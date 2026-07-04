export type BlogBodyTone = "default" | "checklist" | "notice" | "warning";

export interface BlogBodyBlock {
  heading: string;
  content: string;
  listItems: string[];
  tone: BlogBodyTone;
}

const HEADING_SEPARATOR_PATTERN = /^([^：:]{2,18})[：:]\s*(.+)$/;

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
  if (heading.includes("清单") || heading.toLowerCase().includes("checklist")) {
    return "checklist";
  }

  if (heading.includes("提醒") || heading.toLowerCase().includes("note")) {
    return "notice";
  }

  if (heading.includes("错误") || heading.includes("避坑") || heading.toLowerCase().includes("warning")) {
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
