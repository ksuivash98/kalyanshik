import {
  BrandSeed,
  CatalogDatabase,
  TobaccoSeed,
} from "@/types/catalog"
import { dedupeByBrandName } from "./deduplicator"
import { normalizeName, slugify } from "./normalizer"
import { validateCatalog } from "./validator"

export type ImportInput = {
  brands?: BrandSeed[]
  tobaccos?: TobaccoSeed[]
}

export type ImportResult = {
  database: CatalogDatabase
  created: number
  updated: number
  skipped: number
}

/**
 * Deterministic catalog importer for seed/JSON updates.
 * Designed for future admin/CLI sync without hand-editing React files.
 */
export function importCatalog(
  current: CatalogDatabase,
  incoming: ImportInput,
  meta?: { sources?: string[] }
): ImportResult {
  const now = new Date().toISOString()
  const brands = [...current.brands]
  const brandById = new Map(brands.map((b) => [b.id, b]))
  let created = 0
  let updated = 0
  let skipped = 0

  for (const brand of incoming.brands ?? []) {
    const existing = brandById.get(brand.id)
    if (!existing) {
      brands.push(brand)
      brandById.set(brand.id, brand)
      created++
      continue
    }
    Object.assign(existing, brand)
    updated++
  }

  const tobaccoMap = new Map(
    current.tobaccos.map((t) => [`${t.brandId}::${normalizeName(t.name).toLowerCase()}`, t])
  )

  for (const item of incoming.tobaccos ?? []) {
    if (!brandById.has(item.brandId)) {
      skipped++
      continue
    }
    const key = `${item.brandId}::${normalizeName(item.name).toLowerCase()}`
    const existing = tobaccoMap.get(key)
    if (!existing) {
      tobaccoMap.set(key, {
        ...item,
        name: normalizeName(item.name),
        slug: item.slug || slugify(item.name),
        lastVerifiedAt: item.lastVerifiedAt || now,
      })
      created++
      continue
    }

    tobaccoMap.set(key, {
      ...existing,
      ...item,
      name: normalizeName(item.name),
      aliases: [...new Set([...existing.aliases, ...item.aliases])],
      tags: [...new Set([...existing.tags, ...item.tags])],
      flavorNotes: [...new Set([...existing.flavorNotes, ...item.flavorNotes])],
      lastVerifiedAt: item.lastVerifiedAt || now,
      sourceUrl: item.sourceUrl || existing.sourceUrl,
    })
    updated++
  }

  const tobaccos = dedupeByBrandName([...tobaccoMap.values()])

  const database: CatalogDatabase = {
    brands,
    tobaccos,
    flavorTags: current.flavorTags,
    meta: {
      generatedAt: now,
      sources: [
        ...new Set([...(current.meta.sources ?? []), ...(meta?.sources ?? [])]),
      ],
    },
  }

  validateCatalog(database)
  return { database, created, updated, skipped }
}
