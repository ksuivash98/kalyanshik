import { writeFileSync } from "fs"

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept-Language": "ru-RU,ru;q=0.9",
        Accept: "text/html",
      },
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
    .replace(/\s+/g, " ")
    .trim()
}

function stripTags(s) {
  return decode(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "))
}

function stripPack(n) {
  return n
    .replace(/\s*[-–—]?\s*\(?\s*\d+([.,]\d+)?\s*(гр|г|g|GR|ml)?\s*\)?\s*$/i, "")
    .replace(/\s*\(\s*M\s*\)\s*$/i, "")
    .trim()
}

function uniq(a) {
  const s = new Set()
  const o = []
  for (const x of a) {
    const k = String(x).toLowerCase()
    if (x && !s.has(k)) {
      s.add(k)
      o.push(x)
    }
  }
  return o
}

function productLikeTitles(html) {
  const titles = []
  const patterns = [
    /<h1[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/h1>/gi,
    /<h2[^>]*class="[^"]*(?:product|title|name)[^"]*"[^>]*>([\s\S]*?)<\/h2>/gi,
    /<h3[^>]*class="[^"]*(?:product|title|name)[^"]*"[^>]*>([\s\S]*?)<\/h3>/gi,
    /class="[^"]*product-title[^"]*"[^>]*>([\s\S]*?)<\//gi,
    /class="[^"]*product-item-title[^"]*"[\s\S]{0,300}?>([^<]{3,160})</gi,
    /itemprop="name"[^>]*content="([^"]+)"/gi,
    /itemprop="name"[^>]*>([^<]+)/gi,
    /"NAME"\s*:\s*"([^"]+)"/g,
    /data-product_title="([^"]+)"/gi,
    /title="(Табак[^"]{3,120}|Смесь[^"]{3,120}|Доха[^"]{3,120})"/gi,
    /alt="(Табак[^"]{3,120}|Смесь[^"]{3,120})"/gi,
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(html))) titles.push(stripTags(m[1]))
  }
  return titles
}

async function scrapePaginated(baseUrl, { maxPages = 40, label = "" } = {}) {
  const flavorsRaw = []
  const sources = []
  const first = await fetchText(baseUrl)
  if (!first.ok) {
    console.log(label, "FAIL", first.status || first.err, baseUrl)
    return { flavorsRaw: [], sources: [], ok: false }
  }
  sources.push(first.url)
  flavorsRaw.push(...productLikeTitles(first.html))

  let maxPage = Math.max(
    1,
    ...[...first.html.matchAll(/\/page\/(\d+)\//g)].map((x) => +x[1]),
    ...[...first.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]),
    ...[...first.html.matchAll(/[?&]page=(\d+)/g)].map((x) => +x[1])
  )
  const showing = first.html.match(/из\s+(\d+)/i)
  if (showing && +showing[1] > 12) maxPage = Math.max(maxPage, Math.ceil(+showing[1] / 12))

  // try SHOWALL for bitrix
  if (/justfreid|hookahhouse/i.test(baseUrl)) {
    const showAll = baseUrl.includes("?") ? baseUrl + "&SHOWALL_1=1" : baseUrl.replace(/\/?$/, "/") + "?SHOWALL_1=1"
    const sa = await fetchText(showAll)
    if (sa.ok) {
      const got = productLikeTitles(sa.html)
      if (got.length > flavorsRaw.length) {
        flavorsRaw.length = 0
        flavorsRaw.push(...got)
        sources.push(sa.url)
        console.log(label, "SHOWALL", got.length)
        return { flavorsRaw, sources: uniq(sources), ok: true, finalUrl: sa.url }
      }
    }
  }

  for (let p = 2; p <= Math.min(Math.max(maxPage, 2), maxPages); p++) {
    await delay(150)
    const candidates = [
      first.url.replace(/\/?$/, `/page/${p}/`),
      baseUrl.replace(/\/?$/, `/page/${p}/`),
      baseUrl.includes("?") ? `${baseUrl}&PAGEN_1=${p}` : `${baseUrl.replace(/\/?$/, "/")}?PAGEN_1=${p}`,
      baseUrl.includes("?") ? `${baseUrl}&page=${p}` : `${baseUrl}?page=${p}`,
    ]
    let added = false
    for (const u of candidates) {
      const r = await fetchText(u)
      if (!r.ok) continue
      const got = productLikeTitles(r.html)
      if (got.length) {
        flavorsRaw.push(...got)
        sources.push(r.url)
        added = true
        maxPage = Math.max(
          maxPage,
          ...[...r.html.matchAll(/\/page\/(\d+)\//g)].map((x) => +x[1]),
          ...[...r.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1])
        )
        break
      }
    }
    if (!added && p > maxPage) break
    if (!added && p > 3) break
  }
  console.log(label, uniq(flavorsRaw).length, "pages~", sources.length)
  return { flavorsRaw: uniq(flavorsRaw), sources: uniq(sources), ok: true, finalUrl: first.url }
}

// Debug JF burn once
{
  const r = await fetchText("https://justfreid.ru/catalog/tabak/burn/?SHOWALL_1=1")
  console.log("JF burn status", r.status, "len", r.html.length)
  const names = productLikeTitles(r.html)
  console.log("JF burn titles", names.length, names.slice(0, 8))
  // dump NAME matches
  const nameJson = [...r.html.matchAll(/"NAME"\s*:\s*"([^"]+)"/g)].map((m) => decode(m[1]))
  console.log("NAME json", nameJson.length, nameJson.slice(0, 10))
  // look for product-item
  console.log("has product-item", /product-item/.test(r.html), "catalog-section", /catalog-section/.test(r.html))
  const idx = r.html.indexOf("BLACKBURN")
  console.log("context", r.html.slice(idx, idx + 250).replace(/\s+/g, " "))
}

const out = { brands: {}, notes: [] }

const moredymaBrands = [
  "black-burn",
  "burn",
  "dogma",
  "kraken",
  "helix",
  "bliss",
  "aircraft",
  "al-fakher",
  "fake",
  "joy-ru-10",
  "adalya",
  "banger",
  "bonche",
  "codex-nubium",
  "daily-hookah",
  "dark-side",
  "deus",
  "duft",
  "element",
  "endorfin",
  "frigate",
  "jent",
  "khan-burley",
  "leteam",
  "morpheus",
  "must-have",
  "nash",
  "overdose-25-gr",
  "palitra",
  "sapphire-crown",
  "sebero",
  "serbetli",
  "smoke-angels",
  "spectrum",
  "starline",
  "tangiers",
  "wto",
  "jam",
  "mattpear",
  "matt-pear",
  "cobra",
  "iskra",
  "funel",
  "dead-horse",
  "blackleaf",
  "unity",
  "craftium",
  "hlgn",
  "molodost",
  "nur",
  "chabacco",
  "social-smoke",
  "northern-forest",
  "young-blood",
  "snobless",
  "take",
  "huligan",
  "sarma",
  "satyr",
  "trofimoffs",
]

// discover all moredyma brand links
{
  const root = await fetchText("https://moredyma.su/tabak-dlya-kalyana/")
  if (root.ok) {
    const slugs = [
      ...root.html.matchAll(/href="https?:\/\/moredyma\.su\/tabak-dlya-kalyana\/([a-z0-9-]+)\/"/gi),
    ].map((m) => m[1])
    out.moredymaSlugs = uniq(slugs).sort()
    console.log("moredyma slugs", out.moredymaSlugs.join(", "))
    for (const s of out.moredymaSlugs) {
      if (!moredymaBrands.includes(s)) moredymaBrands.push(s)
    }
  } else out.notes.push("moredyma root fail")
}

for (const slug of moredymaBrands) {
  const r = await scrapePaginated(`https://moredyma.su/tabak-dlya-kalyana/${slug}/`, {
    label: "md:" + slug,
    maxPages: 30,
  })
  out.brands["md:" + slug] = r
}

// JustFreid priority with SHOWALL and looser keep
const jf = [
  ["burn", "https://justfreid.ru/catalog/tabak/burn/"],
  ["dogma", "https://justfreid.ru/catalog/tabak/dogma/"],
  ["wto", "https://justfreid.ru/catalog/tabak/wto/"],
  ["kraken", "https://justfreid.ru/catalog/tabak/kraken/"],
  ["helix", "https://justfreid.ru/catalog/tabak/helix/"],
  ["bliss", "https://justfreid.ru/catalog/tabak/Bliss/"],
  ["cobra", "https://justfreid.ru/catalog/tabak/cobra/"],
  ["fake-feyk", "https://justfreid.ru/catalog/tabak/fake-feyk/"],
  ["hlgn", "https://justfreid.ru/catalog/tabak/hlgn/"],
  ["joy-dzhoy", "https://justfreid.ru/catalog/tabak/joy-dzhoy/"],
  ["molodost", "https://justfreid.ru/catalog/tabak/molodost/"],
  ["nur-nur", "https://justfreid.ru/catalog/tabak/nur-nur/"],
  ["tangiers", "https://justfreid.ru/catalog/tabak/tangiers/"],
  ["smoke-angels", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
  ["sebero", "https://justfreid.ru/catalog/tabak/sebero/"],
  ["al-fakher", "https://justfreid.ru/catalog/tabak/al-fakher/"],
  ["serbetli", "https://justfreid.ru/catalog/tabak/serbetli/"],
  ["chabacco", "https://justfreid.ru/catalog/tabak/chabacco/"],
]

for (const [key, url] of jf) {
  const r = await scrapePaginated(url, { label: "jf:" + key, maxPages: 40 })
  out.brands["jf:" + key] = r
}

// SmokeMaster again
for (const [key, url, ] of [
  ["blackburn", "https://smokemaster.ru/shop/tabak-dlya-kalyana/black-burn/"],
  ["smoke-angels", "https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/"],
  ["sebero", "https://smokemaster.ru/shop/tabak-dlya-kalyana/sebero-tobacco/?products-per-page=144"],
  ["sebero2", "https://smokemaster.ru/shop/tabak-dlya-kalyana/sebero/"],
]) {
  const r = await scrapePaginated(url.includes("?") ? url : url.replace(/\/?$/, "/") + "?products-per-page=144", {
    label: "sm:" + key,
    maxPages: 15,
  })
  out.brands["sm:" + key] = r
}

// hookahhouse jam already had 35 - re-scrape clean
{
  const r = await scrapePaginated("https://hookahhouse.ru/catalog/tabak_dlya_kalyana/jam/", {
    label: "hh:jam",
    maxPages: 20,
  })
  out.brands["hh:jam"] = r
}

writeFileSync(new URL("./ru-moredyma-jf.json", import.meta.url), JSON.stringify(out, null, 2))
console.log("wrote")
