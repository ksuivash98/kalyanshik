export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function normalizeName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'")
}

export function normalizeKey(brandId: string, name: string): string {
  return `${brandId}::${normalizeName(name).toLowerCase()}`
}
