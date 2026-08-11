import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Starline — HookahLand UAE retailer listing (250g SKUs). */
const SOURCE =
  "https://hookahland.ae/Shop?Filters.BrandSlug=starline-tobacco-blonde-leaf-shisha"

type Item = { name: string; tags: string[] }

const ITEMS: Item[] = [
  { name: "Wild Strawberry Cream", tags: ["strawberry", "cream"] },
  { name: "Wild Strawberry", tags: ["strawberry"] },
  { name: "Vanilla Cola", tags: ["vanilla", "cola"] },
  { name: "Vanilla", tags: ["vanilla"] },
  { name: "Tropic Smoothie", tags: ["tropical", "fruity"] },
  { name: "Strawberry Soda", tags: ["strawberry", "soda"] },
  { name: "Strawberry Mojito", tags: ["strawberry", "mojito", "mint"] },
  { name: "Strawberry Millefeuille", tags: ["strawberry", "cream", "dessert"] },
  { name: "Strawberry Candy", tags: ["strawberry", "sweet"] },
  { name: "Sour Jelly", tags: ["sour", "sweet"] },
  { name: "Raspberry Waffle", tags: ["raspberry", "dessert"] },
  { name: "Raspberry", tags: ["raspberry"] },
  { name: "Pineapple", tags: ["pineapple"] },
  { name: "Pina Colada", tags: ["pineapple", "coconut", "cocktail"] },
  { name: "Pear", tags: ["pear"] },
  { name: "Peach", tags: ["peach"] },
  { name: "Passion Fruit", tags: ["passion_fruit"] },
  { name: "Papaya", tags: ["tropical"] },
  { name: "Orangina", tags: ["orange", "soda"] },
  { name: "Mint Lozenge", tags: ["mint", "cold"] },
  { name: "Meringue Roulade", tags: ["dessert", "cream"] },
  { name: "Lime Sorbet", tags: ["lime", "cold", "dessert"] },
  { name: "Lemon 2.0", tags: ["lemon", "citrus"] },
  { name: "Green Fresh", tags: ["mint", "herbal"] },
  { name: "Grape Soda", tags: ["grape", "soda"] },
  { name: "Grape Jelly", tags: ["grape", "sweet"] },
  { name: "Exotic Fruits", tags: ["tropical", "fruity"] },
  { name: "Energy Drink", tags: ["energy_drink"] },
  { name: "Cuba Libre", tags: ["cola", "lime", "cocktail"] },
  { name: "Coconut Milk", tags: ["coconut", "cream"] },
  { name: "Butter Cream", tags: ["cream", "dessert"] },
  { name: "Blueberry Crumble", tags: ["blueberry", "cake", "dessert"] },
  { name: "Blackcurrant Sorbet", tags: ["currant", "cold", "dessert"] },
  { name: "Berry Sorbet", tags: ["berry", "cold", "dessert"] },
  { name: "Berry Popcorn", tags: ["berry", "sweet"] },
  { name: "Belgian Waffles", tags: ["dessert", "sweet"] },
  { name: "Banana Marshmallow", tags: ["banana", "marshmallow", "dessert"] },
]

export const STARLINE_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "starline",
    name: item.name,
    line: "Classic",
    tags: item.tags,
    sourceUrl: SOURCE,
    strengthHint: 2,
  })
)
