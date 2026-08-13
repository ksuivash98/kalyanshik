import {
  FlavorProfile,
  MixGenerationMode,
  MixSuggestion,
  PreferenceTag,
  ExclusionTag,
  TobaccoCandidate,
} from "@/types"

export type MixStrategyId =
  | "balanced"
  | "dominant"
  | "complex"
  | "simple"
  | "experimental"
  | "leftovers"

export type FlavorDirection =
  | "fruity"
  | "sour"
  | "tropical"
  | "dessert"
  | "drink"
  | "berry"
  | "citrus"
  | "spicy"
  | "experimental"

export type InventoryLimits = {
  minMixGrams: number
  maxMixGrams: number | null
}

export type RankedCandidate = TobaccoCandidate & {
  fitness: number
  direction: FlavorDirection
  isColdAccent: boolean
  limits: InventoryLimits
}

export type PercentPlan = {
  strategy: MixStrategyId
  percents: number[]
  roles: Array<"base" | "support" | "accent">
}

export type BuiltMixCandidate = {
  strategy: MixStrategyId
  direction: FlavorDirection
  tobaccos: RankedCandidate[]
  percents: number[]
  roles: Array<"base" | "support" | "accent">
  grams: number[]
  profile: FlavorProfile
  score: number
  scoreBreakdown: {
    inventory: number
    preference: number
    compatibility: number
    cold: number
    diversity: number
    practicality: number
    experimental: number
  }
}

export type GenerateMixesInput = {
  candidates: TobaccoCandidate[]
  tobaccoCount: 2 | 3 | 4 | 5
  bowlSize: number
  targetProfile: FlavorProfile
  preferences: PreferenceTag[]
  exclusions: ExclusionTag[]
  requireStock: boolean
  mode: MixGenerationMode
  limit?: number
  recentMixes?: Array<{
    tobaccoIds: string[]
    percents?: number[]
  }>
}

export type GenerateMixesResult = {
  mixes: MixSuggestion[]
  error: string | null
}

export type ValidationResult = {
  ok: boolean
  reasons: string[]
}
