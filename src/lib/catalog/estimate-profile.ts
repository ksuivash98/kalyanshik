import { EstimatedFlavorProfile } from "@/types/catalog"

const TAG_WEIGHTS: Record<
  string,
  Partial<Omit<EstimatedFlavorProfile, "estimated" | "source">>
> = {
  mint: { cold: 4, herbal: 2 },
  cold: { cold: 5 },
  eucalyptus: { cold: 4, herbal: 2 },
  sour: { sourness: 4, sweetness: 2 },
  sweet: { sweetness: 4 },
  lemon: { sourness: 3, fruity: 2, cold: 1 },
  lime: { sourness: 3, fruity: 2 },
  grapefruit: { sourness: 4, fruity: 2 },
  orange: { sweetness: 3, fruity: 3, sourness: 2 },
  berry: { fruity: 4, sourness: 2 },
  raspberry: { fruity: 4, sourness: 3 },
  strawberry: { fruity: 4, sweetness: 3 },
  blueberry: { fruity: 4, sweetness: 2 },
  blackberry: { fruity: 4, sourness: 2 },
  currant: { fruity: 3, sourness: 3 },
  wildberry: { fruity: 4, sourness: 2 },
  mango: { fruity: 5, sweetness: 4 },
  pineapple: { fruity: 4, sourness: 3, sweetness: 3 },
  passion_fruit: { fruity: 5, sourness: 4 },
  banana: { fruity: 4, sweetness: 5, dessert: 2 },
  peach: { fruity: 4, sweetness: 4 },
  pear: { fruity: 3, sweetness: 3 },
  grape: { fruity: 4, sweetness: 3 },
  watermelon: { fruity: 4, sweetness: 4 },
  melon: { fruity: 4, sweetness: 3 },
  coconut: { fruity: 2, dessert: 3, sweetness: 3 },
  lychee: { fruity: 4, sweetness: 4 },
  kiwi: { fruity: 4, sourness: 3 },
  guava: { fruity: 4, sweetness: 3 },
  tropical: { fruity: 5, sweetness: 3 },
  chocolate: { dessert: 5, sweetness: 4 },
  caramel: { dessert: 4, sweetness: 5 },
  cream: { dessert: 4, sweetness: 3 },
  cookie: { dessert: 5, sweetness: 4 },
  cake: { dessert: 5, sweetness: 4 },
  ice_cream: { dessert: 5, sweetness: 4, cold: 1 },
  cheesecake: { dessert: 5, sweetness: 4 },
  vanilla: { dessert: 3, sweetness: 3 },
  honey: { dessert: 3, sweetness: 4 },
  pistachio: { dessert: 3, sweetness: 2 },
  cola: { sweetness: 4, dessert: 2 },
  lemonade: { sourness: 3, sweetness: 3, fruity: 2 },
  tea: { herbal: 3, intensity: 2 },
  coffee: { dessert: 2, intensity: 4 },
  cocktail: { fruity: 3, sourness: 2 },
  soda: { sweetness: 3 },
  basil: { herbal: 4 },
  lemongrass: { herbal: 3 },
  cinnamon: { spicy: 3, dessert: 2 },
  anise: { spicy: 4, herbal: 2 },
  ginger: { spicy: 3 },
  cardamom: { spicy: 3 },
  fruity: { fruity: 4 },
  citrus: { sourness: 3, fruity: 2 },
  dessert: { dessert: 4, sweetness: 3 },
  spice: { spicy: 3 },
  herbal: { herbal: 3 },
  yogurt: { dessert: 3, sweetness: 2 },
  bergamot: { herbal: 2, sourness: 2 },
  pomelo: { sourness: 3, fruity: 2 },
  tangerine: { sweetness: 3, fruity: 3 },
  barberry: { sourness: 3, fruity: 2 },
  gooseberry: { sourness: 3, fruity: 2 },
  sea_buckthorn: { sourness: 4, fruity: 2 },
  feijoa: { fruity: 3, sourness: 2 },
  plum: { fruity: 3, sweetness: 2 },
  pomegranate: { fruity: 3, sourness: 2 },
  apple: { fruity: 3, sweetness: 3 },
  cherry: { fruity: 3, sweetness: 2 },
  tarragon: { herbal: 4 },
  marshmallow: { dessert: 4, sweetness: 4 },
}

function clamp(n: number | null | undefined): number | null {
  if (n == null || Number.isNaN(n)) return null
  return Math.max(0, Math.min(5, Math.round(n)))
}

export function estimateProfileFromTags(
  tags: string[],
  defaults?: { strength?: number | null; intensity?: number | null }
): EstimatedFlavorProfile {
  const acc: Record<string, number[]> = {
    strength: [],
    cold: [],
    sweetness: [],
    sourness: [],
    fruity: [],
    dessert: [],
    spicy: [],
    herbal: [],
    intensity: [],
  }

  for (const tag of tags) {
    const w = TAG_WEIGHTS[tag]
    if (!w) continue
    for (const [key, value] of Object.entries(w)) {
      if (typeof value === "number") {
        acc[key]?.push(value)
      }
    }
  }

  const avg = (key: string, fallback: number | null = null) => {
    const values = acc[key]
    if (!values || values.length === 0) return fallback
    return clamp(values.reduce((a, b) => a + b, 0) / values.length)
  }

  return {
    estimated: true,
    strength: defaults?.strength ?? null,
    cold: avg("cold", 0),
    sweetness: avg("sweetness", 2),
    sourness: avg("sourness", 1),
    fruity: avg("fruity", 1),
    dessert: avg("dessert", 0),
    spicy: avg("spicy", 0),
    herbal: avg("herbal", 0),
    intensity: defaults?.intensity ?? avg("intensity", 3),
    source: "ESTIMATED",
  }
}
