import { TobaccoCandidate } from "@/types"
import { FlavorDirection } from "./types"

export function classifyDirection(tobacco: TobaccoCandidate): FlavorDirection {
  const p = tobacco.profile
  const tags = tobacco.tags.map((t) => t.toLowerCase())
  const name = tobacco.name.toLowerCase()

  if (
    tags.some((t) => /berry|ягод|strawberry|raspberry|blueberry|currant|cherry/.test(t)) ||
    /berry|ягод|клубник|малин|черник|вишн|смородин/.test(name)
  ) {
    return "berry"
  }
  if (
    tags.some((t) => /citrus|lemon|lime|orange|grapefruit|tangerine/.test(t)) ||
    p.sourness >= 3.5 && (tags.includes("citrus") || /лимон|лайм|цитрус|апельсин|грейпфрут/.test(name))
  ) {
    return "citrus"
  }
  if (
    tags.some((t) => /tropical|pineapple|mango|passion|guava|coconut/.test(t)) ||
    /tropical|ананас|манго|маракуй|гуав|кокос|pineapple|mango/.test(name)
  ) {
    return "tropical"
  }
  if (p.dessert >= 3 || tags.some((t) => /dessert|cream|cake|cookie|chocolate|vanilla|yogurt/.test(t))) {
    return "dessert"
  }
  if (tags.some((t) => /cola|tea|coffee|drink|lemonade|mojito|cocktail|soda/.test(t))) {
    return "drink"
  }
  if (p.spicy >= 2.5 || tags.some((t) => /spice|ginger|cinnamon|anise/.test(t))) {
    return "spicy"
  }
  if (p.sourness >= 3.2) return "sour"
  if (p.fruity >= 2.5) return "fruity"
  return "experimental"
}

/** Pairwise flavor compatibility 0..1 */
export function pairCompatibility(a: TobaccoCandidate, b: TobaccoCandidate): number {
  const da = classifyDirection(a)
  const db = classifyDirection(b)

  const GOOD: Record<string, string[]> = {
    fruity: ["fruity", "tropical", "berry", "sour", "citrus", "drink"],
    tropical: ["tropical", "fruity", "berry", "dessert", "drink"],
    berry: ["berry", "fruity", "dessert", "sour", "drink"],
    sour: ["sour", "citrus", "fruity", "berry", "drink"],
    citrus: ["citrus", "sour", "drink", "fruity", "spicy"],
    dessert: ["dessert", "drink", "berry", "tropical", "fruity"],
    drink: ["drink", "fruity", "citrus", "berry", "tropical", "dessert"],
    spicy: ["spicy", "citrus", "drink", "experimental"],
    experimental: ["experimental", "fruity", "dessert", "spicy", "drink"],
  }

  let score = 0.45
  if (da === db) score = 0.75
  else if (GOOD[da]?.includes(db)) score = 0.85
  else score = 0.35

  // Soft penalty for clashing extremes
  if (a.profile.dessert >= 4 && b.profile.sourness >= 4) score -= 0.15
  if (a.profile.spicy >= 3 && b.profile.dessert >= 4) score -= 0.1
  if (Math.abs(a.profile.strength - b.profile.strength) >= 3) score -= 0.08

  // Mild bonus for complementary sour/sweet
  if (
    (a.profile.sourness >= 3 && b.profile.sweetness >= 3) ||
    (b.profile.sourness >= 3 && a.profile.sweetness >= 3)
  ) {
    score += 0.08
  }

  return Math.max(0, Math.min(1, score))
}

export function comboCompatibility(tobaccos: TobaccoCandidate[]): number {
  if (tobaccos.length < 2) return 1
  let sum = 0
  let n = 0
  for (let i = 0; i < tobaccos.length; i++) {
    for (let j = i + 1; j < tobaccos.length; j++) {
      sum += pairCompatibility(tobaccos[i], tobaccos[j])
      n++
    }
  }
  return n === 0 ? 1 : sum / n
}

export function isExperimentalPair(a: TobaccoCandidate, b: TobaccoCandidate): boolean {
  const da = classifyDirection(a)
  const db = classifyDirection(b)
  const EXP = new Set([
    "fruity|dessert",
    "berry|dessert",
    "citrus|spicy",
    "tropical|dessert",
    "drink|fruity",
    "tea|fruity",
  ])
  const key = [da, db].sort().join("|")
  return EXP.has(key) || pairCompatibility(a, b) < 0.5
}

export const DIRECTION_PRIORITY: FlavorDirection[] = [
  "fruity",
  "tropical",
  "berry",
  "sour",
  "citrus",
  "dessert",
  "drink",
  "spicy",
  "experimental",
]
