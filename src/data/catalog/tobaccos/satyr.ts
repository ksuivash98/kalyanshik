import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Satyr — World Hookah Market Aroma/Brilliant listings. */
const SOURCE =
  "https://worldhookahmarket.com/product-category/tobacco/russian-tobacco/satyr-tobacco/"

type Item = { name: string; line: string; tags: string[] }

const ITEMS: Item[] = [
  { name: "1915", line: "Aroma", tags: ["floral", "herbal"] },
  { name: "Good Lemon", line: "Aroma", tags: ["lemon", "citrus"] },
  { name: "Griffin", line: "Aroma", tags: ["fruity"] },
  { name: "Hawaii", line: "Aroma", tags: ["tropical"] },
  { name: "Ice Tangerine", line: "Aroma", tags: ["tangerine", "cold"] },
  { name: "Kiss-Kiss", line: "Aroma", tags: ["sweet", "fruity"] },
  { name: "Lastochka", line: "Aroma", tags: ["fruity"] },
  { name: "Lotus", line: "Aroma", tags: ["floral", "herbal"] },
  { name: "Mangosteen", line: "Aroma", tags: ["tropical", "fruity"] },
  { name: "Margarita", line: "Aroma", tags: ["cocktail", "lime"] },
  { name: "Milk Shot", line: "Aroma", tags: ["cream", "dessert"] },
  { name: "Prick Apple", line: "Aroma", tags: ["apple", "sour"] },
  { name: "Pussy Fruit", line: "Aroma", tags: ["fruity"] },
  { name: "Queen of Persia", line: "Aroma", tags: ["spice", "fruity"] },
  { name: "Sakura Expert", line: "Aroma", tags: ["floral", "cherry"] },
  { name: "Skazka", line: "Aroma", tags: ["dessert", "sweet"] },
  { name: "Tangerine", line: "Aroma", tags: ["tangerine", "citrus"] },
  { name: "Tyanka", line: "Aroma", tags: ["fruity"] },
  { name: "Worms", line: "Aroma", tags: ["sweet", "fruity"] },
  { name: "Cassis", line: "Aroma", tags: ["currant", "berry"] },
  { name: "Basis Moscow", line: "Brilliant", tags: ["spicy"] },
  { name: "Cubano Viso", line: "Brilliant", tags: ["spicy"] },
  { name: "Passion Fruit", line: "Old School", tags: ["passion_fruit"] },
  { name: "Grapefruit", line: "Old School", tags: ["grapefruit", "citrus"] },
  { name: "Watermelon", line: "Old School", tags: ["watermelon"] },
  { name: "Anise", line: "Old School", tags: ["anise", "spice"] },
  { name: "Peach Ice Tea", line: "Old School", tags: ["peach", "tea"] },
  { name: "Bacon", line: "Old School", tags: ["spice"] },
  { name: "Waffle", line: "Old School", tags: ["dessert", "sweet"] },
  { name: "Granola", line: "Old School", tags: ["dessert"] },
]

export const SATYR_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "satyr",
    name: item.name,
    line: item.line,
    tags: item.tags.filter((t) => t !== "floral"),
    sourceUrl: SOURCE,
    strengthHint: item.line === "Brilliant" ? 5 : 4,
  })
)
