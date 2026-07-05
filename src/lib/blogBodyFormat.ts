export type BlogBodyTone = "default" | "checklist" | "notice" | "warning";

export interface BlogBodyBlock {
  heading: string;
  content: string;
  listItems: string[];
  tone: BlogBodyTone;
}

const HEADING_SEPARATOR_PATTERN = /^([^：:]{2,32})[：:]\s*(.+)$/;

export function formatBlogBodyBlock(paragraph: string): BlogBodyBlock {
  const trimmed = paragraph.trim();
  const separated = trimmed.match(HEADING_SEPARATOR_PATTERN);

  if (!separated) {
    return {
      heading: "",
      content: trimmed,
      listItems: [],
      tone: "default",
    };
  }

  const heading = separated[1].trim();
  const content = separated[2].trim();
  const tone = getTone(heading);

  if (tone === "checklist") {
    return {
      heading,
      content: "",
      listItems: splitChecklistItems(content),
      tone,
    };
  }

  return {
    heading,
    content,
    listItems: [],
    tone,
  };
}

function getTone(heading: string): BlogBodyTone {
  const normalizedHeading = heading.toLowerCase();

  if (
    heading.includes("清单") ||
    normalizedHeading.includes("checklist") ||
    normalizedHeading.includes("preparation") ||
    normalizedHeading.includes("lista")
  ) {
    return "checklist";
  }

  if (
    heading.includes("提醒") ||
    normalizedHeading.includes("note") ||
    normalizedHeading.includes("reminder") ||
    normalizedHeading.includes("recordatorio")
  ) {
    return "notice";
  }

  if (
    heading.includes("错误") ||
    heading.includes("錯誤") ||
    heading.includes("避坑") ||
    normalizedHeading.includes("warning") ||
    normalizedHeading.includes("mistake") ||
    normalizedHeading.includes("error")
  ) {
    return "warning";
  }

  return "default";
}

function splitChecklistItems(content: string) {
  return content
    .replace(/[。.]$/, "")
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
