/**
 * Final MattPear seed from cleaned RU sources; rewrite aircraft lightly.
 */
import fs from "fs"
import path from "path"

const raw = JSON.parse(fs.readFileSync("scripts/ru-mattpear-final.json", "utf8"))

function normalizeKey(s) {
  return String(s)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/['’‘‛`´"]/g, "")
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

function guessTags(name) {
  const n = String(name).toLowerCase()
  const tags = []
  const add = (t) => {
    if (!tags.includes(t)) tags.push(t)
  }
  if (/mint|мята|холод|ice |cool|freeze|breeze/.test(n)) add("cold")
  if (/lemon|лимон|laim|lime/.test(n)) add("lemon")
  if (/berry|ягод|yagoda|cherry|grape|strawberry/.test(n)) add("berry")
  if (/mango|манго|man go/.test(n)) add("mango")
  if (/apple|granny/.test(n)) add("apple")
  if (/melon|pumpkin|tikwa|kee wee|kiwi/.test(n)) add("melon")
  if (/tea|чай/.test(n)) add("tea")
  if (/chocco|waffle|wafl|cake|rum babe|banoffee|root beer|honey/.test(n)) add("dessert")
  if (/citrus|cooler|tangerine|green lemon/.test(n)) add("citrus")
  if (/ginger|kretek|cinn/.test(n)) add("spice")
  if (/guava|mara|tropic|apricot/.test(n)) add("tropical")
  if (tags.length === 0) add("fruity")
  return tags
}

function esc(s) {
  return JSON.stringify(s)
}

const map = new Map()
for (const it of raw) {
  let name = String(it.name).replace(/['"]+$/g, "").replace(/^['"]+/g, "").trim()
  name = name.replace(/\s+/g, " ")
  if (!name || /^(вкусы|крепость)$/i.test(name)) continue
  if (/['"]/.test(name)) continue
  // canonicalize some aliases within same line
  const canon = name
    .replace(/^Cinnaboom$/i, "Cinna Boom")
    .replace(/^Ginger meeting$/i, "Ginger Meeting")
    .replace(/^Bottle rise$/i, "Bottle Rise")
    .replace(/^POP Suncake$/i, "Sun Cake")
    .replace(/^Suncake$/i, "Sun Cake")
    .replace(/^Hallzzz$/i, "Hallzzz")
  const key = `${it.line}::${normalizeKey(canon)}`
  const prev = map.get(key)
  if (prev) {
    prev.sources = [...new Set([...prev.sources, ...it.sources])]
  } else {
    map.set(key, {
      name: canon,
      line: it.line,
      sources: [...it.sources],
      status: it.status || "UNKNOWN",
    })
  }
}

const items = [...map.values()].sort(
  (a, b) => a.line.localeCompare(b.line) || a.name.localeCompare(b.name, "en")
)

const body = items
  .map((it) => {
    const status = it.status && it.status !== "ACTIVE" ? `\n    status: ${esc(it.status)},` : ""
    return `  {\n    name: ${esc(it.name)},\n    line: ${esc(it.line)},\n    tags: ${esc(guessTags(it.name))},\n    sources: [${it.sources.map(esc).join(", ")}],\n    strengthHint: 4,${status}\n  },`
  })
  .join("\n")

const file = `import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). */
const ITEMS = [
${body}
] as const

export const MATTPEAR_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "mattpear",
    name: item.name,
    line: item.line,
    tags: [...item.tags],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
    status: ("status" in item
      ? (item as { status?: TobaccoStatus }).status
      : "ACTIVE") as TobaccoStatus | undefined,
  })
)
`

fs.writeFileSync(path.join("src/data/catalog/tobaccos/mattpear.ts"), file)
console.log("MattPear final:", items.length)
console.log(items.map((x) => x.line + " | " + x.name).join("\n"))

// Aircraft rewrite with clean verified RU list
const aircraft = [
  {
    name: "Бленд огневой сушки",
    line: "Classic",
    sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
    status: "ACTIVE",
  },
  {
    name: "Ceylon Chips (Кокосовые чипсы)",
    line: "Classic",
    sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
    status: "ACTIVE",
  },
  {
    name: "French Cider (Французский сидр)",
    line: "Classic",
    sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
    status: "ACTIVE",
  },
  {
    name: "Polish Rum Biscuit (Польский ромовый бисквит)",
    line: "Classic",
    sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
    status: "ACTIVE",
  },
  {
    name: "Strawberries (Клубника)",
    line: "Classic",
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/aircraft_33313.html"],
    status: "DISCONTINUED",
  },
  {
    name: "British Banoffee (Британский Баноффи)",
    line: "Classic",
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"],
    status: "DISCONTINUED",
  },
  {
    name: "California Cola (Калифорнийская кола)",
    line: "Classic",
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"],
    status: "DISCONTINUED",
  },
  {
    name: "Lombardy Nut (Ломбардский орех)",
    line: "Classic",
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"],
    status: "DISCONTINUED",
  },
  {
    name: "Raffaelo (Рафаэло)",
    line: "Classic",
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"],
    status: "DISCONTINUED",
  },
]

const abody = aircraft
  .map((it) => {
    const status = it.status !== "ACTIVE" ? `\n    status: ${esc(it.status)},` : ""
    return `  {\n    name: ${esc(it.name)},\n    line: ${esc(it.line)},\n    tags: ${esc(guessTags(it.name))},\n    sources: [${it.sources.map(esc).join(", ")}],\n    strengthHint: 4,${status}\n  },`
  })
  .join("\n")

fs.writeFileSync(
  "src/data/catalog/tobaccos/aircraft.ts",
  `import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). */
const ITEMS = [
${abody}
] as const

export const AIRCRAFT_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "aircraft",
    name: item.name,
    line: item.line,
    tags: [...item.tags],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
    status: ("status" in item
      ? (item as { status?: TobaccoStatus }).status
      : "ACTIVE") as TobaccoStatus | undefined,
  })
)
`
)
console.log("Aircraft final:", aircraft.length)
