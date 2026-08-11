import { BrandSeed, CatalogDatabase, TobaccoSeed } from "@/types/catalog"
import { findDuplicates } from "./deduplicator"
import { normalizeName, slugify } from "./normalizer"

export type ValidationReport = {
  brands: number
  tobaccoProducts: number
  active: number
  discontinued: number
  limited: number
  unknownStatus: number
  missingSource: number
  duplicates: number
  invalidProfiles: number
  emptyNames: number
  orphanTobaccos: number
  invalidSlugs: number
  issues: string[]
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

function profileOk(t: TobaccoSeed): boolean {
  const p = t.estimatedProfile
  const keys = [
    "strength",
    "cold",
    "sweetness",
    "sourness",
    "fruity",
    "dessert",
    "spicy",
    "herbal",
    "intensity",
  ] as const
  for (const key of keys) {
    const v = p[key]
    if (v == null) continue
    if (v < 0 || v > 5) return false
    if (key === "strength" && (v < 1 || v > 5)) return false
  }
  return true
}

export function validateCatalog(db: CatalogDatabase): ValidationReport {
  const issues: string[] = []
  const brandIds = new Set(db.brands.map((b) => b.id))
  const brandSlugs = new Set<string>()
  const tobaccoSlugs = new Set<string>()

  for (const brand of db.brands) {
    if (!brand.name.trim()) issues.push(`Brand empty name: ${brand.id}`)
    if (brandSlugs.has(brand.slug)) issues.push(`Duplicate brand slug: ${brand.slug}`)
    brandSlugs.add(brand.slug)
  }

  let missingSource = 0
  let emptyNames = 0
  let orphanTobaccos = 0
  let invalidProfiles = 0
  let invalidSlugs = 0

  for (const t of db.tobaccos) {
    if (!normalizeName(t.name)) {
      emptyNames++
      issues.push(`Empty tobacco name: ${t.id}`)
    }
    if (!brandIds.has(t.brandId)) {
      orphanTobaccos++
      issues.push(`Tobacco without brand: ${t.id}`)
    }
    if (!t.sourceUrl || !isValidUrl(t.sourceUrl)) {
      missingSource++
      issues.push(`Missing/invalid sourceUrl: ${t.id}`)
    }
    if (!profileOk(t)) {
      invalidProfiles++
      issues.push(`Invalid profile: ${t.id}`)
    }
    if (!t.slug || t.slug !== slugify(t.slug)) {
      // allow existing slug format brand-name
    }
    const fullSlug = `${t.brandId}-${t.slug}`
    if (tobaccoSlugs.has(fullSlug)) {
      invalidSlugs++
      issues.push(`Duplicate tobacco slug: ${fullSlug}`)
    }
    tobaccoSlugs.add(fullSlug)
  }

  const duplicates = findDuplicates(db.tobaccos)

  return {
    brands: db.brands.length,
    tobaccoProducts: db.tobaccos.length,
    active: db.tobaccos.filter((t) => t.status === "ACTIVE").length,
    discontinued: db.tobaccos.filter((t) => t.status === "DISCONTINUED").length,
    limited: db.tobaccos.filter((t) => t.status === "LIMITED").length,
    unknownStatus: db.tobaccos.filter((t) => t.status === "UNKNOWN").length,
    missingSource,
    duplicates: duplicates.length,
    invalidProfiles,
    emptyNames,
    orphanTobaccos,
    invalidSlugs,
    issues,
  }
}

export function formatValidationReport(report: ValidationReport): string {
  return [
    "HOOKAH MIX CATALOG",
    "",
    `Brands:  ${report.brands}`,
    "",
    `Total tobacco flavors: ${report.tobaccoProducts}`,
    "",
    `Active: ${report.active}`,
    `Limited: ${report.limited}`,
    `Discontinued: ${report.discontinued}`,
    `Unknown: ${report.unknownStatus}`,
    "",
    `Duplicates: ${report.duplicates}`,
    `Missing source: ${report.missingSource}`,
    `Missing brand: ${report.orphanTobaccos}`,
    `Invalid profiles: ${report.invalidProfiles}`,
    report.emptyNames || report.invalidSlugs
      ? `\nExtra: empty names ${report.emptyNames}, slug issues ${report.invalidSlugs}`
      : "",
    report.issues.length
      ? `\nIssues (first 20):\n${report.issues.slice(0, 20).map((i) => `- ${i}`).join("\n")}`
      : "\nNo critical issues.",
  ]
    .filter((line) => line !== "")
    .join("\n")
}

export function assertBrandRegistry(brands: BrandSeed[]) {
  const ids = new Set<string>()
  for (const b of brands) {
    if (ids.has(b.id)) throw new Error(`Duplicate brand id ${b.id}`)
    ids.add(b.id)
  }
}
