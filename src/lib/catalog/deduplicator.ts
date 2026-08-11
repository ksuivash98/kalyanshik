import { TobaccoSeed } from "@/types/catalog"
import { normalizeKey } from "./normalizer"

export type DuplicateGroup = {
  key: string
  items: TobaccoSeed[]
}

export function findDuplicates(items: TobaccoSeed[]): DuplicateGroup[] {
  const map = new Map<string, TobaccoSeed[]>()
  for (const item of items) {
    const key = normalizeKey(item.brandId, item.name, item.line)
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }
  return [...map.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([key, list]) => ({ key, items: list }))
}

/** Keep first occurrence of brand + line + normalized name */
export function dedupeByBrandName(items: TobaccoSeed[]): TobaccoSeed[] {
  const seen = new Set<string>()
  const result: TobaccoSeed[] = []
  for (const item of items) {
    const key = normalizeKey(item.brandId, item.name, item.line)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }
  return result
}
