import { readFileSync } from "fs"
const r = JSON.parse(readFileSync(new URL("./ru-flavors-final.json", import.meta.url), "utf8"))
for (const id of ["smoke-angels", "blackburn", "jam", "serbetli", "cobra", "aircraft", "helix", "wto", "kraken", "dogma", "bliss", "fake", "nur", "tangiers"]) {
  const entries = r.brands.filter((b) => b.id === id)
  const all = [...new Set(entries.flatMap((e) => e.flavors))]
  console.log("\n====", id, "entries", entries.length, "unique", all.length, "completeness", r.completeness[id])
  for (const e of entries) console.log(" line", e.line, e.flavors.length)
  console.log(all.slice(0, 20).join("\n"))
  if (all.length > 20) console.log("...")
}
console.log("\nnewBrandIds", r.newBrandIds)
