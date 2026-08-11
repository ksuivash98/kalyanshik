import { writeFileSync, readFileSync } from "fs"

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
    return { ok: false, err: e.message, url, html: "" }
  }
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/\s+/g, " ")
    .trim()
}

function titles(html) {
  const out = []
  for (const re of [
    /class="[^"]*(?:product-item-title|item-title|catalog-section-item-name|product-title)[^"]*"[^>]*>([\s\S]*?)<\//gi,
    /itemprop="name"[^>]*content="([^"]+)"/gi,
    /"NAME"\s*:\s*"([^"]+)"/g,
    /alt="([^"]{8,120})"/gi,
  ]) {
    let m
    while ((m = re.exec(html))) out.push(decode(m[1].replace(/<[^>]+>/g, " ")))
  }
  return [...new Set(out)]
}

async function scrape(url, label, maxPages = 50) {
  const all = []
  const sources = []
  // try showall
  const show = url.includes("?") ? url + "&SHOWALL_1=1" : url.replace(/\/?$/, "/") + "?SHOWALL_1=1"
  let r = await fetchText(show)
  if (!r.ok || titles(r.html).length < 5) r = await fetchText(url)
  if (!r.ok) {
    console.log(label, "FAIL", r.status || r.err)
    return { flavors: [], sources: [] }
  }
  sources.push(r.url)
  all.push(...titles(r.html))
  let maxPage = Math.max(1, ...[...r.html.matchAll(/PAGEN_1=(\d+)/g)].map((x) => +x[1]))
  // count from "338 товаров" style
  const countM = r.html.match(/(\d+)\s*товар/i)
  if (countM) maxPage = Math.max(maxPage, Math.ceil(+countM[1] / 20))
  console.log(label, "first", all.length, "maxPage~", maxPage, "count", countM && countM[1])

  for (let p = 2; p <= Math.min(maxPage, maxPages); p++) {
    await delay(150)
    const u = url.includes("?") ? `${url}&PAGEN_1=${p}` : `${url.replace(/\/?$/, "/")}?PAGEN_1=${p}`
    const page = await fetchText(u)
    if (!page.ok) break
    const got = titles(page.html)
    if (!got.length) break
    const before = all.length
    all.push(...got)
    sources.push(page.url)
    if (all.length === before) break
  }
  const uniq = [...new Set(all)]
  console.log(label, "total unique titles", uniq.length)
  return { flavors: uniq, sources: [...new Set(sources)] }
}

// discover brand URLs from catalog filters
const root = await fetchText("https://hookahhouse.ru/catalog/tabak_dlya_kalyana/")
const links = [...root.html.matchAll(/href="(https:\/\/hookahhouse\.ru\/catalog\/tabak_dlya_kalyana\/[^"]+\/)"/gi)].map(
  (m) => m[1]
)
const brandLinks = [...new Set(links)].filter((u) => !u.endsWith("/tabak_dlya_kalyana/"))
console.log("hh brand links sample", brandLinks.slice(0, 40))

const wanted = brandLinks.filter((u) =>
  /black.?burn|burn|jam|dogma|serbetli|sebero|smoke|al.?fakher|tangiers|kraken|bliss|helix|wto|cobra|aircraft|fake|joy|matt|chabacco|nur|hlgn|molod|morpheus|palitra|snobless|take/i.test(
    u
  )
)
console.log("wanted", wanted)

const out = { brands: {}, notes: [], brandLinks: brandLinks.slice(0, 80) }

const targets = [
  ...wanted.map((u) => [u.split("/").filter(Boolean).pop(), u]),
  ["black-burn-manual", "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/black_burn/"],
  ["black-burn-hit", "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/black_burn_hit/"],
  ["jam", "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/jam/"],
  ["al-fakher", "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/al_fakher/"],
  ["dogma", "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/dogma/"],
  ["sebero-black", "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/sebero_black/"],
  ["serbetli", "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/serbetli/"],
]

for (const [key, url] of targets) {
  out.brands[key] = await scrape(url, "hh:" + key, 60)
}

writeFileSync(new URL("./ru-hookahhouse.json", import.meta.url), JSON.stringify(out, null, 2))
console.log("done")
