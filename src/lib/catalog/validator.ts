import { BrandSeed, CatalogDatabase, TobaccoSeed } from "@/types/catalog"
import { findDuplicates } from "./deduplicator"
import { isRussianSourceUrl } from "./ru-sources"
import { normalizeName, slugify } from "./normalizer"

export type ValidationReport = {
  brands: number
  tobaccoProducts: number
  active: number
  discontinued: number
  limited: number
  unknownStatus: number
  missingSource: number
  nonRussianSources: number
  russianSourceUrls: number
  duplicates: number
  invalidProfiles: number
  emptyNames: number
  orphanTobaccos: number
  invalidSlugs: number
  lines: number
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
  const tobaccoIds = new Set<string>()
  const sourceUrls = new Set<string>()
  const lines = new Set<string>()

  for (const brand of db.brands) {
    if (!brand.name.trim()) issues.push(`Brand empty name: ${brand.id}`)
    if (brandSlugs.has(brand.slug)) issues.push(`Duplicate brand slug: ${brand.slug}`)
    brandSlugs.add(brand.slug)
  }

  let missingSource = 0
  let nonRussianSources = 0
  let emptyNames = 0
  let orphanTobaccos = 0
  let invalidProfiles = 0
  let invalidSlugs = 0

  for (const t of db.tobaccos) {
    if (t.line) lines.add(t.line)
    if (!normalizeName(t.name)) {
      emptyNames++
      issues.push(`Empty tobacco name: ${t.id}`)
    }
    if (!brandIds.has(t.brandId)) {
      orphanTobaccos++
      issues.push(`Tobacco without brand: ${t.id}`)
    }

    const sources = t.sources?.length ? t.sources : []
    if (sources.length === 0) {
      missingSource++
      issues.push(`Missing sources: ${t.id}`)
    } else {
      for (const s of sources) {
        sourceUrls.add(s.url)
        if (!isValidUrl(s.url) || !isRussianSourceUrl(s.url)) {
          nonRussianSources++
          issues.push(`Non-Russian/invalid source: ${t.id} → ${s.url}`)
        }
      }
    }

    if (!t.sourceUrl || !isValidUrl(t.sourceUrl)) {
      missingSource++
      issues.push(`Missing/invalid sourceUrl: ${t.id}`)
    }

    if (!profileOk(t)) {
      invalidProfiles++
      issues.push(`Invalid profile: ${t.id}`)
    }

    if (tobaccoIds.has(t.id)) {
      invalidSlugs++
      issues.push(`Duplicate tobacco id: ${t.id}`)
    }
    tobaccoIds.add(t.id)
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
    nonRussianSources,
    russianSourceUrls: sourceUrls.size,
    duplicates: duplicates.length,
    invalidProfiles,
    emptyNames,
    orphanTobaccos,
    invalidSlugs,
    lines: lines.size,
    issues,
  }
}

export function formatValidationReport(report: ValidationReport): string {
  return [
    "HOOKAH MIX — RUSSIAN CATALOG",
    "",
    `Брендов: ${report.brands}`,
    `Линеек: ${report.lines}`,
    `Уникальных вкусов: ${report.tobaccoProducts}`,
    "",
    `ACTIVE: ${report.active}`,
    `LIMITED: ${report.limited}`,
    `DISCONTINUED: ${report.discontinued}`,
    `UNKNOWN: ${report.unknownStatus}`,
    "",
    `Российских источников: ${report.russianSourceUrls}`,
    "",
    `Дубликатов: ${report.duplicates}`,
    `Товаров без источника: ${report.missingSource}`,
    `Нероссийских источников: ${report.nonRussianSources}`,
    `Missing brand: ${report.orphanTobaccos}`,
    `Invalid profiles: ${report.invalidProfiles}`,
    report.issues.length
      ? `\nIssues (first 20):\n${report.issues.slice(0, 20).map((i) => `- ${i}`).join("\n")}`
      : "\nNo critical issues.",
  ].join("\n")
}

export function assertBrandRegistry(brands: BrandSeed[]) {
  const ids = new Set<string>()
  for (const b of brands) {
    if (ids.has(b.id)) throw new Error(`Duplicate brand id ${b.id}`)
    ids.add(b.id)
  }
}
