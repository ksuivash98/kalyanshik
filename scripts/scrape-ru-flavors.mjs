/**
 * Scrape hookah tobacco flavors from RU sources only.
 * Dedupes pack sizes; keeps card names as-is.
 */
import { writeFileSync, mkdirSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "ru-scrape-raw.json")
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

const notes = []
const delays = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(45000),
      })
      if (!res.ok) {
        if (i === retries - 1) {
          notes.push(`HTTP ${res.status}: ${url}`)
          return null
        }
        await delays(800 * (i + 1))
        continue
      }
      return await res.text()
    } catch (e) {
      if (i === retries - 1) {
        notes.push(`fail: ${url} — ${e.message}`)
        return null
      }
      await delays(1000 * (i + 1))
    }
  }
  return null
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&nbsp;/g, " ")
    .trim()
}

function stripPack(name) {
  return name
    .replace(/\s*[-–—]?\s*\(?\s*\d+\s*(г|гр|г\.|гр\.|g|G)\s*\)?\s*$/i, "")
    .replace(/\s*\(\s*M\s*\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
}

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const k = x.toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      out.push(x)
    }
  }
  return out
}

/* ---------- SmokeMaster (WooCommerce-like) ---------- */
function parseSmokeMasterTitles(html, brandHint) {
  const titles = new Set()
  // product title in h2/h3 or title attr
  const re1 = /<h[23][^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]+)<\/h[23]>/gi
  let m
  while ((m = re1.exec(html))) titles.add(decodeEntities(m[1]))
  const re2 = /title="(Табак[^"]+|Смесь[^"]+|Доха[^"]+)"/gi
  while ((m = re2.exec(html))) titles.add(decodeEntities(m[1]))
  // aria / img alt
  const re3 = /alt="(Табак[^"]+|Смесь[^"]+)"/gi
  while ((m = re3.exec(html))) titles.add(decodeEntities(m[1]))

  const flavors = []
  for (const t of titles) {
    let n = t
    // strip prefixes
    n = n.replace(/^Табак\s+/i, "")
    n = n.replace(/^Смесь\s+(для\s+кальяна\s+)?/i, "")
    // remove brand prefixes commonly used
    if (brandHint) {
      for (const b of brandHint) {
        n = n.replace(new RegExp("^" + b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+", "i"), "")
      }
    }
    n = stripPack(n)
    if (n && n.length > 1) flavors.push(n)
  }
  return uniq(flavors)
}

function smMaxPage(html) {
  const pages = [...html.matchAll(/\/page\/(\d+)\/?/g)].map((x) => +x[1])
  const max = pages.length ? Math.max(...pages) : 1
  // also "из N" style
  return Math.max(max, 1)
}

async function scrapeSmokeMasterCategory(baseUrl, brandHint, label) {
  const flavors = new Set()
  const sources = []
  // try high per-page
  const urls = [
    baseUrl.replace(/\/?$/, "/") + "?products-per-page=144",
    baseUrl.replace(/\/?$/, "/") + "?per_page=144",
    baseUrl,
  ]
  let html = null
  let used = null
  for (const u of urls) {
    html = await fetchText(u)
    if (html && html.length > 5000) {
      used = u
      break
    }
  }
  if (!html) {
    notes.push(`smokemaster empty: ${label}`)
    return { flavors: [], sources }
  }
  sources.push(used || baseUrl)
  for (const f of parseSmokeMasterTitles(html, brandHint)) flavors.add(f)

  let maxPage = smMaxPage(html)
  // if we see "Показать ещё" there may be more via /page/2/
  // Also count products mentioned
  const countMatch = html.match(/\((\d+)\)\s*<\/a>\s*<\/li>/) // weak
  // pagination links
  if (maxPage === 1) {
    // try page 2 existence
    const p2 = await fetchText(baseUrl.replace(/\/?$/, "/page/2/"))
    if (p2 && /woocommerce-loop-product__title|Табак /i.test(p2) && !/ничего не найдено|no products/i.test(p2)) {
      maxPage = 2
      for (const f of parseSmokeMasterTitles(p2, brandHint)) flavors.add(f)
      // discover more
      maxPage = Math.max(maxPage, smMaxPage(p2))
      sources.push(baseUrl.replace(/\/?$/, "/page/2/"))
    }
  }
  for (let p = 2; p <= Math.min(maxPage, 40); p++) {
    if (p === 2 && sources.some((s) => s.includes("/page/2/"))) continue
    await delays(250)
    const u = baseUrl.replace(/\/?$/, `/page/${p}/`)
    const h = await fetchText(u)
    if (!h) break
    const got = parseSmokeMasterTitles(h, brandHint)
    if (!got.length) break
    for (const f of got) flavors.add(f)
    sources.push(u)
    maxPage = Math.max(maxPage, smMaxPage(h))
  }
  notes.push(`${label}: smokemaster ${flavors.size} flavors, pages≈${sources.length}`)
  return { flavors: [...flavors].sort((a, b) => a.localeCompare(b, "ru")), sources: uniq(sources) }
}

/* ---------- Sevas Market (WooCommerce) ---------- */
function parseSevasTitles(html) {
  const titles = new Set()
  const re = /<h[23][^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]+)<\/h[23]>/gi
  let m
  while ((m = re.exec(html))) titles.add(decodeEntities(m[1]))
  // fallback product-title
  const re2 = /class="[^"]*product-title[^"]*"[^>]*>\s*<a[^>]*>([^<]+)</gi
  while ((m = re2.exec(html))) titles.add(decodeEntities(m[1]))
  const re3 = /<a[^>]+class="[^"]*woocommerce-LoopProduct-link[^"]*"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/gi
  while ((m = re3.exec(html))) titles.add(decodeEntities(m[1]))
  // aria-label / title in product cards
  const re4 = /Добавить в список желаний[\s\S]{0,200}?<h3[^>]*>\s*([^<]+)\s*<\/h3>/gi
  while ((m = re4.exec(html))) titles.add(decodeEntities(m[1]))
  // ### markdown-ish from some converters won't apply; use heading pattern
  const re5 = /###\s+([^\n]+)/g
  while ((m = re5.exec(html))) {
    const t = m[1].trim()
    if (/табак|смесь|доха/i.test(t)) titles.add(t)
  }
  return [...titles]
}

function sevasNormalize(title, brandSlug) {
  let n = title
  n = n.replace(/^Табак для кальяна\s+/i, "")
  n = n.replace(/^Смесь для кальяна\s+/i, "")
  n = n.replace(/^Доха для кальяна\s+/i, "")
  // Brand — Flavor patterns
  n = n.replace(/\s*[—–-]\s*/g, " — ")
  n = stripPack(n)
  // remove trailing (Акциз) etc
  n = n.replace(/\s*\(Акциз\)\s*$/i, "").trim()
  return n
}

function sevasMaxPage(html) {
  const pages = [...html.matchAll(/\/page\/(\d+)\/?/g)].map((x) => +x[1])
  const showing = html.match(/Отображение\s+\d+[–-]\d+\s+из\s+(\d+)/i)
  let maxFromCount = 1
  if (showing) {
    const total = +showing[1]
    maxFromCount = Math.ceil(total / 20) // default 20 per page
  }
  const maxLink = pages.length ? Math.max(...pages) : 1
  return Math.max(maxLink, maxFromCount, 1)
}

async function scrapeSevasBrand(slug, label) {
  const base = `https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/${slug}/`
  const flavors = new Set()
  const sources = []
  const html = await fetchText(base)
  if (!html) {
    // try alternate
    notes.push(`sevas miss brand/${slug}`)
    return { flavors: [], sources, ok: false }
  }
  if (/ничего не найдено|No products were found|404/i.test(html) && !/woocommerce-loop-product__title/i.test(html)) {
    notes.push(`sevas empty brand/${slug}`)
    return { flavors: [], sources, ok: false }
  }
  sources.push(base)
  let maxPage = sevasMaxPage(html)
  for (const t of parseSevasTitles(html)) {
    const n = sevasNormalize(t, slug)
    if (n) flavors.add(n)
  }
  // also extract from product links text
  const linkRe = /href="https?:\/\/sevas-market\.ru\/product\/[^"]+"[^>]*>([^<]{3,120})</gi
  let lm
  while ((lm = linkRe.exec(html))) {
    const t = decodeEntities(lm[1]).trim()
    if (/табак|смесь|доха/i.test(t) || t.includes("—") || t.includes("–")) {
      flavors.add(sevasNormalize(t, slug))
    }
  }

  for (let p = 2; p <= Math.min(maxPage, 80); p++) {
    await delays(200)
    const u = `https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/${slug}/page/${p}/`
    const h = await fetchText(u)
    if (!h) break
    const before = flavors.size
    for (const t of parseSevasTitles(h)) {
      const n = sevasNormalize(t, slug)
      if (n) flavors.add(n)
    }
    let lm2
    const linkRe2 = /href="https?:\/\/sevas-market\.ru\/product\/[^"]+"[^>]*>([^<]{3,120})</gi
    while ((lm2 = linkRe2.exec(h))) {
      const t = decodeEntities(lm2[1]).trim()
      if (t.length > 3) flavors.add(sevasNormalize(t, slug))
    }
    if (flavors.size === before && !/woocommerce-loop-product__title/i.test(h)) break
    sources.push(u)
  }
  notes.push(`${label}: sevas ${flavors.size} raw titles, pages≈${Math.min(maxPage, sources.length)}`)
  return {
    flavors: [...flavors].filter(Boolean).sort((a, b) => a.localeCompare(b, "ru")),
    sources: uniq(sources),
    ok: true,
  }
}

/* ---------- JustFreid ---------- */
function parseJustFreid(html) {
  const titles = new Set()
  // product cards often in <a ...>ТАБАК ...
  const re = /(ТАБАК\s+[A-ZА-Я0-9][^<\n]{2,120}|BLACKBURN\s*[-–][^<\n]{2,100}|Burn\s+[A-Za-z][^<\n]{2,80})/gi
  let m
  while ((m = re.exec(html))) titles.add(decodeEntities(m[1]).replace(/\s+/g, " ").trim())
  // data-name / itemprop
  const re2 = /(?:data-name|itemprop="name"|product-title)[^>]*>([^<]+)/gi
  while ((m = re2.exec(html))) {
    const t = decodeEntities(m[1])
    if (/табак|burn|blackburn|dogma|wto|jam|helix|bliss|chabacco|serbetli|smoke/i.test(t))
      titles.add(t)
  }
  // JSON-LD
  const re3 = /"name"\s*:\s*"(ТАБАК[^"]+|BLACKBURN[^"]+|Табак[^"]+)"/gi
  while ((m = re3.exec(html))) titles.add(decodeEntities(m[1]))
  return [...titles]
}

function jfNormalize(t) {
  let n = t
  n = n.replace(/^ТАБАК\s+/i, "")
  n = n.replace(/^Табак\s+/i, "")
  n = stripPack(n)
  n = n.replace(/\s*\(M\)\s*$/i, "").trim()
  return n
}

async function scrapeJustFreid(baseUrl, label) {
  const flavors = new Set()
  const sources = []
  // try show 100
  const variants = [
    baseUrl.includes("?") ? baseUrl + "&PAGEN_1=1&SHOWALL_1=1" : baseUrl.replace(/\/?$/, "/") + "?SHOWALL_1=1",
    baseUrl.includes("?") ? baseUrl + "&count=100" : baseUrl.replace(/\/?$/, "/") + "?count=100",
    baseUrl,
  ]
  let html = null
  for (const u of variants) {
    html = await fetchText(u)
    if (html && parseJustFreid(html).length > 0) {
      sources.push(u)
      break
    }
  }
  if (!html) return { flavors: [], sources }
  for (const t of parseJustFreid(html)) flavors.add(jfNormalize(t))

  // Bitrix pagination PAGEN_1
  let maxPage = 1
  const pagen = [...html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1])
  if (pagen.length) maxPage = Math.max(...pagen)
  const pageLinks = [...html.matchAll(/\/page[=\/](\d+)/gi)].map((x) => +x[1])
  if (pageLinks.length) maxPage = Math.max(maxPage, ...pageLinks)

  for (let p = 2; p <= Math.min(maxPage, 50); p++) {
    await delays(200)
    const u = baseUrl.includes("?")
      ? `${baseUrl}&PAGEN_1=${p}`
      : `${baseUrl.replace(/\/?$/, "/")}?PAGEN_1=${p}`
    const h = await fetchText(u)
    if (!h) break
    const got = parseJustFreid(h)
    if (!got.length) break
    for (const t of got) flavors.add(jfNormalize(t))
    sources.push(u)
  }
  // also try sequential until empty if maxPage was 1 but products suggest more
  if (maxPage <= 1) {
    for (let p = 2; p <= 30; p++) {
      await delays(200)
      const u = baseUrl.includes("?")
        ? `${baseUrl}&PAGEN_1=${p}`
        : `${baseUrl.replace(/\/?$/, "/")}?PAGEN_1=${p}`
      const h = await fetchText(u)
      if (!h) break
      const got = parseJustFreid(h)
      if (!got.length) break
      const before = flavors.size
      for (const t of got) flavors.add(jfNormalize(t))
      sources.push(u)
      if (flavors.size === before) break
    }
  }
  notes.push(`${label}: justfreid ${flavors.size}`)
  return {
    flavors: [...flavors].filter(Boolean).sort((a, b) => a.localeCompare(b, "ru")),
    sources: uniq(sources),
  }
}

/* ---------- HookahHouse ---------- */
async function scrapeHookahHouse(url, label) {
  const flavors = new Set()
  const sources = []
  const html = await fetchText(url)
  if (!html) return { flavors: [], sources }
  sources.push(url)
  const re = /<(?:div|a|span|h[1-4])[^>]*>([^<]*(?:Jam|JAM|табак|Табак)[^<]{0,80})<\/(?:div|a|span|h[1-4])>/gi
  // product names
  const re2 = /class="[^"]*(?:product-title|item-title|catalog-item)[^"]*"[^>]*>([^<]+)/gi
  let m
  while ((m = re2.exec(html))) flavors.add(stripPack(decodeEntities(m[1])))
  const re3 = /"name"\s*:\s*"([^"]+)"/g
  while ((m = re3.exec(html))) {
    const t = decodeEntities(m[1])
    if (/jam|табак/i.test(t)) flavors.add(stripPack(t))
  }
  // pagination
  let maxPage = Math.max(1, ...[...html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]), ...[...html.matchAll(/\/page-(\d+)/g)].map((x) => +x[1]), ...[...html.matchAll(/\/page\/(\d+)/g)].map((x) => +x[1]))
  for (let p = 2; p <= Math.min(maxPage, 40); p++) {
    await delays(200)
    const u = url.includes("?") ? `${url}&PAGEN_1=${p}` : `${url.replace(/\/?$/, "/")}?PAGEN_1=${p}`
    const h = await fetchText(u)
    if (!h) break
    const before = flavors.size
    while ((m = re2.exec(h))) flavors.add(stripPack(decodeEntities(m[1])))
    re2.lastIndex = 0
    if (flavors.size === before) {
      // try /page/N/
      const u2 = url.replace(/\/?$/, `/page/${p}/`)
      const h2 = await fetchText(u2)
      if (!h2) break
      let m2
      const r = /class="[^"]*(?:product-title|item-title|catalog-item)[^"]*"[^>]*>([^<]+)/gi
      while ((m2 = r.exec(h2))) flavors.add(stripPack(decodeEntities(m2[1])))
      sources.push(u2)
    } else sources.push(u)
  }
  notes.push(`${label}: hookahhouse ${flavors.size}`)
  return { flavors: [...flavors].filter(Boolean).sort((a, b) => a.localeCompare(b, "ru")), sources: uniq(sources) }
}

/* ---------- generic product extractor ---------- */
function extractGenericProducts(html) {
  const titles = new Set()
  const patterns = [
    /<(?:h2|h3|h4)[^>]*class="[^"]*(?:product|title|name)[^"]*"[^>]*>([^<]{2,150})<\/(?:h2|h3|h4)>/gi,
    /class="[^"]*product-title[^"]*"[^>]*>([^<]{2,150})</gi,
    /itemprop="name"[^>]*content="([^"]+)"/gi,
    /itemprop="name"[^>]*>([^<]+)/gi,
    /"productName"\s*:\s*"([^"]+)"/gi,
    /data-product-name="([^"]+)"/gi,
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(html))) titles.add(decodeEntities(m[1]).replace(/\s+/g, " ").trim())
  }
  return [...titles]
}

async function scrapePaginated(baseUrl, label, normalizeFn) {
  const flavors = new Set()
  const sources = []
  const html = await fetchText(baseUrl)
  if (!html) return { flavors: [], sources }
  sources.push(baseUrl)
  for (const t of extractGenericProducts(html)) {
    const n = normalizeFn ? normalizeFn(t) : stripPack(t)
    if (n) flavors.add(n)
  }
  let maxPage = Math.max(
    1,
    ...[...html.matchAll(/\/page\/(\d+)/g)].map((x) => +x[1]),
    ...[...html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]),
    ...[...html.matchAll(/[?&]page=(\d+)/g)].map((x) => +x[1])
  )
  const showing = html.match(/из\s+(\d+)/i)
  if (showing && +showing[1] > 20) maxPage = Math.max(maxPage, Math.ceil(+showing[1] / 20))

  for (let p = 2; p <= Math.min(maxPage, 60); p++) {
    await delays(200)
    const candidates = [
      baseUrl.replace(/\/?$/, `/page/${p}/`),
      baseUrl.includes("?") ? `${baseUrl}&page=${p}` : `${baseUrl}?page=${p}`,
      baseUrl.includes("?") ? `${baseUrl}&PAGEN_1=${p}` : `${baseUrl}?PAGEN_1=${p}`,
    ]
    let added = false
    for (const u of candidates) {
      const h = await fetchText(u)
      if (!h) continue
      const before = flavors.size
      for (const t of extractGenericProducts(h)) {
        const n = normalizeFn ? normalizeFn(t) : stripPack(t)
        if (n) flavors.add(n)
      }
      if (flavors.size > before) {
        sources.push(u)
        added = true
        break
      }
    }
    if (!added && p > 3) break
  }
  notes.push(`${label}: generic ${flavors.size}`)
  return {
    flavors: [...flavors].filter(Boolean).sort((a, b) => a.localeCompare(b, "ru")),
    sources: uniq(sources),
  }
}

function mergeFlavorSets(...lists) {
  const all = []
  for (const l of lists) all.push(...l)
  return uniq(all).sort((a, b) => a.localeCompare(b, "ru"))
}

function blackburnClean(names) {
  const out = []
  for (let n of names) {
    n = n
      .replace(/^BLACKBURN\s*[-–—]\s*/i, "")
      .replace(/^Black\s*Burn\s+/i, "")
      .replace(/^BLACK\s*Burn\s+/i, "")
      .replace(/^Burn\s+/i, "")
      .replace(/^Табак\s+/i, "")
      .replace(/\s+/g, " ")
      .trim()
    // drop Russian parenthetical descriptions if EN name present: "NAME (desc)" keep both or EN?
    // Keep full card-ish: prefer EN code part before paren if pattern NAME (russian)
    n = stripPack(n)
    if (!n || n.length < 2) continue
    if (/^(производитель|граммовка|тип|вкус|крепость|страна|линейка)/i.test(n)) continue
    out.push(n)
  }
  return uniq(out).sort((a, b) => a.localeCompare(b, "en"))
}

function extractBbCanonical(n) {
  // "APPLE SHOCK (Кислое зеленое яблоко)" -> Apple Shock; "Cola Gummies"
  let m = n.match(/^([A-Za-z0-9][A-Za-z0-9\s'&+./-]{1,60?}?)(?:\s*\(|$)/)
  if (m) {
    return m[1]
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((w) => (w === w.toUpperCase() && w.length > 1 ? w[0] + w.slice(1).toLowerCase() : w))
      .join(" ")
      .replace(/\bShock\b/i, (x) => x) // keep
  }
  return n
}

async function main() {
  const result = {
    brands: {},
    brandPages: {},
    notes,
    fetchedAt: new Date().toISOString(),
  }

  // --- Discover sevas brand list ---
  const sevasRoot = await fetchText("https://sevas-market.ru/product-category/tabak-dlya-kalyana/")
  if (sevasRoot) {
    const brands = [...sevasRoot.matchAll(/product-category\/tabak-dlya-kalyana\/brand\/([a-z0-9-]+)\//gi)].map(
      (x) => x[1].toLowerCase()
    )
    result.brandPages.sevas = uniq(brands).sort()
    notes.push(`sevas brands listed: ${result.brandPages.sevas.join(", ")}`)
  }

  // SmokeMaster brand filters from tobacco root
  const smRoot = await fetchText("https://smokemaster.ru/shop/tabak-dlya-kalyana/")
  if (smRoot) {
    const brands = [...smRoot.matchAll(/shop\/tabak-dlya-kalyana\/([a-z0-9-]+)\//gi)].map((x) => x[1])
    result.brandPages.smokemaster = uniq(brands).sort()
    notes.push(`smokemaster brand paths sample: ${result.brandPages.smokemaster.slice(0, 40).join(", ")}`)
  }

  // Priority brands on sevas
  const sevasSlugs = [
    "jam",
    "kraken",
    "dogma",
    "wto",
    "mattpear",
    "matt-pear",
    "serbetli",
    "blackburn",
    "burn",
    "bliss",
    "helix",
    "aircraft",
    "iskra",
    "funel",
    "blackleaf",
    "dead-horse",
    "deadhorse",
    "cobra",
    "unity",
    "northern-forest",
    "fake",
    "craftium",
    "hlgn",
    "young-blood",
    "molodost",
    "nur",
    "joy",
    "smoke-angels",
    "smokeangels",
    "tangiers",
    "al-fakher",
    "alfakher",
    "social-smoke",
    "sebero",
    "chabacco",
    "chaba",
  ]

  for (const slug of sevasSlugs) {
    await delays(150)
    const r = await scrapeSevasBrand(slug, `sevas:${slug}`)
    result.brands[`sevas:${slug}`] = r
  }

  // SmokeMaster priority
  const smCats = [
    ["https://smokemaster.ru/shop/tabak-dlya-kalyana/black-burn/", ["Black Burn", "BLACK Burn", "Burn"], "sm:blackburn"],
    ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", ["Smoke Angels"], "sm:smoke-angels"],
    ["https://smokemaster.ru/shop/tabak-dlya-kalyana/sebero/", ["Sebero", "Sebero tobacco"], "sm:sebero"],
    ["https://smokemaster.ru/shop/tabak-dlya-kalyana/chabacco/", ["Chabacco"], "sm:chabacco"],
    ["https://smokemaster.ru/shop/tabak-dlya-kalyana/serbetli/", ["Serbetli"], "sm:serbetli"],
  ]
  // discover jam, wto, tangiers, al-fakher on sm
  if (smRoot) {
    for (const key of ["jam", "wto", "tangiers", "al-fakher", "alfakher", "dogma", "kraken", "mattpear", "matt-pear"]) {
      const re = new RegExp(`shop/tabak-dlya-kalyana/${key}/[^"]*"[^>]*>[^<]*\\((\\d+)\\)`, "i")
      const m = smRoot.match(re)
      if (m && +m[1] > 0) {
        smCats.push([`https://smokemaster.ru/shop/tabak-dlya-kalyana/${key}/`, [key], `sm:${key}`])
      } else if (smRoot.includes(`/shop/tabak-dlya-kalyana/${key}/`)) {
        smCats.push([`https://smokemaster.ru/shop/tabak-dlya-kalyana/${key}/`, [key], `sm:${key}`])
      }
    }
  }

  for (const [url, hint, key] of smCats) {
    await delays(150)
    result.brands[key] = await scrapeSmokeMasterCategory(url, hint, key)
  }

  // JustFreid Burn + searches
  result.brands["jf:burn"] = await scrapeJustFreid("https://justfreid.ru/catalog/tabak/burn/", "jf:burn")
  for (const q of [
    ["https://justfreid.ru/catalog/?q=Dogma", "jf:dogma"],
    ["https://justfreid.ru/catalog/?q=WTO", "jf:wto"],
    ["https://justfreid.ru/catalog/?q=Kraken", "jf:kraken"],
    ["https://justfreid.ru/catalog/?q=Helix", "jf:helix"],
    ["https://justfreid.ru/catalog/?q=Bliss", "jf:bliss"],
    ["https://justfreid.ru/catalog/?q=Jam", "jf:jam"],
    ["https://justfreid.ru/catalog/?q=Chabacco", "jf:chabacco"],
    ["https://justfreid.ru/catalog/?q=Smoke+Angels", "jf:smoke-angels"],
    ["https://justfreid.ru/catalog/?q=Serbetli", "jf:serbetli"],
    ["https://justfreid.ru/catalog/?q=MattPear", "jf:mattpear"],
    ["https://justfreid.ru/catalog/?q=Cobra", "jf:cobra"],
    ["https://justfreid.ru/catalog/?q=Aircraft", "jf:aircraft"],
    ["https://justfreid.ru/catalog/?q=Iskra", "jf:iskra"],
    ["https://justfreid.ru/catalog/?q=Funel", "jf:funel"],
    ["https://justfreid.ru/catalog/?q=Dead+Horse", "jf:dead-horse"],
  ]) {
    await delays(150)
    result.brands[q[1]] = await scrapeJustFreid(q[0], q[1])
  }

  // jam official
  result.brands["jam:official"] = await scrapePaginated("https://jammtobacco.com/jam", "jam:official", (t) =>
    stripPack(t.replace(/^Jam\s+/i, ""))
  )

  // hookahhouse jam
  result.brands["hh:jam"] = await scrapeHookahHouse(
    "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/jam/",
    "hh:jam"
  )

  // moredyma
  result.brands["md:root"] = await scrapePaginated("https://moredyma.su/", "md:root")

  // 4kalyans
  result.brands["4k:root"] = await scrapePaginated("https://4kalyans.ru/", "4k:root")
  for (const path of [
    "https://4kalyans.ru/catalog/tabak/",
    "https://4kalyans.ru/brand/jam/",
    "https://4kalyans.ru/brand/blackburn/",
    "https://4kalyans.ru/brand/dogma/",
    "https://4kalyans.ru/brand/wto/",
    "https://4kalyans.ru/brand/kraken/",
    "https://4kalyans.ru/brand/serbetli/",
    "https://4kalyans.ru/brand/smoke-angels/",
  ]) {
    const key = "4k:" + path.replace(/https?:\/\/4kalyans\.ru\//, "").replace(/\//g, "_")
    await delays(150)
    result.brands[key] = await scrapePaginated(path, key)
  }

  // check hookah-voodoo domain
  try {
    const u = new URL("https://hookah-voodoo.com/vendor/jam-1")
    if (!u.hostname.endsWith(".ru") && !u.hostname.endsWith(".su")) {
      notes.push("skip hookah-voodoo.com — not .ru/.su")
    }
  } catch {}

  writeFileSync(OUT, JSON.stringify(result, null, 2), "utf8")
  console.log("Wrote", OUT)
  console.log("Notes:", notes.slice(-30).join("\n"))
  console.log("Keys:", Object.keys(result.brands).length)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
