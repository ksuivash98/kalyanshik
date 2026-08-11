import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Overdozz — flavor profiles from TexasHookah / TheHookah + Overdozz USA. */
const SOURCE = "https://www.texashookah.com/overdozz-shisha-200g.html"
const SOURCE_USA = "https://overdozzusa.com/shisha.php"

type Item = { name: string; tags: string[]; source?: string }

const ITEMS: Item[] = [
  { name: "24 Karatine", tags: ["coffee", "banana", "cream"] },
  { name: "All Nighter", tags: ["fruity", "mint", "cold"] },
  { name: "Areejan", tags: ["tropical", "cold"], source: SOURCE_USA },
  { name: "Bad Habit", tags: ["grape"] },
  { name: "Bananago", tags: ["banana", "mango"] },
  { name: "Crazy Ex", tags: ["spice", "mango"] },
  { name: "Dopamine", tags: ["citrus", "grape", "blueberry"] },
  { name: "Double Trouble", tags: ["apple", "anise"] },
  { name: "Fresh Greens", tags: ["mint", "cold"] },
  { name: "Go For Broke", tags: ["grape", "mint"] },
  { name: "Heat Wave", tags: ["cinnamon", "mint", "sweet"] },
  { name: "Judgment Day", tags: ["peach", "coconut"] },
  { name: "Kaffeine Addikt", tags: ["citrus", "cookie", "mint"] },
  { name: "Kesowawa", tags: ["strawberry", "cocktail"], source: SOURCE_USA },
  { name: "Kooliche", tags: ["lychee", "lemon", "mint"] },
  { name: "Love Bug", tags: ["tropical", "passion_fruit"] },
  { name: "Lusidrem", tags: ["watermelon", "mint"] },
  { name: "One Night Stand", tags: ["passion_fruit", "mango"] },
  { name: "Psych Out", tags: ["pineapple", "mint"] },
  { name: "Summer Fling", tags: ["blueberry", "mint"] },
  { name: "Wild Night Out", tags: ["lemon", "cake", "dessert"] },
  { name: "Zero Gravity", tags: ["lemon", "mint"] },
  { name: "1st Love", tags: ["fruity"], source: SOURCE_USA },
]

export const OVERDOZZ_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "overdozz",
    name: item.name,
    line: "Classic",
    tags: item.tags,
    sourceUrl: item.source ?? SOURCE,
    strengthHint: 2,
  })
)
