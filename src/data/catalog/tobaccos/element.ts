import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/**
 * Element — только вкусы, явно упоминаемые в обзорах/описаниях линеек.
 * Полный SKU-каталог с официального сайта в этой итерации недоступен целиком.
 */
const SOURCE = "https://en.element-tobacco.ru/tobacco"
const SOURCE_ARTICLE =
  "https://worldhookahmarket.com/top-10-best-flavors-of-element-tobacco-which-lines-to-try/"

type Item = { name: string; line: string; tags: string[]; source?: string }

const ITEMS: Item[] = [
  { name: "Choco Loco", line: "Air", tags: ["chocolate", "dessert"] },
  { name: "Green Ginger Tea", line: "Air", tags: ["tea", "ginger", "herbal"] },
  { name: "Vanilla Sky", line: "Air", tags: ["vanilla", "dessert"] },
  { name: "Tropicana", line: "Water", tags: ["tropical", "fruity"] },
  { name: "Orbital", line: "Water", tags: ["fruity"] },
  { name: "Lemongrass", line: "Water", tags: ["lemongrass", "herbal"] },
  { name: "Cookie Monster", line: "Water", tags: ["cookie", "dessert"] },
  { name: "Watermelon Holls", line: "Water", tags: ["watermelon", "cold"] },
  { name: "Belgian Waffle", line: "Water", tags: ["dessert", "sweet"] },
  { name: "Garnet Yogurt", line: "Earth", tags: ["pomegranate", "yogurt", "dessert"] },
  { name: "Pear", line: "Earth", tags: ["pear", "fruity"] },
  { name: "Pineapple", line: "Earth", tags: ["pineapple", "fruity"] },
  { name: "Margarita", line: "Earth", tags: ["cocktail", "lime", "sour"] },
  { name: "Pomelo & Grapefruit", line: "Earth", tags: ["pomelo", "grapefruit", "citrus"] },
  { name: "Irish Cream", line: "Fire", tags: ["cream", "dessert", "coffee"] },
  { name: "Pistachio", line: "Fire", tags: ["pistachio", "dessert"] },
  { name: "Cranberries", line: "Fire", tags: ["cranberry", "berry", "sour"] },
  {
    name: "Green Soda",
    line: "Fifth Element",
    tags: ["soda", "sweet"],
    source: SOURCE_ARTICLE,
  },
]

export const ELEMENT_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "element",
    name: item.name,
    line: item.line,
    tags: item.tags,
    sourceUrl: item.source ?? SOURCE,
    strengthHint:
      item.line === "Air" ? 2 : item.line === "Water" ? 3 : item.line === "Earth" ? 4 : 5,
    status: item.line === "Fifth Element" ? "DISCONTINUED" : "ACTIVE",
    discontinued: item.line === "Fifth Element",
  })
)
