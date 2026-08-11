/**
 * Dump current catalog → merge with scripts/ru-flavors-final.json → regenerate tobacco seeds.
 * Run: npx tsx scripts/merge-ru-expand.mjs  (uses compiled dump via child)
 */
import fs from "fs"
import path from "path"
import { createRequire } from "module"
import { register } from "tsx/esm/api"

// Use dynamic import of catalog via tsx runner instead — this file is run with tsx
const OUT = "src/data/catalog/tobaccos"
const VERIFIED = "2026-08-11"

function guessTags(name) {
  const n = String(name).toLowerCase()
  const tags = []
  const add = (t) => {
    if (!tags.includes(t)) tags.push(t)
  }
  if (/mint|мята|холод|frost|ice |ice$|supernova|freeze|shock/.test(n)) add("cold")
  if (/mint|мята/.test(n)) add("mint")
  if (/lemon|лимон/.test(n)) add("lemon")
  if (/lime|лайм/.test(n)) add("lime")
  if (/orange|апельсин/.test(n)) add("orange")
  if (/grape|виноград/.test(n)) add("grape")
  if (/berry|ягод|черник|малин|клубник|ежевик|смородин/.test(n)) add("berry")
  if (/mango|манго/.test(n)) add("mango")
  if (/peach|персик/.test(n)) add("peach")
  if (/apple|яблок|granny|granni|гренни|грэнни/.test(n)) add("apple")
  if (/watermelon|арбуз/.test(n)) add("watermelon")
  if (/melon|дын/.test(n)) add("melon")
  if (/cola|кола/.test(n)) add("cola")
  if (/tea|чай/.test(n)) add("tea")
  if (/coffee|кофе|латте/.test(n)) add("coffee")
  if (/cream|сливк|мороженое|ice cream|dessert|пирог|печенье|вафл|чизкейк|джем/.test(n))
    add("dessert")
  if (/citrus|цитрус/.test(n)) add("citrus")
  if (/tropic|тропик/.test(n)) add("tropical")
  if (/spice|кориц|прян|кашмир/.test(n)) add("spice")
  if (tags.length === 0) add("fruity")
  return tags
}

function normalizeName(value) {
  return String(value)
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[’‘‛`´]/g, "'")
    .replace(/[“”„«»]/g, "")
    .replace(/["']/g, "")
    .replace(/[–—−]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim()
}

function esc(s) {
  return JSON.stringify(s)
}

function isRuUrl(url) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "").toLowerCase()
    return (
      h.endsWith(".ru") ||
      h.endsWith(".su") ||
      h.endsWith(".рф") ||
      h.includes("xn--") ||
      h === "darkside.company" ||
      h === "blckburn.com" ||
      h === "jammtobacco.com"
    )
  } catch {
    return false
  }
}

function cleanFlavorName(name) {
  return String(name)
    .replace(/\s*[—–-]\s*\d+\s*г(р|рамм)?\.?$/i, "")
    .replace(/\s+\d+\s*г(р|рамм)?\.?$/i, "")
    .replace(/\s+\d+\s*\(m\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** @type {Map<string, {brandId:string, line:string, name:string, sources:string[], status:string, strength:number}>} */
const map = new Map()

function upsert(brandId, line, name, sources, status = "ACTIVE", strength = 3) {
  const clean = cleanFlavorName(name)
  if (!clean) return
  const ruSources = (sources || []).filter(isRuUrl)
  if (ruSources.length === 0) return
  const key = `${brandId}::${normalizeName(line || "")}::${normalizeName(clean)}`
  const existing = map.get(key)
  if (existing) {
    existing.sources = [...new Set([...existing.sources, ...ruSources])]
    if (status === "LIMITED" || status === "DISCONTINUED") existing.status = status
    return
  }
  map.set(key, {
    brandId,
    line: line || "Classic",
    name: clean,
    sources: [...new Set(ruSources)],
    status,
    strength,
  })
}

// 1) Load current catalog via dump file if present, else skip
const dumpPath = "scripts/catalog-dump.json"
if (fs.existsSync(dumpPath)) {
  const dump = JSON.parse(fs.readFileSync(dumpPath, "utf8"))
  for (const t of dump.tobaccos || []) {
    upsert(
      t.brandId,
      t.line,
      t.name,
      (t.sources || []).map((s) => (typeof s === "string" ? s : s.url)).filter(Boolean),
      t.status || "ACTIVE",
      t.estimatedProfile?.strength ?? 3
    )
  }
  console.log("Loaded dump:", dump.tobaccos?.length)
}

// 2) Merge expansion JSON
const expansion = JSON.parse(fs.readFileSync("scripts/ru-flavors-final.json", "utf8"))
for (const b of expansion.brands || []) {
  if (!b.flavors?.length) continue
  const strength =
    b.id === "blackburn" || b.id === "wto" || b.id === "kraken" || b.id === "dogma"
      ? 4
      : b.id === "jam" || b.id === "chabacco"
        ? 1
        : 3
  for (const name of b.flavors) {
    const status = b.statusHints?.[name] || (b.line === "Limited" ? "LIMITED" : "ACTIVE")
    upsert(b.id, b.line, name, b.sources || [], status, strength)
  }
}
console.log("After merge unique:", map.size)

// 3) Write tobacco files by brand
const byBrand = new Map()
for (const item of map.values()) {
  const list = byBrand.get(item.brandId) ?? []
  list.push(item)
  byBrand.set(item.brandId, list)
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith(".ts")) fs.unlinkSync(path.join(OUT, f))
}

const brandExports = []
for (const [brandId, items] of [...byBrand.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  items.sort((a, b) => a.line.localeCompare(b.line) || a.name.localeCompare(b.name, "ru"))
  const exportName = `${brandId.replace(/-/g, "_").toUpperCase()}_TOBACCOS`
  const body = items
    .map((it) => {
      const src = it.sources.map((s) => esc(s)).join(", ")
      const tags = esc(guessTags(it.name))
      const status =
        it.status !== "ACTIVE" ? `\n    status: ${esc(it.status)},` : ""
      return `  {\n    name: ${esc(it.name)},\n    line: ${esc(it.line)},\n    tags: ${tags},\n    sources: [${src}],\n    strengthHint: ${it.strength},${status}\n  },`
    })
    .join("\n")

  const file = `import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Russian market sources only (${VERIFIED}). */
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
`.replace(
    'import { TobaccoSeed } from "@/types/catalog"',
    'import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"'
  )
  fs.writeFileSync(path.join(OUT, `${brandId}.ts`), file)
  brandExports.push({ brandId, exportName, count: items.length })
  console.log(brandId, items.length)
}

fs.writeFileSync(
  "scripts/ru-merge-stats.json",
  JSON.stringify(
    {
      total: map.size,
      brands: Object.fromEntries(brandExports.map((b) => [b.brandId, b.count])),
      completeness: expansion.completeness || {},
      newBrandIds: expansion.newBrandIds || [],
      generatedAt: VERIFIED,
    },
    null,
    2
  )
)

// Write index imports helper
const imports = brandExports
  .map((b) => `import { ${b.exportName} } from "./tobaccos/${b.brandId}"`)
  .join("\n")
const spread = brandExports.map((b) => `  ...${b.exportName},`).join("\n")
fs.writeFileSync(
  "scripts/index-tobaccos-snippet.txt",
  `${imports}\n\nconst ALL_TOBACCOS = dedupeByBrandName([\n${spread}\n])\n`
)
console.log("\nWrote", brandExports.length, "brand files,", map.size, "flavors")
