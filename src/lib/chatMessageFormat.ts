/**
 * CaliBot replies arrive as light markdown. The app renders chat messages as
 * React elements rather than HTML, so this module parses only the small subset
 * the model actually produces — bold runs, single-level bullets, numbered
 * lists, and paragraphs. Anything it does not recognize stays literal text.
 *
 * Deliberately not a general markdown parser: no HTML is produced, so there is
 * no injection surface, and the bundle carries no new dependency.
 */

export type ChatInline =
  | { type: "text"; text: string }
  | { type: "bold"; text: string };

export type ChatBlock =
  | { type: "paragraph"; inlines: ChatInline[] }
  | { type: "list"; ordered: boolean; items: ChatInline[][] };

const BULLET_PATTERN = /^\s*[-*•]\s+(.*)$/;
const ORDERED_PATTERN = /^\s*\d+[.)]\s+(.*)$/;
const HEADING_PATTERN = /^\s*#{1,6}\s+(.*)$/;
/** Matches **bold** and ***bold***; the inner run may not contain an asterisk. */
const BOLD_PATTERN = /\*{2,3}([^*]+)\*{2,3}/g;

function parseInlines(text: string): ChatInline[] {
  const inlines: ChatInline[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BOLD_PATTERN)) {
    const start = match.index ?? 0;

    if (start > lastIndex) {
      inlines.push({ type: "text", text: text.slice(lastIndex, start) });
    }

    inlines.push({ type: "bold", text: match[1].trim() });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    inlines.push({ type: "text", text: text.slice(lastIndex) });
  }

  return inlines.filter((inline) => inline.text.length > 0);
}

export function formatChatMessage(content: string): ChatBlock[] {
  const blocks: ChatBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  function flushParagraph() {
    if (!paragraphLines.length) {
      return;
    }

    const inlines = parseInlines(paragraphLines.join(" ").trim());
    paragraphLines = [];

    if (inlines.length) {
      blocks.push({ type: "paragraph", inlines });
    }
  }

  function flushList() {
    if (!listItems.length) {
      return;
    }

    const items = listItems.map(parseInlines).filter((item) => item.length > 0);
    listItems = [];

    if (items.length) {
      blocks.push({ type: "list", ordered: listOrdered, items });
    }
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(HEADING_PATTERN);
    if (heading) {
      flushParagraph();
      flushList();
      const text = heading[1].trim();
      if (text) {
        blocks.push({ type: "paragraph", inlines: [{ type: "bold", text }] });
      }
      continue;
    }

    const ordered = line.match(ORDERED_PATTERN);
    if (ordered) {
      flushParagraph();
      if (listItems.length && !listOrdered) {
        flushList();
      }
      listOrdered = true;
      listItems.push(ordered[1]);
      continue;
    }

    const bullet = line.match(BULLET_PATTERN);
    if (bullet) {
      flushParagraph();
      if (listItems.length && listOrdered) {
        flushList();
      }
      listOrdered = false;
      listItems.push(bullet[1]);
      continue;
    }

    flushList();
    paragraphLines.push(line.trim());
  }

  flushParagraph();
  flushList();

  return blocks;
}
