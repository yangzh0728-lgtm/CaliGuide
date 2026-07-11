export async function readChatResponseError(response: Response, fallback: string) {
  const responseText = await response.text();
  if (!responseText.trim()) {
    return fallback;
  }

  try {
    const responseBody = JSON.parse(responseText) as { error?: unknown };
    if (typeof responseBody.error === "string" && responseBody.error.trim()) {
      return responseBody.error.trim();
    }
  } catch {
    return responseText;
  }

  return fallback;
}
