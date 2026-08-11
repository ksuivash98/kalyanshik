import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/**
 * Zomo Classic / Strong / World Experience — confirmed names from UtopiaClouds + SmokeDex listings.
 * Full SmokeDex catalog claims 131 SKUs; only named/confirmed items are imported here.
 */
const SOURCE_CLASSIC = "https://utopiaclouds.com/products/zomo"
const SOURCE_DEX = "https://smokedex.info/en/shisha/brand/zomo"

type Item = { name: string; line: string; tags: string[]; source?: string }

const ITEMS: Item[] = [
  { name: "Acai Cream", line: "Classic", tags: ["berry", "cream"] },
  { name: "Bahamas Twist", line: "Classic", tags: ["tropical"] },
  { name: "Copacabana Beach", line: "Classic", tags: ["tropical", "fruity"] },
  { name: "Dragon Wall", line: "World Experience", tags: ["peach"], source: SOURCE_DEX },
  { name: "Guava", line: "Classic", tags: ["guava"] },
  { name: "Havana Style", line: "Classic", tags: ["cocktail"] },
  { name: "Mango", line: "Classic", tags: ["mango"] },
  { name: "Mystery of Bali", line: "Classic", tags: ["tropical", "spice"] },
  { name: "Secret of Babylon", line: "World Experience", tags: ["melon", "watermelon", "cold"], source: SOURCE_DEX },
  { name: "Spiced Chai", line: "Classic", tags: ["tea", "cinnamon", "spice"] },
  { name: "Splash Fruits", line: "Splash", tags: ["fruity"] },
  { name: "Strawberry", line: "Classic", tags: ["strawberry"] },
  { name: "Strawberry Cream", line: "Classic", tags: ["strawberry", "cream"] },
  { name: "Strong Red", line: "Strong", tags: ["berry"] },
  { name: "Two Apple", line: "Classic", tags: ["apple", "anise"] },
  { name: "Watermelon", line: "Classic", tags: ["watermelon"] },
  { name: "Watermelon Mix", line: "Classic", tags: ["watermelon", "fruity"] },
  { name: "AmazeMint", line: "Classic", tags: ["mint", "cold"] },
  { name: "Banana Cinnamon", line: "Classic", tags: ["banana", "cinnamon"] },
  { name: "Blueberry", line: "Classic", tags: ["blueberry"] },
  { name: "Blueberry Mint", line: "Classic", tags: ["blueberry", "mint"] },
  { name: "Cancun Sunrise", line: "Classic", tags: ["tropical", "citrus"] },
  { name: "Grape", line: "Classic", tags: ["grape"] },
  { name: "Grape Mint", line: "Classic", tags: ["grape", "mint"] },
  { name: "Ibiza Sensation", line: "Classic", tags: ["fruity"] },
  { name: "Kiwi", line: "Classic", tags: ["kiwi"] },
  { name: "Lemon", line: "Classic", tags: ["lemon"] },
  { name: "Lemon Mint", line: "Classic", tags: ["lemon", "mint"] },
  { name: "Miami Nights", line: "World Experience", tags: ["mango", "orange", "mint"], source: SOURCE_DEX },
  { name: "Mint", line: "Classic", tags: ["mint"] },
  { name: "Orange", line: "Classic", tags: ["orange"] },
  { name: "Orange Mint", line: "Classic", tags: ["orange", "mint"] },
  { name: "Passion Fruit", line: "Classic", tags: ["passion_fruit"] },
  { name: "Passion Fruit Mint", line: "Classic", tags: ["passion_fruit", "mint"] },
  { name: "Pink Lemon Drop", line: "Classic", tags: ["lemon", "sweet"] },
  { name: "Spell of Love", line: "Classic", tags: ["fruity", "sweet"] },
  { name: "Strong Mint", line: "Strong", tags: ["mint", "cold"], source: SOURCE_DEX },
  { name: "Swiss Apls", line: "Classic", tags: ["apple"] },
  { name: "Water Lemon", line: "Classic", tags: ["watermelon", "lemon"] },
  { name: "White Choco Berry", line: "Classic", tags: ["chocolate", "berry", "cream"] },
  { name: "Strong Mango", line: "Strong", tags: ["mango"], source: SOURCE_DEX },
  { name: "Blu Mnt", line: "Classic", tags: ["blueberry", "mint"], source: SOURCE_DEX },
  { name: "Buzios Dreams", line: "Flavors of Brazil", tags: ["banana", "vanilla", "fruity"], source: SOURCE_DEX },
  { name: "Bana Split", line: "Classic", tags: ["banana", "vanilla"], source: SOURCE_DEX },
  { name: "Cactuz Jack", line: "Classic", tags: ["tropical"], source: SOURCE_DEX },
  { name: "Cinnamon Gum", line: "Classic", tags: ["cinnamon", "sweet"], source: SOURCE_DEX },
  { name: "Strong Blu", line: "Strong", tags: ["blueberry", "mint"], source: SOURCE_DEX },
  { name: "Strong Orng", line: "Strong", tags: ["orange", "mint"], source: SOURCE_DEX },
  { name: "Splash Joy", line: "Splash", tags: ["cherry", "strawberry", "mint"], source: SOURCE_DEX },
  { name: "Magic Floripa", line: "Flavors of Brazil", tags: ["mango", "guava", "orange"], source: SOURCE_DEX },
  { name: "Wild Africa", line: "World Experience", tags: ["mint", "lime", "passion_fruit"], source: SOURCE_DEX },
  { name: "Strawkify", line: "Classic", tags: ["kiwi", "strawberry"], source: SOURCE_DEX },
  { name: "Strong Passion", line: "Strong", tags: ["passion_fruit", "mint"], source: SOURCE_DEX },
]

export const ZOMO_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "zomo",
    name: item.name,
    line: item.line,
    tags: item.tags,
    sourceUrl: item.source ?? SOURCE_CLASSIC,
    strengthHint: item.line === "Strong" ? 4 : 2,
  })
)
