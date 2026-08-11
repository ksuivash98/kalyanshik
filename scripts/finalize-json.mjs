import { readFileSync, writeFileSync } from "fs"

const p = new URL("./ru-flavors-final.json", import.meta.url)
const r = JSON.parse(readFileSync(p, "utf8"))

for (const b of r.brands) {
  if (b.id !== "smoke-angels") continue
  b.flavors = [
    ...new Set(
      b.flavors.map((f) => {
        let x = f.replace(/^Smoke Angels"\s*\(/i, "").replace(/\)$/, "").trim()
        if (/MAPLE PE/i.test(x)) return "IT'S LIKE THAT ONE MAPLE PECAN"
        return x
      })
    ),
  ].sort((a, b) => a.localeCompare(b))
}

const missing = [
  "mattpear",
  "iskra",
  "funel",
  "dead-horse",
  "blackleaf",
  "unity",
  "craftium",
  "northern-forest",
  "social-smoke",
  "young-blood",
]
for (const id of missing) {
  if (r.brands.some((b) => b.id === id)) continue
  r.brands.push({ id, line: null, sources: [], flavors: [], statusHints: {} })
  r.completeness[id] = "LOW"
  r.notes.push(`${id}: отдельной RU-витрины с ассортиментом не найдено`)
}
if (!r.newBrandIds.includes("al-fakher")) r.newBrandIds.push("al-fakher")
r.newBrandIds = [...new Set(r.newBrandIds)].sort()
r.brands.sort((a, b) => a.id.localeCompare(b.id) || String(a.line).localeCompare(String(b.line)))

writeFileSync(p, JSON.stringify(r, null, 2))
console.log("ok", r.brands.length)
console.log("SA", r.brands.find((b) => b.id === "smoke-angels").flavors)
console.log("serbetli", r.brands.find((b) => b.id === "serbetli").flavors.length)
console.log("blackburn", r.brands.filter((b) => b.id === "blackburn").map((b) => b.line + ":" + b.flavors.length))
