/**
 * Clean import of MattPear + Aircraft (+ optional Burn light) from RU stores.
 * Writes scripts/ru-low-clean.json and merges into catalog seeds.
 */
import fs from "fs"
import path from "path"

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

function cleanMattPearName(raw) {
  let n = decode(raw)
  n = n.replace(/^Табак\s+/i, "")
  n = n.replace(/^MattPear\s*(Tobacco)?\s*[-–—:]?\s*/i, "")
  n = n.replace(/^Matt Pear\s*[-–—:]?\s*/i, "")
  n = n.replace(/^CRAZY\s+/i, "")
  n = n.replace(/^Old School\s*[-–—:]?\s*/i, "")
  n = n.replace(/^Pop\s*[-–—:]?\s*/i, "")
  n = n.replace(/^new\s+/i, "")
  n = n.replace(/,?\s*пачка\s+\d+\s*гр\.?/i, "")
  n = n.replace(/\s+\d+\s*гр\.?\s*(\([^)]*\))?$/i, "")
  n = n.replace(/\s+\d+\s*г\.?\s*(\([^)]*\))?$/i, "")
  n = n.replace(/\s*\(\s*[^)]*\s*\)\s*$/g, (m) => {
    // keep meaningful russian alias if short
    const inner = m.slice(1, -1).trim()
    if (/^\d/.test(inner)) return ""
    if (/гр|грамм|g\b/i.test(inner)) return ""
    return m
  })
  n = n.replace(/\s+,+\s*$/, "").replace(/,\s*$/, "").trim()
  // drop noise
  if (!n || n.length < 2) return null
  if (/^(вкусы|крепость|промо|mattpear|табак)$/i.test(n)) return null
  return n
}

function detectMattLine(raw) {
  const n = raw.toLowerCase()
  if (/crazy/.test(n)) return "Crazy"
  if (/old school|oldschool/.test(n)) return "Old School"
  if (/\bpop\b/.test(n)) return "Pop"
  if (/hallz/.test(n)) return "Hallz"
  return "Classic"
}

function upsert(map, brandId, line, name, sources, status = "UNKNOWN") {
  const key = `${brandId}::${normalizeKey(line)}::${normalizeKey(name)}`
  const prev = map.get(key)
  if (prev) {
    prev.sources = [...new Set([...prev.sources, ...sources])]
    if (status === "DISCONTINUED" || status === "LIMITED") prev.status = status
    return
  }
  map.set(key, { brandId, line, name, sources: [...new Set(sources)], status })
}

async function scrapeMyKalyanMattPear(map) {
  const base = "https://www.mykalyan.ru/shop/tabak/tabak-mattpear/"
  for (let p = 1; p <= 40; p++) {
    await delay(p === 1 ? 0 : 180)
    const url = p === 1 ? base : `${base}${p}/`
    const r = await fetchText(url)
    if (!r.ok) break
    const titles = []
    let m
    const reH3 = /<h3[^>]*>\s*<a[^>]*>([^<]+)<\/a>\s*<\/h3>/gi
    while ((m = reH3.exec(r.html))) titles.push(decode(m[1]))
    const reAlt = /Табак\s+MattPear\s*[-–—]\s*[^<]{2,120}/gi
    while ((m = reAlt.exec(r.html))) titles.push(decode(m[0]))
    let added = 0
    for (const t of titles) {
      const name = cleanMattPearName(t)
      if (!name) continue
      const before = map.size
      upsert(map, "mattpear", detectMattLine(t), name, [r.url], "UNKNOWN")
      if (map.size > before) added++
    }
    console.log("mykalyan page", p, "titles", titles.length, "newish", added, "total", [...map.keys()].filter((k) => k.startsWith("mattpear")).length)
    if (p > 1 && titles.length === 0) break
    if (p > 1 && added === 0 && titles.length < 3) break
  }
}

async function scrapeHookahHouseMattPear(map) {
  const base = "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/mattpear_1/"
  let maxPage = 1
  for (let p = 1; p <= 15; p++) {
    await delay(p === 1 ? 0 : 200)
    const url = p === 1 ? base : `${base}?PAGEN_1=${p}`
    const r = await fetchText(url)
    if (!r.ok) break
    if (p === 1) {
      maxPage = Math.max(1, ...[...r.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]))
    }
    const titles = []
    let m
    // product name blocks
    const re = />(MattPear[^<]{3,100})<\/(?:a|div|span|h\d)>/gi
    while ((m = re.exec(r.html))) titles.push(decode(m[1]))
    const re2 = /itemprop="name"[^>]*>([^<]+)</gi
    while ((m = re2.exec(r.html))) {
      const t = decode(m[1])
      if (/mattpear|матпир/i.test(t)) titles.push(t)
    }
    for (const t of titles) {
      const name = cleanMattPearName(t)
      if (!name) continue
      upsert(map, "mattpear", detectMattLine(t), name, [r.url], "UNKNOWN")
    }
    console.log("hh page", p, "titles", titles.length)
    if (p >= maxPage) break
  }
}

async function scrapeHookahSetMattPear(map) {
  const url = "https://hookahset.ru/catalog/tabak-matt-pear"
  const r = await fetchText(url)
  if (!r.ok) {
    console.log("hookahset fail", r.status)
    return
  }
  let m
  const re = /Табак\s+Matt\s*Pear[^<]{0,80}|Matt\s*Pear\s+(Crazy|Pop|Old School)?[^<]{3,80}/gi
  while ((m = re.exec(r.html))) {
    const t = decode(m[0])
    const name = cleanMattPearName(t)
    if (!name) continue
    upsert(map, "mattpear", detectMattLine(t), name, [r.url], "UNKNOWN")
  }
  // also ### headers from markdown-like fetch aren't in HTML; try product cards
  const re2 = /<(?:div|a|span)[^>]*>\s*((?:Табак\s+)?Matt\s*Pear[^<]{3,100})/gi
  while ((m = re2.exec(r.html))) {
    const t = decode(m[1])
    const name = cleanMattPearName(t)
    if (!name) continue
    upsert(map, "mattpear", detectMattLine(t), name, [r.url], "UNKNOWN")
  }
  console.log("hookahset mattpear", [...map.keys()].filter((k) => k.startsWith("mattpear")).length)
}

function cleanAircraftName(raw) {
  let n = decode(raw)
  n = n.replace(/^X\s+/i, "")
  n = n.replace(/^AIRCRAFT\s*[-–—:]?\s*/i, "")
  n = n.replace(/^Aircraft\s*[-–—:]?\s*/i, "")
  n = n.replace(/\s*[-–—]\s*\d+\s*\(M\)\s*$/i, "")
  n = n.replace(/\s+\d+\s*АТП\s*$/i, "")
  n = n.replace(/\s+\d+\s*\(M\)\s*$/i, "")
  n = n.replace(/\s+\d+\s*гр\.?\s*$/i, "")
  n = n.trim()
  if (!n || n.length < 2) return null
  if (/калауд|калад|на грани/i.test(n)) return null
  return n
}

async function scrapeAircraftJF(map) {
  const urls = [
    "https://justfreid.ru/catalog/tabak/aircraft/",
    "https://justfreid.ru/catalog/tabak/aircraft/?filter=1398",
    "https://justfreid.ru/catalog/tabak/aircraft/?SHOWALL_1=1",
    "https://justfreid.ru/catalog/tabak/aircraft/tobacco-aircraft-40-grams-for-hookah/",
  ]
  for (const url of urls) {
    await delay(150)
    const r = await fetchText(url)
    if (!r.ok) continue
    const titles = []
    let m
    const reName = /"NAME"\s*:\s*"([^"]{3,160})"/g
    while ((m = reName.exec(r.html))) titles.push(decode(m[1]))
    const reA = /X\s+AIRCRAFT\s*[-–—][^<"']{3,120}/gi
    while ((m = reA.exec(r.html))) titles.push(decode(m[0]))
    const reB = /AIRCRAFT\s*[-–—][^<"']{3,120}/gi
    while ((m = reB.exec(r.html))) titles.push(decode(m[0]))
    const reTitle = /product-item-title[\s\S]{0,240}?<a[^>]*>([^<]{3,160})<\/a>/gi
    while ((m = reTitle.exec(r.html))) titles.push(decode(m[1]))
    for (const t of titles) {
      if (!/aircraft/i.test(t)) continue
      const name = cleanAircraftName(t)
      if (!name) continue
      const status = /архив|распродаж/i.test(t) ? "DISCONTINUED" : "UNKNOWN"
      upsert(map, "aircraft", "Classic", name, [r.url], status)
    }
    console.log("aircraft url", url, "titles", titles.filter((t) => /aircraft/i.test(t)).length)
  }
}

async function scrapeAircraftMoredyma(map) {
  const url = "https://moredyma.su/tabak-dlya-kalyana/aircraft/"
  const r = await fetchText(url)
  if (!r.ok) return
  let m
  const re = /<(?:h2|h3|a)[^>]*>([^<]*Aircraft[^<]{0,80}|[^<]{3,80})<\/(?:h2|h3|a)>/gi
  while ((m = re.exec(r.html))) {
    const t = decode(m[1])
    if (!/aircraft|аиркрафт|цейлон|french|polish|бленд|coconut|chips|cider|biscuit|rum|banoffee|strawberr|cola|nut|mango|peach|melon|grape|lemon|apple|berry|cherry|mint|ice/i.test(t))
      continue
    let name = cleanAircraftName(t)
    if (!name) {
      name = t.replace(/^Табак\s+/i, "").trim()
    }
    if (!name || name.length < 3) continue
    upsert(map, "aircraft", "Classic", name, [r.url], "ACTIVE")
  }
  // product cards common in WP
  const re2 = /woocommerce-loop-product__title[^>]*>([^<]+)</gi
  while ((m = re2.exec(r.html))) {
    const t = decode(m[1])
    const name = cleanAircraftName(t) || t.replace(/^Табак\s+(для кальяна\s+)?Aircraft\s*[-–—:]?\s*/i, "").trim()
    if (!name || name.length < 2) continue
    upsert(map, "aircraft", "Classic", name, [r.url], "ACTIVE")
  }
  console.log("moredyma aircraft", [...map.keys()].filter((k) => k.startsWith("aircraft")).length)
}

// Also try sevas / smokemaster aircraft & mattpear category pages
async function scrapeSevasBrand(map, slug, brandId, cleaner) {
  const base = `https://sevas-market.ru/product-category/tabak-dlya-kalyana/${slug}/`
  const first = await fetchText(base)
  if (!first.ok || first.status >= 400) {
    console.log("sevas miss", slug, first.status)
    return
  }
  const pages = Math.max(1, ...[...first.html.matchAll(/\/page\/(\d+)\//g)].map((x) => +x[1]))
  for (let p = 1; p <= Math.min(pages, 30); p++) {
    await delay(p === 1 ? 0 : 180)
    const url = p === 1 ? base : `${base}page/${p}/`
    const r = p === 1 ? first : await fetchText(url)
    if (!r.ok) break
    let m
    const re = /<h3[^>]*>([\s\S]*?)<\/h3>/gi
    while ((m = re.exec(r.html))) {
      const t = decode(m[1].replace(/<[^>]+>/g, " "))
      const name = cleaner(t)
      if (!name) continue
      upsert(map, brandId, "Classic", name, [r.url], "ACTIVE")
    }
  }
  console.log("sevas", brandId, [...map.keys()].filter((k) => k.startsWith(brandId)).length)
}

const map = new Map()
await scrapeMyKalyanMattPear(map)
await scrapeHookahHouseMattPear(map)
await scrapeHookahSetMattPear(map)
await scrapeAircraftJF(map)
await scrapeAircraftMoredyma(map)
await scrapeSevasBrand(map, "mattpear", "mattpear", (t) => {
  if (!/mattpear|matt pear|матпир/i.test(t)) return null
  return cleanMattPearName(t)
})
await scrapeSevasBrand(map, "aircraft", "aircraft", (t) => {
  if (!/aircraft|аиркрафт/i.test(t)) return null
  return cleanAircraftName(t) || t.replace(/^Табак для кальяна\s+/i, "").replace(/^Aircraft\s*/i, "").trim()
})

const byBrand = {}
for (const it of map.values()) {
  ;(byBrand[it.brandId] ??= []).push(it)
}
for (const id of Object.keys(byBrand)) {
  byBrand[id].sort((a, b) => a.name.localeCompare(b.name, "ru"))
  console.log("FINAL", id, byBrand[id].length)
}

fs.writeFileSync("scripts/ru-low-clean.json", JSON.stringify({ generatedAt: new Date().toISOString(), brands: byBrand }, null, 2))
console.log("wrote scripts/ru-low-clean.json")
