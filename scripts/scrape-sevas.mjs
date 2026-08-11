import { writeFileSync } from "fs"

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9" },
    redirect: "follow",
    signal: AbortSignal.timeout(60000),
  })
  return { status: res.status, url: res.url, html: await res.text() }
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .trim()
}

function productTitles(html) {
  const out = []
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>/gi
  let m
  while ((m = re.exec(html))) {
    const t = decodeEntities(stripTags(m[1]))
    if (t.length < 5) continue
    if (/популяр|связанн|категор|бренд/i.test(t)) continue
    out.push(t)
  }
  return out
}

function totalCount(html) {
  const m = html.match(/Отображение\s+[\d–\-]+\s+из\s+(\d+)/i)
  return m ? +m[1] : null
}

function maxPage(html, perPage = 20) {
  const pages = [...html.matchAll(/\/page\/(\d+)\//g)].map((x) => +x[1])
  const total = totalCount(html)
  const fromTotal = total ? Math.ceil(total / perPage) : 1
  return Math.max(1, fromTotal, ...(pages.length ? pages : [1]))
}

function stripPack(name) {
  return name
    .replace(/\s*[—–\-]\s*\d+\s*(гр|г|g)\.?$/i, "")
    .replace(/\s+\d+\s*(гр|г|g)\.?$/i, "")
    .replace(/\s*\(\s*акциз\s*\)\s*$/i, "")
    .trim()
}

function flavorFromSevasTitle(title) {
  let n = title
  n = n.replace(/^Табак для кальяна\s+/i, "")
  n = n.replace(/^Смесь для кальяна\s+/i, "")
  n = n.replace(/^Доха для кальяна\s+/i, "")
  n = stripPack(n)
  return n
}

async function scrapeSevasCat(slug) {
  const base = `https://sevas-market.ru/product-category/tabak-dlya-kalyana/${slug}/`
  const first = await fetchText(base)
  if (first.status >= 400) {
    return { slug, ok: false, status: first.status, finalUrl: first.url, flavors: [], sources: [], total: 0 }
  }
  const flavors = new Set()
  const sources = [first.url]
  for (const t of productTitles(first.html)) flavors.add(flavorFromSevasTitle(t))
  const pages = maxPage(first.html)
  const total = totalCount(first.html)
  for (let p = 2; p <= Math.min(pages, 100); p++) {
    const u = first.url.replace(/\/?$/, `/`) + `page/${p}/`
    // if final url already has trailing path
    const pageUrl = first.url.endsWith("/")
      ? `${first.url}page/${p}/`
      : `${first.url}/page/${p}/`
    try {
      const r = await fetchText(pageUrl)
      if (r.status >= 400) break
      const before = flavors.size
      for (const t of productTitles(r.html)) flavors.add(flavorFromSevasTitle(t))
      sources.push(r.url)
      if (flavors.size === before && p > pages) break
    } catch {
      break
    }
  }
  return {
    slug,
    ok: true,
    status: first.status,
    finalUrl: first.url,
    total,
    pages,
    flavors: [...flavors].filter(Boolean).sort((a, b) => a.localeCompare(b, "ru")),
    sources: [...new Set(sources)],
  }
}

// Probe structure once
const probe = await fetchText("https://sevas-market.ru/product-category/tabak-dlya-kalyana/kraken/")
const i = probe.html.indexOf("Kraken")
console.log("redirect", probe.url)
console.log("context", probe.html.slice(Math.max(0, i - 120), i + 300).replace(/\s+/g, " "))
console.log("titles sample", productTitles(probe.html).slice(0, 5))
console.log("total", totalCount(probe.html), "pages", maxPage(probe.html))

// Brand list from tobacco root headings / category cards
const root = await fetchText("https://sevas-market.ru/product-category/tabak-dlya-kalyana/")
const brandLinks = [
  ...root.html.matchAll(/href="(https:\/\/sevas-market\.ru\/product-category\/tabak-dlya-kalyana\/[a-z0-9-]+\/)"/gi),
]
  .map((m) => m[1])
  .filter((u) => !u.includes("/brand/") && !u.endsWith("/tabak-dlya-kalyana/"))
const brandSlugs = [...new Set(brandLinks.map((u) => u.split("/").filter(Boolean).pop()))].sort()
console.log("brand slugs", brandSlugs.join(", "))

const priority = [
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
  "tangiers",
  "al-fakher",
  "social-smoke",
  "sebero",
  "chabacco",
  "chaba",
  "adalya",
  "morpheus",
  "palitra",
  "snobless",
  "take",
]

const slugs = [...new Set([...priority, ...brandSlugs])]
const out = { brands: {}, notes: [], brandSlugs }
for (const slug of slugs) {
  process.stdout.write(`sevas ${slug}...\n`)
  try {
    const r = await scrapeSevasCat(slug)
    out.brands[slug] = r
    console.log(`  -> ${r.flavors.length} flavors, total=${r.total}, pages=${r.pages}, url=${r.finalUrl}`)
  } catch (e) {
    out.notes.push(`${slug}: ${e.message}`)
    console.log("  ERR", e.message)
  }
}

writeFileSync(new URL("./ru-sevas.json", import.meta.url), JSON.stringify(out, null, 2))
console.log("done sevas")
