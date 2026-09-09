import { normalizeMovingChecklistTaskIds, type MovingChecklistTaskId } from "./movingChecklist";

type Task = MovingChecklistTaskId;
export type ChecklistSnapshot = {
  completed: Task[]; isLoading: boolean; isSaving: boolean; error: "load" | "save" | null;
};

// One store serializes writes for one identity. Account loads never merge guest data.
export function createChecklistProgressStore(load: () => Promise<Task[]>, save: (tasks: Task[]) => Promise<void>) {
  let state: ChecklistSnapshot = { completed: [], isLoading: true, isSaving: false, error: null };
  let started = false;
  let loaded = false;
  let revision = 0;
  let savedRevision = 0;
  const listeners = new Set<() => void>();
  const publish = (next: Partial<ChecklistSnapshot>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };
  async function initialize() {
    if (started) return;
    started = true;
    publish({ isLoading: true, error: null });
    try {
      const completed = await load();
      loaded = true;
      publish({ completed: normalizeMovingChecklistTaskIds(completed), isLoading: false });
    } catch {
      started = false;
      publish({ isLoading: false, error: "load" });
    }
  }
  async function flush() {
    if (state.isSaving || !loaded) return;
    publish({ isSaving: true, error: null });
    try {
      while (savedRevision < revision) {
        const currentRevision = revision;
        await save([...state.completed]);
        savedRevision = currentRevision;
      }
      publish({ isSaving: false });
    } catch { publish({ isSaving: false, error: "save" }); }
  }
  function update(next: Task[]) {
    if (!loaded) return;
    revision += 1;
    publish({ completed: next });
    void flush();
  }
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => state,
    initialize,
    toggle(task: Task) { update(state.completed.includes(task) ? state.completed.filter((id) => id !== task) : [...state.completed, task]); },
    reset() { update([]); },
    retry() { return loaded ? flush() : initialize(); },
  };
}
