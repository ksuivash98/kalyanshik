import {
  BRAND_COMPLETENESS,
  CATALOG_DB,
  getBrandById,
} from "../src/data/catalog"
import { computeBrandCompleteness } from "../src/data/catalog/brand-completeness"
import { formatValidationReport, validateCatalog } from "../src/lib/catalog"

const report = validateCatalog(CATALOG_DB)
console.log(formatValidationReport(report))

const brandsWithTobaccos = new Set(CATALOG_DB.tobaccos.map((t) => t.brandId))
const unchecked = CATALOG_DB.brands.filter((b) => !brandsWithTobaccos.has(b.id))

console.log("\nБРЕНДЫ, КОТОРЫЕ ЕЩЁ НЕ ПРОВЕРЕНЫ / БЕЗ ВКУСОВ:")
for (const b of unchecked) {
  const level = BRAND_COMPLETENESS[b.id] ?? "NONE"
  console.log(
    `- ${b.name} [${level}]${b.verificationNotes ? ` (${b.verificationNotes})` : ""}`
  )
}

type Agg = {
  brandId: string
  name: string
  n: number
  sources: Set<string>
  lines: Set<string>
}

const counts = new Map<string, Agg>()
for (const t of CATALOG_DB.tobaccos) {
  const brand = getBrandById(t.brandId)
  const cur =
    counts.get(t.brandId) ??
    ({
      brandId: t.brandId,
      name: brand?.name ?? t.brandId,
      n: 0,
      sources: new Set<string>(),
      lines: new Set<string>(),
    } satisfies Agg)
  cur.n++
  for (const s of t.sources) cur.sources.add(s.domain || s.url)
  if (t.line) cur.lines.add(t.line)
  counts.set(t.brandId, cur)
}

const top = [...counts.values()].sort((a, b) => b.n - a.n)
console.log("\nТОП БРЕНДОВ ПО КОЛИЧЕСТВУ ВКУСОВ + ПОЛНОТА")
top.forEach((row, i) => {
  const completeness = computeBrandCompleteness(
    row.brandId,
    row.n,
    row.sources.size,
    row.lines.size
  )
  console.log(
    `${i + 1}. ${row.name} — ${row.n} | линий: ${row.lines.size} | источников: ${row.sources.size} | полнота: ${completeness.level}`
  )
})

console.log("\nИсточники meta:")
for (const s of CATALOG_DB.meta.sources) console.log(`- ${s}`)
