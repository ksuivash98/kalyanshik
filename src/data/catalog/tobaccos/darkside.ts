import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** DARKSIDE Core — подтверждено ассортиментом дистрибьютора HookahStuff (48 SKU Core line). */
const SOURCE =
  "https://hookahstuff.com/collections/darkside-core-line-hookah-shisha-tobacco"

type Item = {
  name: string
  tags: string[]
  notes?: string[]
  aliases?: string[]
}

const CORE: Item[] = [
  { name: "Ultranova", tags: ["mint", "cold"] },
  { name: "Pineapple Pulse", tags: ["pineapple", "fruity", "sour"] },
  { name: "Cola", tags: ["cola", "sweet", "soda"] },
  { name: "Pear", tags: ["pear", "fruity", "sweet"] },
  { name: "Space Lychee", tags: ["lychee", "fruity", "sweet"] },
  { name: "Generis Raspberry", tags: ["raspberry", "berry", "sour"] },
  { name: "Mango Lassi", tags: ["mango", "cream", "sweet", "dessert"] },
  { name: "Cyber Kiwi", tags: ["kiwi", "fruity", "sour"] },
  { name: "Lemonblast", tags: ["lemon", "sour", "citrus"] },
  { name: "Falling Star", tags: ["mango", "passion_fruit", "tropical"] },
  { name: "Wild Forest", tags: ["strawberry", "wildberry", "berry"] },
  { name: "Nuzz", tags: ["dessert", "sweet"] },
  { name: "Admiral Acbar", tags: ["tea", "herbal"] },
  { name: "Cherry Rocks", tags: ["cherry", "berry", "sweet"] },
  { name: "Grape", tags: ["grape", "fruity", "sweet"] },
  { name: "Pomelow", tags: ["pomelo", "citrus", "sour"] },
  { name: "Bloody Orange", tags: ["orange", "citrus", "sweet"] },
  { name: "Supermint", tags: ["mint", "cold"] },
  { name: "Cream Soda", tags: ["soda", "cream", "sweet"] },
  { name: "Polar Cream", tags: ["cream", "cold", "dessert"] },
  { name: "Red Alert", tags: ["berry", "sour"] },
  { name: "Dark Peach 2.0", tags: ["peach", "fruity", "sweet"], aliases: ["Peach 2.0"] },
  { name: "Kalee Grapefruit 2.0", tags: ["grapefruit", "citrus", "sour"] },
  { name: "Wildberry", tags: ["wildberry", "berry"] },
  { name: "Dark Ice Cream", tags: ["ice_cream", "dessert", "sweet"] },
  { name: "Crystal Grape", tags: ["grape", "fruity"] },
  { name: "Glitch Ice Tea", tags: ["tea", "cold", "lemon"] },
  { name: "Sweet Comet", tags: ["sweet", "fruity"] },
  { name: "Bananapapa", tags: ["banana", "sweet", "dessert"] },
  { name: "Red Tea", tags: ["tea", "berry"] },
  { name: "Top Gum", tags: ["sweet", "fruity"] },
  { name: "Barvy Orange", tags: ["orange", "citrus"] },
  { name: "Dark Passion", tags: ["passion_fruit", "fruity", "sour"] },
  { name: "Basil Blast", tags: ["basil", "herbal"] },
  { name: "Melon", tags: ["melon", "fruity", "sweet"] },
  { name: "Bergamonstr", tags: ["bergamot", "citrus", "tea"] },
  { name: "Killer Milk", tags: ["cream", "dessert", "sweet"] },
  { name: "Blueberry Blast", tags: ["blueberry", "berry"] },
  { name: "Peach 2.0", tags: ["peach", "fruity", "sweet"] },
  { name: "Torpedo", tags: ["tropical", "fruity"] },
  { name: "Honey Dust", tags: ["honey", "sweet", "dessert"] },
  { name: "Bounty Hunter", tags: ["coconut", "chocolate", "dessert"] },
  { name: "Dark Spirit", tags: ["cocktail", "lime", "sour"] },
  { name: "Guava Rebel", tags: ["guava", "fruity"] },
  { name: "Virgin Melon", tags: ["melon", "fruity"] },
  { name: "Fruitality", tags: ["tropical", "fruity"] },
  { name: "Red Jam", tags: ["berry", "sweet"] },
  { name: "Skylime", tags: ["lime", "citrus", "sour"] },
]

export const DARKSIDE_TOBACCOS: TobaccoSeed[] = CORE.map((item) =>
  makeTobacco({
    brandId: "darkside",
    name: item.name,
    line: "Core",
    tags: item.tags,
    flavorNotes: item.notes ?? item.tags,
    aliases: item.aliases,
    sourceUrl: SOURCE,
    strengthHint: 3,
  })
)
