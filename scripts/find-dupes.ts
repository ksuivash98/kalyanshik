import { CATALOG_DB } from "../src/data/catalog/index.ts"
import { normalizeTobaccoName } from "../src/lib/catalog/normalizer.ts"

const byBrandName = new Map()
const byBrandLineName = new Map()
for (const t of CATALOG_DB.tobaccos) {
  const bn = `${t.brandId}::${normalizeTobaccoName(t.name)}`
  const bln = `${t.brandId}::${t.line || ""}::${normalizeTobaccoName(t.name)}`
  if (!byBrandName.has(bn)) byBrandName.set(bn, [])
  byBrandName.get(bn).push(t)
  if (!byBrandLineName.has(bln)) byBrandLineName.set(bln, [])
  byBrandLineName.get(bln).push(t)
}

const sameNameDiffLine = [...byBrandName.entries()]
  .filter(([, arr]) => arr.length > 1)
  .sort((a, b) => b[1].length - a[1].length)

console.log("Same brand+name across lines:", sameNameDiffLine.length)
for (const [k, arr] of sameNameDiffLine.slice(0, 50)) {
  console.log(
    k,
    "=>",
    arr.map((t) => t.line).join(" | ")
  )
}

const trueDup = [...byBrandLineName.entries()].filter(([, a]) => a.length > 1)
console.log("\nTrue duplicates brand+line+name:", trueDup.length)

const ice = CATALOG_DB.tobaccos.filter((t) => /ice granny/i.test(t.name))
console.log(
  "\nIce Granny:",
  ice.map((t) => ({ id: t.id, line: t.line, tags: t.tags }))
)

// Darkside same names
const ds = sameNameDiffLine.filter(([k]) => k.startsWith("darkside::"))
console.log("\nDARKSIDE repeats:", ds.length)
for (const [k, arr] of ds) {
  console.log(k, "=>", arr.map((t) => t.line).join(" | "))
}
