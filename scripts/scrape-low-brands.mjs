/**
 * Deep scrape of LOW/MEDIUM brands from Russian stores only.
 * Output: scripts/ru-low-brands.json
 */
import { writeFileSync } from "fs"

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9" },
      redirect: "follow",
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) return { ok: false, status: res.status, url: res.url, html: "" }
    return { ok: true, status: res.status, url: res.url, html: await res.text() }
  } catch (e) {
    return { ok: false, status: 0, url, html: "", err: e.message }
  }
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

function stripTags(s) {
  return decode(s.replace(/<[^>]+>/g, " "))
}

function stripPack(n) {
  return n
    .replace(/,?\s*пачка\s+\d+\s*гр\.?/i, "")
    .replace(/\s*[—–\-]?\s*\d+\s*(гр|г|g|GR)\.?$/i, "")
    .replace(/\s+\d+\s*\(m\)\s*$/i, "")
    .replace(/\s*\(\s*акциз\s*\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
}

function uniq(a) {
  const s = new Set()
  const o = []
  for (const x of a) {
    const k = x.toLowerCase()
    if (x && !s.has(k)) {
      s.add(k)
      o.push(x)
    }
  }
  return o
}

function extractJFNames(html) {
  const names = []
  const reName = /"NAME"\s*:\s*"([^"]{3,160})"/g
  let m
  while ((m = reName.exec(html))) names.push(decode(m[1]))
  const reTitle = /product-item-title[\s\S]{0,220}?<a[^>]*>([^<]{3,160})<\/a>/gi
  while ((m = reTitle.exec(html))) names.push(decode(m[1]))
  const reMeta = /itemprop="name"\s+content="([^"]+)"/gi
  while ((m = reMeta.exec(html))) names.push(decode(m[1]))
  const reH = /<(?:h2|h3|div)[^>]*class="[^"]*product[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]{3,160})<\/a>/gi
  while ((m = reH.exec(html))) names.push(decode(m[1]))
  return names
}

function normalizeFlavor(n, brandKeys, brandId) {
  let x = n
  x = x.replace(/^(ТАБАК|СМЕСЬ|Табак|Смесь|X)\s+/i, "")
  x = stripPack(x)
  if (/интернет|mary|justfreid|купить|магазин|price|%price%|промо|подписаться|фильтр/i.test(x))
    return null
  if (x.length < 2) return null
  if (brandKeys?.length) {
    const ok = brandKeys.some((b) => new RegExp(b, "i").test(n) || new RegExp(b, "i").test(x))
    if (!ok) return null
  }
  // strip leading brand tokens
  for (const b of brandKeys || []) {
    x = x.replace(new RegExp(`^${b}\\s*[-–—:]?\\s*`, "i"), "")
  }
  if (brandId === "mattpear") {
    x = x.replace(/^MattPear\s*(Tobacco)?\s*/i, "")
    x = x.replace(/^Matt Pear\s*/i, "")
    x = x.replace(/^МатПир\s*/i, "")
    x = x.replace(/^new\s+/i, "")
  }
  if (brandId === "aircraft") {
    x = x.replace(/^AIRCRAFT\s*/i, "")
    x = x.replace(/^Aircraft\s*/i, "")
  }
  if (brandId === "burn") {
    // Keep only light Burn line, not BlackBurn / Overdose product names belonging to other brands
    if (/blackburn|black burn|overdose/i.test(n) && !/^BURN\s/i.test(n)) return null
    if (/^BLACKBURN/i.test(n)) return null
    x = x.replace(/^BURN\s*[-–—:]?\s*/i, "")
  }
  x = stripPack(x).replace(/\s*[-–—]\s*$/, "").trim()
  if (!x || x.length < 2) return null
  return x
}

function detectLine(name, brandId) {
  const n = name.toLowerCase()
  if (brandId === "mattpear") {
    if (/crazy/.test(n)) return "Crazy"
    if (/old school|oldschool/.test(n)) return "Old School"
    if (/pop\b/.test(n)) return "Pop"
    if (/hallz/.test(n)) return "Hallz"
    return "Classic"
  }
  if (brandId === "burn") return "Burn"
  if (brandId === "aircraft") return "Classic"
  return "Classic"
}

async function scrapeJF(url, brandId, brandKeys) {
  const flavors = new Map() // name -> {line, sources}
  const addHtml = (html, src) => {
    for (const n of extractJFNames(html)) {
      const f = normalizeFlavor(n, brandKeys, brandId)
      if (!f) continue
      const line = detectLine(n + " " + f, brandId)
      const prev = flavors.get(f.toLowerCase())
      if (prev) {
        prev.sources = uniq([...prev.sources, src])
      } else {
        flavors.set(f.toLowerCase(), { name: f, line, sources: [src], status: /архив|распродаж/i.test(n) ? "DISCONTINUED" : "ACTIVE" })
      }
    }
  }

  const u0 = url.includes("?") ? url + "&SHOWALL_1=1" : url.replace(/\/?$/, "/") + "?SHOWALL_1=1"
  let r = await fetchText(u0)
  if (!r.ok || extractJFNames(r.html).length < 2) r = await fetchText(url)
  if (!r.ok) return { brandId, items: [], note: "fail " + (r.status || r.err) }
  addHtml(r.html, r.url)

  let maxPage = Math.max(1, ...[...r.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]))
  for (let p = 2; p <= Math.min(maxPage, 50); p++) {
    await delay(200)
    const u = url.includes("?") ? `${url}&PAGEN_1=${p}` : `${url.replace(/\/?$/, "/")}?PAGEN_1=${p}`
    const page = await fetchText(u)
    if (!page.ok) break
    const before = flavors.size
    addHtml(page.html, page.url)
    if (flavors.size === before && p > maxPage) break
  }
  console.log("JF", brandId, flavors.size)
  return { brandId, items: [...flavors.values()] }
}

async function scrapeHookahHouse(url, brandId, brandKeys) {
  const flavors = new Map()
  const addHtml = (html, src) => {
    // product titles often in <a> or card text
    const titles = []
    let m
    const reA = /<a[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/a>/gi
    while ((m = reA.exec(html))) titles.push(stripTags(m[1]))
    const reName = /itemprop="name"[^>]*>([^<]+)</gi
    while ((m = reName.exec(html))) titles.push(decode(m[1]))
    const reH = /<(?:div|span|a)[^>]*>\s*(MattPear[^<]{2,120}|AIRCRAFT[^<]{2,120}|Aircraft[^<]{2,80}|Dead Horse[^<]{2,80}|Burn[^<]{2,80})/gi
    while ((m = reH.exec(html))) titles.push(decode(m[1]))
    // plain product names from cards
    const reCard = />(MattPear[^<]{2,100}|Matt Pear[^<]{2,100})<\/(?:a|div|span|h\d)>/gi
    while ((m = reCard.exec(html))) titles.push(decode(m[1]))

    for (const n of titles) {
      const f = normalizeFlavor(n, brandKeys, brandId)
      if (!f) continue
      if (/промо|подписаться|отписаться|показать|фильтр|нет в наличии$/i.test(f)) continue
      const line = detectLine(n + " " + f, brandId)
      const key = f.toLowerCase()
      const prev = flavors.get(key)
      if (prev) prev.sources = uniq([...prev.sources, src])
      else flavors.set(key, { name: f, line, sources: [src], status: "UNKNOWN" })
    }
  }

  let r = await fetchText(url)
  if (!r.ok) return { brandId, items: [], note: "fail hh" }
  addHtml(r.html, r.url)
  let maxPage = Math.max(1, ...[...r.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]))
  for (let p = 2; p <= Math.min(maxPage, 20); p++) {
    await delay(220)
    const sep = url.includes("?") ? "&" : "?"
    const page = await fetchText(`${url}${sep}PAGEN_1=${p}`)
    if (!page.ok) break
    addHtml(page.html, page.url)
  }
  console.log("HH", brandId, flavors.size)
  return { brandId, items: [...flavors.values()] }
}

async function scrapeMyKalyan(url, brandId, brandKeys) {
  const flavors = new Map()
  const addHtml = (html, src) => {
    let m
    const re = /<a[^>]*href="[^"]*"[^>]*>\s*(Табак\s+MattPear[^<]{2,140}|MattPear[^<]{2,140})/gi
    while ((m = re.exec(html))) {
      const n = decode(m[1])
      const f = normalizeFlavor(n, brandKeys, brandId)
      if (!f) continue
      const line = detectLine(n + " " + f, brandId)
      const key = f.toLowerCase()
      if (!flavors.has(key)) flavors.set(key, { name: f, line, sources: [src], status: "UNKNOWN" })
      else flavors.get(key).sources = uniq([...flavors.get(key).sources, src])
    }
    // product cards
    const re2 = /itemprop="name"[^>]*content="([^"]+)"/gi
    while ((m = re2.exec(html))) {
      const n = decode(m[1])
      const f = normalizeFlavor(n, brandKeys, brandId)
      if (!f) continue
      const line = detectLine(n + " " + f, brandId)
      const key = f.toLowerCase()
      if (!flavors.has(key)) flavors.set(key, { name: f, line, sources: [src], status: "UNKNOWN" })
    }
  }

  // pages
  for (let p = 1; p <= 30; p++) {
    await delay(p === 1 ? 0 : 200)
    const u = p === 1 ? url : `${url.replace(/\/?$/, "/")}${p}/`
    const page = await fetchText(u)
    if (!page.ok) break
    const before = flavors.size
    addHtml(page.html, page.url)
    if (p > 1 && flavors.size === before) break
  }
  console.log("MK", brandId, flavors.size)
  return { brandId, items: [...flavors.values()] }
}

function mergeBrand(...parts) {
  const map = new Map()
  for (const part of parts) {
    for (const it of part.items || []) {
      const key = it.name.toLowerCase()
      const prev = map.get(key)
      if (prev) {
        prev.sources = uniq([...prev.sources, ...it.sources])
        if (it.line && it.line !== "Classic") prev.line = it.line
        if (it.status === "DISCONTINUED" || it.status === "LIMITED") prev.status = it.status
      } else map.set(key, { ...it, sources: [...it.sources] })
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"))
}

const out = { generatedAt: new Date().toISOString(), brands: {} }

// MattPear
{
  const hh = await scrapeHookahHouse(
    "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/mattpear_1/",
    "mattpear",
    ["MattPear", "Matt Pear", "МатПир"]
  )
  const mk = await scrapeMyKalyan(
    "https://www.mykalyan.ru/shop/tabak/tabak-mattpear/",
    "mattpear",
    ["MattPear", "Matt Pear"]
  )
  const jf = await scrapeJF(
    "https://justfreid.ru/catalog/tabak/mattpear-tobacco/",
    "mattpear",
    ["MATTPEAR", "MattPear", "Matt Pear", "МАТТ"]
  )
  out.brands.mattpear = mergeBrand(hh, mk, jf)
  console.log("TOTAL mattpear", out.brands.mattpear.length)
}

// Aircraft
{
  const jf = await scrapeJF(
    "https://justfreid.ru/catalog/tabak/aircraft/",
    "aircraft",
    ["AIRCRAFT", "Aircraft", "Аиркрафт"]
  )
  out.brands.aircraft = mergeBrand(jf)
  console.log("TOTAL aircraft", out.brands.aircraft.length)
}

// Burn light line (separate from BlackBurn)
{
  const jf = await scrapeJF("https://justfreid.ru/catalog/tabak/burn/", "burn", ["^BURN", "BURN -", "ТАБАК BURN"])
  // filter: only names that look like Burn (not BlackBurn)
  out.brands.burn = mergeBrand(jf).filter((it) => {
    // already filtered in normalize; keep items that aren't clearly blackburn flavors wrongly kept
    return !/^black/i.test(it.name)
  })
  console.log("TOTAL burn", out.brands.burn.length)
}

// Discover more JF slugs for remaining LOW brands
{
  const cat = await fetchText("https://justfreid.ru/catalog/tabak/")
  const slugs = new Set()
  if (cat.ok) {
    for (const m of cat.html.matchAll(/\/catalog\/tabak\/([a-zA-Z0-9_-]+)\//g)) slugs.add(m[1].toLowerCase())
  }
  out.jfSlugsSample = [...slugs].filter((s) =>
    /iskra|funel|dead|blackleaf|unity|craft|northern|overdozz|smoke|daily|brusko|deus|cobra|aircraft|matt|burn/i.test(
      s
    )
  )
  console.log("relevant slugs", out.jfSlugsSample.join(", "))

  const extras = [
    ["iskra", ["ISKRA", "Iskra", "Искра"]],
    ["funel", ["FUNEL", "Funel"]],
    ["dead-horse", ["DEAD HORSE", "Dead Horse", "DEAD"]],
    ["blackleaf", ["BLACKLEAF", "Blackleaf"]],
    ["unity", ["UNITY", "Unity"]],
    ["craftium", ["CRAFTIUM", "Craftium"]],
    ["overdozz", ["OVERDOZZ", "Overdozz"]],
  ]
  for (const [slug, keys] of extras) {
    const real = [...slugs].find((s) => s === slug || s.includes(slug.replace("-", "")))
    if (!real) {
      console.log("no slug", slug)
      continue
    }
    const jf = await scrapeJF(`https://justfreid.ru/catalog/tabak/${real}/`, slug, keys)
    out.brands[slug] = mergeBrand(jf)
    console.log("TOTAL", slug, out.brands[slug].length)
  }
}

writeFileSync("scripts/ru-low-brands.json", JSON.stringify(out, null, 2))
console.log("\nWrote scripts/ru-low-brands.json")
for (const [id, items] of Object.entries(out.brands)) {
  console.log(id, items.length)
}
