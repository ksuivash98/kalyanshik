import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Adalya — named flavors from specialty retailers / brand US pages. */
const SOURCE = "https://hellohookahexpress.com/adalya-premium-flavors-250g/"
const SOURCE_US = "https://adalya.us/product/love66/"

type Item = { name: string; tags: string[]; source?: string }

const ITEMS: Item[] = [
  { name: "Love 66", tags: ["passion_fruit", "watermelon", "melon", "mint"], source: SOURCE_US },
  { name: "Lady Killer", tags: ["mango", "melon", "berry", "mint"] },
  { name: "Angel Lips", tags: ["blackberry", "watermelon", "mint"] },
  { name: "Baku Nights", tags: ["fruity", "mint"] },
  { name: "Berlin Nights", tags: ["peach", "mint"] },
  { name: "Blue Dragon", tags: ["fruity", "mint", "cold"] },
  { name: "Blueberrys", tags: ["blueberry", "mint"] },
  { name: "Blue Orange", tags: ["blueberry", "orange"] },
  { name: "Blue MLN", tags: ["melon", "blueberry", "mint"] },
  { name: "Exagelado", tags: ["grape", "lemon", "mint"] },
  { name: "Hawaii", tags: ["mango", "pineapple", "mint"] },
  { name: "JK777", tags: ["grape", "mint", "berry"] },
  { name: "Madagascar Nights", tags: ["lychee", "mint"] },
  { name: "MNG TNGS", tags: ["mango", "passion_fruit", "mint"] },
  { name: "Mi Amor", tags: ["pineapple", "banana", "mint"] },
  { name: "Mint Watermelon", tags: ["watermelon", "mint", "cold"] },
  { name: "Havana", tags: ["strawberry", "orange"] },
  { name: "English Lord", tags: ["mango", "peach", "raspberry", "mint"] },
  { name: "Sky Fall", tags: ["melon", "peach", "watermelon"] },
  { name: "Delons", tags: ["melon"] },
  { name: "Love66", tags: ["passion_fruit", "watermelon", "melon", "mint"], source: SOURCE_US },
]

export const ADALYA_TOBACCOS: TobaccoSeed[] = ITEMS.filter(
  (item, index, arr) =>
    // keep Love 66, drop near-duplicate Love66 spelling as separate only if different - actually merge: skip Love66
    item.name !== "Love66"
).map((item) =>
  makeTobacco({
    brandId: "adalya",
    name: item.name,
    line: "Classic",
    tags: item.tags,
    sourceUrl: item.source ?? SOURCE,
    strengthHint: 2,
  })
)
