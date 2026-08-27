export const ACCOUNT_EXPORT_TABLES = [
  { table: "profiles", ownerColumn: "id" },
  { table: "saved_guides", ownerColumn: "user_id" },
  { table: "saved_forum_posts", ownerColumn: "user_id" },
  { table: "forum_posts", ownerColumn: "user_id" },
  { table: "forum_comments", ownerColumn: "user_id" },
  { table: "forum_votes", ownerColumn: "user_id" },
  { table: "chat_sessions", ownerColumn: "user_id" },
  { table: "chat_messages", ownerColumn: "user_id" },
  { table: "media_assets", ownerColumn: "owner_user_id" },
  { table: "forum_reports", ownerColumn: "reporter_user_id" },
] as const;

export const ACCOUNT_DELETE_TABLES = [
  { table: "forum_reports", ownerColumn: "reporter_user_id" },
  { table: "forum_votes", ownerColumn: "user_id" },
  { table: "saved_forum_posts", ownerColumn: "user_id" },
  { table: "saved_guides", ownerColumn: "user_id" },
  { table: "forum_comments", ownerColumn: "user_id" },
  { table: "forum_posts", ownerColumn: "user_id" },
  { table: "chat_messages", ownerColumn: "user_id" },
  { table: "chat_sessions", ownerColumn: "user_id" },
  { table: "media_assets", ownerColumn: "owner_user_id" },
  { table: "profiles", ownerColumn: "id" },
] as const;

export function getUserMediaPrefix(userId: string) {
  const safeUserId = userId.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  return `assets/users/${safeUserId}/`;
}

export function getAccountDeleteValidationError(confirmation: unknown) {
  return confirmation === "DELETE" ? null : "Type DELETE to confirm account deletion.";
}
