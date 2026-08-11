import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Al Fakher USA official catalog — alfakher.com/products-usa */
const SOURCE = "https://www.alfakher.com/products-usa"

type Item = { name: string; tags: string[]; line?: string }

const ITEMS: Item[] = [
  // Collaborations
  { name: "Cloud 92", tags: ["tropical", "cold"], line: "Snoop Dogg" },
  { name: "Dogg's Delight", tags: ["mango", "passion_fruit", "cold"], line: "Snoop Dogg" },
  { name: "Midnight Blues", tags: ["wildberry", "cold"], line: "Snoop Dogg" },
  { name: "Money Honey", tags: ["melon", "fruity", "cold"], line: "Snoop Dogg" },
  { name: "Tha G'z Mix", tags: ["pear", "citrus", "cold"], line: "Snoop Dogg" },
  { name: "Blueberry Caviar", tags: ["blueberry", "citrus", "mint"], line: "Cookies" },
  { name: "Citrus Zen", tags: ["orange", "mint"], line: "Cookies" },
  { name: "Lemon Icy", tags: ["lemon", "mint", "cold"], line: "Cookies" },
  { name: "Purple Sunset", tags: ["grape", "mint", "cold"], line: "Cookies" },
  { name: "Sandia", tags: ["watermelon", "cold"], line: "Cookies" },
  // Classic
  { name: "Mint", tags: ["mint", "cold"] },
  { name: "Two Apples", tags: ["apple", "anise"] },
  { name: "Gum With Mint", tags: ["mint", "cold", "sweet"] },
  { name: "Blueberry With Mint", tags: ["blueberry", "mint", "cold"] },
  { name: "Orange With Mint", tags: ["orange", "mint"] },
  { name: "Lemon With Mint", tags: ["lemon", "mint"] },
  { name: "Watermelon With Mint", tags: ["watermelon", "mint"] },
  { name: "Blueberry", tags: ["blueberry", "berry"] },
  { name: "Two Apples Bahraini", tags: ["apple", "anise"] },
  { name: "Peach", tags: ["peach", "fruity"] },
  { name: "Watermelon", tags: ["watermelon", "sweet"] },
  { name: "Grape With Mint", tags: ["grape", "mint"] },
  { name: "Two Apples With Mint", tags: ["apple", "mint", "anise"] },
  { name: "Grape", tags: ["grape", "fruity"] },
  { name: "Orange", tags: ["orange", "citrus"] },
  { name: "Vanilla", tags: ["vanilla", "cream"] },
  { name: "Strawberry", tags: ["strawberry", "berry"] },
  { name: "Kiwi", tags: ["kiwi", "fruity"] },
  { name: "Mango", tags: ["mango", "tropical"] },
  { name: "Mint With Cream", tags: ["mint", "cream"] },
  { name: "Gum", tags: ["mint", "sweet"] },
  { name: "Guava", tags: ["guava", "fruity"] },
  { name: "Pineapple", tags: ["pineapple", "tropical"] },
  { name: "Grapefruit With Mint", tags: ["grapefruit", "mint"] },
  { name: "Citrus With Mint", tags: ["citrus", "mint"] },
  { name: "Lemon", tags: ["lemon", "citrus"] },
  { name: "Melon", tags: ["melon", "sweet"] },
  { name: "Cherry", tags: ["cherry", "berry"] },
  { name: "Berry", tags: ["berry"] },
  { name: "Orange With Cream", tags: ["orange", "cream"] },
  { name: "Grapefruit", tags: ["grapefruit", "citrus"] },
  { name: "Cocktail", tags: ["tropical", "cocktail"] },
  { name: "Gum With Cinnamon", tags: ["cinnamon", "sweet"] },
  { name: "Cherry With Mint", tags: ["cherry", "mint"] },
  { name: "Fresh...!", tags: ["berry", "mint"] },
  { name: "Hubbly", tags: ["sweet"] },
  { name: "Coconut", tags: ["coconut", "cream"] },
  { name: "Mojito", tags: ["mojito", "lime", "mint"] },
  { name: "Strawberry With Cream", tags: ["strawberry", "cream"] },
  { name: "Rose", tags: ["floral", "herbal"] },
  { name: "Grenadine", tags: ["pomegranate", "cherry"] },
  { name: "Grape With Berry", tags: ["grape", "berry"] },
  { name: "Banana", tags: ["banana", "cream"] },
  { name: "Apple", tags: ["apple", "fruity"] },
  { name: "Apricot", tags: ["fruity", "sweet"] },
  { name: "Plum", tags: ["plum", "fruity"] },
  { name: "Cappuccino", tags: ["coffee", "cream"] },
  { name: "Cinnamon", tags: ["cinnamon", "spice"] },
  // Fusion
  { name: "California Citrus Breeze", tags: ["citrus", "mint", "floral"], line: "Fusion" },
  { name: "Magic Love", tags: ["fruity", "cold", "spice"], line: "Fusion" },
  { name: "Dream Scape", tags: ["blueberry", "citrus", "mint"], line: "Fusion" },
  { name: "Harvest Moon", tags: ["tea", "lemon", "lime"], line: "Fusion" },
  { name: "Diamond Dust", tags: ["orange", "pineapple", "raspberry", "lime"], line: "Fusion" },
  { name: "Florida Orange Creamsicle", tags: ["orange", "cream"], line: "Fusion" },
  { name: "Georgia Peach Pie", tags: ["peach", "spice", "dessert"], line: "Fusion" },
]

export const AL_FAKHER_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "al-fakher",
    name: item.name,
    line: item.line ?? "Classic",
    tags: item.tags.filter((t) => t !== "floral"),
    sourceUrl: SOURCE,
    strengthHint: 2,
  })
)
