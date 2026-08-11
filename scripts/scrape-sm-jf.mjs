import { writeFileSync } from "fs"

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

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/\s+/g, " ")
    .trim()
}

function stripPack(name) {
  return name
    .replace(/\s*[-–—]?\s*\(?\s*\d+\s*(г|гр|г\.|гр\.|g)\s*\)?\s*$/i, "")
    .replace(/\s*\(\s*M\s*\)\s*$/i, "")
    .trim()
}

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const k = x.toLowerCase()
    if (!seen.has(k) && x) {
      seen.add(k)
      out.push(x)
    }
  }
  return out
}

/* ===== SmokeMaster ===== */
function smTitles(html) {
  const titles = []
  const re = /<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]+)<\/h2>/gi
  let m
  while ((m = re.exec(html))) titles.push(decodeEntities(m[1]))
  // fallback title attrs unique product names
  const re2 = /alt="(Табак [^"]+)"/gi
  while ((m = re2.exec(html))) titles.push(decodeEntities(m[1]))
  return titles
}

function smNormalize(t, brandPatterns) {
  let n = t.replace(/^Табак\s+/i, "")
  for (const p of brandPatterns) n = n.replace(new RegExp("^" + p + "\\s+", "i"), "")
  return stripPack(n)
}

async function scrapeSM(base, brandPatterns, key) {
  const urlsTry = [
    base.replace(/\/?$/, "/") + "?products-per-page=144",
    base.replace(/\/?$/, "/"),
  ]
  let first = null
  for (const u of urlsTry) {
    first = await fetchText(u)
    if (first.ok && smTitles(first.html).length) break
  }
  if (!first?.ok) return { key, flavors: [], sources: [], note: "fail" }
  const flavors = new Set()
  const sources = [first.url]
  for (const t of smTitles(first.html)) flavors.add(smNormalize(t, brandPatterns))

  let maxPage = Math.max(1, ...[...first.html.matchAll(/\/page\/(\d+)\//g)].map((x) => +x[1]))
  // count from filter (40)
  for (let p = 2; p <= Math.max(maxPage, 15); p++) {
    await delay(200)
    const u = base.replace(/\/?$/, `/page/${p}/`) + "?products-per-page=144"
    const r = await fetchText(u)
    if (!r.ok) break
    const got = smTitles(r.html)
    if (!got.length) break
    for (const t of got) flavors.add(smNormalize(t, brandPatterns))
    sources.push(r.url)
    maxPage = Math.max(maxPage, ...[...r.html.matchAll(/\/page\/(\d+)\//g)].map((x) => +x[1]))
  }
  console.log(key, flavors.size)
  return { key, flavors: uniq([...flavors]).sort((a, b) => a.localeCompare(b, "ru")), sources: uniq(sources) }
}

/* ===== JustFreid Bitrix ===== */
function jfCards(html) {
  const titles = []
  // product name in catalog cards - look for common patterns
  const patterns = [
    /class="[^"]*product-item-title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/gi,
    /class="[^"]*product-title[^"]*"[^>]*>([^<]+)/gi,
    /data-product[^>]*data-name="([^"]+)"/gi,
    /"NAME"\s*:\s*"([^"]+)"/g,
    /itemprop="name"[^>]*content="([^"]+)"/gi,
    /itemprop="name"[^>]*>([^<]+)/gi,
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(html))) titles.push(decodeEntities(m[1]))
  }
  // uppercase product headings seen in markdown conversion
  const reCap = />\s*((?:ТАБАК|BLACKBURN|СМЕСЬ)[^<]{3,120})\s*</gi
  let m
  while ((m = reCap.exec(html))) titles.push(decodeEntities(m[1]))
  return titles
}

function jfNormalize(t) {
  let n = t.replace(/^(ТАБАК|Табак|СМЕСЬ|Смесь)\s+/i, "")
  n = stripPack(n)
  n = n.replace(/\s*\(M\)\s*$/i, "")
  return n
}

async function scrapeJF(url, key) {
  // try show all
  const tries = [
    url.includes("?") ? url + "&SHOWALL_1=1" : url.replace(/\/?$/, "/") + "?SHOWALL_1=1",
    url.includes("?") ? url + "&count=100" : url.replace(/\/?$/, "/") + "?count=100",
    url,
  ]
  let first = null
  for (const u of tries) {
    first = await fetchText(u)
    if (first.ok && jfCards(first.html).length) break
  }
  if (!first?.ok) return { key, flavors: [], sources: [] }
  const flavors = new Set()
  const sources = [first.url]
  for (const t of jfCards(first.html)) flavors.add(jfNormalize(t))

  let maxPage = Math.max(1, ...[...first.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]))
  // also look for pagination numbers in nav
  const navPages = [...first.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1])
  if (navPages.length) maxPage = Math.max(...navPages)

  for (let p = 2; p <= Math.min(Math.max(maxPage, 1), 40); p++) {
    await delay(200)
    const u = url.includes("?") ? `${url}&PAGEN_1=${p}` : `${url.replace(/\/?$/, "/")}?PAGEN_1=${p}`
    const r = await fetchText(u)
    if (!r.ok) break
    const got = jfCards(r.html)
    if (!got.length) {
      // stop if empty after page 2+
      if (p > maxPage) break
      continue
    }
    const before = flavors.size
    for (const t of got) flavors.add(jfNormalize(t))
    sources.push(r.url)
    if (flavors.size === before && p > maxPage) break
  }
  // if still only few, walk until empty
  if (flavors.size < 30 && maxPage <= 1) {
    for (let p = 2; p <= 25; p++) {
      await delay(200)
      const u = url.includes("?") ? `${url}&PAGEN_1=${p}` : `${url.replace(/\/?$/, "/")}?PAGEN_1=${p}`
      const r = await fetchText(u)
      if (!r.ok) break
      const got = jfCards(r.html)
      if (!got.length) break
      const before = flavors.size
      for (const t of got) flavors.add(jfNormalize(t))
      sources.push(r.url)
      if (flavors.size === before) break
    }
  }
  console.log(key, flavors.size, "sample", [...flavors].slice(0, 3))
  return { key, flavors: uniq([...flavors]).sort((a, b) => a.localeCompare(b, "ru")), sources: uniq(sources) }
}

const out = { sm: {}, jf: {}, notes: [] }

// SmokeMaster root brand counts
const smRoot = await fetchText("https://smokemaster.ru/shop/tabak-dlya-kalyana/")
if (smRoot.ok) {
  const brands = [...smRoot.html.matchAll(/href="(https:\/\/smokemaster\.ru\/shop\/tabak-dlya-kalyana\/[a-z0-9-]+\/)"[^>]*>[\s\S]*?\((\d+)\)/gi)]
  const map = {}
  for (const m of brands) {
    const slug = m[1].split("/").filter(Boolean).pop()
    map[slug] = +m[2]
  }
  out.smBrandCounts = map
  console.log("SM brands with count>0:", Object.entries(map).filter(([, c]) => c > 0).map(([k, c]) => `${k}(${c})`).join(", "))
}

const smJobs = [
  ["https://smokemaster.ru/shop/tabak-dlya-kalyana/black-burn/", ["Black Burn", "BLACK Burn", "Burn"], "blackburn"],
  ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", ["Smoke Angels"], "smoke-angels"],
  ["https://smokemaster.ru/shop/tabak-dlya-kalyana/sebero/", ["Sebero tobacco", "Sebero"], "sebero"],
  ["https://smokemaster.ru/shop/tabak-dlya-kalyana/chabacco/", ["Chabacco"], "chabacco"],
]

// add from counts
if (out.smBrandCounts) {
  for (const [slug, c] of Object.entries(out.smBrandCounts)) {
    if (c > 0 && !smJobs.some((j) => j[0].includes(`/${slug}/`))) {
      if (/jam|wto|tangiers|fakher|dogma|kraken|serbetli|matt|helix|bliss|cobra|aircraft|iskra|funel|dead|social/i.test(slug)) {
        smJobs.push([`https://smokemaster.ru/shop/tabak-dlya-kalyana/${slug}/`, [slug.replace(/-/g, " ")], slug])
      }
    }
  }
}

for (const [url, pats, key] of smJobs) {
  out.sm[key] = await scrapeSM(url, pats, key)
}

// JustFreid category pages (not search - search pollutes)
const jfJobs = [
  ["https://justfreid.ru/catalog/tabak/burn/", "burn"],
  ["https://justfreid.ru/catalog/tabak/chabacco/", "chabacco"],
  ["https://justfreid.ru/catalog/tabak/serbetli/", "serbetli"],
  ["https://justfreid.ru/catalog/tabak/sebero/", "sebero"],
  ["https://justfreid.ru/catalog/tabak/smoke-angels/", "smoke-angels"],
  ["https://justfreid.ru/catalog/tabak/jam/", "jam"],
  ["https://justfreid.ru/catalog/tabak/dogma/", "dogma"],
  ["https://justfreid.ru/catalog/tabak/wto/", "wto"],
  ["https://justfreid.ru/catalog/tabak/kraken/", "kraken"],
  ["https://justfreid.ru/catalog/tabak/mattpear/", "mattpear"],
  ["https://justfreid.ru/catalog/tabak/helix/", "helix"],
  ["https://justfreid.ru/catalog/tabak/bliss/", "bliss"],
  ["https://justfreid.ru/catalog/tabak/cobra/", "cobra"],
  ["https://justfreid.ru/catalog/tabak/aircraft/", "aircraft"],
  ["https://justfreid.ru/catalog/tabak/iskra/", "iskra"],
  ["https://justfreid.ru/catalog/tabak/funel/", "funel"],
  ["https://justfreid.ru/catalog/tabak/", "tabak-root-probe"],
]

// discover JF brand folders from catalog
const jfCat = await fetchText("https://justfreid.ru/catalog/tabak/")
if (jfCat.ok) {
  const slugs = [...jfCat.html.matchAll(/\/catalog\/tabak\/([a-z0-9-]+)\//gi)].map((x) => x[1])
  out.jfBrandSlugs = uniq(slugs).sort()
  console.log("JF brand slugs:", out.jfBrandSlugs.join(", "))
  for (const s of out.jfBrandSlugs) {
    if (!jfJobs.some((j) => j[1] === s) && /jam|dogma|wto|kraken|helix|bliss|matt|cobra|aircraft|iskra|funel|dead|smoke|serbet|burn|black|chabacco|sebero|tangiers|fakher|social|unity|craft|hlgn|nur|joy|fake|young|molod|northern|blackleaf/i.test(s)) {
      jfJobs.push([`https://justfreid.ru/catalog/tabak/${s}/`, s])
    }
  }
}

for (const [url, key] of jfJobs) {
  if (key === "tabak-root-probe") continue
  out.jf[key] = await scrapeJF(url, "jf:" + key)
}

writeFileSync(new URL("./ru-sm-jf.json", import.meta.url), JSON.stringify(out, null, 2))
console.log("wrote ru-sm-jf.json")
