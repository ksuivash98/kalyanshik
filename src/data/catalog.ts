import { FlavorProfile } from "@/types"

export type CatalogTobacco = {
  id: string
  brand: string
  name: string
  tags: string[]
  profile: FlavorProfile
}

function idOf(brand: string, name: string) {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
}

const raw: Array<Omit<CatalogTobacco, "id">> = [
  { brand: "Darkside", name: "Cola", tags: ["напиток", "сладкий"], profile: { strength: 4, cold: 0, sweetness: 4, sourness: 1, fruity: 1, dessert: 2, spicy: 1, herbal: 0, intensity: 4 } },
  { brand: "Darkside", name: "Mango Lassi", tags: ["фруктовый", "сладкий"], profile: { strength: 3, cold: 0, sweetness: 4, sourness: 1, fruity: 5, dessert: 2, spicy: 0, herbal: 0, intensity: 4 } },
  { brand: "Darkside", name: "Supernova", tags: ["свежий", "мята"], profile: { strength: 3, cold: 5, sweetness: 2, sourness: 0, fruity: 0, dessert: 0, spicy: 0, herbal: 2, intensity: 3 } },
  { brand: "Darkside", name: "Barvy", tags: ["ягодный", "фруктовый"], profile: { strength: 3, cold: 1, sweetness: 3, sourness: 3, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "Darkside", name: "Generis Blueberry", tags: ["ягодный"], profile: { strength: 3, cold: 0, sweetness: 3, sourness: 2, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "Darkside", name: "Space Lychee", tags: ["фруктовый", "сладкий"], profile: { strength: 3, cold: 1, sweetness: 4, sourness: 2, fruity: 5, dessert: 2, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "Darkside", name: "Fallout", tags: ["цитрусовый", "кислый"], profile: { strength: 4, cold: 1, sweetness: 2, sourness: 4, fruity: 3, dessert: 0, spicy: 0, herbal: 0, intensity: 4 } },
  { brand: "Darkside", name: "Peach", tags: ["фруктовый", "сладкий"], profile: { strength: 3, cold: 0, sweetness: 4, sourness: 1, fruity: 4, dessert: 2, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "MustHave", name: "Raspberry", tags: ["ягодный", "кислый"], profile: { strength: 3, cold: 0, sweetness: 3, sourness: 4, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 4 } },
  { brand: "MustHave", name: "Banana Mama", tags: ["фруктовый", "десертный"], profile: { strength: 2, cold: 0, sweetness: 5, sourness: 0, fruity: 4, dessert: 4, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "MustHave", name: "Nord Star", tags: ["свежий", "мята"], profile: { strength: 3, cold: 5, sweetness: 1, sourness: 0, fruity: 0, dessert: 0, spicy: 0, herbal: 2, intensity: 3 } },
  { brand: "MustHave", name: "Pineapple Rings", tags: ["фруктовый", "кислый"], profile: { strength: 3, cold: 0, sweetness: 3, sourness: 3, fruity: 5, dessert: 1, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "MustHave", name: "Cane Mint", tags: ["свежий", "сладкий", "мята"], profile: { strength: 2, cold: 4, sweetness: 4, sourness: 0, fruity: 0, dessert: 1, spicy: 0, herbal: 1, intensity: 2 } },
  { brand: "MustHave", name: "Cookie", tags: ["десертный", "сладкий"], profile: { strength: 2, cold: 0, sweetness: 5, sourness: 0, fruity: 0, dessert: 5, spicy: 1, herbal: 0, intensity: 3 } },
  { brand: "MustHave", name: "Orange Soda", tags: ["напиток", "цитрусовый"], profile: { strength: 3, cold: 0, sweetness: 4, sourness: 2, fruity: 3, dessert: 1, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "Tangiers", name: "Noir Kashmir Peach", tags: ["фруктовый", "пряный"], profile: { strength: 5, cold: 0, sweetness: 3, sourness: 1, fruity: 3, dessert: 1, spicy: 3, herbal: 1, intensity: 5 } },
  { brand: "Tangiers", name: "Noir Horchata", tags: ["десертный", "пряный"], profile: { strength: 5, cold: 0, sweetness: 4, sourness: 0, fruity: 0, dessert: 4, spicy: 3, herbal: 1, intensity: 5 } },
  { brand: "Tangiers", name: "Birquq Cane Mint", tags: ["свежий", "мята"], profile: { strength: 4, cold: 4, sweetness: 3, sourness: 0, fruity: 0, dessert: 0, spicy: 0, herbal: 2, intensity: 4 } },
  { brand: "Tangiers", name: "Noir Maraschino Cherry", tags: ["ягодный", "десертный"], profile: { strength: 5, cold: 0, sweetness: 4, sourness: 2, fruity: 3, dessert: 3, spicy: 0, herbal: 0, intensity: 5 } },
  { brand: "Fumari", name: "White Gummi Bear", tags: ["сладкий", "фруктовый"], profile: { strength: 2, cold: 0, sweetness: 5, sourness: 1, fruity: 3, dessert: 4, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "Fumari", name: "Mint Chocolate Chill", tags: ["десертный", "мята", "свежий"], profile: { strength: 2, cold: 4, sweetness: 4, sourness: 0, fruity: 0, dessert: 4, spicy: 0, herbal: 1, intensity: 3 } },
  { brand: "Fumari", name: "Ambrosia", tags: ["фруктовый", "сладкий"], profile: { strength: 2, cold: 0, sweetness: 4, sourness: 1, fruity: 4, dessert: 2, spicy: 0, herbal: 0, intensity: 2 } },
  { brand: "Fumari", name: "Lemon Loaf", tags: ["цитрусовый", "десертный"], profile: { strength: 2, cold: 0, sweetness: 4, sourness: 3, fruity: 2, dessert: 4, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "BlackBurn", name: "Energy Drink", tags: ["напиток", "кислый"], profile: { strength: 3, cold: 1, sweetness: 3, sourness: 3, fruity: 1, dessert: 0, spicy: 0, herbal: 0, intensity: 4 } },
  { brand: "BlackBurn", name: "Tropic Juice", tags: ["фруктовый", "цитрусовый"], profile: { strength: 3, cold: 0, sweetness: 3, sourness: 3, fruity: 5, dessert: 1, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "BlackBurn", name: "Ice Baby", tags: ["свежий", "мята"], profile: { strength: 3, cold: 5, sweetness: 2, sourness: 0, fruity: 0, dessert: 0, spicy: 0, herbal: 1, intensity: 3 } },
  { brand: "BlackBurn", name: "Peach Tea", tags: ["фруктовый", "напиток"], profile: { strength: 2, cold: 0, sweetness: 3, sourness: 1, fruity: 4, dessert: 1, spicy: 0, herbal: 2, intensity: 2 } },
  { brand: "Satyr", name: "Passion Fruit", tags: ["фруктовый", "кислый"], profile: { strength: 3, cold: 0, sweetness: 2, sourness: 4, fruity: 5, dessert: 0, spicy: 0, herbal: 0, intensity: 4 } },
  { brand: "Satyr", name: "Grapefruit", tags: ["цитрусовый", "кислый"], profile: { strength: 3, cold: 0, sweetness: 1, sourness: 5, fruity: 3, dessert: 0, spicy: 0, herbal: 1, intensity: 4 } },
  { brand: "Satyr", name: "Watermelon", tags: ["фруктовый", "свежий"], profile: { strength: 2, cold: 1, sweetness: 4, sourness: 1, fruity: 5, dessert: 1, spicy: 0, herbal: 0, intensity: 2 } },
  { brand: "Satyr", name: "Anise", tags: ["пряный", "анис"], profile: { strength: 3, cold: 0, sweetness: 2, sourness: 0, fruity: 0, dessert: 1, spicy: 4, herbal: 3, intensity: 4 } },
  { brand: "Satyr", name: "Peach Ice Tea", tags: ["напиток", "фруктовый", "свежий"], profile: { strength: 2, cold: 2, sweetness: 3, sourness: 1, fruity: 4, dessert: 1, spicy: 0, herbal: 1, intensity: 2 } },
  { brand: "Element", name: "Air Melonade", tags: ["фруктовый", "цитрусовый"], profile: { strength: 2, cold: 1, sweetness: 3, sourness: 3, fruity: 4, dessert: 0, spicy: 0, herbal: 0, intensity: 2 } },
  { brand: "Element", name: "Earth Chocolate", tags: ["десертный", "сладкий"], profile: { strength: 3, cold: 0, sweetness: 4, sourness: 0, fruity: 0, dessert: 5, spicy: 1, herbal: 0, intensity: 4 } },
  { brand: "Element", name: "Water Berry Mix", tags: ["ягодный", "свежий"], profile: { strength: 2, cold: 2, sweetness: 3, sourness: 2, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 2 } },
  { brand: "Element", name: "Fire Spice", tags: ["пряный"], profile: { strength: 4, cold: 0, sweetness: 2, sourness: 0, fruity: 0, dessert: 1, spicy: 5, herbal: 2, intensity: 4 } },
  { brand: "Duft", name: "Pinkman", tags: ["ягодный", "сладкий"], profile: { strength: 2, cold: 0, sweetness: 4, sourness: 2, fruity: 4, dessert: 2, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "Duft", name: "Apple Pie", tags: ["десертный", "фруктовый"], profile: { strength: 2, cold: 0, sweetness: 4, sourness: 1, fruity: 3, dessert: 5, spicy: 1, herbal: 0, intensity: 3 } },
  { brand: "Duft", name: "Lime", tags: ["цитрусовый", "кислый"], profile: { strength: 2, cold: 1, sweetness: 1, sourness: 5, fruity: 2, dessert: 0, spicy: 0, herbal: 1, intensity: 3 } },
  { brand: "Duft", name: "Mint Candy", tags: ["свежий", "сладкий", "мята"], profile: { strength: 2, cold: 4, sweetness: 4, sourness: 0, fruity: 0, dessert: 2, spicy: 0, herbal: 1, intensity: 2 } },
  { brand: "Starline", name: "Brazilian Tea", tags: ["напиток", "травянистый"], profile: { strength: 2, cold: 0, sweetness: 2, sourness: 1, fruity: 1, dessert: 0, spicy: 1, herbal: 4, intensity: 2 } },
  { brand: "Starline", name: "Mango", tags: ["фруктовый", "сладкий"], profile: { strength: 2, cold: 0, sweetness: 4, sourness: 1, fruity: 5, dessert: 1, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "Starline", name: "Orange Soda", tags: ["напиток", "цитрусовый"], profile: { strength: 2, cold: 0, sweetness: 4, sourness: 2, fruity: 3, dessert: 1, spicy: 0, herbal: 0, intensity: 2 } },
  { brand: "Starline", name: "Wildberry", tags: ["ягодный"], profile: { strength: 2, cold: 0, sweetness: 3, sourness: 3, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "Sebero", name: "Blackcurrant", tags: ["ягодный", "кислый"], profile: { strength: 3, cold: 0, sweetness: 2, sourness: 4, fruity: 4, dessert: 0, spicy: 0, herbal: 1, intensity: 4 } },
  { brand: "Sebero", name: "Pear", tags: ["фруктовый", "сладкий"], profile: { strength: 2, cold: 0, sweetness: 4, sourness: 1, fruity: 4, dessert: 2, spicy: 0, herbal: 0, intensity: 2 } },
  { brand: "Sebero", name: "Grapes", tags: ["фруктовый", "сладкий"], profile: { strength: 3, cold: 0, sweetness: 4, sourness: 2, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 3 } },
  { brand: "Sebero", name: "Basil Lemon", tags: ["цитрусовый", "травянистый"], profile: { strength: 3, cold: 0, sweetness: 1, sourness: 3, fruity: 2, dessert: 0, spicy: 1, herbal: 4, intensity: 3 } },
]

export const CATALOG: CatalogTobacco[] = raw.map((item) => ({
  ...item,
  id: idOf(item.brand, item.name),
}))

export const STARTER_COLLECTION_IDS = [
  "darkside-mango-lassi",
  "satyr-passion-fruit",
  "darkside-peach",
  "darkside-supernova",
  "musthave-raspberry",
  "blackburn-tropic-juice",
  "musthave-banana-mama",
  "satyr-grapefruit",
]

export function getTobaccoById(id: string) {
  return CATALOG.find((t) => t.id === id)
}

export function getBrands() {
  return [...new Set(CATALOG.map((t) => t.brand))].sort()
}
