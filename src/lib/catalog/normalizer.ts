/**
 * Normalize tobacco flavor names for deduplication / search keys.
 * Does NOT merge intentionally different products (line is handled separately).
 */
export function normalizeTobaccoName(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[’‘‛`´]/g, "'")
    .replace(/[“”„«»]/g, '"')
    .replace(/["']/g, "")
    .replace(/[–—−]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Normalize brand display names for matching (not for merging distinct brands). */
export function normalizeBrandName(value: string): string {
  return normalizeTobaccoName(value)
    .replace(/\btobacco\b/g, "")
    .replace(/\btabak\b/g, "")
    .replace(/\s+/g, " ")
    .replace(/\bdark\s*side\b/g, "darkside")
    .replace(/\bmust\s*have\b/g, "musthave")
    .replace(/\bblack\s*burn\b/g, "blackburn")
    .replace(/\bnаш\b/g, "nash")
    .trim()
}

export function slugify(value: string): string {
  return normalizeTobaccoName(value)
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** @deprecated use normalizeTobaccoName */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").replace(/[’']/g, "'")
}

export function normalizeKey(
  brandId: string,
  name: string,
  line?: string | null
): string {
  const linePart = normalizeTobaccoName(line ?? "")
  return `${brandId}::${linePart}::${normalizeTobaccoName(name)}`
}
