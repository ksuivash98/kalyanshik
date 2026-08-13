export type FlavorProfile = {
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

export type FlavorKey = keyof FlavorProfile

export type MixRole = "base" | "support" | "accent"

export type PreferenceTag =
  | "фруктовый"
  | "ягодный"
  | "цитрусовый"
  | "сладкий"
  | "кислый"
  | "десертный"
  | "напиток"
  | "свежий"
  | "пряный"
  | "травянистый"

export type ExclusionTag =
  | "без мяты"
  | "без аниса"
  | "без цитруса"
  | "без сладости"
  | "без холода"

export type MixVariantType = "safe" | "interesting" | "experimental" | "leftovers"

export type MixGenerationMode = "balanced" | "dominant" | "experimental" | "leftovers"

export type ScoringWeights = Partial<Record<FlavorKey, number>>

export type TobaccoCandidate = {
  id: string
  name: string
  brandName: string
  tags: string[]
  profile: FlavorProfile
  gramsAvailable: number | null
}

export type MixComponent = {
  tobaccoId: string
  name: string
  brandName: string
  role: MixRole
  percent: number
  grams: number
  profile: FlavorProfile
  gramsAvailable: number | null
  sufficient: boolean
}

export type MixSuggestion = {
  id: string
  name: string
  variantType: MixVariantType
  score: number
  totalGrams: number
  components: MixComponent[]
  profile: FlavorProfile
  explanation: string
  availability: {
    available: boolean
    warnings: string[]
    alternatives?: string[]
  }
}

export type MixRequest = {
  tobaccoCount: 2 | 3 | 4 | 5
  totalGrams: number
  targetProfile: FlavorProfile
  preferences: PreferenceTag[]
  exclusions: ExclusionTag[]
  useCollectionOnly: boolean
  requireStock: boolean
  mode?: MixGenerationMode
  limit?: number
}

export const FLAVOR_KEYS: FlavorKey[] = [
  "strength",
  "cold",
  "sweetness",
  "sourness",
  "fruity",
  "dessert",
  "spicy",
  "herbal",
  "intensity",
]

export const FLAVOR_LABELS: Record<FlavorKey, string> = {
  strength: "Крепость",
  cold: "Холод",
  sweetness: "Сладость",
  sourness: "Кислотность",
  fruity: "Фруктовость",
  dessert: "Десертность",
  spicy: "Пряность",
  herbal: "Травянистость",
  intensity: "Насыщенность",
}

export const PREFERENCE_TAGS: PreferenceTag[] = [
  "фруктовый",
  "ягодный",
  "цитрусовый",
  "сладкий",
  "кислый",
  "десертный",
  "напиток",
  "свежий",
  "пряный",
  "травянистый",
]

export const EXCLUSION_TAGS: ExclusionTag[] = [
  "без мяты",
  "без аниса",
  "без цитруса",
  "без сладости",
  "без холода",
]

export const DEFAULT_WEIGHTS: Record<FlavorKey, number> = {
  strength: 0.15,
  cold: 0.1,
  sweetness: 0.15,
  sourness: 0.1,
  fruity: 0.15,
  dessert: 0.1,
  spicy: 0.05,
  herbal: 0.05,
  intensity: 0.15,
}
