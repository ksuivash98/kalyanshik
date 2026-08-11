import fs from "fs"
import path from "path"

const catalogPath =
  "C:/Users/Ксюша/.cursor/projects/d-1-kalyanshik/agent-tools/a25e3a60-b2a8-48aa-8835-77bf83dd3595.txt"
const text = fs.readFileSync(catalogPath, "utf8")
const names = [
  ...new Set(
    [...text.matchAll(/^## (.+)$/gm)]
      .map((m) => m[1].trim())
      .filter((n) => !/results|catalog|jibiar|explore|shop/i.test(n))
  ),
]

function guessTags(name) {
  const n = name.toLowerCase()
  const tags = []
  const add = (t) => {
    if (!tags.includes(t)) tags.push(t)
  }
  if (/mint|menthe|chill|ice |ice$|absolute zero|iceberg|cold/.test(n)) add("cold")
  if (/mint|menthe/.test(n)) add("mint")
  if (/lemon/.test(n)) add("lemon")
  if (/lime/.test(n)) add("lime")
  if (/orange/.test(n)) add("orange")
  if (/grapefruit/.test(n)) add("grapefruit")
  if (/(?:^|[^a-z])grape(?:[^a-z]|$)|vin/.test(n)) add("grape")
  if (/berry|blueberry|raspberry|strawberry|blackberry/.test(n)) add("berry")
  if (/blueberry/.test(n)) add("blueberry")
  if (/raspberry/.test(n)) add("raspberry")
  if (/strawberry/.test(n)) add("strawberry")
  if (/blackberry/.test(n)) add("blackberry")
  if (/watermelon/.test(n)) add("watermelon")
  if (/(?:^|[^a-z])melon(?:[^a-z]|$)/.test(n)) add("melon")
  if (/mango/.test(n)) add("mango")
  if (/peach/.test(n)) add("peach")
  if (/pineapple|pineapples|(?<![a-z])ananas(?![a-z])/.test(n)) add("pineapple")
  if (/(?:^|[^a-z])apple(?:[^a-z]|$)/.test(n)) add("apple")
  if (/passion/.test(n)) add("passion_fruit")
  if (/cola/.test(n)) add("cola")
  if (/coffee|latte|cappuccino/.test(n)) add("coffee")
  if (/chocolate|tiramisu|wafer|biscuit|cake/.test(n)) add("dessert")
  if (/cream|plombir|milkshake|sahlep/.test(n)) add("cream")
  if (/vanilla/.test(n)) add("vanilla")
  if (/cinnamon/.test(n)) add("cinnamon")
  if (/gum|bubble/.test(n)) add("sweet")
  if (/mojito/.test(n)) add("mojito")
  if (/tea|chai/.test(n)) add("tea")
  if (/guava/.test(n)) add("guava")
  if (/pear/.test(n)) add("pear")
  if (/banana/.test(n)) add("banana")
  if (/tangerine/.test(n)) add("tangerine")
  if (/lychee/.test(n)) add("lychee")
  if (/energy|power drink|voltage/.test(n)) add("energy_drink")
  if (tags.length === 0) add("fruity")
  return tags
}

const items = names
  .map((name) => {
    const tags = guessTags(name)
    const tagsLit = JSON.stringify(tags)
    return `  { name: ${JSON.stringify(name)}, tags: ${tagsLit} },`
  })
  .join("\n")

const file = `import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Jibiar — official US catalog (jibiartobacco.us/catalog), ${names.length} named SKUs. */
const SOURCE = "https://www.jibiartobacco.us/catalog/"

type Item = { name: string; tags: string[] }

const ITEMS: Item[] = [
${items}
]

export const JIBIAR_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "jibiar",
    name: item.name,
    line: "Classic",
    tags: item.tags,
    sourceUrl: SOURCE,
    strengthHint: 2,
  })
)
`

fs.writeFileSync(path.join("src/data/catalog/tobaccos/jibiar.ts"), file)
console.log("Wrote jibiar.ts with", names.length, "flavors")
