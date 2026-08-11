import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type SeedTobacco = {
  brand: string
  name: string
  tags: string[]
  strength: number
  cold: number
  sweetness: number
  sourness: number
  fruity: number
  dessert: number
  spicy: number
  herbal: number
  intensity: number
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
}

const tobaccos: SeedTobacco[] = [
  { brand: "Darkside", name: "Cola", tags: ["напиток", "сладкий"], strength: 4, cold: 0, sweetness: 4, sourness: 1, fruity: 1, dessert: 2, spicy: 1, herbal: 0, intensity: 4 },
  { brand: "Darkside", name: "Mango Lassi", tags: ["фруктовый", "сладкий"], strength: 3, cold: 0, sweetness: 4, sourness: 1, fruity: 5, dessert: 2, spicy: 0, herbal: 0, intensity: 4 },
  { brand: "Darkside", name: "Supernova", tags: ["свежий", "мята"], strength: 3, cold: 5, sweetness: 2, sourness: 0, fruity: 0, dessert: 0, spicy: 0, herbal: 2, intensity: 3 },
  { brand: "Darkside", name: "Barvy", tags: ["ягодный", "фруктовый"], strength: 3, cold: 1, sweetness: 3, sourness: 3, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "Darkside", name: "Generis Blueberry", tags: ["ягодный"], strength: 3, cold: 0, sweetness: 3, sourness: 2, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "Darkside", name: "Space Lychee", tags: ["фруктовый", "сладкий"], strength: 3, cold: 1, sweetness: 4, sourness: 2, fruity: 5, dessert: 2, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "Darkside", name: "Fallout", tags: ["цитрусовый", "кислый"], strength: 4, cold: 1, sweetness: 2, sourness: 4, fruity: 3, dessert: 0, spicy: 0, herbal: 0, intensity: 4 },
  { brand: "Darkside", name: "Peach", tags: ["фруктовый", "сладкий"], strength: 3, cold: 0, sweetness: 4, sourness: 1, fruity: 4, dessert: 2, spicy: 0, herbal: 0, intensity: 3 },

  { brand: "MustHave", name: "Raspberry", tags: ["ягодный", "кислый"], strength: 3, cold: 0, sweetness: 3, sourness: 4, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 4 },
  { brand: "MustHave", name: "Banana Mama", tags: ["фруктовый", "десертный"], strength: 2, cold: 0, sweetness: 5, sourness: 0, fruity: 4, dessert: 4, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "MustHave", name: "Nord Star", tags: ["свежий", "мята"], strength: 3, cold: 5, sweetness: 1, sourness: 0, fruity: 0, dessert: 0, spicy: 0, herbal: 2, intensity: 3 },
  { brand: "MustHave", name: "Pineapple Rings", tags: ["фруктовый", "кислый"], strength: 3, cold: 0, sweetness: 3, sourness: 3, fruity: 5, dessert: 1, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "MustHave", name: "Cane Mint", tags: ["свежий", "сладкий", "мята"], strength: 2, cold: 4, sweetness: 4, sourness: 0, fruity: 0, dessert: 1, spicy: 0, herbal: 1, intensity: 2 },
  { brand: "MustHave", name: "Cookie", tags: ["десертный", "сладкий"], strength: 2, cold: 0, sweetness: 5, sourness: 0, fruity: 0, dessert: 5, spicy: 1, herbal: 0, intensity: 3 },
  { brand: "MustHave", name: "Orange Soda", tags: ["напиток", "цитрусовый"], strength: 3, cold: 0, sweetness: 4, sourness: 2, fruity: 3, dessert: 1, spicy: 0, herbal: 0, intensity: 3 },

  { brand: "Tangiers", name: "Noir Kashmir Peach", tags: ["фруктовый", "пряный"], strength: 5, cold: 0, sweetness: 3, sourness: 1, fruity: 3, dessert: 1, spicy: 3, herbal: 1, intensity: 5 },
  { brand: "Tangiers", name: "Noir Horchata", tags: ["десертный", "пряный"], strength: 5, cold: 0, sweetness: 4, sourness: 0, fruity: 0, dessert: 4, spicy: 3, herbal: 1, intensity: 5 },
  { brand: "Tangiers", name: "Birquq Cane Mint", tags: ["свежий", "мята"], strength: 4, cold: 4, sweetness: 3, sourness: 0, fruity: 0, dessert: 0, spicy: 0, herbal: 2, intensity: 4 },
  { brand: "Tangiers", name: "Noir Maraschino Cherry", tags: ["ягодный", "десертный"], strength: 5, cold: 0, sweetness: 4, sourness: 2, fruity: 3, dessert: 3, spicy: 0, herbal: 0, intensity: 5 },

  { brand: "Fumari", name: "White Gummi Bear", tags: ["сладкий", "фруктовый"], strength: 2, cold: 0, sweetness: 5, sourness: 1, fruity: 3, dessert: 4, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "Fumari", name: "Mint Chocolate Chill", tags: ["десертный", "мята", "свежий"], strength: 2, cold: 4, sweetness: 4, sourness: 0, fruity: 0, dessert: 4, spicy: 0, herbal: 1, intensity: 3 },
  { brand: "Fumari", name: "Ambrosia", tags: ["фруктовый", "сладкий"], strength: 2, cold: 0, sweetness: 4, sourness: 1, fruity: 4, dessert: 2, spicy: 0, herbal: 0, intensity: 2 },
  { brand: "Fumari", name: "Lemon Loaf", tags: ["цитрусовый", "десертный"], strength: 2, cold: 0, sweetness: 4, sourness: 3, fruity: 2, dessert: 4, spicy: 0, herbal: 0, intensity: 3 },

  { brand: "BlackBurn", name: "Energy Drink", tags: ["напиток", "кислый"], strength: 3, cold: 1, sweetness: 3, sourness: 3, fruity: 1, dessert: 0, spicy: 0, herbal: 0, intensity: 4 },
  { brand: "BlackBurn", name: "Tropic Juice", tags: ["фруктовый", "цитрусовый"], strength: 3, cold: 0, sweetness: 3, sourness: 3, fruity: 5, dessert: 1, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "BlackBurn", name: "Ice Baby", tags: ["свежий", "мята"], strength: 3, cold: 5, sweetness: 2, sourness: 0, fruity: 0, dessert: 0, spicy: 0, herbal: 1, intensity: 3 },
  { brand: "BlackBurn", name: "Peach Tea", tags: ["фруктовый", "напиток"], strength: 2, cold: 0, sweetness: 3, sourness: 1, fruity: 4, dessert: 1, spicy: 0, herbal: 2, intensity: 2 },

  { brand: "Satyr", name: "Passion Fruit", tags: ["фруктовый", "кислый"], strength: 3, cold: 0, sweetness: 2, sourness: 4, fruity: 5, dessert: 0, spicy: 0, herbal: 0, intensity: 4 },
  { brand: "Satyr", name: "Grapefruit", tags: ["цитрусовый", "кислый"], strength: 3, cold: 0, sweetness: 1, sourness: 5, fruity: 3, dessert: 0, spicy: 0, herbal: 1, intensity: 4 },
  { brand: "Satyr", name: "Watermelon", tags: ["фруктовый", "свежий"], strength: 2, cold: 1, sweetness: 4, sourness: 1, fruity: 5, dessert: 1, spicy: 0, herbal: 0, intensity: 2 },
  { brand: "Satyr", name: "Anise", tags: ["пряный", "анис"], strength: 3, cold: 0, sweetness: 2, sourness: 0, fruity: 0, dessert: 1, spicy: 4, herbal: 3, intensity: 4 },
  { brand: "Satyr", name: "Peach Ice Tea", tags: ["напиток", "фруктовый", "свежий"], strength: 2, cold: 2, sweetness: 3, sourness: 1, fruity: 4, dessert: 1, spicy: 0, herbal: 1, intensity: 2 },

  { brand: "Element", name: "Air Melonade", tags: ["фруктовый", "цитрусовый"], strength: 2, cold: 1, sweetness: 3, sourness: 3, fruity: 4, dessert: 0, spicy: 0, herbal: 0, intensity: 2 },
  { brand: "Element", name: "Earth Chocolate", tags: ["десертный", "сладкий"], strength: 3, cold: 0, sweetness: 4, sourness: 0, fruity: 0, dessert: 5, spicy: 1, herbal: 0, intensity: 4 },
  { brand: "Element", name: "Water Berry Mix", tags: ["ягодный", "свежий"], strength: 2, cold: 2, sweetness: 3, sourness: 2, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 2 },
  { brand: "Element", name: "Fire Spice", tags: ["пряный"], strength: 4, cold: 0, sweetness: 2, sourness: 0, fruity: 0, dessert: 1, spicy: 5, herbal: 2, intensity: 4 },

  { brand: "Duft", name: "Pinkman", tags: ["ягодный", "сладкий"], strength: 2, cold: 0, sweetness: 4, sourness: 2, fruity: 4, dessert: 2, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "Duft", name: "Apple Pie", tags: ["десертный", "фруктовый"], strength: 2, cold: 0, sweetness: 4, sourness: 1, fruity: 3, dessert: 5, spicy: 1, herbal: 0, intensity: 3 },
  { brand: "Duft", name: "Lime", tags: ["цитрусовый", "кислый"], strength: 2, cold: 1, sweetness: 1, sourness: 5, fruity: 2, dessert: 0, spicy: 0, herbal: 1, intensity: 3 },
  { brand: "Duft", name: "Mint Candy", tags: ["свежий", "сладкий", "мята"], strength: 2, cold: 4, sweetness: 4, sourness: 0, fruity: 0, dessert: 2, spicy: 0, herbal: 1, intensity: 2 },

  { brand: "Starline", name: "Brazilian Tea", tags: ["напиток", "травянистый"], strength: 2, cold: 0, sweetness: 2, sourness: 1, fruity: 1, dessert: 0, spicy: 1, herbal: 4, intensity: 2 },
  { brand: "Starline", name: "Mango", tags: ["фруктовый", "сладкий"], strength: 2, cold: 0, sweetness: 4, sourness: 1, fruity: 5, dessert: 1, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "Starline", name: "Orange Soda", tags: ["напиток", "цитрусовый"], strength: 2, cold: 0, sweetness: 4, sourness: 2, fruity: 3, dessert: 1, spicy: 0, herbal: 0, intensity: 2 },
  { brand: "Starline", name: "Wildberry", tags: ["ягодный"], strength: 2, cold: 0, sweetness: 3, sourness: 3, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 3 },

  { brand: "Sebero", name: "Blackcurrant", tags: ["ягодный", "кислый"], strength: 3, cold: 0, sweetness: 2, sourness: 4, fruity: 4, dessert: 0, spicy: 0, herbal: 1, intensity: 4 },
  { brand: "Sebero", name: "Pear", tags: ["фруктовый", "сладкий"], strength: 2, cold: 0, sweetness: 4, sourness: 1, fruity: 4, dessert: 2, spicy: 0, herbal: 0, intensity: 2 },
  { brand: "Sebero", name: "Grapes", tags: ["фруктовый", "сладкий"], strength: 3, cold: 0, sweetness: 4, sourness: 2, fruity: 4, dessert: 1, spicy: 0, herbal: 0, intensity: 3 },
  { brand: "Sebero", name: "Basil Lemon", tags: ["цитрусовый", "травянистый"], strength: 3, cold: 0, sweetness: 1, sourness: 3, fruity: 2, dessert: 0, spicy: 1, herbal: 4, intensity: 3 },
]

async function main() {
  console.log("Seeding Hookah Mix database...")

  await prisma.mixRating.deleteMany()
  await prisma.mixIngredient.deleteMany()
  await prisma.mix.deleteMany()
  await prisma.userTobacco.deleteMany()
  await prisma.flavorProfile.deleteMany()
  await prisma.tobacco.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.user.deleteMany()

  const user = await prisma.user.create({
    data: {
      name: "Кальянщик",
      email: "demo@hookahmix.app",
    },
  })

  const brandMap = new Map<string, string>()

  for (const brandName of [...new Set(tobaccos.map((t) => t.brand))]) {
    const brand = await prisma.brand.create({
      data: {
        name: brandName,
        slug: slugify(brandName),
      },
    })
    brandMap.set(brandName, brand.id)
  }

  const createdTobaccos: { id: string; name: string }[] = []

  for (const item of tobaccos) {
    const brandId = brandMap.get(item.brand)
    if (!brandId) continue

    const tobacco = await prisma.tobacco.create({
      data: {
        brandId,
        name: item.name,
        slug: slugify(item.name),
        tags: JSON.stringify(item.tags),
        description: `${item.brand} ${item.name} — ориентировочный профиль для MVP`,
        profile: {
          create: {
            strength: item.strength,
            cold: item.cold,
            sweetness: item.sweetness,
            sourness: item.sourness,
            fruity: item.fruity,
            dessert: item.dessert,
            spicy: item.spicy,
            herbal: item.herbal,
            intensity: item.intensity,
          },
        },
      },
    })

    createdTobaccos.push({ id: tobacco.id, name: item.name })
  }

  const starterNames = [
    "Mango Lassi",
    "Passion Fruit",
    "Peach",
    "Supernova",
    "Raspberry",
    "Tropic Juice",
    "Banana Mama",
    "Grapefruit",
  ]

  const starter = createdTobaccos.filter((t) => starterNames.includes(t.name))

  for (const item of starter) {
    await prisma.userTobacco.create({
      data: {
        userId: user.id,
        tobaccoId: item.id,
        grams:
          item.name === "Passion Fruit"
            ? 2
            : item.name === "Mango Lassi"
              ? 8
              : 25,
        rating: 4,
        note: "Добавлено из стартовой коллекции",
      },
    })
  }

  console.log(`Brands: ${brandMap.size}`)
  console.log(`Tobaccos: ${createdTobaccos.length}`)
  console.log(`Starter collection: ${starter.length}`)
  console.log(`Demo user: ${user.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
