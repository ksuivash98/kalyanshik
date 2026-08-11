import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Sebero Classic/Black — MozeShisha + Hookain named SKUs (не полный 196, только подтверждённые имена). */
const SOURCE = "https://mozeshisha.de/en/tobacco/top-brands/sebero-tobacco/"
const SOURCE_CLASSIC = "https://hookain.de/en/shisha-tobacco/top-marken/sebero/"

type Item = { name: string; line: string; tags: string[]; aliases?: string[] }

const ITEMS: Item[] = [
  // Classic (old + new named)
  { name: "Buratino", line: "Classic", tags: ["pear", "guava"] },
  { name: "Sweet & Sour", line: "Classic", tags: ["lime", "lemon", "sour"] },
  { name: "Blackcurrant", line: "Classic", tags: ["currant", "berry"] },
  { name: "Joyce", line: "Classic", tags: ["apricot", "fruity"] },
  { name: "Isabella", line: "Classic", tags: ["grape", "fruity"] },
  { name: "Soft Drink", line: "Classic", tags: ["cola", "soda"] },
  { name: "Clubnika", line: "Classic", tags: ["strawberry", "berry"] },
  { name: "Sicilian", line: "Classic", tags: ["orange", "citrus"] },
  { name: "Pala Thai", line: "Classic", tags: ["banana", "sweet"] },
  { name: "Mangolorian", line: "Classic", tags: ["mango", "tropical"] },
  { name: "Omsk", line: "Classic", tags: ["currant", "herbal"] },
  { name: "Garden Queen", line: "Classic", tags: ["strawberry", "berry"] },
  { name: "Bright Pala Thai", line: "Classic", tags: ["banana", "strawberry", "cold"] },
  { name: "Passion Rings", line: "Classic", tags: ["pineapple", "fruity"] },
  { name: "Bright Blackthorn", line: "Classic", tags: ["blackberry", "cold"] },
  { name: "Jumble", line: "Classic", tags: ["pineapple", "apple", "strawberry"] },
  { name: "Green & Green", line: "Classic", tags: ["apple", "kiwi"] },
  { name: "Green Grains", line: "Classic", tags: ["kiwi", "pomegranate"] },
  { name: "Red Ball", line: "Classic", tags: ["watermelon", "strawberry"] },
  { name: "Bumble", line: "Classic", tags: ["banana", "strawberry"] },
  { name: "Berry Sorbet", line: "Classic", tags: ["berry", "dessert", "sour"] },
  { name: "Honey Melon", line: "Classic", tags: ["melon", "honey"] },
  { name: "Very Sour", line: "Classic", tags: ["citrus", "sour"] },
  { name: "Gentle Berry", line: "Classic", tags: ["berry"] },
  { name: "Red Flag", line: "Classic", tags: ["barberry", "candy", "sour"] },
  // Black
  { name: "Wtrmln", line: "Black", tags: ["watermelon"], aliases: ["Watermelon"] },
  { name: "Prns", line: "Black", tags: ["plum"], aliases: ["Plum"] },
  { name: "Lmnchello", line: "Black", tags: ["lemon", "soda"], aliases: ["Limoncello"] },
  { name: "Lmn Waff", line: "Black", tags: ["lemon", "dessert"] },
  { name: "Grap Frut", line: "Black", tags: ["grapefruit", "citrus"] },
  { name: "Cuctus", line: "Black", tags: ["fruity"] },
  { name: "Blckberi", line: "Black", tags: ["blackberry"] },
  { name: "Amarena Chry", line: "Black", tags: ["cherry", "sour"] },
  { name: "Blue Forest", line: "Black", tags: ["blueberry"] },
  { name: "Depth", line: "Black", tags: ["currant", "herbal"] },
  { name: "Rspberi", line: "Black", tags: ["raspberry"], aliases: ["Raspberry"] },
  { name: "Iscer", line: "Black", tags: ["pear"] },
  { name: "Grnt", line: "Black", tags: ["pomegranate"] },
  { name: "Mngo Jght", line: "Black", tags: ["mango", "yogurt"] },
  { name: "Wild", line: "Black", tags: ["wildberry", "berry"] },
  { name: "Sharlot", line: "Black", tags: ["apple", "cake", "dessert"] },
  { name: "Wonder", line: "Black", tags: ["vanilla", "dessert"] },
  { name: "Warmel", line: "Black", tags: ["watermelon", "melon"] },
  { name: "Exo Mix", line: "Black", tags: ["pineapple", "mango", "passion_fruit"] },
  { name: "Del Toro", line: "Black", tags: ["citrus", "sweet", "fruity"] },
  { name: "Crn", line: "Black", tags: ["sweet"] },
  { name: "Rspberi Rffelo", line: "Black", tags: ["raspberry", "coconut", "dessert"] },
  { name: "Coki Monster", line: "Black", tags: ["cookie", "coconut", "dessert"] },
  { name: "Veri Perii", line: "Black", tags: ["blueberry", "blackberry"] },
  { name: "Green & Green Black", line: "Black", tags: ["apple", "kiwi"] },
  { name: "Jumble Black", line: "Black", tags: ["pineapple", "apple", "strawberry"] },
  { name: "Passion Rings Black", line: "Black", tags: ["pineapple"] },
  { name: "Red Ball Black", line: "Black", tags: ["watermelon", "strawberry"] },
  { name: "Pala Thai Black", line: "Black", tags: ["banana", "strawberry"] },
  { name: "Bright Pala Thai Black", line: "Black", tags: ["banana", "strawberry", "cold"] },
  { name: "Clubnika Black", line: "Black", tags: ["strawberry"] },
  { name: "Grpe", line: "Black", tags: ["grape"] },
  { name: "Lmn Candi", line: "Black", tags: ["lemon", "candy"] },
  { name: "Color of India", line: "Black", tags: ["spice"] },
  // Arctic Mix named
  { name: "Cucumber Sprite", line: "Arctic Mix", tags: ["herbal", "soda", "cold"] },
  { name: "Okroshka Time", line: "Arctic Mix", tags: ["herbal", "cold"] },
  { name: "Spice Fruit", line: "Arctic Mix", tags: ["tea", "strawberry", "currant", "cold"] },
  { name: "Vanilla Fruit", line: "Arctic Mix", tags: ["vanilla", "cola", "cold"] },
  { name: "Sour Citrus", line: "Arctic Mix", tags: ["lemon", "cherry", "orange", "cold", "sour"] },
  { name: "Summer Vibe", line: "Arctic Mix", tags: ["raspberry", "cold"] },
  { name: "Cactus Pear", line: "Arctic Mix", tags: ["pear", "cold"] },
  { name: "Jelly Fruit", line: "Arctic Mix", tags: ["fruity", "cold"] },
  { name: "Sunny Honey", line: "Arctic Mix", tags: ["honey", "cold"] },
  { name: "Fresh Time", line: "Arctic Mix", tags: ["cold", "mint"] },
  { name: "Bubble Fruit", line: "Arctic Mix", tags: ["fruity", "sweet", "cold"] },
]

export const SEBERO_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "sebero",
    name: item.name,
    line: item.line,
    tags: item.tags,
    aliases: item.aliases,
    sourceUrl: item.line === "Classic" && ["Buratino", "Isabella", "Sicilian"].includes(item.name)
      ? SOURCE_CLASSIC
      : SOURCE,
    strengthHint: item.line === "Black" ? 4 : item.line === "Arctic Mix" ? 2 : 2,
  })
)
