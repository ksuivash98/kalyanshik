import { readFileSync, writeFileSync } from "fs"

const p = new URL("./ru-flavors-final.json", import.meta.url)
const r = JSON.parse(readFileSync(p, "utf8"))

function fixParens(s) {
  const open = (s.match(/\(/g) || []).length
  const close = (s.match(/\)/g) || []).length
  if (open > close) return s + ")".repeat(open - close)
  return s
}

function stripPack(n) {
  return n
    .replace(/,\s*\d+\s*гр\.?\s*$/i, "")
    .replace(/\s+\d+\s*гр\.?\s*$/i, "")
    .replace(/\s*\(\s*н\/м\s*\)\s*$/i, "")
    .replace(/\s*\(\s*M\s*\)\s*$/i, "")
    .replace(/\s*\(\s*БПК\s*\)\s*$/i, "")
    .replace(/\s+МРК$/i, "")
    .replace(/\s+БПК$/i, "")
    .replace(/\s*[-–—]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const k = x
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9%#]+/gi, "")
    if (!x || !k || seen.has(k)) continue
    seen.add(k)
    out.push(x)
  }
  return out
}

for (const b of r.brands) {
  b.flavors = uniq(
    b.flavors
      .map((f) => fixParens(stripPack(String(f))))
      .filter((f) => f && f.length > 1 && !/^\(блэк/i.test(f) && f !== "(Блэк Берн)")
  ).sort((a, c) => a.localeCompare(c, "ru"))
}

for (const id of Object.keys(r.completeness)) {
  const n = uniq(r.brands.filter((b) => b.id === id).flatMap((b) => b.flavors)).length
  const high =
    {
      blackburn: 80,
      serbetli: 40,
      jam: 40,
      dogma: 40,
      kraken: 35,
      sebero: 80,
      "smoke-angels": 12,
      "al-fakher": 20,
      chabacco: 40,
      bliss: 25,
    }[id] || 15
  r.completeness[id] = n === 0 ? "LOW" : n >= high ? "HIGH" : n >= high * 0.4 ? "MEDIUM" : "LOW"
}

writeFileSync(p, JSON.stringify(r, null, 2))
console.log("al-fakher", r.brands.find((b) => b.id === "al-fakher").flavors.slice(0, 8))
console.log("done")
