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
