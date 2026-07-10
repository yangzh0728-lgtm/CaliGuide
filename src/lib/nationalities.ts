export const COUNTRY_OPTIONS = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Cambodia",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Haiti",
  "Honduras",
  "Hong Kong",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kenya",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Nigeria",
  "Pakistan",
  "Panama",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Russia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Taiwan",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Kingdom",
  "United States",
  "Venezuela",
  "Vietnam",
] as const;

const COUNTRY_SET = new Set<string>(COUNTRY_OPTIONS);

export function normalizeNationalities(values: unknown, fallback?: string | null) {
  const rawValues = Array.isArray(values) ? values : [];
  const normalized = rawValues
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  const fallbackValues =
    normalized.length > 0
      ? []
      : (fallback ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);

  return Array.from(new Set([...normalized, ...fallbackValues])).filter(
    (value) => COUNTRY_SET.has(value) || fallbackValues.includes(value),
  );
}

export function formatNationalities(nationalities: string[]) {
  return normalizeNationalities(nationalities).join(", ");
}
