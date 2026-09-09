const PALETTES = [
  { background: "#073B75", foreground: "#FFFFFF" },
  { background: "#17665B", foreground: "#FFFFFF" },
  { background: "#763D59", foreground: "#FFFFFF" },
  { background: "#DCEAF3", foreground: "#073B75" },
  { background: "#F7E4AA", foreground: "#53410C" },
];

export function avatarInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length || name.trim() === "CaliGuide Member") return "CG";
  const initial = (word: string) => Array.from(word).find((character) => /[\p{L}\p{N}]/u.test(character)) ?? "";
  return Array.from((words.length > 1 ? initial(words[0]) + initial(words[words.length - 1]) : initial(words[0])).toUpperCase()).slice(0, 2).join("") || "CG";
}

export function createDefaultAvatar(name: string) {
  const normalized = name.trim().toLowerCase();
  let hash = 0;
  for (const character of normalized) hash = (Math.imul(hash, 31) + character.codePointAt(0)!) >>> 0;
  const palette = PALETTES[hash % PALETTES.length];
  const initials = avatarInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" data-caliguide-avatar="monogram-v1"><rect width="128" height="128" rx="64" fill="${palette.background}"/><circle cx="64" cy="64" r="57" fill="none" stroke="${palette.foreground}" stroke-opacity="0.16"/><text x="64" y="66" text-anchor="middle" dominant-baseline="central" font-family="Inter, Arial, sans-serif" font-size="${initials.length > 1 ? 44 : 52}" font-weight="600" fill="${palette.foreground}">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function resolveProfileAvatar(url: string | null | undefined, name: string) {
  if (!url) return createDefaultAvatar(name);
  if (!url.startsWith("data:image/svg+xml,")) return url;
  try {
    const svg = decodeURIComponent(url.slice("data:image/svg+xml,".length));
    const isMonogram = svg.includes('data-caliguide-avatar="monogram-v1"');
    const isOldCartoon = svg.includes('viewBox="0 0 200 200"') && svg.includes('<circle cx="100" cy="144" r="24"') && svg.includes('M45 178 Q100 126 155 178');
    const isDatabaseDefault = svg.includes('viewBox="0 0 96 96"') && svg.includes('M24 80c4-18 16-28 24-28s20 10 24 28');
    return isMonogram || isOldCartoon || isDatabaseDefault ? createDefaultAvatar(name) : url;
  } catch {
    return url;
  }
}
