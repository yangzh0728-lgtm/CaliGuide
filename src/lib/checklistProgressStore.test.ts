import { expect, test } from "bun:test";
import { createChecklistProgressStore } from "./checklistProgressStore";

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

test("serializes saves so reset wins over an earlier in-flight toggle", async () => {
  const writes: string[][] = [];
  let release!: () => void;
  const store = createChecklistProgressStore(async () => [], async (tasks) => {
    writes.push(tasks);
    if (writes.length === 1) await new Promise<void>((resolve) => { release = resolve; });
  });
  await store.initialize();
  store.toggle("usps");
  store.toggle("uscis");
  store.reset();
  expect(writes).toEqual([["usps"]]);
  release();
  await settle();
  expect(writes).toEqual([["usps"], []]);
  expect(store.getSnapshot()).toMatchObject({ completed: [], isSaving: false, error: null });
});

test("a failed load cannot overwrite remote progress and can be retried", async () => {
  let fail = true;
  let writes = 0;
  const store = createChecklistProgressStore(async () => {
    if (fail) throw Error("offline");
    return ["uscis"];
  }, async () => { writes++; });
  await store.initialize();
  store.toggle("usps");
  expect(writes).toBe(0);
  expect(store.getSnapshot().error).toBe("load");
  fail = false;
  await store.retry();
  expect(store.getSnapshot().completed).toEqual(["uscis"]);
});

test("failed saves retain user edits for retry and never mix identities", async () => {
  let fail = true;
  let saved: string[] = [];
  const first = createChecklistProgressStore(async () => [], async (tasks) => {
    if (fail) throw Error("offline");
    saved = tasks;
  });
  const second = createChecklistProgressStore(async () => [], async () => {});
  await first.initialize(); await second.initialize();
  first.toggle("usps"); await settle();
  expect(first.getSnapshot().error).toBe("save");
  expect(second.getSnapshot().completed).toEqual([]);
  fail = false; await first.retry();
  expect(saved).toEqual(["usps"]);
  expect(first.getSnapshot().error).toBeNull();
});
