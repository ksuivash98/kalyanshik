/**
 * Sanitize ru-low-clean + re-extract MattPear from mykalyan/HH/hookahset with strict rules.
 * Then merge into tobacco seed files + update index.
 */
import fs from "fs"
import path from "path"

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9" },
    redirect: "follow",
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) return { ok: false, status: res.status, url: res.url, html: "" }
  return { ok: true, status: res.status, url: res.url, html: await res.text() }
}

function decode(s) {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeKey(s) {
  return String(s)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘‛`´]/g, "'")
    .replace(/["«»„“”]/g, "")
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

function isCleanName(name) {
  if (!name || name.length < 2 || name.length > 80) return false
  if (/[<>{}=]|href|DETAIL_|data-entity|под заказ|промо|купить|магазин|производител|ссылк|вкус по|любой вкус|это |непревзойд|спектр|spectrum|one hit|40-grams|airkraft|pageSpeed/i.test(name))
    return false
  if (/^[-–,.\s]+/.test(name)) return false
  if (/^для кальяна|^по лучшей|^стал |^вы можете/i.test(name)) return false
  // must look like a flavor (latin/cyrillic word chars)
  if (!/[A-Za-zА-Яа-яЁё]/.test(name)) return false
  return true
}

function stripWeightAndAlias(n) {
  let x = n
  x = x.replace(/\s+\d+\s*гр\.?\s*(\([^)]*\))?$/i, "")
  x = x.replace(/\s*\([^)]*\)\s*$/g, "")
  x = x.replace(/\s+\d+\s*г\.?$/i, "")
  return x.replace(/\s+/g, " ").trim()
}

function detectLine(raw) {
  const n = raw.toLowerCase()
  if (/crazy/.test(n)) return "Crazy"
  if (/old school|oldschool/.test(n)) return "Old School"
  if (/\bpop\b/.test(n)) return "Pop"
  if (/hallz/.test(n)) return "Hallz"
  return "Classic"
}

function upsert(map, brandId, line, name, sources, status = "UNKNOWN") {
  const clean = stripWeightAndAlias(name)
  if (!isCleanName(clean)) return
  const key = `${brandId}::${normalizeKey(line)}::${normalizeKey(clean)}`
  const prev = map.get(key)
  if (prev) {
    prev.sources = [...new Set([...prev.sources, ...sources])]
    return
  }
  map.set(key, { brandId, line, name: clean, sources: [...sources], status })
}

const map = new Map()

// --- mykalyan: only h3 product titles ---
{
  const base = "https://www.mykalyan.ru/shop/tabak/tabak-mattpear/"
  for (let p = 1; p <= 50; p++) {
    await delay(p === 1 ? 0 : 160)
    const url = p === 1 ? base : `${base}${p}/`
    const r = await fetchText(url)
    if (!r.ok) break
    let m
    let count = 0
    const re = /<h3[^>]*>\s*(?:<a[^>]*>)?\s*(Табак\s+MattPear\s*[-–—]\s*[^<]+?)\s*(?:<\/a>)?\s*<\/h3>/gi
    while ((m = re.exec(r.html))) {
      const raw = decode(m[1])
      let name = raw.replace(/^Табак\s+MattPear\s*[-–—]\s*/i, "")
      name = stripWeightAndAlias(name)
      upsert(map, "mattpear", detectLine(raw), name, [url], "UNKNOWN")
      count++
    }
    console.log("mk", p, count, "unique", [...map.keys()].filter((k) => k.startsWith("mattpear")).length)
    if (p > 1 && count === 0) break
  }
}

// --- hookahhouse ---
{
  const base = "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/mattpear_1/"
  const first = await fetchText(base)
  const maxPage = Math.max(1, ...[...first.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]))
  for (let p = 1; p <= maxPage; p++) {
    await delay(p === 1 ? 0 : 180)
    const url = p === 1 ? base : `${base}?PAGEN_1=${p}`
    const r = p === 1 ? first : await fetchText(url)
    if (!r.ok) break
    let m
    const re = />(MattPear[^<]{2,90})<\/(?:a|div|span|h\d)>/gi
    while ((m = re.exec(r.html))) {
      const raw = decode(m[1])
      let name = raw
        .replace(/^MattPear\s*(Tobacco)?\s*/i, "")
        .replace(/^CRAZY\s+/i, "")
        .replace(/^new\s+/i, "")
      name = stripWeightAndAlias(name)
      if (/промо|^$/i.test(name)) continue
      upsert(map, "mattpear", detectLine(raw), name, [url], "UNKNOWN")
    }
  }
  console.log("after hh", [...map.keys()].filter((k) => k.startsWith("mattpear")).length)
}

// --- hookahset curated list from known product titles pattern ---
{
  const url = "https://hookahset.ru/catalog/tabak-matt-pear"
  const r = await fetchText(url)
  if (r.ok) {
    let m
    const re = /(?:Табак\s+)?Matt\s*Pear\s+(Pop|Crazy|Old School)\s*[-–—]\s*([A-Za-z][A-Za-z0-9 ']+)/gi
    while ((m = re.exec(r.html))) {
      const line = m[1]
      const name = m[2].trim()
      const lineNorm =
        /crazy/i.test(line) ? "Crazy" : /old/i.test(line) ? "Old School" : /pop/i.test(line) ? "Pop" : "Classic"
      upsert(map, "mattpear", lineNorm, name, [url], "ACTIVE")
    }
  }
}

// --- Aircraft from moredyma only (verified product titles) ---
{
  const url = "https://moredyma.su/tabak-dlya-kalyana/aircraft/"
  const r = await fetchText(url)
  if (r.ok) {
    let m
    const re = /woocommerce-loop-product__title[^>]*>([^<]+)</gi
    while ((m = re.exec(r.html))) {
      let name = decode(m[1])
      name = name.replace(/^Табак\s+(для кальяна\s+)?/i, "")
      name = name.replace(/^Aircraft\s*/i, "")
      name = stripWeightAndAlias(name)
      if (!isCleanName(name)) continue
      upsert(map, "aircraft", "Classic", name, [url], "ACTIVE")
    }
    // fallback h2
    const re2 = /<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]+)</gi
    while ((m = re2.exec(r.html))) {
      let name = decode(m[1]).replace(/^Табак\s+(для кальяна\s+)?Aircraft\s*/i, "")
      name = stripWeightAndAlias(name)
      if (!isCleanName(name)) continue
      upsert(map, "aircraft", "Classic", name, [url], "ACTIVE")
    }
  }
  // keep already known dump aircraft if scrape empty — also add from search snippets verified RU
  const knownRu = [
    { name: "Strawberries (Клубника)", status: "DISCONTINUED", sources: ["https://justfreid.ru/catalog/tabak/aircraft/aircraft_33313.html"] },
    { name: "British Banoffee (Британский Баноффи)", status: "DISCONTINUED", sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"] },
    { name: "California Cola (Калифорнийская кола)", status: "DISCONTINUED", sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"] },
    { name: "Lombardy Nut (Ломбардский орех)", status: "DISCONTINUED", sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"] },
    { name: "Raffaelo (Рафаэло)", status: "DISCONTINUED", sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"] },
  ]
  for (const k of knownRu) {
    upsert(map, "aircraft", "Classic", k.name, k.sources, k.status)
  }
}

const byBrand = {}
for (const it of map.values()) {
  ;(byBrand[it.brandId] ??= []).push(it)
}
for (const id of Object.keys(byBrand)) {
  byBrand[id].sort((a, b) => a.line.localeCompare(b.line) || a.name.localeCompare(b.name, "ru"))
  console.log("CLEAN", id, byBrand[id].length)
  console.log(byBrand[id].slice(0, 15).map((x) => x.line + " | " + x.name).join("\n"))
}

fs.writeFileSync(
  "scripts/ru-low-clean.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), brands: byBrand }, null, 2)
)

// --- Merge into existing tobacco files without full regen ---
function guessTags(name) {
  const n = String(name).toLowerCase()
  const tags = []
  const add = (t) => {
    if (!tags.includes(t)) tags.push(t)
  }
  if (/mint|мята|холод|frost|ice |ice$|freeze/.test(n)) add("cold")
  if (/lemon|лимон/.test(n)) add("lemon")
  if (/berry|ягод|черник|малин|клубник|ежевик|смородин|yagoda/.test(n)) add("berry")
  if (/mango|манго/.test(n)) add("mango")
  if (/peach|персик/.test(n)) add("peach")
  if (/pineapple|(?<![a-z])ananas(?![a-z])|ананас/.test(n)) add("pineapple")
  if (/(?:^|[^a-z])apple(?:[^a-z]|$)|яблок|granny/.test(n)) add("apple")
  if (/grapefruit|грейпфрут/.test(n)) add("grapefruit")
  if (/(?:^|[^a-z])grape(?:[^a-z]|$)|виноград/.test(n)) add("grape")
  if (/melon|дын|tikwa|pumpkin/.test(n) && !/watermelon|арбуз/.test(n)) add("melon")
  if (/tea|чай/.test(n)) add("tea")
  if (/coffee|кофе/.test(n)) add("coffee")
  if (/cream|шоколад|chocco|waffle|wafl|biscuit|cake|dessert|rum babe|banoffee|raffaelo/.test(n))
    add("dessert")
  if (/citrus|цитрус|cooler|lime|лайм/.test(n)) add("citrus")
  if (/ginger|имбирь|spice|кориц|гвоздик|kretek/.test(n)) add("spice")
  if (/cola|кола/.test(n)) add("cola")
  if (tags.length === 0) add("fruity")
  return tags
}

function esc(s) {
  return JSON.stringify(s)
}

function writeBrandFile(brandId, items, strength = 4) {
  const exportName = `${brandId.replace(/-/g, "_").toUpperCase()}_TOBACCOS`
  const body = items
    .map((it) => {
      const status = it.status && it.status !== "ACTIVE" ? `\n    status: ${esc(it.status)},` : ""
      return `  {\n    name: ${esc(it.name)},\n    line: ${esc(it.line)},\n    tags: ${esc(guessTags(it.name))},\n    sources: [${it.sources.map(esc).join(", ")}],\n    strengthHint: ${strength},${status}\n  },`
    })
    .join("\n")
  const file = `import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). */
const ITEMS = [
${body}
] as const

export const ${exportName}: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: ${esc(brandId)},
    name: item.name,
    line: item.line,
    tags: [...item.tags],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
    status: ("status" in item
      ? (item as { status?: TobaccoStatus }).status
      : "ACTIVE") as TobaccoStatus | undefined,
  })
)
`
  fs.writeFileSync(path.join("src/data/catalog/tobaccos", `${brandId}.ts`), file)
  return exportName
}

// Merge aircraft with existing 4 if needed
const aircraftItems = byBrand.aircraft || []
const existingAircraftPath = "src/data/catalog/tobaccos/aircraft.ts"
if (fs.existsSync(existingAircraftPath)) {
  // keep unique by normalize
  const seen = new Set(aircraftItems.map((x) => normalizeKey(x.name)))
  const extra = [
    {
      name: "Бленд огневой сушки",
      line: "Classic",
      sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
      status: "ACTIVE",
    },
    {
      name: "Ceylon Chips (Кокосовые чипсы)",
      line: "Classic",
      sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
      status: "ACTIVE",
    },
    {
      name: "French Cider (Французский сидр)",
      line: "Classic",
      sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
      status: "ACTIVE",
    },
    {
      name: "Polish Rum Biscuit (Польский ромовый бисквит)",
      line: "Classic",
      sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
      status: "ACTIVE",
    },
  ]
  for (const e of extra) {
    if (!seen.has(normalizeKey(e.name))) aircraftItems.push(e)
  }
}
aircraftItems.sort((a, b) => a.name.localeCompare(b.name, "ru"))

const mattExport = writeBrandFile("mattpear", byBrand.mattpear || [], 4)
const airExport = writeBrandFile("aircraft", aircraftItems, 4)
console.log("wrote", mattExport, (byBrand.mattpear || []).length)
console.log("wrote", airExport, aircraftItems.length)

// Patch index.ts if mattpear missing
const indexPath = "src/data/catalog/index.ts"
let index = fs.readFileSync(indexPath, "utf8")
if (!index.includes("MATTPEAR_TOBACCOS")) {
  index = index.replace(
    'import { MUSTHAVE_TOBACCOS } from "./tobaccos/musthave"',
    'import { MATTPEAR_TOBACCOS } from "./tobaccos/mattpear"\nimport { MUSTHAVE_TOBACCOS } from "./tobaccos/musthave"'
  )
  index = index.replace(
    "  ...MUSTHAVE_TOBACCOS,",
    "  ...MATTPEAR_TOBACCOS,\n  ...MUSTHAVE_TOBACCOS,"
  )
  fs.writeFileSync(indexPath, index)
  console.log("patched index.ts for mattpear")
}

// Update brand completeness
const bcPath = "src/data/catalog/brand-completeness.ts"
let bc = fs.readFileSync(bcPath, "utf8")
bc = bc.replace(/mattpear: "LOW"/, 'mattpear: "HIGH"')
bc = bc.replace(/aircraft: "LOW"/, 'aircraft: "MEDIUM"')
fs.writeFileSync(bcPath, bc)
console.log("updated completeness")
