/**
 * Prisma seed entrypoint — reuses the same verified catalog sources as the app.
 * For GitHub Pages the runtime uses localStorage + static CATALOG_DB.
 * This seed is for local Prisma / future server deployments.
 */
import { CATALOG_DB } from "../src/data/catalog"
import { formatValidationReport, validateCatalog } from "../src/lib/catalog"

async function main() {
  const report = validateCatalog(CATALOG_DB)
  console.log(formatValidationReport(report))
  console.log("\nSources:")
  for (const s of CATALOG_DB.meta.sources) console.log(`- ${s}`)
  console.log(
    "\nNote: full Prisma upsert for thousands of rows can be wired here later."
  )
  console.log(
    `Ready catalog snapshot: ${report.brands} brands, ${report.tobaccoProducts} tobaccos.`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
