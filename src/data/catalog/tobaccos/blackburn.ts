import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** BlackBurn — подтверждено витриной специализированного магазина + официальный сайт бренда. */
const SOURCE =
  "https://vape-optom.ru/collection/tabak-blackburn/product/blackburn-25gr"
const SOURCE_OFFICIAL = "https://en.blckburn.com/"

type Item = { name: string; tags: string[]; line?: string }

const ITEMS: Item[] = [
  { name: "Iceberg", tags: ["cold", "mint"] },
  { name: "Bananini", tags: ["banana", "sweet"] },
  { name: "Chupa Graper", tags: ["grape", "sweet"] },
  { name: "Blueberry", tags: ["blueberry", "berry"] },
  { name: "Grapefruit", tags: ["grapefruit", "citrus", "sour"] },
  { name: "Pear", tags: ["pear", "lemonade"] },
  { name: "PeachBerry", tags: ["peach", "strawberry", "berry"] },
  { name: "Cherry Shock", tags: ["cherry", "sour"], line: "Shock" },
  { name: "Raspberry Shock", tags: ["raspberry", "sour"], line: "Shock" },
  { name: "Currant Shock", tags: ["currant", "sour"], line: "Shock" },
  { name: "Apple Shock", tags: ["apple", "sour"], line: "Shock" },
  { name: "Ananas Shock", tags: ["pineapple", "sour"], line: "Shock" },
  { name: "Blackcola", tags: ["cola", "soda", "sweet"] },
  { name: "Red Orange", tags: ["orange", "citrus"] },
  { name: "Raspberries", tags: ["raspberry", "berry"] },
  { name: "Rising Star", tags: ["mango", "passion_fruit", "tropical"] },
  { name: "Etalon Melon", tags: ["melon", "honey", "sweet"] },
  { name: "Almond Pear", tags: ["pear", "dessert"] },
  { name: "Watermelon", tags: ["watermelon", "sweet"] },
  { name: "Pineapple", tags: ["pineapple", "fruity"] },
  { name: "Something Tropical", tags: ["tropical", "fruity"] },
  { name: "Cane Mint", tags: ["mint", "sweet", "cold"] },
  { name: "Lemon Shock", tags: ["lemon", "sour"], line: "Shock" },
  { name: "Skittles", tags: ["fruity", "sweet"] },
  { name: "Sundaysun", tags: ["citrus", "orange"] },
  { name: "Cherry Garden", tags: ["cherry", "berry"] },
  { name: "Nutella", tags: ["chocolate", "dessert"] },
  { name: "Berry lemonade", tags: ["berry", "lemonade"] },
  { name: "Something Berry", tags: ["wildberry", "berry"] },
  { name: "Ice Baby", tags: ["berry", "grapefruit", "cold"] },
  { name: "Haribon", tags: ["cola", "sweet"] },
  { name: "Melon Halls", tags: ["melon", "cold", "eucalyptus"] },
  { name: "Strawberry Jam", tags: ["strawberry", "sweet"] },
  { name: "Peach Killer", tags: ["peach", "fruity"] },
]

export const BLACKBURN_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "blackburn",
    name: item.name,
    line: item.line ?? "Classic",
    tags: item.tags,
    sourceUrl: item.line === "Shock" ? SOURCE_OFFICIAL : SOURCE,
    strengthHint: 3,
  })
)
