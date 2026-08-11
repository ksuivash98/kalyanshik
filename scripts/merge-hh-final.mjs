import { readFileSync, writeFileSync } from "fs"

const clean = JSON.parse(readFileSync(new URL("./ru-flavors-clean.json", import.meta.url), "utf8"))
const hh = JSON.parse(readFileSync(new URL("./ru-hookahhouse.json", import.meta.url), "utf8"))
const sevas = JSON.parse(readFileSync(new URL("./ru-sevas.json", import.meta.url), "utf8"))

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const k = String(x)
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9%#]+/gi, "")
    if (!x || !k || seen.has(k)) continue
    seen.add(k)
    out.push(String(x).replace(/\s+/g, " ").trim())
  }
  return out
}

function stripPack(n) {
  return n
    .replace(/,?\s*\d+\s*гр\.?(?:\s*\([^)]*\))?$/i, "")
    .replace(/\s*\(\s*н\/м\s*\)\s*$/i, "")
    .replace(/\s*\(\s*M\s*\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
}

function isJunk(n) {
  if (!n || n.length < 2 || n.length > 140) return true
  return /^(hookah house|аксессуары|комплектующие|жевательный|главная|каталог|фильтр|бренда|как выбрать|линейки|mary|интернет)/i.test(
    n
  )
}

function hhFlavors(key, brandRe, stripRe) {
  const list = hh.brands[key]?.flavors || []
  const out = []
  for (let t of list) {
    t = stripPack(t)
    if (!brandRe.test(t)) continue
    t = t.replace(stripRe, "").replace(/^[-–—]\s*/, "").trim()
    t = t.replace(/^с ароматом\s+/i, "").trim()
    if (isJunk(t)) continue
    out.push(t)
  }
  return out
}

function detectLine(name, brandId) {
  if (brandId === "blackburn") {
    if (/\bhit\b/i.test(name)) return "HiT"
    if (/\bshock\b/i.test(name)) return "Shock"
    if (/\bkmtm\b/i.test(name)) return "KMTM"
    return "Classic"
  }
  if (brandId === "kraken") {
    if (/\bstrong\b/i.test(name)) return "Strong"
    if (/\bmedium\b|\bseco\b|\bcaviar\b/i.test(name)) return "Medium"
    return null
  }
  if (brandId === "sebero") {
    if (/arctic\s*mix/i.test(name)) return "Arctic Mix"
    if (/limited\s*mix/i.test(name)) return "Limited Mix"
    if (/\blimited\b/i.test(name)) return "Limited"
    if (/\bblack\b/i.test(name)) return "Black"
    return null
  }
  if (brandId === "chabacco") {
    if (/medium\s*mix/i.test(name)) return "Medium Mix"
    if (/\bdrinks\b/i.test(name)) return "Drinks"
    if (/\bemotions\b/i.test(name)) return "Emotions"
    if (/\bgastro\b/i.test(name)) return "Gastro"
    if (/\bmedium\b/i.test(name)) return "Medium"
    if (/\bstrong\b/i.test(name)) return "Strong"
    return null
  }
  if (brandId === "tangiers") {
    if (/\bnoir\b/i.test(name)) return "Noir"
    if (/\bburley\b/i.test(name)) return "Burley"
    return null
  }
  if (brandId === "wto") {
    if (/nicaragua/i.test(name)) return "Nicaragua"
    if (/caribbean|carribean/i.test(name)) return "Caribbean"
    if (/\bitaly\b/i.test(name)) return "Italy"
    if (/dominicana/i.test(name)) return "Dominicana"
    if (/tanzania/i.test(name)) return "Tanzania"
    return null
  }
  if (brandId === "dogma") {
    if (/100\s*%/i.test(name)) return "100%"
    if (/limited|лимит/i.test(name)) return "Limited"
    return null
  }
  return null
}

function statusHints(flavors) {
  const h = {}
  for (const f of flavors) if (/limited|лимит/i.test(f)) h[f] = "LIMITED"
  return h
}

function splitByLine(id, flavors, sources) {
  const map = new Map()
  for (const f of flavors) {
    const line = detectLine(f, id)
    const k = line ?? "__null__"
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(f)
  }
  return [...map.entries()]
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .map(([k, fl]) => ({
      id,
      line: k === "__null__" ? null : k,
      sources: uniq(sources),
      flavors: uniq(fl).sort((a, b) => a.localeCompare(b, "ru")),
      statusHints: statusHints(fl),
    }))
}

function one(id, flavors, sources, line = null) {
  const fl = uniq(flavors).sort((a, b) => a.localeCompare(b, "ru"))
  return { id, line, sources: uniq(sources), flavors: fl, statusHints: statusHints(fl) }
}

function mergeExisting(id, extraFlavors, extraSources) {
  const existing = clean.brands.filter((b) => b.id === id)
  const allFlavors = [...existing.flatMap((b) => b.flavors), ...extraFlavors]
  const sources = [...existing.flatMap((b) => b.sources), ...extraSources]
  // fix smoke angels maple
  const fixed = allFlavors.map((f) =>
    f.replace(/^Smoke Angels"\s*\(/i, "").replace(/\)$/, "").replace(/^["«]+|["»]+$/g, "").trim()
  )
  return { flavors: uniq(fixed), sources: uniq(sources) }
}

const brands = []
const completeness = {}
const notes = [...clean.notes]
const newBrandIds = [...clean.newBrandIds]

function setC(id, n, high) {
  completeness[id] = n >= high ? "HIGH" : n >= high * 0.4 ? "MEDIUM" : "LOW"
}

// Rebuild priority brands with HH merge
{
  const { flavors, sources } = mergeExisting(
    "blackburn",
    [
      ...hhFlavors("black-burn-manual", /black\s*burn/i, /^black\s*burn\s*/i),
      ...hhFlavors("black-burn-hit", /black\s*burn/i, /^black\s*burn\s*/i),
    ],
    [
      "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/black_burn/",
      "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/black_burn_hit/",
    ]
  )
  brands.push(...splitByLine("blackburn", flavors, sources))
  setC("blackburn", uniq(flavors).length, 80)
}

{
  const { flavors, sources } = mergeExisting(
    "jam",
    hhFlavors("jam", /\bjam\b/i, /^jam\s*/i),
    ["https://hookahhouse.ru/catalog/tabak_dlya_kalyana/jam/"]
  )
  brands.push(one("jam", flavors, sources))
  setC("jam", uniq(flavors).length, 40)
}

{
  const { flavors, sources } = mergeExisting(
    "dogma",
    hhFlavors("dogma", /\bdogma\b/i, /^dogma\s*/i),
    ["https://hookahhouse.ru/catalog/tabak_dlya_kalyana/dogma/"]
  )
  brands.push(...splitByLine("dogma", flavors, sources))
  setC("dogma", uniq(flavors).length, 40)
}

{
  const { flavors, sources } = mergeExisting(
    "serbetli",
    hhFlavors("serbetli", /\bserbetli\b/i, /^serbetli\s*/i),
    ["https://hookahhouse.ru/catalog/tabak_dlya_kalyana/serbetli/"]
  )
  brands.push(one("serbetli", flavors, sources))
  setC("serbetli", uniq(flavors).length, 40)
}

{
  const hhOnly = hhFlavors("sebero-black", /sebero/i, /^sebero(\s*black)?\s*/i)
  const base = clean.brands.filter((b) => b.id === "sebero").flatMap((b) => b.flavors)
  const sources = [
    ...clean.brands.filter((b) => b.id === "sebero").flatMap((b) => b.sources),
    "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/sebero_black/",
  ]
  const merged = uniq([...base, ...hhOnly])
  brands.push(...splitByLine("sebero", merged, sources))
  setC("sebero", uniq(merged).length, 80)
}

{
  const { flavors, sources } = mergeExisting(
    "al-fakher",
    hhFlavors("al-fakher", /al\s*fakher/i, /^al\s*fakher\s*/i),
    ["https://hookahhouse.ru/catalog/tabak_dlya_kalyana/al_fakher/"]
  )
  brands.push(one("al-fakher", flavors, sources))
  setC("al-fakher", uniq(flavors).length, 20)
  if (!newBrandIds.includes("al-fakher")) newBrandIds.push("al-fakher")
}

// Pass-through other brands from clean
for (const b of clean.brands) {
  if (["blackburn", "jam", "dogma", "serbetli", "sebero", "al-fakher"].includes(b.id)) continue
  brands.push(b)
  if (completeness[b.id] == null) completeness[b.id] = clean.completeness[b.id]
}

notes.push(
  "hookahhouse.ru: black_burn (пагинация ~17 стр), black_burn_hit, jam, dogma, serbetli, sebero_black, al_fakher",
  "Serbetli дополнен с hookahhouse.ru (ранее только 13 на sevas)"
)

// Fix sebero line: remove default Classic forcing — already using null in detectLine now
// Recompute completeness for pass-through
for (const id of Object.keys(clean.completeness)) {
  if (completeness[id] == null) completeness[id] = clean.completeness[id]
}

const result = {
  brands: brands.sort((a, b) => a.id.localeCompare(b.id) || String(a.line).localeCompare(String(b.line))),
  newBrandIds: uniq(newBrandIds).sort(),
  notes: uniq(notes),
  completeness,
}

writeFileSync(new URL("./ru-flavors-final.json", import.meta.url), JSON.stringify(result, null, 2), "utf8")

for (const id of Object.keys(completeness).sort()) {
  const entries = result.brands.filter((b) => b.id === id)
  const n = uniq(entries.flatMap((e) => e.flavors)).length
  console.log(
    id,
    n,
    completeness[id],
    entries.map((e) => `${e.line}:${e.flavors.length}`).join(", ")
  )
}
console.log("entries", result.brands.length, "file ok")
