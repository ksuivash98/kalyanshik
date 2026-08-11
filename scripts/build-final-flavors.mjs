import { readFileSync, writeFileSync, existsSync } from "fs"

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9" },
      redirect: "follow",
      signal: AbortSignal.timeout(45000),
    })
    if (!res.ok) return null
    return { url: res.url, html: await res.text() }
  } catch {
    return null
  }
}

function decode(s) {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/\s+/g, " ")
    .trim()
}

function stripTags(s) {
  return decode(String(s).replace(/<[^>]+>/g, " "))
}

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const k = String(x).toLowerCase().replace(/\s+/g, " ").trim()
    if (!x || !k || seen.has(k)) continue
    seen.add(k)
    out.push(String(x).replace(/\s+/g, " ").trim())
  }
  return out
}

function stripPack(n) {
  return n
    .replace(/,?\s*\d+\s*(гр|г|g|GR)\.?\s*(\([^)]*\))?$/i, "")
    .replace(/\s*[-–—]?\s*\d+\s*(гр|г|g|GR)\.?\s*$/i, "")
    .replace(/\s+\d+\s*г\s*(МРК|БПК)?$/i, "")
    .replace(/\s*\(\s*M\s*\)\s*$/i, "")
    .replace(/\s*\(\s*акциз\s*\)\s*$/i, "")
    .replace(/\s+МРК$/i, "")
    .replace(/\s+БПК$/i, "")
    .replace(/\s*[-–—]\s*\d+\s*$/i, "")
    .trim()
}

function isNoise(n) {
  if (!n || n.length < 2 || n.length > 140) return true
  return /^(mary|интернет|как выбрать|линейки|что ещё|в севас|авторизация|главная|магазин|кальянный|табак для кальяна|фильтр|сортировка|добавить|cookie|согласен|smoke angels$|jam$|dogma$|serbetli$|bliss$|fake$|joy$|take$|morpheus$|burn$|kraken medium$|kraken strong$|sebero arctic mix$|chabacco drinks medium$|chabacco emotions$|chabacco gastro$)/i.test(
    n.trim()
  )
}

function matchesBrand(text, patterns) {
  return patterns.some((p) => new RegExp(p, "i").test(text))
}

function stripBrandPrefix(n, patterns) {
  let x = n
  for (const p of patterns) {
    const re = new RegExp("^" + p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*[-–—:]?\\s*", "i")
    if (re.test(x)) {
      x = x.replace(re, "")
      break
    }
  }
  return x.trim()
}

function cleanFlavor(raw, patterns, { keepBrandInName = false } = {}) {
  if (!matchesBrand(raw, patterns) && !keepBrandInName) {
    // allow if already stripped elsewhere
    return null
  }
  let n = raw
  n = n.replace(/^Табак для кальяна\s+/i, "")
  n = n.replace(/^Смесь для кальяна\s+/i, "")
  n = n.replace(/^Доха для кальяна\s+/i, "")
  n = n.replace(/^Табак\s+/i, "")
  n = n.replace(/^Смесь\s+/i, "")
  n = n.replace(/^Капсула Для Кальяна\s+/i, "")
  n = n.replace(/^ТАБАК\s+/i, "")
  n = stripPack(n)
  if (!keepBrandInName) n = stripBrandPrefix(n, patterns)
  n = n.replace(/^["«]\s*/, "").replace(/\s*["»]\s*$/, "")
  n = n.replace(/\(\s*([^)]+)\s*\)\s*$/, (_, inner) => {
    // keep russian or EN desc in paren if useful — prefer leaving full "Name (Desc)"
    return ` (${inner.trim()})`
  })
  n = n.replace(/\s+/g, " ").trim()
  // collapse empty after strip
  if (isNoise(n)) return null
  if (/^(medium|strong|classic|shock|hit|black|в севас)/i.test(n)) return null
  return n
}

/** Prefer EN code name if pattern NAME (russian) or EN — Russian */
function preferCardName(n) {
  // "Ananas Shock — Кислый Ананас" keep as is (card style)
  return n
}

function detectLine(name, brandId) {
  const n = name
  if (brandId === "blackburn") {
    if (/\bshock\b|кисл/i.test(n) && /\bshock\b/i.test(n)) return "Shock"
    if (/\bhit\b/i.test(n)) return "HiT"
    if (/\bkmtm\b/i.test(n)) return "KMTM"
    if (/\bburn black\b|^black\b/i.test(n)) return "Classic"
    return "Classic"
  }
  if (brandId === "kraken") {
    if (/\bstrong\b/i.test(n)) return "Strong"
    if (/\bmedium\b|\bseco\b|\bcaviar\b/i.test(n)) return "Medium"
    return null
  }
  if (brandId === "sebero") {
    if (/arctic\s*mix/i.test(n)) return "Arctic Mix"
    if (/limited\s*mix/i.test(n)) return "Limited Mix"
    if (/\blimited\b|лимит/i.test(n)) return "Limited"
    if (/classic|black\b/i.test(n)) return "Classic"
    return null
  }
  if (brandId === "chabacco") {
    if (/medium\s*mix/i.test(n)) return "Medium Mix"
    if (/\bdrinks\b/i.test(n)) return "Drinks"
    if (/\bemotions\b/i.test(n)) return "Emotions"
    if (/\bgastro\b/i.test(n)) return "Gastro"
    if (/\bmedium\b/i.test(n)) return "Medium"
    if (/\bstrong\b/i.test(n)) return "Strong"
    return null
  }
  if (brandId === "tangiers") {
    if (/\bnoir\b/i.test(n)) return "Noir"
    if (/\bburley\b/i.test(n)) return "Burley"
    return null
  }
  if (brandId === "wto") {
    if (/nicaragua/i.test(n)) return "Nicaragua"
    if (/caribbean/i.test(n)) return "Caribbean"
    if (/\bitaly\b/i.test(n)) return "Italy"
    return null
  }
  if (brandId === "dogma") {
    if (/100\s*%|100%/i.test(n)) return "100%"
    return null
  }
  return null
}

function statusHints(flavors) {
  const h = {}
  for (const f of flavors) {
    if (/limited|лимит|мрк/i.test(f) && /limited|лимит/i.test(f)) h[f] = "LIMITED"
  }
  return h
}

function load(name) {
  const p = new URL("./" + name, import.meta.url)
  if (!existsSync(p)) return null
  return JSON.parse(readFileSync(p, "utf8"))
}

async function scrapeMoredymaFull(slug) {
  const base = `https://moredyma.su/tabak-dlya-kalyana/${slug}/`
  const titles = []
  const sources = []
  for (let p = 1; p <= 25; p++) {
    const url = p === 1 ? base : `${base}page/${p}/`
    const r = await fetchText(url)
    if (!r) break
    // redirect away from brand?
    if (p === 1 && !r.url.includes(`/${slug}`) && !r.url.includes(slug)) {
      return { titles: [], sources: [], redirected: r.url }
    }
    const pageTitles = []
    for (const m of r.html.matchAll(/<(?:h2|h3|a)[^>]*>([^<]{5,160})<\/(?:h2|h3|a)>/gi)) {
      pageTitles.push(decode(m[1]))
    }
    for (const m of r.html.matchAll(/alt="([^"]{5,160})"/gi)) pageTitles.push(decode(m[1]))
    for (const m of r.html.matchAll(/itemprop="name"[^>]*content="([^"]+)"/gi)) pageTitles.push(decode(m[1]))
    // product card titles often in .product-title
    for (const m of r.html.matchAll(/class="[^"]*product-title[^"]*"[^>]*>([\s\S]*?)<\//gi)) {
      pageTitles.push(stripTags(m[1]))
    }
    const before = titles.length
    titles.push(...pageTitles)
    sources.push(r.url)
    if (p > 1 && titles.length === before) break
    await delay(120)
  }
  return { titles: uniq(titles), sources: uniq(sources) }
}

const sevas = load("ru-sevas.json")
const mdjf = load("ru-moredyma-jf.json")
const smjf = load("ru-sm-jf.json")
const notes = []

const BRANDS = [
  {
    id: "blackburn",
    patterns: ["Black\\s*Burn", "BLACKBURN", "BlackBurn", "Burn Black", "\\bBurn\\b"],
    sevas: ["burn"],
    md: ["black-burn", "burn"],
    jf: ["jf:burn"],
    sm: ["sm:blackburn"],
    smKeys: ["blackburn"],
    expected: 90,
  },
  {
    id: "jam",
    patterns: ["\\bJam\\b", "\\bJAM\\b"],
    sevas: ["jam"],
    md: [],
    jf: [],
    hh: ["hh:jam"],
    expected: 45,
  },
  {
    id: "kraken",
    patterns: ["Kraken", "KRAKEN"],
    sevas: ["kraken"],
    md: ["kraken"],
    jf: ["jf:kraken"],
    expected: 40,
  },
  {
    id: "dogma",
    patterns: ["Dogma", "DOGMA"],
    sevas: ["dogma"],
    md: ["dogma"],
    jf: ["jf:dogma"],
    expected: 40,
  },
  {
    id: "serbetli",
    patterns: ["Serbetli", "SERBETLI"],
    sevas: ["serbetli"],
    md: [],
    jf: [],
    expected: 40,
  },
  {
    id: "bliss",
    patterns: ["Bliss", "BLISS"],
    sevas: ["bliss"],
    md: ["bliss"],
    jf: ["jf:bliss"],
    expected: 25,
  },
  {
    id: "fake",
    patterns: ["\\bFake\\b", "\\bFAKE\\b"],
    sevas: ["fake"],
    md: ["fake"],
    jf: ["jf:fake-feyk"],
    expected: 15,
  },
  {
    id: "joy",
    patterns: ["\\bJoy\\b", "\\bJOY\\b"],
    sevas: ["joy"],
    md: ["joy-ru-10"],
    jf: ["jf:joy-dzhoy"],
    expected: 30,
  },
  {
    id: "sebero",
    patterns: ["Sebero", "SEBERO"],
    sevas: ["sebero"],
    md: ["sebero"],
    jf: ["jf:sebero"],
    expected: 100,
  },
  {
    id: "chabacco",
    patterns: ["Chabacco", "CHABACCO", "\\bChaba\\b"],
    sevas: ["chabacco"],
    md: [],
    jf: [],
    expected: 50,
  },
  {
    id: "morpheus",
    patterns: ["Morpheus", "MORPHEUS"],
    sevas: ["morpheus"],
    md: ["morpheus"],
    expected: 12,
  },
  {
    id: "palitra",
    patterns: ["Palitra", "PALITRA", "Палитра"],
    sevas: ["palitra"],
    md: ["palitra"],
    expected: 25,
  },
  {
    id: "snobless",
    patterns: ["Snobless", "SNOBLESS"],
    sevas: ["snobless"],
    md: ["snobless"],
    expected: 18,
  },
  {
    id: "take",
    patterns: ["\\bTake\\b", "\\bTAKE\\b"],
    sevas: ["take"],
    md: [],
    expected: 20,
  },
  {
    id: "smoke-angels",
    patterns: ["Smoke\\s*Angels", "SMOKE\\s*ANGELS"],
    sevas: [],
    md: ["smoke-angels"],
    jf: ["jf:smoke-angels"],
    sm: ["sm:smoke-angels"],
    smKeys: ["smoke-angels"],
    expected: 15,
  },
  {
    id: "wto",
    patterns: ["\\bWTO\\b"],
    sevas: [],
    md: ["wto"],
    jf: ["jf:wto"],
    expected: 25,
  },
  {
    id: "helix",
    patterns: ["Helix", "HELIX", "Хеликс"],
    sevas: [],
    md: ["helix"],
    jf: ["jf:helix"],
    expected: 15,
  },
  {
    id: "cobra",
    patterns: ["Cobra", "КОБРА", "Кобра", "X\\s*КОБРА"],
    sevas: [],
    md: [],
    jf: ["jf:cobra"],
    expected: 20,
  },
  {
    id: "aircraft",
    patterns: ["Aircraft", "AIRCRAFT", "Аиркрафт"],
    sevas: [],
    md: ["aircraft"],
    jf: [],
    expected: 10,
  },
  {
    id: "tangiers",
    patterns: ["Tangiers", "TANGIERS"],
    sevas: [],
    md: ["tangiers", "tangiers-noir"],
    jf: ["jf:tangiers"],
    expected: 20,
  },
  {
    id: "al-fakher",
    patterns: ["Al\\s*Fakher", "AL\\s*FAKHER", "Альфакер"],
    sevas: [],
    md: ["al-fakher"],
    jf: ["jf:al-fakher"],
    expected: 15,
  },
  {
    id: "hlgn",
    patterns: ["HLGN", "ХЛГN", "ХЛГ"],
    sevas: [],
    md: [],
    jf: ["jf:hlgn"],
    expected: 15,
  },
  {
    id: "molodost",
    patterns: ["Молодость", "МОЛОДОСТЬ"],
    sevas: [],
    md: [],
    jf: ["jf:molodost"],
    expected: 15,
  },
  {
    id: "nur",
    patterns: ["\\bNur\\b", "\\bNUR\\b"],
    sevas: [],
    md: ["kapsuly-nur"],
    jf: ["jf:nur-nur"],
    expected: 15,
  },
]

// Deepen moredyma for key missing brands
const mdExtra = {}
for (const slug of [
  "black-burn",
  "dogma",
  "kraken",
  "helix",
  "bliss",
  "wto",
  "smoke-angels",
  "tangiers",
  "tangiers-noir",
  "aircraft",
  "fake",
  "joy-ru-10",
  "sebero",
  "kapsuly-nur",
  "al-fakher",
]) {
  process.stdout.write(`md-full ${slug}\n`)
  mdExtra[slug] = await scrapeMoredymaFull(slug)
  console.log(" ", mdExtra[slug].titles.length, mdExtra[slug].redirected || "")
}

function collectRawLists(def) {
  const raw = []
  const sources = []

  if (sevas) {
    for (const slug of def.sevas || []) {
      const b = sevas.brands[slug]
      if (!b?.flavors) continue
      raw.push(...b.flavors)
      sources.push(...(b.sources || []))
      if (b.finalUrl) sources.push(b.finalUrl)
    }
  }

  if (mdjf) {
    for (const slug of def.md || []) {
      const b = mdjf.brands["md:" + slug]
      if (!b) continue
      // skip redirected root catalog pollution
      if ((b.sources || [])[0]?.endsWith("/tabak-dlya-kalyana/")) {
        notes.push(`skip polluted md:${slug} (redirect to root)`)
        continue
      }
      raw.push(...(b.flavorsRaw || []))
      sources.push(...(b.sources || []))
    }
  }

  for (const slug of def.md || []) {
    const b = mdExtra[slug]
    if (!b?.titles?.length) continue
    if (b.redirected) continue
    raw.push(...b.titles)
    sources.push(...b.sources)
  }

  if (mdjf) {
    for (const key of def.jf || []) {
      const b = mdjf.brands[key]
      if (!b) continue
      raw.push(...(b.flavorsRaw || []))
      sources.push(...(b.sources || []))
    }
    for (const key of def.sm || []) {
      const b = mdjf.brands[key]
      if (!b) continue
      raw.push(...(b.flavorsRaw || []))
      sources.push(...(b.sources || []))
    }
    for (const key of def.hh || []) {
      const b = mdjf.brands[key]
      if (!b) continue
      raw.push(...(b.flavorsRaw || []))
      sources.push(...(b.sources || []))
    }
  }

  if (smjf?.sm) {
    for (const key of def.smKeys || []) {
      const b = smjf.sm[key]
      if (!b?.flavors) continue
      raw.push(...b.flavors.map((f) => "Табак " + (key === "blackburn" ? "Black Burn " : "") + f))
      // better: flavors already stripped sometimes
      raw.push(...b.flavors)
      sources.push(...(b.sources || []))
    }
  }

  return { raw: uniq(raw), sources: uniq(sources) }
}

const brandsOut = []
const completeness = {}
const newBrandIds = []
const known = new Set([
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

for (const def of BRANDS) {
  const { raw, sources } = collectRawLists(def)
  const flavors = []
  const stripNoiseName = (t) => {
    const n = stripPack(t)
    return isNoise(n) ? null : n
  }
  for (const t of raw) {
    let f = cleanFlavor(t, def.patterns)
    // short EN names from smokemaster category context
    if (!f && (def.smKeys || def.sm) && t.length < 50 && !/табак для кальяна|главная|магазин/i.test(t)) {
      if (matchesBrand(t, def.patterns)) f = cleanFlavor(t, def.patterns)
      else if (/^[A-Za-z0-9][A-Za-z0-9\s'&+./-]{1,40}$/.test(t.trim())) f = stripNoiseName(t)
    }
    if (f) flavors.push(preferCardName(f))
  }

  const unique = uniq(flavors).sort((a, b) => a.localeCompare(b, "ru"))

  // Split by line into multiple entries when useful
  const byLine = new Map()
  for (const f of unique) {
    const line = detectLine(f, def.id)
    const key = line || "__null__"
    if (!byLine.has(key)) byLine.set(key, [])
    byLine.get(key).push(f)
  }

  // Also emit one combined? User schema is per line field. Emit per-line + if only null, one entry.
  if (byLine.size === 1 && byLine.has("__null__")) {
    brandsOut.push({
      id: def.id,
      line: null,
      sources,
      flavors: unique,
      statusHints: statusHints(unique),
    })
  } else {
    // full list under line null AND line splits? User wants flavors full arrays.
    // Provide: one entry with line null containing ALL, plus optional line-tagged subsets would duplicate.
    // Spec: "line": "Classic|Shock|HiT|null" — one value per brand object.
    // Best: separate objects per line with that line's flavors only.
    for (const [lineKey, fl] of [...byLine.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      brandsOut.push({
        id: def.id,
        line: lineKey === "__null__" ? null : lineKey,
        sources,
        flavors: fl,
        statusHints: statusHints(fl),
      })
    }
  }

  completeness[def.id] = unique.length >= def.expected ? "HIGH" : unique.length >= def.expected * 0.45 ? "MEDIUM" : "LOW"
  if (!known.has(def.id) && unique.length) newBrandIds.push(def.id)
  console.log(def.id, unique.length, "lines", byLine.size)
}

const result = {
  brands: brandsOut,
  newBrandIds: uniq(newBrandIds),
  notes: [
    ...uniq(notes),
    "Пагинация: sevas /page/N/ для brand categories; moredyma /page/N/; justfreid PAGEN_1 / SHOWALL_1; smokemaster products-per-page=144 + /page/N/",
    "sevas: URL /product-category/tabak-dlya-kalyana/{slug}/ (редирект с /brand/{slug}/)",
    "jam на sevas: /product-category/smes-dlya-kalyana/jam/",
    "chabacco на sevas: /product-category/smes-dlya-kalyana/chabacco/",
    "4kalyans.ru недоступен (fetch failed)",
    "hookah-voodoo.com пропущен (не .ru/.su)",
    "jammtobacco.com: карточки вкусов из HTML не извлечены (0); подтверждение jam через sevas + hookahhouse.ru",
    "WTO/MattPear/Helix/Aircraft/Cobra/Smoke Angels нет отдельных brand pages на sevas (поиск brand list)",
    "MattPear/Iskra/Funel/Dead Horse/Blackleaf/Unity/Craftium/Northern Forest/Social Smoke: отдельных .ru витрин с ассортиментом не найдено или редирект в общий каталог",
    "Al Fakher / Tangiers: только RU витрины (moredyma.su, justfreid.ru)",
    `sevas brand slugs: ${(sevas?.brandSlugs || []).join(", ")}`,
    `moredyma brand slugs: ${(mdjf?.moredymaSlugs || []).join(", ")}`,
  ],
  completeness,
}

writeFileSync(new URL("./ru-flavors-final.json", import.meta.url), JSON.stringify(result, null, 2), "utf8")
console.log("wrote final", brandsOut.length, "entries")
