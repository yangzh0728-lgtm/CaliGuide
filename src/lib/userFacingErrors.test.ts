import { expect, test } from "bun:test";
import { WORKFLOW_COPY } from "../i18n/workflowCopy";
import type { LanguageCode } from "../i18n/translations";
import { getUserFacingError } from "./userFacingErrors";

for (const language of Object.keys(WORKFLOW_COPY) as LanguageCode[]) {
  test(`sanitizes failures in ${language}`, () => {
    const copy = WORKFLOW_COPY[language];
    expect(getUserFacingError(Error("database password=secret"), language)).toBe(copy.failed);
    expect(getUserFacingError(Error("Invalid login credentials"), language)).toBe(copy.credentials);
    expect(getUserFacingError(Error("Failed to fetch"), language)).toBe(copy.network);
    expect(getUserFacingError(Error("RATE_LIMITED"), language)).toBe(copy.rateLimited);
  });
}
