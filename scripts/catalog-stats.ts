import { CATALOG_DB, getBrandById } from "../src/data/catalog"

const counts = new Map<string, number>()
for (const t of CATALOG_DB.tobaccos) {
  const brand = getBrandById(t.brandId)
  const name = brand?.name ?? t.brandId
  counts.set(name, (counts.get(name) ?? 0) + 1)
}

const rows = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
const maxName = Math.max(...rows.map(([n]) => n.length), 8)

console.log("HOOKAH MIX — RUSSIAN CATALOG STATS\n")
for (const [name, count] of rows) {
  console.log(`${name.padEnd(maxName + 2)}${count}`)
}
console.log(`\nTotal brands with flavors: ${rows.length}`)
console.log(`Total flavors: ${CATALOG_DB.tobaccos.length}`)
