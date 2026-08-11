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
    .replace(/\s+/g, " ")
    .trim()
}

function stripPack(n) {
  return n
    .replace(/\s*[-–—]?\s*\d+\s*(GR|гр|г|g)\.?$/i, "")
    .replace(/\s*\(\s*M\s*\)\s*$/i, "")
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

/** Extract Bitrix catalog product NAMES from justfreid */
function extractJFNames(html) {
  const names = []
  // JSON fragments
  const reName = /"NAME"\s*:\s*"([^"]{3,160})"/g
  let m
  while ((m = reName.exec(html))) {
    const n = decode(m[1])
    if (/^(ТАБАК|СМЕСЬ|BLACKBURN|DOGMA|WTO|KRAKEN|HELIX|BLISS|JOY|FAKE|ХЛГ|МОЛОДОСТЬ|NUR|TANGIERS|SEBERO|CHABACCO|SMOKE|SERBETLI|JAM|COBRA|AIRCRAFT|X |BURN|МАТТ|MATT)/i.test(n)) {
      names.push(n)
    }
  }
  // product-item-title links
  const reTitle = /product-item-title[\s\S]{0,200}?<a[^>]*>([^<]{3,160})<\/a>/gi
  while ((m = reTitle.exec(html))) names.push(decode(m[1]))

  // meta product name
  const reMeta = /itemprop="name"\s+content="([^"]+)"/gi
  while ((m = reMeta.exec(html))) {
    const n = decode(m[1])
    if (/табак|смесь|burn|dogma|wto|kraken|helix|bliss/i.test(n)) names.push(n)
  }
  return names
}

function normalizeJF(n, brandKeys) {
  let x = n
  x = x.replace(/^(ТАБАК|СМЕСЬ|Табак|Смесь)\s+/i, "")
  x = stripPack(x)
  // drop noise
  if (/интернет|mary|justfreid|купить|магазин|price|%price%/i.test(x)) return null
  if (x.length < 2) return null
  // optional: must mention brand
  if (brandKeys?.length) {
    const ok = brandKeys.some((b) => new RegExp(b, "i").test(n) || new RegExp(b, "i").test(x))
    if (!ok) return null
  }
  return x
}

async function scrapeJFCategory(url, key, brandKeys) {
  const flavors = new Set()
  const sources = []
  // SHOWALL
  const u0 = url.includes("?") ? url + "&SHOWALL_1=1" : url.replace(/\/?$/, "/") + "?SHOWALL_1=1"
  let r = await fetchText(u0)
  if (!r.ok || extractJFNames(r.html).length < 3) {
    r = await fetchText(url)
  }
  if (!r.ok) return { key, flavors: [], sources: [], note: "fail " + (r.status || r.err) }
  sources.push(r.url)

  const add = (html) => {
    for (const n of extractJFNames(html)) {
      const f = normalizeJF(n, brandKeys)
      if (f) flavors.add(f)
    }
  }
  add(r.html)

  let maxPage = Math.max(1, ...[...r.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]))
  // if SHOWALL worked, may be 1 page
  if (!url.includes("SHOWALL") && maxPage <= 1) {
    // walk pages until empty
    for (let p = 2; p <= 40; p++) {
      await delay(180)
      const u = url.includes("?") ? `${url}&PAGEN_1=${p}` : `${url.replace(/\/?$/, "/")}?PAGEN_1=${p}`
      const page = await fetchText(u)
      if (!page.ok) break
      const before = flavors.size
      add(page.html)
      sources.push(page.url)
      if (flavors.size === before) break
    }
  } else {
    for (let p = 2; p <= Math.min(maxPage, 40); p++) {
      await delay(180)
      const u = url.includes("?") ? `${url}&PAGEN_1=${p}` : `${url.replace(/\/?$/, "/")}?PAGEN_1=${p}`
      const page = await fetchText(u)
      if (!page.ok) break
      add(page.html)
      sources.push(page.url)
    }
  }
  console.log(key, flavors.size)
  return {
    key,
    flavors: uniq([...flavors]).sort((a, b) => a.localeCompare(b, "ru")),
    sources: uniq(sources),
  }
}

const jobs = [
  ["https://justfreid.ru/catalog/tabak/burn/", "burn", ["BLACKBURN", "BURN", "Burn"]],
  ["https://justfreid.ru/catalog/tabak/dogma/", "dogma", ["DOGMA", "Dogma"]],
  ["https://justfreid.ru/catalog/tabak/wto/", "wto", ["WTO"]],
  ["https://justfreid.ru/catalog/tabak/kraken/", "kraken", ["KRAKEN", "Kraken"]],
  ["https://justfreid.ru/catalog/tabak/helix/", "helix", ["HELIX", "Helix"]],
  ["https://justfreid.ru/catalog/tabak/Bliss/", "bliss", ["BLISS", "Bliss"]],
  ["https://justfreid.ru/catalog/tabak/cobra/", "cobra", ["КОБРА", "COBRA", "Кобра", "X КОБРА"]],
  ["https://justfreid.ru/catalog/tabak/fake-feyk/", "fake", ["FAKE", "Fake"]],
  ["https://justfreid.ru/catalog/tabak/hlgn/", "hlgn", ["ХЛГ", "HLGN", "ХЛГN"]],
  ["https://justfreid.ru/catalog/tabak/joy-dzhoy/", "joy", ["JOY", "Joy"]],
  ["https://justfreid.ru/catalog/tabak/molodost/", "molodost", ["МОЛОДОСТЬ", "Молодость", "Young"]],
  ["https://justfreid.ru/catalog/tabak/nur-nur/", "nur", ["NUR"]],
  ["https://justfreid.ru/catalog/tabak/tangiers/", "tangiers", ["TANGIERS", "Tangiers"]],
  ["https://justfreid.ru/catalog/tabak/smoke-angels/", "smoke-angels", ["SMOKE ANGELS", "Smoke Angels", "SMOKE"]],
  ["https://justfreid.ru/catalog/tabak/sebero/", "sebero", ["SEBERO", "Sebero"]],
  ["https://justfreid.ru/catalog/tabak/al-fakher/", "al-fakher", ["AL FAKHER", "Al Fakher", "Альфакер", "AL-FAKHER"]],
  ["https://justfreid.ru/catalog/tabak/adalya/", "adalya", ["ADALYA", "Adalya"]],
]

// discover aircraft / jam / serbetli / mattpear / chabacco / aircraft paths
const cat = await fetchText("https://justfreid.ru/catalog/tabak/")
const slugSet = new Set()
if (cat.ok) {
  for (const m of cat.html.matchAll(/\/catalog\/tabak\/([a-zA-Z0-9-]+)\//g)) slugSet.add(m[1])
}
const extraMap = {
  aircraft: ["AIRCRAFT", "Aircraft", "Аиркрафт"],
  jam: ["JAM", "Jam"],
  serbetli: ["SERBETLI", "Serbetli", "Щербетли"],
  mattpear: ["MATTPEAR", "MattPear", "Matt Pear", "МАТТПИР"],
  "matt-pear": ["MATTPEAR", "MattPear"],
  chabacco: ["CHABACCO", "Chabacco", "Чебакко"],
  iskra: ["ISKRA", "Iskra", "Искра"],
  funel: ["FUNEL", "Funel"],
  "dead-horse": ["DEAD HORSE", "Dead Horse"],
  blackleaf: ["BLACKLEAF", "Blackleaf"],
  unity: ["UNITY", "Unity"],
  craftium: ["CRAFTIUM", "Craftium"],
  take: ["TAKE", "Take"],
  morpheus: ["MORPHEUS", "Morpheus", "Морфеус"],
  "morpheus-morfeus": ["MORPHEUS", "Morpheus"],
  "codex-nubium": ["CODEX", "Nubium"],
  wave: ["WAVE", "Wave"],
  antagonist: ["ANTAGONIST", "Antagonist"],
  dusha: ["ДУША", "Dusha"],
  "original-virginia": ["ORIGINAL VIRGINIA", "Virginia"],
}
for (const [slug, keys] of Object.entries(extraMap)) {
  if ([...slugSet].some((s) => s.toLowerCase() === slug.toLowerCase())) {
    const real = [...slugSet].find((s) => s.toLowerCase() === slug.toLowerCase())
    if (!jobs.some((j) => j[1] === slug)) {
      jobs.push([`https://justfreid.ru/catalog/tabak/${real}/`, slug, keys])
    }
  }
}

const out = { brands: {}, notes: [], jfSlugsFound: [...slugSet].filter((s) => Object.keys(extraMap).includes(s.toLowerCase()) || /burn|dogma|wto|kraken|helix|bliss|cobra|fake|hlgn|joy|molod|nur|tangiers|smoke|sebero|fakher|aircraft|jam|serbet|matt|chabacco|iskra|funel|dead|blackleaf|unity|craft|wave|antagonist|dusha|morpheus/i.test(s)).sort() }
console.log("extra slugs", out.jfSlugsFound.join(", "))

for (const [url, key, brandKeys] of jobs) {
  out.brands[key] = await scrapeJFCategory(url, key, brandKeys)
}

/* ===== SmokeMaster improved: all products via filter count & page walk ===== */
async function scrapeSMFull(base, brandStrip, key) {
  const flavors = new Set()
  const sources = []
  const first = await fetchText(base.replace(/\/?$/, "/") + "?products-per-page=144&orderby=title")
  if (!first.ok) return { key, flavors: [], sources: [] }
  sources.push(first.url)
  const titles = (html) => {
    const t = []
    const re = /<h2[^>]*woocommerce-loop-product__title[^>]*>([^<]+)<\/h2>/gi
    let m
    while ((m = re.exec(html))) t.push(decode(m[1]))
    return t
  }
  const norm = (t) => {
    let n = t.replace(/^Табак\s+/i, "")
    for (const b of brandStrip) n = n.replace(new RegExp("^" + b + "\\s+", "i"), "")
    return stripPack(n)
  }
  for (const t of titles(first.html)) flavors.add(norm(t))
  for (let p = 2; p <= 20; p++) {
    await delay(200)
    const u = base.replace(/\/?$/, `/page/${p}/`) + "?products-per-page=144"
    const r = await fetchText(u)
    if (!r.ok) break
    const got = titles(r.html)
    if (!got.length) break
    for (const t of got) flavors.add(norm(t))
    sources.push(r.url)
  }
  console.log("sm", key, flavors.size)
  return { key, flavors: uniq([...flavors]).sort((a, b) => a.localeCompare(b, "ru")), sources: uniq(sources) }
}

out.sm = {}
out.sm.blackburn = await scrapeSMFull(
  "https://smokemaster.ru/shop/tabak-dlya-kalyana/black-burn/",
  ["Black Burn", "BLACK Burn", "Burn"],
  "blackburn"
)
out.sm["smoke-angels"] = await scrapeSMFull(
  "https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/",
  ["Smoke Angels"],
  "smoke-angels"
)
out.sm.sebero = await scrapeSMFull(
  "https://smokemaster.ru/shop/tabak-dlya-kalyana/sebero/",
  ["Sebero tobacco", "Sebero"],
  "sebero"
)

/* ===== Jam official ===== */
{
  const jam = await fetchText("https://jammtobacco.com/jam")
  const flavors = new Set()
  if (jam.ok) {
    const re = /<(?:h[1-4]|div|span|a|p)[^>]*>([^<]{2,80})<\/(?:h[1-4]|div|span|a|p)>/gi
    let m
    while ((m = re.exec(jam.html))) {
      const t = decode(m[1])
      if (/jam/i.test(jam.html) && t.length > 2 && t.length < 60 && !/меню|корзин|купить|каталог|доставк|о компан|контакт/i.test(t)) {
        // keep later filtered
      }
    }
    // try JSON / product cards
    for (const m of jam.html.matchAll(/"title"\s*:\s*"([^"]+)"/g)) flavors.add(decode(m[1]))
    for (const m of jam.html.matchAll(/"name"\s*:\s*"([^"]+)"/g)) {
      const n = decode(m[1])
      if (!/jamm|tobacco|home|jam tobacco/i.test(n) && n.length < 50) flavors.add(n)
    }
  }
  out.jamOfficial = { flavors: uniq([...flavors]), sources: ["https://jammtobacco.com/jam"], note: jam.ok ? "ok" : jam.err }
  console.log("jam official", out.jamOfficial.flavors.length)
}

/* ===== HookahHouse ===== */
{
  const urls = [
    "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/jam/",
    "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/",
  ]
  out.hookahhouse = {}
  for (const url of urls) {
    const flavors = new Set()
    const sources = []
    let r = await fetchText(url)
    if (!r.ok) {
      out.notes.push("hh fail " + url)
      continue
    }
    sources.push(r.url)
    const extract = (html) => {
      for (const m of html.matchAll(/class="[^"]*(?:product-title|item-title|catalog-section-item-name)[^"]*"[^>]*>([\s\S]*?)<\//gi)) {
        flavors.add(stripPack(decode(m[1].replace(/<[^>]+>/g, " "))))
      }
      for (const m of html.matchAll(/itemprop="name"[^>]*content="([^"]+)"/gi)) flavors.add(stripPack(decode(m[1])))
      for (const m of html.matchAll(/"NAME"\s*:\s*"([^"]+)"/g)) flavors.add(stripPack(decode(m[1])))
    }
    extract(r.html)
    let maxPage = Math.max(1, ...[...r.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]))
    for (let p = 2; p <= Math.min(maxPage, 30); p++) {
      await delay(200)
      const u = `${url}${url.includes("?") ? "&" : "?"}PAGEN_1=${p}`
      const page = await fetchText(u)
      if (!page.ok) break
      extract(page.html)
      sources.push(page.url)
    }
    const key = url.includes("/jam/") ? "jam" : "all"
    out.hookahhouse[key] = { flavors: uniq([...flavors]).filter((x) => x.length > 1), sources: uniq(sources) }
    console.log("hh", key, out.hookahhouse[key].flavors.length)
  }
}

/* ===== moredyma.su ===== */
{
  const r = await fetchText("https://moredyma.su/")
  out.moredyma = { flavors: [], sources: [], note: r.ok ? "ok" : r.err }
  if (r.ok) {
    // find catalog links
    const links = [...r.html.matchAll(/href="(https?:\/\/moredyma\.su\/[^"]+)"/gi)].map((x) => x[1])
    out.moredyma.links = uniq(links.filter((l) => /tabak|brand|catalog|tobacco/i.test(l))).slice(0, 40)
    console.log("moredyma links", out.moredyma.links)
  }
}

/* ===== WTO / MattPear search on sevas ===== */
{
  out.sevasSearch = {}
  for (const q of ["WTO", "MattPear", "Helix", "Aircraft", "Iskra", "Funel", "Dead Horse", "Cobra", "Smoke Angels", "Tangiers", "Al Fakher", "Social Smoke", "Blackleaf", "Unity", "Craftium", "Northern Forest"]) {
    const url = `https://sevas-market.ru/?s=${encodeURIComponent(q)}&post_type=product`
    const r = await fetchText(url)
    const flavors = []
    if (r.ok) {
      const re = /<h3[^>]*>([\s\S]*?)<\/h3>/gi
      let m
      while ((m = re.exec(r.html))) {
        const t = decode(m[1].replace(/<[^>]+>/g, " "))
        if (t.length > 5 && new RegExp(q.split(" ")[0], "i").test(t)) flavors.push(stripPack(t.replace(/^Табак для кальяна\s+/i, "").replace(/^Смесь для кальяна\s+/i, "")))
      }
    }
    out.sevasSearch[q] = { flavors: uniq(flavors), sources: [url], count: flavors.length }
    console.log("sevas search", q, flavors.length)
  }
}

writeFileSync(new URL("./ru-jf-extra.json", import.meta.url), JSON.stringify(out, null, 2))
console.log("done")
