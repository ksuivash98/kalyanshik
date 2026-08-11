import { readFileSync, writeFileSync } from "fs"

const sevas = JSON.parse(readFileSync(new URL("./ru-sevas.json", import.meta.url), "utf8"))
const mdjf = JSON.parse(readFileSync(new URL("./ru-moredyma-jf.json", import.meta.url), "utf8"))
const smjf = JSON.parse(readFileSync(new URL("./ru-sm-jf.json", import.meta.url), "utf8"))

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const k = normKey(x)
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(x)
  }
  return out
}

function normKey(s) {
  return String(s)
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9%]+/gi, "")
    .trim()
}

function stripPack(n) {
  return n
    .replace(/\s*\(\s*M\s*\)\s*/gi, " ")
    .replace(/,?\s*\d+\s*(гр|г|g|GR)\.?\s*/gi, " ")
    .replace(/\s+\d+\s*(гр|г)\b/gi, " ")
    .replace(/\s*[-–—]\s*\d+\s*$/g, "")
    .replace(/\s+МРК\b/gi, "")
    .replace(/\s+БПК\b/gi, "")
    .replace(/\s+40gr\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s*[-–—]\s*$/g, "")
    .trim()
}

function scrub(n) {
  let x = String(n)
  x = x.replace(/^Приобрести\s+/i, "")
  x = x.replace(/^табака для кальяна от\s+/i, "")
  x = x.replace(/^Табак для кальяна\s*/i, "")
  x = x.replace(/^Смесь для кальяна\s*/i, "")
  x = x.replace(/^Доха для кальяна\s*/i, "")
  x = x.replace(/^Табак\s+/i, "")
  x = x.replace(/^Смесь\s+/i, "")
  x = x.replace(/^ТАБАК\s+/i, "")
  x = x.replace(/^Капсула Для Кальяна\s+/i, "")
  x = x.replace(/&nbsp;/g, " ")
  x = x.replace(/\s+/g, " ").trim()
  x = stripPack(x)
  return x
}

function isJunk(n) {
  if (!n || n.length < 2 || n.length > 130) return true
  if (/^(бренда|как выбрать|линейки|что ещё|в севас|mary|интернет|авторизация|главная|магазин|капсулы nur|smoke angels|jam|dogma|serbetli|bliss|fake|joy|take|morpheus|burn|kraken|sebero|для кальяна|описание вкусов|original tangiers\"?$|\(танжирс\))/i.test(n))
    return true
  if (/^табак для кальяна$/i.test(n)) return true
  // brand directory leftovers
  if (/^(adalya|afzal|aircraft|al fakher|badge|banger|barclay|black burn|blansh|bonche|brusko|candy man|codex|daily hookah|darkside|dark side|deus|duft|element|fake|frigate|helix|huligan|jent|joy|khan|kraken|leteam|morpheus|must have|nash|oven|overdose|palitra|sapphire|sarma|sebero|spectrum|starline|tangiers|trofimoff|wto|северный|хулиган|сарма)$/i.test(n))
    return true
  return false
}

function mustMatch(n, re) {
  return re.test(n)
}

function stripRe(n, re) {
  return n.replace(re, "").replace(/^\s*[-–—:]\s*/, "").trim()
}

function finalizeName(n) {
  n = n.replace(/\s*[-–—]\s*$/, "").trim()
  n = n.replace(/\s{2,}/g, " ")
  // unify spaced dash
  n = n.replace(/\s*[—–]\s*/g, " — ")
  return n
}

function addFromSevas(slug, brandRe, stripBrandRe) {
  const b = sevas.brands[slug]
  if (!b?.flavors) return []
  const out = []
  for (let t of b.flavors) {
    t = scrub(t)
    if (!mustMatch(t, brandRe)) continue
    t = stripRe(t, stripBrandRe)
    t = finalizeName(t)
    if (isJunk(t)) continue
    if (/^(medium|strong|classic|drinks|emotions|gastro|arctic mix|black)$/i.test(t)) continue
    out.push(t)
  }
  return out
}

function addFromList(list, brandRe, stripBrandRe, { requireBrand = true } = {}) {
  const out = []
  for (let t of list || []) {
    t = scrub(t)
    if (requireBrand && !mustMatch(t, brandRe)) continue
    if (stripBrandRe) t = stripRe(t, stripBrandRe)
    t = finalizeName(stripPack(t))
    if (isJunk(t)) continue
    out.push(t)
  }
  return out
}

function mdList(slug) {
  const b = mdjf.brands["md:" + slug]
  if (!b) return []
  if ((b.sources || [])[0]?.match(/\/tabak-dlya-kalyana\/?$/)) return []
  return b.flavorsRaw || []
}

function jfList(key) {
  return mdjf.brands[key]?.flavorsRaw || []
}

function smList(key) {
  // carefully: only product-like
  const fromFile = mdjf.brands["sm:" + key]?.flavorsRaw || []
  const fromSm = (smjf.sm?.[key]?.flavors || []).map((f) =>
    key === "blackburn" ? `Black Burn ${f}` : key === "smoke-angels" ? `Smoke Angels ${f}` : f
  )
  return [...fromFile, ...fromSm]
}

function detectLine(name, brandId) {
  if (brandId === "blackburn") {
    if (/\bshock\b/i.test(name)) return "Shock"
    if (/\bhit\b/i.test(name)) return "HiT"
    if (/\bkmtm\b/i.test(name)) return "KMTM"
    return "Classic"
  }
  if (brandId === "kraken") {
    if (/\bstrong\b/i.test(name)) return "Strong"
    if (/\bmedium\b|\bseco\b|\bcaviar\b/i.test(name)) return "Medium"
    return null
  }
  if (brandId === "sebero") {
    if (/arctic\s*mix/i.test(name)) return "Arctic Mix"
    if (/limited\s*mix/i.test(name)) return "Limited Mix"
    if (/\blimited\b/i.test(name)) return "Limited"
    return "Classic"
  }
  if (brandId === "chabacco") {
    if (/medium\s*mix/i.test(name)) return "Medium Mix"
    if (/\bdrinks\b/i.test(name)) return "Drinks"
    if (/\bemotions\b/i.test(name)) return "Emotions"
    if (/\bgastro\b/i.test(name)) return "Gastro"
    if (/\bmedium\b/i.test(name)) return "Medium"
    if (/\bstrong\b/i.test(name)) return "Strong"
    return null
  }
  if (brandId === "tangiers") {
    if (/\bnoir\b/i.test(name)) return "Noir"
    if (/\bburley\b/i.test(name)) return "Burley"
    if (/\bbirquq\b|\bf-line\b/i.test(name)) return null
    return null
  }
  if (brandId === "wto") {
    if (/nicaragua/i.test(name)) return "Nicaragua"
    if (/caribbean|carribean/i.test(name)) return "Caribbean"
    if (/\bitaly\b/i.test(name)) return "Italy"
    if (/dominicana/i.test(name)) return "Dominicana"
    if (/tanzania/i.test(name)) return "Tanzania"
    if (/brazil|cuba|perique|ultimate/i.test(name)) return null
    return null
  }
  if (brandId === "dogma") {
    if (/100\s*%|^100%/i.test(name) || /DOGMA\s*100/i.test(name)) return "100%"
    return null
  }
  return null
}

function statusHints(flavors) {
  const h = {}
  for (const f of flavors) if (/limited|лимит/i.test(f)) h[f] = "LIMITED"
  return h
}

function pack(id, line, flavors, sources) {
  const fl = uniq(flavors).sort((a, b) => a.localeCompare(b, "ru"))
  return { id, line, sources: uniq(sources), flavors: fl, statusHints: statusHints(fl) }
}

function splitByLine(id, flavors, sources) {
  const map = new Map()
  for (const f of flavors) {
    const line = detectLine(f, id)
    const k = line ?? "__null__"
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(f)
  }
  const out = []
  for (const [k, fl] of [...map.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])))) {
    out.push(pack(id, k === "__null__" ? null : k, fl, sources))
  }
  return out
}

const notes = []
const brands = []
const completeness = {}
const newBrandIds = []

function setComplete(id, n, high) {
  completeness[id] = n >= high ? "HIGH" : n >= high * 0.4 ? "MEDIUM" : "LOW"
}

// ---- BLACKBURN / BURN ----
{
  const sources = [
    "https://sevas-market.ru/product-category/tabak-dlya-kalyana/burn/",
    "https://justfreid.ru/catalog/tabak/burn/",
    "https://smokemaster.ru/shop/tabak-dlya-kalyana/black-burn/",
    "https://moredyma.su/tabak-dlya-kalyana/black-burn/",
  ]
  const brandRe = /\b(black\s*burn|blackburn|burn\s*black|\bburn\b)/i
  const strip = /^(black\s*burn|blackburn|burn\s*black|burn)\s*/i
  let fl = [
    ...addFromSevas("burn", brandRe, strip),
    ...addFromList(jfList("jf:burn"), brandRe, strip),
    ...addFromList(mdList("black-burn"), brandRe, strip),
    ...addFromList(smList("blackburn"), brandRe, strip),
  ]
  // normalize "Black After 8" style remaining
  fl = fl.map((f) => f.replace(/^Black\s+/i, "")).filter((f) => !isJunk(f))
  brands.push(...splitByLine("blackburn", fl, sources))
  setComplete("blackburn", uniq(fl).length, 70)
}

// ---- JAM ----
{
  const sources = [
    "https://sevas-market.ru/product-category/smes-dlya-kalyana/jam/",
    "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/jam/",
    "https://jammtobacco.com/jam",
  ]
  const brandRe = /\bjam\b/i
  const strip = /^jam\s*/i
  let fl = [
    ...addFromSevas("jam", brandRe, strip),
    ...addFromList(jfList("hh:jam"), brandRe, strip),
    ...addFromList(mdjf.brands["hh:jam"]?.flavorsRaw || [], brandRe, strip),
  ]
  // keep "— Flavor" cards: after strip may start with "—"
  fl = fl.map((f) => f.replace(/^[-–—]\s*/, "").trim())
  // hh names like "БМ Байкал"
  brands.push(pack("jam", null, fl, sources))
  setComplete("jam", uniq(fl).length, 40)
  newBrandIds.push("jam")
}

// ---- KRAKEN ----
{
  const sources = [
    "https://sevas-market.ru/product-category/tabak-dlya-kalyana/kraken/",
    "https://moredyma.su/tabak-dlya-kalyana/kraken/",
    "https://justfreid.ru/catalog/tabak/kraken/",
  ]
  const brandRe = /\bkraken\b/i
  const strip = /^kraken\s*/i
  const fl = [
    ...addFromSevas("kraken", brandRe, strip),
    ...addFromList(mdList("kraken"), brandRe, strip),
    ...addFromList(jfList("jf:kraken"), brandRe, strip),
  ].map((f) => f.replace(/^[-–—]\s*/, "").trim())
  brands.push(...splitByLine("kraken", fl, sources))
  setComplete("kraken", uniq(fl).length, 35)
  newBrandIds.push("kraken")
}

// ---- DOGMA ----
{
  const sources = [
    "https://sevas-market.ru/product-category/tabak-dlya-kalyana/dogma/",
    "https://moredyma.su/tabak-dlya-kalyana/dogma/",
    "https://justfreid.ru/catalog/tabak/dogma/",
  ]
  const brandRe = /\bdogma\b/i
  const strip = /^dogma(\s*100\s*%?)?\s*/i
  // keep 100% in name for line detect — strip carefully
  const fl = [
    ...addFromSevas("dogma", brandRe, /^dogma\s*/i),
    ...addFromList(mdList("dogma"), brandRe, /^dogma\s*/i),
    ...addFromList(jfList("jf:dogma"), brandRe, /^dogma\s*/i),
  ].map((f) => f.replace(/^[-–—]\s*/, "").trim())
  brands.push(...splitByLine("dogma", fl, sources))
  setComplete("dogma", uniq(fl).length, 40)
  newBrandIds.push("dogma")
}

// ---- SERBETLI ----
{
  const sources = ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/serbetli/"]
  const fl = addFromSevas("serbetli", /\bserbetli\b/i, /^serbetli\s*/i)
  brands.push(pack("serbetli", null, fl, sources))
  setComplete("serbetli", uniq(fl).length, 40)
  notes.push("Serbetli: на sevas только часть ассортимента (пагинация 1 стр.); justfreid /serbetli/ 404; moredyma slug отсутствует")
}

// ---- BLISS ----
{
  const sources = [
    "https://sevas-market.ru/product-category/tabak-dlya-kalyana/bliss/",
    "https://moredyma.su/tabak-dlya-kalyana/bliss/",
    "https://justfreid.ru/catalog/tabak/Bliss/",
  ]
  const fl = [
    ...addFromSevas("bliss", /\bbliss\b/i, /^bliss\s*/i),
    ...addFromList(mdList("bliss"), /\bbliss\b/i, /^bliss\s*/i),
    ...addFromList(jfList("jf:bliss"), /\bbliss\b/i, /^bliss\s*/i),
  ].map((f) => f.replace(/^[-–—]\s*/, "").trim())
  brands.push(pack("bliss", null, fl, sources))
  setComplete("bliss", uniq(fl).length, 25)
  newBrandIds.push("bliss")
}

// ---- FAKE ----
{
  const sources = [
    "https://sevas-market.ru/product-category/tabak-dlya-kalyana/fake/",
    "https://moredyma.su/tabak-dlya-kalyana/fake/",
    "https://justfreid.ru/catalog/tabak/fake-feyk/",
  ]
  const fl = [
    ...addFromSevas("fake", /\bfake\b/i, /^fake\s*/i),
    ...addFromList(mdList("fake"), /\bfake\b/i, /^fake\s*/i),
    ...addFromList(jfList("jf:fake-feyk"), /\bfake\b/i, /^fake\s*/i),
  ].map((f) => f.replace(/^[-–—]\s*/, "").replace(/^\d+гр?\s*/i, "").trim())
  brands.push(pack("fake", null, fl, sources))
  setComplete("fake", uniq(fl).length, 15)
  newBrandIds.push("fake")
}

// ---- JOY ----
{
  const sources = [
    "https://sevas-market.ru/product-category/tabak-dlya-kalyana/joy/",
    "https://moredyma.su/tabak-dlya-kalyana/joy-ru-10/",
    "https://justfreid.ru/catalog/tabak/joy-dzhoy/",
  ]
  const fl = [
    ...addFromSevas("joy", /\bjoy\b/i, /^joy\s*/i),
    ...addFromList(mdList("joy-ru-10"), /\bjoy\b/i, /^joy\s*/i),
    ...addFromList(jfList("jf:joy-dzhoy"), /\bjoy\b/i, /^joy\s*/i),
  ]
  brands.push(pack("joy", null, fl, sources))
  setComplete("joy", uniq(fl).length, 25)
  newBrandIds.push("joy")
}

// ---- SEBERO ----
{
  const sources = [
    "https://sevas-market.ru/product-category/tabak-dlya-kalyana/sebero/",
    "https://moredyma.su/tabak-dlya-kalyana/sebero/",
    "https://justfreid.ru/catalog/tabak/sebero/",
    "https://smokemaster.ru/shop/tabak-dlya-kalyana/",
  ]
  const fl = [
    ...addFromSevas("sebero", /\bsebero\b/i, /^sebero\s*/i),
    ...addFromList(mdList("sebero"), /\bsebero\b/i, /^sebero\s*/i),
    ...addFromList(jfList("jf:sebero"), /\bsebero\b/i, /^sebero\s*/i),
  ]
  brands.push(...splitByLine("sebero", fl, sources))
  setComplete("sebero", uniq(fl).length, 80)
}

// ---- CHABACCO ----
{
  const sources = ["https://sevas-market.ru/product-category/smes-dlya-kalyana/chabacco/"]
  const fl = addFromSevas("chabacco", /\bchabacco\b|\bchaba\b/i, /^(chabacco|chaba)\s*/i)
  brands.push(...splitByLine("chabacco", fl, sources))
  setComplete("chabacco", uniq(fl).length, 40)
}

// ---- MORPHEUS / PALITRA / SNOBLESS / TAKE ----
for (const [id, slug, high] of [
  ["morpheus", "morpheus", 12],
  ["palitra", "palitra", 25],
  ["snobless", "snobless", 18],
  ["take", "take", 18],
]) {
  const sources = [`https://sevas-market.ru/product-category/tabak-dlya-kalyana/${slug}/`]
  const re = new RegExp(id, "i")
  const fl = addFromSevas(slug, re, new RegExp("^" + id + "\\s*", "i"))
  if (id === "morpheus" || id === "palitra" || id === "snobless") {
    const md = addFromList(mdList(slug), re, new RegExp("^" + id + "\\s*", "i"))
    brands.push(pack(id, null, [...fl, ...md], sources.concat([`https://moredyma.su/tabak-dlya-kalyana/${slug}/`])))
  } else brands.push(pack(id, null, fl, sources))
  setComplete(id, brands.filter((b) => b.id === id).reduce((s, b) => s + b.flavors.length, 0), high)
  newBrandIds.push(id)
}

// ---- SMOKE ANGELS ----
{
  const sources = [
    "https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/",
    "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/",
    "https://justfreid.ru/catalog/tabak/smoke-angels/",
  ]
  const brandRe = /smoke\s*angels/i
  const strip = /^smoke\s*angels\s*/i
  let fl = [
    ...addFromList(mdList("smoke-angels"), brandRe, strip),
    ...addFromList(jfList("jf:smoke-angels"), brandRe, strip),
    ...addFromList(smList("smoke-angels"), brandRe, strip),
  ]
  // extract from quotes (PICKLE RICK)
  fl = fl.map((f) => {
    const m = f.match(/\(([^)]+)\)\s*$/)
    if (m && /^[A-Z0-9'’\s]+$/i.test(m[1].trim()) && m[1].length > 2) return m[1].trim()
    return f.replace(/^["«]\s*/, "").replace(/\s*["»]\s*$/, "")
  })
  brands.push(pack("smoke-angels", null, fl, sources))
  setComplete("smoke-angels", uniq(fl).length, 12)
}

// ---- WTO ----
{
  const sources = ["https://moredyma.su/tabak-dlya-kalyana/wto/", "https://justfreid.ru/catalog/tabak/wto/"]
  const fl = [
    ...addFromList(mdList("wto"), /\bwto\b/i, /^wto\s*/i),
    ...addFromList(jfList("jf:wto"), /\bwto\b/i, /^wto\s*/i),
  ]
  brands.push(...splitByLine("wto", fl, sources))
  setComplete("wto", uniq(fl).length, 25)
  newBrandIds.push("wto")
}

// ---- HELIX ----
{
  const sources = ["https://moredyma.su/tabak-dlya-kalyana/helix/", "https://justfreid.ru/catalog/tabak/helix/"]
  let fl = [
    ...addFromList(mdList("helix"), /\bhelix\b|хеликс/i, /^(helix|хеликс)\s*/i),
    ...addFromList(jfList("jf:helix"), /\bhelix\b/i, /^helix\s*/i),
  ].map((f) => f.replace(/^25\s*гр\s*/i, "").replace(/^[-–—]\s*/, "").trim())
  brands.push(pack("helix", null, fl, sources))
  setComplete("helix", uniq(fl).length, 14)
  newBrandIds.push("helix")
}

// ---- COBRA ----
{
  const sources = ["https://justfreid.ru/catalog/tabak/cobra/"]
  const fl = addFromList(jfList("jf:cobra"), /кобра|cobra/i, /^(x\s*)?(кобра|cobra)\s*/i)
  brands.push(pack("cobra", null, fl, sources))
  setComplete("cobra", uniq(fl).length, 15)
  newBrandIds.push("cobra")
}

// ---- AIRCRAFT ----
{
  const sources = ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"]
  const fl = addFromList(mdList("aircraft"), /aircraft|аиркрафт/i, /^(aircraft|аиркрафт)\s*/i)
  brands.push(pack("aircraft", null, fl, sources))
  setComplete("aircraft", uniq(fl).length, 8)
  newBrandIds.push("aircraft")
}

// ---- TANGIERS ----
{
  const sources = [
    "https://moredyma.su/tabak-dlya-kalyana/tangiers/",
    "https://moredyma.su/tabak-dlya-kalyana/tangiers-noir/",
    "https://justfreid.ru/catalog/tabak/tangiers/",
  ]
  const fl = [
    ...addFromList(mdList("tangiers"), /tangiers/i, /^(original\s+)?tangiers\"?\s*/i),
    ...addFromList(mdList("tangiers-noir"), /tangiers/i, /^(original\s+)?tangiers\"?\s*/i),
    ...addFromList(jfList("jf:tangiers"), /tangiers/i, /^tangiers\s*/i),
  ]
  brands.push(...splitByLine("tangiers", fl, sources))
  setComplete("tangiers", uniq(fl).length, 15)
  newBrandIds.push("tangiers")
}

// ---- AL FAKHER ----
{
  const sources = ["https://moredyma.su/tabak-dlya-kalyana/al-fakher/", "https://justfreid.ru/catalog/tabak/al-fakher/"]
  const fl = [
    ...addFromList(mdList("al-fakher"), /al\s*fakher|альфакер/i, /^(al\s*fakher|альфакер)\s*/i),
    ...addFromList(jfList("jf:al-fakher"), /al\s*fakher|альфакер/i, /^(al\s*fakher|альфакер)\s*/i),
  ]
  brands.push(pack("al-fakher", null, fl, sources))
  setComplete("al-fakher", uniq(fl).length, 10)
  newBrandIds.push("al-fakher")
}

// ---- HLGN / MOLODOST / NUR ----
{
  const sources = ["https://justfreid.ru/catalog/tabak/hlgn/"]
  const fl = addFromList(jfList("jf:hlgn"), /хлг|hlgn/i, /^(хлгn?|hlgn)\s*/i)
  brands.push(pack("hlgn", null, fl, sources))
  setComplete("hlgn", uniq(fl).length, 12)
  newBrandIds.push("hlgn")
}
{
  const sources = ["https://justfreid.ru/catalog/tabak/molodost/"]
  const fl = addFromList(jfList("jf:molodost"), /молодость/i, /^молодость\s*/i)
  brands.push(pack("molodost", null, fl, sources))
  setComplete("molodost", uniq(fl).length, 12)
  newBrandIds.push("molodost")
}
{
  const sources = [
    "https://moredyma.su/tabak-dlya-kalyana/kapsuly-nur/",
    "https://justfreid.ru/catalog/tabak/nur-nur/",
  ]
  const fl = [
    ...addFromList(mdList("kapsuly-nur"), /\bnur\b/i, /^nur\s*/i),
    ...addFromList(jfList("jf:nur-nur"), /\bnur\b/i, /^nur\s*/i),
  ].map((f) =>
    f
      .replace(/\s*капсула с табаком\s*/i, " ")
      .replace(/\s+/g, " ")
      .trim()
  )
  brands.push(pack("nur", null, fl, sources))
  setComplete("nur", uniq(fl).length, 15)
  newBrandIds.push("nur")
}

notes.push(
  "Пагинация пройдена: sevas page/N; moredyma page/N; justfreid PAGEN_1/SHOWALL; smokemaster products-per-page=144",
  "sevas brand URL: /product-category/tabak-dlya-kalyana/{slug}/ (не /brand/)",
  "4kalyans.ru — fetch failed",
  "hookah-voodoo.com — skip (не .ru)",
  "jammtobacco.com — вкусы не распарсились из HTML; jam подтверждён sevas + hookahhouse.ru",
  "Не найдены отдельные RU brand pages с товарами: MattPear, Iskra, Funel, Dead Horse, Blackleaf, Unity, Craftium, Northern Forest, Social Smoke, Young Blood (есть Молодость)",
  "WTO/Helix/Aircraft/Cobra/Smoke Angels/Tangiers/Al Fakher — с moredyma.su и/или justfreid.ru",
  `sevas brands: ${sevas.brandSlugs.join(", ")}`,
  `moredyma brands: ${(mdjf.moredymaSlugs || []).join(", ")}`
)

const result = {
  brands,
  newBrandIds: uniq(newBrandIds),
  notes,
  completeness,
}

writeFileSync(new URL("./ru-flavors-clean.json", import.meta.url), JSON.stringify(result, null, 2), "utf8")

for (const id of Object.keys(completeness)) {
  const entries = brands.filter((b) => b.id === id)
  const n = uniq(entries.flatMap((e) => e.flavors)).length
  console.log(id, n, completeness[id], entries.map((e) => `${e.line}:${e.flavors.length}`).join(", "))
}
console.log("total entries", brands.length)
