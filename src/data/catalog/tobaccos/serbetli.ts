import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Serbetli — retailer catalog B2Hookah (confirmed SKU names). */
const SOURCE = "https://b2hookah.com/products/serbetli-shisha-tobacco"

type Item = { name: string; tags: string[]; line?: string }

const ITEMS: Item[] = [
  { name: "Baked Fruit", tags: ["fruity", "dessert"] },
  { name: "Banana Milkshake", tags: ["banana", "cream", "dessert"] },
  { name: "Blue Curacao", tags: ["cocktail", "citrus"] },
  { name: "Bronx 66", tags: ["fruity", "sweet"] },
  { name: "Bubble Fruit", tags: ["fruity", "sweet"] },
  { name: "Caribbean", tags: ["tropical", "cocktail"] },
  { name: "Cinnamon Gum", tags: ["cinnamon", "sweet"] },
  { name: "Coconut Lemon", tags: ["coconut", "lemon"] },
  { name: "Dark Sweet", tags: ["sweet", "dessert"] },
  { name: "Earl Grey", tags: ["tea", "bergamot"] },
  { name: "Fresh Pineapple", tags: ["pineapple", "tropical"] },
  { name: "Grape", tags: ["grape"] },
  { name: "Green Mix", tags: ["herbal", "fruity"] },
  { name: "Gum Fusion Melon", tags: ["melon", "sweet"] },
  { name: "Gum Mint", tags: ["mint", "sweet"] },
  { name: "Ice", tags: ["cold", "mint"] },
  { name: "Ice Acai Raspberry", tags: ["raspberry", "berry", "cold"] },
  { name: "Ice Banana Strawberry", tags: ["banana", "strawberry", "cold"] },
  { name: "Ice Bodrum Tangerine", tags: ["tangerine", "cold"] },
  { name: "Ice Blueberry", tags: ["blueberry", "cold"] },
  { name: "Ice Bom Bom", tags: ["sweet", "cold"] },
  { name: "Ice Citrus Mango", tags: ["citrus", "mango", "cold"] },
  { name: "Ice Grapefruit", tags: ["grapefruit", "cold"] },
  { name: "Ice Green Apple", tags: ["apple", "cold"] },
  { name: "Ice Kiwi", tags: ["kiwi", "cold"] },
  { name: "Ice Lemon Mint", tags: ["lemon", "mint", "cold"] },
  { name: "Ice Mulberry", tags: ["berry", "cold"] },
  { name: "Ice Orange", tags: ["orange", "cold"] },
  { name: "Ice Passion Fruit", tags: ["passion_fruit", "cold"] },
  { name: "Ice Pear", tags: ["pear", "cold"] },
  { name: "Ice Strawberry Melon", tags: ["strawberry", "melon", "cold"] },
  { name: "Ice Watermelon", tags: ["watermelon", "cold"] },
  { name: "Indian Kulfi Ice Cream", tags: ["ice_cream", "dessert", "cream"] },
  { name: "Istanbul Nights", tags: ["sweet", "spice"] },
  { name: "Lemon", tags: ["lemon", "citrus"] },
  { name: "Lemon Berry", tags: ["lemon", "berry"] },
  { name: "Lemon Cake", tags: ["lemon", "cake", "dessert"] },
  { name: "Lime Cactus", tags: ["lime", "fruity"] },
  { name: "Lime Lychee Blueberry", tags: ["lime", "lychee", "blueberry"] },
  { name: "Lime Spice Peach", tags: ["lime", "peach", "spice"] },
  { name: "Lime Tea", tags: ["lime", "tea"] },
  { name: "Macaron", tags: ["dessert", "sweet"] },
  { name: "Marbella", tags: ["cherry", "citrus"] },
  { name: "Mint", tags: ["mint", "cold"] },
  { name: "Orange", tags: ["orange", "citrus"] },
  { name: "Orange Mint", tags: ["orange", "mint"] },
  { name: "Peach", tags: ["peach"] },
  { name: "Pistachio Ice Cream", tags: ["pistachio", "ice_cream", "dessert"] },
  { name: "Raspberry", tags: ["raspberry"] },
  { name: "Soft Mint", tags: ["mint"] },
  { name: "Strawberry Milkshake", tags: ["strawberry", "cream", "dessert"] },
  { name: "Toasted Berry", tags: ["berry", "dessert"] },
  { name: "Two Apple", tags: ["apple", "anise"] },
  { name: "Watermelon", tags: ["watermelon"] },
  { name: "Watermelon Mint", tags: ["watermelon", "mint"] },
  { name: "Melon Fusion Gum", tags: ["melon", "sweet"] },
]

export const SERBETLI_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "serbetli",
    name: item.name,
    line: item.line ?? "Classic",
    tags: item.tags,
    sourceUrl: SOURCE,
    strengthHint: 2,
  })
)
