import { readFileSync, writeFileSync, existsSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const dir = dirname(fileURLToPath(import.meta.url))

function load(name) {
  const p = join(dir, name)
  if (!existsSync(p)) return null
  return JSON.parse(readFileSync(p, "utf8"))
}

function uniq(a) {
  const s = new Set()
  const o = []
  for (const x of a) {
    const k = String(x).toLowerCase().replace(/\s+/g, " ").trim()
    if (x && !s.has(k)) {
      s.add(k)
      o.push(String(x).replace(/\s+/g, " ").trim())
    }
  }
  return o
}

function stripPack(n) {
  return n
    .replace(/\s*[-–—]?\s*\(?\s*\d+([.,]\d+)?\s*(гр|г|g|GR|ml)?\.?\s*\)?\s*$/i, "")
    .replace(/\s*\(\s*акциз\s*\)\s*$/i, "")
    .replace(/\s*\(\s*M\s*\)\s*$/i, "")
    .trim()
}

function stripNoise(n) {
  if (!n) return null
  if (/^(интернет|mary|justfreid|купить|магазин|фильтр|сортировка|показать|добавить)/i.test(n)) return null
  if (/price|%price%|cookie|согласен/i.test(n)) return null
  if (n.length < 2 || n.length > 120) return null
  return n
}

/** Sevas titles like "Смесь для кальяна Kraken Medium Seco Black Corn Черная кукуруза" */
function sevasFlavor(title, brandPatterns) {
  let n = title
  n = n.replace(/^Табак для кальяна\s+/i, "")
  n = n.replace(/^Смесь для кальяна\s+/i, "")
  n = n.replace(/^Доха для кальяна\s+/i, "")
  n = stripPack(n)
  // remove brand prefix
  for (const b of brandPatterns) {
    n = n.replace(new RegExp("^" + b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+", "i"), "")
  }
  // drop category-only leftovers like "Medium" alone from sidebar
  if (/^(medium|strong|classic|shock|hit|light|dark|base|core)$/i.test(n.trim())) return null
  return stripNoise(n)
}

function jfFlavor(title, brandPatterns) {
  let n = title
  n = n.replace(/^(ТАБАК|СМЕСЬ|Табак|Смесь)\s+/i, "")
  n = stripPack(n)
  // Prefer keeping "BRAND - FLAVOR" then strip brand
  for (const b of brandPatterns) {
    const re = new RegExp("^" + b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*[-–—:]?\\s*", "i")
    if (re.test(n)) {
      n = n.replace(re, "")
      break
    }
  }
  n = n.replace(/\s*-\s*\d+\s*$/, "")
  return stripNoise(n)
}

function smFlavor(title, brandPatterns) {
  let n = title.replace(/^Табак\s+/i, "")
  for (const b of brandPatterns) {
    n = n.replace(new RegExp("^" + b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+", "i"), "")
  }
  return stripNoise(stripPack(n))
}

function mdFlavor(title, brandPatterns) {
  let n = title.replace(/^Табак\s+/i, "").replace(/^Смесь\s+/i, "")
  for (const b of brandPatterns) {
    n = n.replace(new RegExp("^" + b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+", "i"), "")
  }
  return stripNoise(stripPack(n))
}

function detectLine(name, brandId) {
  const n = name.toLowerCase()
  if (brandId === "blackburn" || brandId === "burn") {
    if (/\bshock\b/i.test(name)) return "Shock"
    if (/\bhit\b/i.test(name) || /\bhi[tт]\b/i.test(name)) return "HiT"
    if (/\bkmtm\b/i.test(name)) return "KMTM"
    return "Classic"
  }
  if (brandId === "kraken") {
    if (/strong/i.test(name)) return "Strong"
    if (/medium/i.test(name) || /\bseco\b/i.test(name) || /\bcaviar\b/i.test(name)) return "Medium"
  }
  if (brandId === "sebero") {
    if (/arctic/i.test(name)) return "Arctic Mix"
    if (/limited\s*mix/i.test(name)) return "Limited Mix"
    if (/limited/i.test(name)) return "Limited"
    if (/classic/i.test(name)) return "Classic"
  }
  if (brandId === "chabacco") {
    if (/medium\s*mix/i.test(name)) return "Medium Mix"
    if (/medium/i.test(name)) return "Medium"
    if (/strong/i.test(name)) return "Strong"
  }
  if (brandId === "dogma") {
    if (/100%|100 %/i.test(name)) return "100%"
  }
  return null
}

function statusHints(flavors) {
  const hints = {}
  for (const f of flavors) {
    if (/limited|лимит/i.test(f)) hints[f] = "LIMITED"
  }
  return hints
}

function completeness(count, expectedHigh) {
  if (count >= expectedHigh) return "HIGH"
  if (count >= expectedHigh * 0.4) return "MEDIUM"
  if (count > 0) return "LOW"
  return "LOW"
}

const sevas = load("ru-sevas.json")
const smjf = load("ru-sm-jf.json")
const raw = load("ru-scrape-raw.json")
const jfextra = load("ru-jf-extra.json")
const mdjf = load("ru-moredyma-jf.json")

const brandDefs = {
  blackburn: {
    id: "blackburn",
    patterns: ["Black Burn", "BLACK Burn", "BLACKBURN", "Burn", "Блэкберн", "Блэк Берн"],
    sevas: ["burn"],
    expected: 80,
  },
  jam: { id: "jam", patterns: ["Jam", "JAM"], sevas: ["jam"], expected: 40 },
  kraken: { id: "kraken", patterns: ["Kraken", "KRAKEN"], sevas: ["kraken"], expected: 40 },
  dogma: { id: "dogma", patterns: ["Dogma", "DOGMA"], sevas: ["dogma"], expected: 40 },
  serbetli: { id: "serbetli", patterns: ["Serbetli", "SERBETLI", "Щербетли"], sevas: ["serbetli"], expected: 50 },
  bliss: { id: "bliss", patterns: ["Bliss", "BLISS"], sevas: ["bliss"], expected: 25 },
  fake: { id: "fake", patterns: ["Fake", "FAKE"], sevas: ["fake"], expected: 15 },
  joy: { id: "joy", patterns: ["Joy", "JOY"], sevas: ["joy"], expected: 30 },
  sebero: { id: "sebero", patterns: ["Sebero", "SEBERO"], sevas: ["sebero"], expected: 100 },
  chabacco: { id: "chabacco", patterns: ["Chabacco", "CHABACCO", "Chaba"], sevas: ["chabacco"], expected: 50 },
  morpheus: { id: "morpheus", patterns: ["Morpheus", "MORPHEUS", "Морфеус"], sevas: ["morpheus"], expected: 15 },
  palitra: { id: "palitra", patterns: ["Palitra", "PALITRA", "Палитра"], sevas: ["palitra"], expected: 30 },
  snobless: { id: "snobless", patterns: ["Snobless", "SNOBLESS"], sevas: ["snobless"], expected: 20 },
  take: { id: "take", patterns: ["Take", "TAKE"], sevas: ["take"], expected: 20 },
  "smoke-angels": {
    id: "smoke-angels",
    patterns: ["Smoke Angels", "SMOKE ANGELS"],
    sevas: [],
    expected: 20,
  },
  wto: { id: "wto", patterns: ["WTO"], sevas: [], expected: 30 },
  helix: { id: "helix", patterns: ["Helix", "HELIX"], sevas: [], expected: 20 },
  cobra: { id: "cobra", patterns: ["Cobra", "КОБРА", "Кобра", "X КОБРА"], sevas: [], expected: 20 },
  aircraft: { id: "aircraft", patterns: ["Aircraft", "AIRCRAFT", "Аиркрафт"], sevas: [], expected: 20 },
  mattpear: { id: "mattpear", patterns: ["MattPear", "Matt Pear", "MATTPEAR"], sevas: [], expected: 20 },
  tangiers: { id: "tangiers", patterns: ["Tangiers", "TANGIERS"], sevas: [], expected: 20 },
  "al-fakher": { id: "al-fakher", patterns: ["Al Fakher", "AL FAKHER", "Альфакер"], sevas: [], expected: 15 },
  hlgn: { id: "hlgn", patterns: ["HLGN", "ХЛГN", "ХЛГ"], sevas: [], expected: 15 },
  molodost: { id: "molodost", patterns: ["Молодость", "МОЛОДОСТЬ", "Young Blood"], sevas: [], expected: 15 },
  nur: { id: "nur", patterns: ["NUR"], sevas: [], expected: 15 },
  iskra: { id: "iskra", patterns: ["Iskra", "ISKRA", "Искра"], sevas: [], expected: 10 },
  funel: { id: "funel", patterns: ["Funel", "FUNEL"], sevas: [], expected: 10 },
  "dead-horse": { id: "dead-horse", patterns: ["Dead Horse", "DEAD HORSE"], sevas: [], expected: 10 },
  blackleaf: { id: "blackleaf", patterns: ["Blackleaf", "BLACKLEAF"], sevas: [], expected: 10 },
  unity: { id: "unity", patterns: ["Unity", "UNITY"], sevas: [], expected: 10 },
  craftium: { id: "craftium", patterns: ["Craftium", "CRAFTIUM"], sevas: [], expected: 10 },
  "northern-forest": { id: "northern-forest", patterns: ["Northern Forest"], sevas: [], expected: 10 },
  "social-smoke": { id: "social-smoke", patterns: ["Social Smoke"], sevas: [], expected: 10 },
}

const notes = []
const brandsOut = []
const completenessMap = {}
const newBrandIds = []

const existingKnown = new Set([
  "blackburn",
  "serbetli",
  "smoke-angels",
  "sebero",
  "chabacco",
  "darkside",
  "musthave",
  "duft",
  "element",
  "spectrum",
  "starline",
  "adalya",
  "satyr",
  "bonche",
  "overdose",
  "daily-hookah",
  "severnyy",
  "nash",
  "sarma",
  "huligan",
  "jent",
  "trofimoff",
  "deus",
  "sapphire-crown",
  "brusko",
  "banger",
])

function collectFor(def) {
  const flavors = []
  const sources = []

  if (sevas) {
    for (const slug of def.sevas) {
      const b = sevas.brands[slug]
      if (!b?.flavors?.length) continue
      sources.push(...(b.sources || []))
      for (const t of b.flavors) {
        const f = sevasFlavor(t, def.patterns)
        if (f) flavors.push(f)
      }
    }
  }

  // smokemaster from smjf / raw / mdjf
  const smKeys = [def.id, def.id.replace("-", ""), "blackburn"]
  if (smjf?.sm?.[def.id]?.flavors) {
    sources.push(...(smjf.sm[def.id].sources || []))
    for (const t of smjf.sm[def.id].flavors) {
      const f = smFlavor(t, def.patterns)
      if (f) flavors.push(f)
    }
  }
  if (raw?.brands?.[`sm:${def.id}`]?.flavors) {
    sources.push(...(raw.brands[`sm:${def.id}`].sources || []))
    for (const t of raw.brands[`sm:${def.id}`].flavors) {
      const f = smFlavor(t, def.patterns)
      if (f) flavors.push(f)
    }
  }

  // justfreid
  for (const src of [smjf?.jf?.[def.id], raw?.brands?.[`jf:${def.id}`], mdjf?.brands?.[`jf:${def.id}`], mdjf?.brands?.[`jf:${def.id.replace("-", "")}`]]) {
    if (!src?.flavors && !src?.flavorsRaw) continue
    const list = src.flavors || src.flavorsRaw || []
    sources.push(...(src.sources || []))
    for (const t of list) {
      const f = jfFlavor(t, def.patterns)
      if (f) flavors.push(f)
    }
  }

  // moredyma
  if (mdjf) {
    for (const [k, v] of Object.entries(mdjf.brands || {})) {
      if (!k.startsWith("md:")) continue
      const slug = k.slice(3)
      const match =
        slug === def.id ||
        slug === def.id.replace(/-/g, "") ||
        (def.id === "blackburn" && (slug === "black-burn" || slug === "burn")) ||
        (def.id === "joy" && slug.startsWith("joy")) ||
        (def.id === "al-fakher" && slug === "al-fakher") ||
        (def.id === "smoke-angels" && slug.includes("smoke")) ||
        (def.id === "darkside" && slug.includes("dark"))
      if (!match) continue
      sources.push(...(v.sources || []))
      for (const t of v.flavorsRaw || v.flavors || []) {
        const f = mdFlavor(t, def.patterns)
        if (f) flavors.push(f)
      }
    }
  }

  // hookahhouse jam
  if (def.id === "jam") {
    for (const src of [jfextra?.hookahhouse?.jam, mdjf?.brands?.["hh:jam"], raw?.brands?.["hh:jam"]]) {
      if (!src) continue
      sources.push(...(src.sources || []))
      for (const t of src.flavors || src.flavorsRaw || []) {
        let f = t.replace(/^Табак\s+/i, "")
        for (const b of def.patterns) f = f.replace(new RegExp("^" + b + "\\s+", "i"), "")
        f = stripNoise(stripPack(f))
        if (f) flavors.push(f)
      }
    }
  }

  // Split by line for blackburn optional — keep single brand with line field null at brand level;
  // user asked line Classic|Shock|HiT|null per brand entry — we can emit multiple entries per line
  return { flavors: uniq(flavors).sort((a, b) => a.localeCompare(b, "ru")), sources: uniq(sources) }
}

// If mdjf not ready, still process sevas-heavy brands
for (const def of Object.values(brandDefs)) {
  const { flavors, sources } = collectFor(def)
  if (!flavors.length && !sources.length) continue

  // For blackburn, split into line groups as separate brand objects? User schema has one object with line field.
  // Emit one object per line when we can classify, plus unclassified.
  if (def.id === "blackburn" || def.id === "sebero" || def.id === "kraken" || def.id === "chabacco") {
    const byLine = new Map()
    for (const f of flavors) {
      const line = detectLine(f, def.id) || "null"
      if (!byLine.has(line)) byLine.set(line, [])
      byLine.get(line).push(f)
    }
    // Prefer single brand entry with line null and full list if many lines — user schema allows one line per entry
    // Emit separate entries per line for clarity
    for (const [line, fl] of byLine) {
      brandsOut.push({
        id: def.id,
        line: line === "null" ? null : line,
        sources,
        flavors: fl,
        statusHints: statusHints(fl),
      })
    }
  } else {
    brandsOut.push({
      id: def.id,
      line: null,
      sources,
      flavors,
      statusHints: statusHints(flavors),
    })
  }

  completenessMap[def.id] = completeness(flavors.length, def.expected)
  if (!existingKnown.has(def.id) && flavors.length) newBrandIds.push(def.id)
}

// Add other sevas brands that are new
if (sevas) {
  const map = {
    feed: "feed",
  }
  for (const [slug, b] of Object.entries(sevas.brands)) {
    if (!b.ok || !b.flavors?.length) continue
    if (Object.values(brandDefs).some((d) => d.sevas.includes(slug) || d.id === slug)) continue
    // skip already in catalog major brands unless we want them — user asked for max completeness for gaps;
    // include useful new ones: feed already tiny
  }
}

const result = {
  brands: brandsOut,
  newBrandIds: uniq(newBrandIds),
  notes: [
    ...notes,
    ...(sevas?.notes || []),
    ...(mdjf?.notes || []),
    "sevas brand path: /product-category/tabak-dlya-kalyana/{slug}/ (не /brand/)",
    "hookah-voodoo.com пропущен (не .ru)",
    "4kalyans.ru: fetch failed",
    `sevas brand slugs: ${(sevas?.brandSlugs || []).join(", ")}`,
    mdjf ? `moredyma slugs: ${(mdjf.moredymaSlugs || []).join(", ")}` : "moredyma scrape pending",
  ],
  completeness: completenessMap,
  meta: {
    sevasLoaded: !!sevas,
    mdjfLoaded: !!mdjf,
    brandEntries: brandsOut.length,
    totalFlavorRows: brandsOut.reduce((s, b) => s + b.flavors.length, 0),
  },
}

writeFileSync(join(dir, "ru-flavors-merged.json"), JSON.stringify(result, null, 2), "utf8")
console.log(JSON.stringify(result.meta, null, 2))
for (const b of brandsOut) {
  console.log(b.id, b.line, b.flavors.length)
}
