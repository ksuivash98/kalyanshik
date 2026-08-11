import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Bonche — World Hookah Market 30g listings (pages 1–2). */
const SOURCE =
  "https://worldhookahmarket.com/product-category/tobacco/russian-tobacco/bonche/bonch-30gr/"

type Item = { name: string; tags: string[]; line?: string; status?: "ACTIVE" | "LIMITED" }

const ITEMS: Item[] = [
  { name: "Bartender – Clover Club", tags: ["cocktail", "berry"], line: "Bartender" },
  { name: "Bartender – Gimlet", tags: ["cocktail", "lime"], line: "Bartender" },
  { name: "Bartender – Mint Julep", tags: ["cocktail", "mint"], line: "Bartender" },
  { name: "Bartender – Singapore Sling", tags: ["cocktail", "fruity"], line: "Bartender" },
  { name: "Bergamot", tags: ["bergamot", "citrus"] },
  { name: "Black Currant", tags: ["currant", "berry"] },
  { name: "Blueberry", tags: ["blueberry"] },
  { name: "Brownie", tags: ["chocolate", "dessert"] },
  { name: "Caramel", tags: ["caramel", "dessert"] },
  { name: "Coconut", tags: ["coconut"] },
  { name: "Cognac", tags: ["cocktail", "spice"] },
  { name: "Grapefruit", tags: ["grapefruit"] },
  { name: "Kiwi", tags: ["kiwi"] },
  { name: "Orange", tags: ["orange"] },
  { name: "Peanut", tags: ["dessert"] },
  { name: "Pear", tags: ["pear"] },
  { name: "Prunes", tags: ["plum", "fruity"] },
  { name: "Red Wine", tags: ["cocktail", "grape"] },
  { name: "Sesame", tags: ["dessert", "spice"] },
  { name: "Wild Strawberry", tags: ["strawberry"] },
  { name: "Barberry", tags: ["barberry", "berry"] },
  { name: "Base", tags: ["spice"] },
  { name: "Basil", tags: ["basil", "herbal"] },
  { name: "Cherry", tags: ["cherry"] },
  { name: "Clove", tags: ["spice"] },
  { name: "Cookie", tags: ["cookie", "dessert"] },
  { name: "Dark Chocolate", tags: ["chocolate", "dessert"] },
  { name: "Ginger", tags: ["ginger", "spice"] },
  { name: "Lavender", tags: ["herbal"] },
  { name: "Lemon", tags: ["lemon"] },
  { name: "Lemongrass", tags: ["lemongrass", "herbal"] },
  { name: "Lychee", tags: ["lychee"] },
  { name: "Mango", tags: ["mango"] },
  { name: "Marzipan", tags: ["dessert", "sweet"] },
  { name: "Melissa", tags: ["herbal"] },
  { name: "Olive", tags: ["herbal"] },
  { name: "Pineapple", tags: ["pineapple"] },
  { name: "Pomegranate", tags: ["pomegranate"] },
  { name: "Raspberry", tags: ["raspberry"] },
  { name: "Rum", tags: ["cocktail"] },
  { name: "Salami", tags: ["spice"] },
  { name: "Strawberry", tags: ["strawberry"] },
  { name: "Vanilla", tags: ["vanilla"] },
  { name: "Whiskey", tags: ["cocktail"] },
  { name: "Coffee", tags: ["coffee"] },
  { name: "Limited Edition – Desvall", tags: ["fruity"], line: "Limited", status: "LIMITED" },
  { name: "Cheesecake", tags: ["cheesecake", "dessert"] },
  { name: "Honey", tags: ["honey", "sweet"] },
  { name: "Passion Fruit", tags: ["passion_fruit"] },
  { name: "Sweet Corn", tags: ["sweet", "cream"] },
]

export const BONCHE_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "bonche",
    name: item.name,
    line: item.line ?? "Classic",
    tags: item.tags,
    sourceUrl: SOURCE,
    strengthHint: 5,
    status: item.status ?? "ACTIVE",
    limitedEdition: item.status === "LIMITED",
  })
)
