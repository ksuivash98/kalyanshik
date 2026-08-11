import { CATALOG_DB } from "../src/data/catalog"
import { formatValidationReport, validateCatalog } from "../src/lib/catalog"

const report = validateCatalog(CATALOG_DB)
console.log(formatValidationReport(report))

const brandsWithTobaccos = new Set(CATALOG_DB.tobaccos.map((t) => t.brandId))
const unchecked = CATALOG_DB.brands.filter((b) => !brandsWithTobaccos.has(b.id))

console.log("\nBrands without imported flavors yet:")
for (const b of unchecked) {
  console.log(`- ${b.name}${b.verificationNotes ? ` (${b.verificationNotes})` : ""}`)
}

const lines = new Set(
  CATALOG_DB.tobaccos.map((t) => t.line).filter((l): l is string => Boolean(l))
)
console.log(`\nLines in catalog: ${lines.size}`)

console.log("\nEstimated data:")
console.log(
  `- All flavor scales are estimated: true (${CATALOG_DB.tobaccos.length} products)`
)
console.log("- Official manufacturer numeric strength almost always UNKNOWN/null")

console.log("\nSources used:")
for (const s of CATALOG_DB.meta.sources) console.log(`- ${s}`)
