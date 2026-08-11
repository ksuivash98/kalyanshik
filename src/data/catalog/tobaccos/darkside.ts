import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** DARKSIDE Core — HookahStuff Core catalog (48). Shot — WHM + HookahFox. */
const SOURCE_CORE =
  "https://hookahstuff.com/collections/darkside-core-line-hookah-shisha-tobacco"
const SOURCE_SHOT =
  "https://worldhookahmarket.com/product-category/tobacco/russian-tobacco/darkside-shot-125gr/"
const SOURCE_SHOT_DETAIL =
  "https://hookahfox.com/category/tobacco/tobacco-darkside/tobacco-darkside-shot-30-gr/"

type Item = {
  name: string
  tags: string[]
  aliases?: string[]
  source?: string
  notes?: string[]
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
  { name: "Dark Peach 2.0", tags: ["peach", "fruity", "sweet"], aliases: ["Peach 2.0 Dark"] },
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

const SHOT: Item[] = [
  { name: "Azovski", tags: ["melon", "pear", "dessert"], notes: ["Melon", "Pear", "Souffle"], source: SOURCE_SHOT_DETAIL },
  { name: "Baltiiski", tags: ["coconut", "cookie", "ice_cream"], notes: ["Coconut", "Cookies", "Ice cream"], source: SOURCE_SHOT_DETAIL },
  { name: "Crimeria", tags: ["melon", "peach", "grape"], notes: ["Melon", "Peach", "Grape"], source: SOURCE_SHOT_DETAIL },
  { name: "Kamchatski", tags: ["pear", "tea", "cranberry"], notes: ["Pear", "Tea", "Cranberry"], source: SOURCE_SHOT_DETAIL },
  { name: "Kubanski", tags: ["strawberry", "cake", "lemon"], notes: ["Strawberry", "Muffin", "Lemon"], source: SOURCE_SHOT_DETAIL },
  { name: "Kyrilien", tags: ["apple", "passion_fruit", "mango"], notes: ["Apple", "Passion fruit", "Mango"], source: SOURCE_SHOT_DETAIL },
  { name: "Nevski", tags: ["energy_drink", "grape", "lime"], notes: ["Energy drink", "Grape", "Lime"], source: SOURCE_SHOT_DETAIL },
  { name: "North Trip", tags: ["basil", "cranberry", "raspberry"], notes: ["Basil", "Cranberry", "Raspberry"], source: SOURCE_SHOT_DETAIL },
  { name: "Siberian", tags: ["feijoa", "strawberry", "ice_cream"], notes: ["Feijoa", "Strawberry", "Ice cream"], source: SOURCE_SHOT_DETAIL },
  { name: "Ural", tags: ["banana", "vanilla", "cinnamon"], notes: ["Banana", "Vanilla", "Cinnamon"], source: SOURCE_SHOT_DETAIL },
  { name: "Amurski", tags: ["watermelon", "raspberry", "currant"], notes: ["Watermelon", "Raspberry", "Currant"], source: SOURCE_SHOT_DETAIL },
  { name: "Kolski", tags: ["fruity", "cold"], source: SOURCE_SHOT },
  { name: "Kurshski", tags: ["peach", "feijoa", "herbal"], notes: ["Nectarine", "Feijoa", "Cactus"], source: SOURCE_SHOT_DETAIL },
  { name: "Ohotski", tags: ["cranberry", "dessert", "watermelon"], notes: ["Cranberry", "Sorbet", "Watermelon"], source: SOURCE_SHOT_DETAIL },
  { name: "Volzhski", tags: ["cheesecake", "blueberry", "strawberry"], notes: ["Cheesecake", "Blueberries", "Strawberries"], source: SOURCE_SHOT_DETAIL },
  { name: "Altai Trip", tags: ["herbal", "feijoa", "eucalyptus"], notes: ["Needles", "Feijoa", "Eucalyptus"], source: SOURCE_SHOT_DETAIL },
  { name: "Ladozh Vibe", tags: ["fruity"], source: SOURCE_SHOT },
  { name: "Onega Punch", tags: ["pomegranate", "cherry", "raspberry"], notes: ["Pomegranate", "Cherry", "Raspberry"], source: SOURCE_SHOT_DETAIL },
  { name: "Vyatka", tags: ["grapefruit", "pineapple", "kiwi"], notes: ["Grapefruit", "Pineapple", "Kiwi"], source: SOURCE_SHOT_DETAIL },
  { name: "Baikal Crash", tags: ["pistachio", "mint", "ice_cream"], notes: ["Pistachio", "Mint", "Ice cream"], source: SOURCE_SHOT_DETAIL },
  { name: "Capital", tags: ["cranberry", "strawberry", "lime"], notes: ["Cranberry", "Strawberry", "Lime"], source: SOURCE_SHOT_DETAIL },
  { name: "Caspian", tags: ["lychee", "raspberry", "cola"], notes: ["Lychee", "Raspberry", "Cola"], source: SOURCE_SHOT_DETAIL },
  { name: "Central", tags: ["grape", "lime", "cranberry"], notes: ["Grape", "Lime", "Cranberry"], source: SOURCE_SHOT_DETAIL },
  { name: "Don", tags: ["dessert", "melon", "lemon"], notes: ["Nougat", "Melon", "Lemon"], aliases: ["Don Chill"], source: SOURCE_SHOT_DETAIL },
  { name: "Karelian", tags: ["blueberry", "strawberry", "raspberry"], notes: ["Blueberries", "Strawberries", "Raspberries"], source: SOURCE_SHOT_DETAIL },
  { name: "SeaSide", tags: ["fruity"], source: SOURCE_SHOT },
  { name: "South", tags: ["pear", "mango", "mint"], notes: ["Pear", "Mango", "Mint"], aliases: ["Southern Vibe"], source: SOURCE_SHOT_DETAIL },
  { name: "Taiga", tags: ["lemongrass", "feijoa", "eucalyptus"], notes: ["Lemongrass", "Feijoa", "Eucalyptus"], source: SOURCE_SHOT_DETAIL },
  { name: "Primorsky Shake", tags: ["coconut", "blueberry", "pineapple"], notes: ["Coconut", "Blueberries", "Pineapple"], source: SOURCE_SHOT_DETAIL },
  { name: "Yakutski Bit", tags: ["apple", "energy_drink", "kiwi"], notes: ["Apple", "Energy drink", "Kiwi"], source: SOURCE_SHOT_DETAIL },
  { name: "Chukotski Vibe", tags: ["barberry", "grape", "lime"], notes: ["Barberry", "Grape", "Lime"], source: SOURCE_SHOT_DETAIL },
  { name: "Sayanski Bit", tags: ["grape", "currant", "guava"], notes: ["Grape", "Currant", "Guava"], source: SOURCE_SHOT_DETAIL },
]

export const DARKSIDE_TOBACCOS: TobaccoSeed[] = [
  ...CORE.map((item) =>
    makeTobacco({
      brandId: "darkside",
      name: item.name,
      line: "Core",
      tags: item.tags,
      flavorNotes: item.notes ?? item.tags,
      aliases: item.aliases,
      sourceUrl: SOURCE_CORE,
      strengthHint: 3,
    })
  ),
  ...SHOT.map((item) =>
    makeTobacco({
      brandId: "darkside",
      name: item.name,
      line: "Shot",
      tags: item.tags,
      flavorNotes: item.notes ?? item.tags,
      aliases: item.aliases,
      sourceUrl: item.source ?? SOURCE_SHOT,
      strengthHint: 2,
    })
  ),
]
