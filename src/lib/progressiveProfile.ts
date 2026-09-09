export const DEFAULT_MEMBER_NAME = "CaliGuide Member";

export type ProfileDetailInput = { kind: "name" | "arrival"; value: string };

export function minimalSignupMetadata() {
  return { name: DEFAULT_MEMBER_NAME, arrival_status_provided: false };
}

export function needsDisplayName(name: string) {
  return !name.trim() || name.trim() === DEFAULT_MEMBER_NAME;
}

export function buildProfileDetailUpdate(input: ProfileDetailInput) {
  if (input.kind === "name") {
    const name = input.value.trim();
    if (!name || name.length > 80) throw new Error("Name is required");
    return { profile: { name }, metadata: { name } };
  }
  const arrival_status = input.value;
  if (!["planning", "arrived", "long_term_resident"].includes(arrival_status)) {
    throw new Error("Choose an arrival stage");
  }
  return { profile: { arrival_status }, metadata: { arrival_status, arrival_status_provided: true } };
}
