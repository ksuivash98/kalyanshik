import { FLAVOR_TAG_BY_ID } from "@/data/catalog/flavor-tags"
import { normalizeTobaccoName } from "@/lib/catalog/normalizer"
import { TobaccoSeed } from "@/types/catalog"

/** RU/EN query aliases for catalog search */
const QUERY_ALIASES: Record<string, string[]> = {
  mango: ["манго", "mango"],
  mint: ["мята", "mint", "ментол"],
  lemon: ["лимон", "lemon"],
  berry: ["ягоды", "ягода", "berry", "berries"],
  watermelon: ["арбуз", "watermelon"],
  strawberry: ["клубника", "strawberry"],
  grape: ["виноград", "grape"],
  apple: ["яблоко", "apple"],
  pineapple: ["ананас", "pineapple"],
  peach: ["персик", "peach"],
  orange: ["апельсин", "orange"],
  cola: ["кола", "cola"],
  coffee: ["кофе", "coffee"],
  tea: ["чай", "tea"],
  cream: ["сливки", "cream"],
  dessert: ["десерт", "dessert"],
  citrus: ["цитрус", "цитрусовый", "citrus"],
  cold: ["холод", "лёд", "лед", "ice"],
}

function expandQuery(q: string): string[] {
  const base = normalizeTobaccoName(q)
  if (!base) return []
  const out = new Set<string>([base, q.trim().toLowerCase()])
  for (const [canon, aliases] of Object.entries(QUERY_ALIASES)) {
    if (aliases.some((a) => normalizeTobaccoName(a) === base || base.includes(normalizeTobaccoName(a)))) {
      out.add(canon)
      for (const a of aliases) out.add(normalizeTobaccoName(a))
    }
  }
  return [...out]
}

export function tobaccoMatchesQuery(
  tobacco: TobaccoSeed,
  brandName: string,
  query: string
): boolean {
  const q = query.trim()
  if (!q) return true
  const terms = expandQuery(q)
  const haystack = [
    tobacco.name,
    brandName,
    tobacco.line ?? "",
    ...tobacco.aliases,
    ...tobacco.tags,
    ...tobacco.flavorNotes,
    ...tobacco.tags.map((t) => FLAVOR_TAG_BY_ID[t]?.labelRu ?? ""),
    ...tobacco.tags.map((t) => FLAVOR_TAG_BY_ID[t]?.labelEn ?? ""),
  ]
    .join(" ")
    .toLowerCase()

  return terms.some((term) => haystack.includes(term))
}
