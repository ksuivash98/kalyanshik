import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** JAM — official line page jammtobacco.com/jam (+ retailer supplements). */
const SOURCE = "https://jammtobacco.com/jam"
const SOURCE_RETAILER = "https://hookah-voodoo.com/vendor/jam-1"

type Item = { name: string; tags: string[]; aliases?: string[]; source?: string }

const ITEMS: Item[] = [
  { name: "Blueberry Energy Drink", tags: ["blueberry", "energy_drink"] },
  { name: "Grape", tags: ["grape"] },
  { name: "Strawberry Jam", tags: ["strawberry", "sweet"] },
  { name: "Mango and Passion Fruit", tags: ["mango", "passion_fruit", "tropical"] },
  { name: "Mango Peach", tags: ["mango", "peach"] },
  { name: "Lemon Mint", tags: ["lemon", "mint"] },
  { name: "Grapefruit with Raspberry Juice", tags: ["grapefruit", "raspberry"] },
  { name: "Mango with Ice", tags: ["mango", "cold"] },
  { name: "Fruity Bubblegum", tags: ["fruity", "sweet"] },
  { name: "Refreshing Mojito", tags: ["mojito", "mint", "lime"] },
  { name: "Cherry Cola", tags: ["cherry", "cola"] },
  { name: "Double Apple", tags: ["apple", "anise"] },
  { name: "Ripe Passion Fruit", tags: ["passion_fruit"] },
  { name: "Caramel Popcorn", tags: ["caramel", "dessert"] },
  { name: "Watermelon Rondo", tags: ["watermelon", "mint"] },
  { name: "Apple with Mint", tags: ["apple", "mint"] },
  { name: "Raspberry", tags: ["raspberry"] },
  { name: "Lemon Lime", tags: ["lemon", "lime"] },
  { name: "Berry Hols", tags: ["berry", "cold"] },
  { name: "Tutti-Frutti", tags: ["fruity", "citrus"] },
  { name: "Cherry with Ice", tags: ["cherry", "cold"] },
  { name: "Watermelon and Melon Lemonade", tags: ["watermelon", "melon", "lemonade"] },
  { name: "Hazelnut", tags: ["dessert"] },
  { name: "Mauntin Du", tags: ["soda", "citrus"], aliases: ["Mountain Dew"] },
  { name: "Peppermint", tags: ["mint", "cold"] },
  { name: "Pineapple Candies", tags: ["pineapple", "sweet"] },
  { name: "Iceberg", tags: ["mint", "cold"] },
  { name: "Red Orange", tags: ["orange", "citrus"] },
  { name: "Nut Ice Cream", tags: ["ice_cream", "cream", "dessert"] },
  { name: "Sweet Kiwi", tags: ["kiwi", "sweet"] },
  // retailer-confirmed extras
  { name: "Juicy Mango", tags: ["mango"], source: SOURCE_RETAILER },
  { name: "Blackberry", tags: ["blackberry"], source: SOURCE_RETAILER },
  { name: "Blueberry with Mint", tags: ["blueberry", "mint"], source: SOURCE_RETAILER },
  { name: "Cuba Libre", tags: ["cola", "lime", "cocktail"], source: SOURCE_RETAILER },
  { name: "Mors", tags: ["berry"], source: SOURCE_RETAILER },
  { name: "Sweet Barberry", tags: ["barberry", "sweet"], source: SOURCE_RETAILER },
  { name: "Banana Cocktail", tags: ["banana", "cocktail"], source: SOURCE_RETAILER },
  { name: "Strawberry Lemonade with Basil", tags: ["strawberry", "lemonade", "basil"], source: SOURCE_RETAILER },
]

export const JAM_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "jam",
    name: item.name,
    line: "Classic",
    tags: item.tags,
    aliases: item.aliases,
    sourceUrl: item.source ?? SOURCE,
    strengthHint: 1,
  })
)
