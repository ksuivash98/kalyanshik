import {
  MixComponent,
  MixGenerationMode,
  MixRequest,
  MixSuggestion,
  MixVariantType,
  TobaccoCandidate,
} from "@/types"
import { explainMix } from "@/lib/recommendations/explanations"
import { filterInventory, applyPreferenceFilter } from "./inventory-filter"
import { strategiesForMode } from "./mix-strategies"
import { buildCandidates } from "./candidate-builder"
import { filterByDiversity } from "./diversity-filter"
import { assertValidMix } from "./inventory-validator"
import { BuiltMixCandidate, GenerateMixesInput, GenerateMixesResult } from "./types"

export type { GenerateMixesInput, GenerateMixesResult } from "./types"
export { calculateMixSimilarity } from "./diversity-filter"
export { validateMixAgainstInventory, assertValidMix } from "./inventory-validator"
export { calculateGrams, percentsFromGrams } from "./gram-calculator"
export { estimateMixCold, coldScore } from "./cold-calculator"

const NAME_PREFIX = [
  "Tropical",
  "Midnight",
  "Velvet",
  "Amber",
  "Smoke",
  "Citrus",
  "Desert",
  "Forest",
  "Ocean",
  "Golden",
  "Berry",
  "Bright",
]

const NAME_SUFFIX = [
  "Sunset",
  "Wave",
  "Bloom",
  "Spark",
  "Drift",
  "Glow",
  "Nest",
  "Pulse",
  "Mirage",
  "Echo",
  "Grove",
  "Rush",
]

function hashSeed(parts: string[]): number {
  return parts.join("|").split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
}

function buildMixName(candidate: BuiltMixCandidate, variant: MixVariantType): string {
  const seed = hashSeed([
    variant,
    candidate.strategy,
    candidate.direction,
    ...candidate.tobaccos.map((t) => t.id),
  ])
  const prefix = NAME_PREFIX[seed % NAME_PREFIX.length]
  const suffix = NAME_SUFFIX[(seed * 7) % NAME_SUFFIX.length]
  return `${prefix} ${suffix}`
}

function modeToVariant(mode: MixGenerationMode, strategy: string): MixVariantType {
  if (mode === "leftovers" || strategy === "leftovers") return "leftovers"
  if (mode === "experimental" || strategy === "experimental") return "experimental"
  if (mode === "dominant" || strategy === "dominant" || strategy === "simple") {
    return "interesting"
  }
  return "safe"
}

function toSuggestion(
  candidate: BuiltMixCandidate,
  bowlSize: number,
  mode: MixGenerationMode
): MixSuggestion {
  const variantType = modeToVariant(mode, candidate.strategy)
  const components: MixComponent[] = candidate.tobaccos.map((t, i) => ({
    tobaccoId: t.id,
    name: t.name,
    brandName: t.brandName,
    role: candidate.roles[i] ?? "support",
    percent: candidate.percents[i],
    grams: candidate.grams[i],
    profile: t.profile,
    gramsAvailable: t.gramsAvailable,
    sufficient:
      t.gramsAvailable === null || t.gramsAvailable + 0.05 >= candidate.grams[i],
  }))

  const key = components
    .map((c) => c.tobaccoId)
    .sort()
    .join("-")

  return {
    id: `${variantType}-${candidate.strategy}-${key}`,
    name: buildMixName(candidate, variantType),
    variantType,
    score: Math.max(0, Math.min(1, candidate.score)),
    totalGrams: bowlSize,
    components,
    profile: candidate.profile,
    explanation: explainMix(components),
    availability: {
      available: components.every((c) => c.sufficient),
      warnings: components
        .filter((c) => !c.sufficient)
        .map(
          (c) =>
            `${c.name}: нужно ${c.grams} г, в наличии ${c.gramsAvailable ?? 0} г`
        ),
    },
  }
}

export function generateMixes(input: GenerateMixesInput): GenerateMixesResult {
  const limit = input.limit ?? 8
  const targetCold = input.targetProfile.cold

  if (input.requireStock) {
    const usable = input.candidates.filter(
      (c) => (c.gramsAvailable ?? 0) > 0
    )
    if (usable.length < input.tobaccoCount) {
      return {
        mixes: [],
        error: `В коллекции недостаточно табаков для микса из ${input.tobaccoCount} компонентов. Попробуйте выбрать ${Math.max(2, Math.min(4, usable.length))}–${Math.min(4, usable.length)}.`
          .replace(/выбрать (\d+)–\1\./, "выбрать $1."),
      }
    }
  }

  const filtered = filterInventory(input.candidates, {
    exclusions: input.exclusions,
    requireStock: input.requireStock,
    bowlSize: input.bowlSize,
    tobaccoCount: input.tobaccoCount,
    targetCold,
  })

  const ranked = applyPreferenceFilter(
    filtered,
    input.preferences,
    input.targetProfile
  )

  if (ranked.length < input.tobaccoCount) {
    return {
      mixes: [],
      error: `В коллекции недостаточно подходящих табаков для микса из ${input.tobaccoCount} компонентов. Попробуйте выбрать меньше табаков или смягчить фильтры.`,
    }
  }

  const strategies = strategiesForMode(input.mode)
  const built = buildCandidates({
    pool: ranked,
    tobaccoCount: input.tobaccoCount,
    bowlSize: input.bowlSize,
    strategies,
    preferences: input.preferences,
    targetCold,
    mode: input.mode,
  })

  const diverse = filterByDiversity(built, {
    limit: Math.max(limit * 2, 12),
    threshold: 0.72,
    minComponentChanges: 2,
    recent: input.recentMixes?.map((m) => ({
      tobaccoIds: m.tobaccoIds,
      percents: m.percents,
    })),
  })

  const suggestions: MixSuggestion[] = []
  for (const candidate of diverse) {
    const suggestion = toSuggestion(candidate, input.bowlSize, input.mode)
    const validation = assertValidMix(suggestion, ranked, {
      tobaccoCount: input.tobaccoCount,
      bowlSize: input.bowlSize,
      targetCold,
    })
    if (!validation.ok) continue
    // Exact ingredient count
    if (suggestion.components.length !== input.tobaccoCount) continue
    suggestions.push(suggestion)
    if (suggestions.length >= limit) break
  }

  if (suggestions.length === 0) {
    return {
      mixes: [],
      error:
        "Не удалось подобрать валидный микс под остатки и выбранные параметры. Уменьшите вес чаши, число табаков или смягчите фильтры.",
    }
  }

  return { mixes: suggestions, error: null }
}

/** Backward-compatible wrapper used by Mix Builder. */
export function recommendMixes(
  candidates: TobaccoCandidate[],
  request: MixRequest & {
    mode?: MixGenerationMode
    limit?: number
    recentMixes?: GenerateMixesInput["recentMixes"]
  }
): MixSuggestion[] {
  const mode = request.mode ?? "balanced"
  const result = generateMixes({
    candidates,
    tobaccoCount: request.tobaccoCount,
    bowlSize: request.totalGrams,
    targetProfile: request.targetProfile,
    preferences: request.preferences,
    exclusions: request.exclusions,
    requireStock: request.requireStock && request.useCollectionOnly,
    mode,
    limit: request.limit ?? 8,
    recentMixes: request.recentMixes,
  })
  return result.mixes
}

export function generateMixesWithMeta(
  candidates: TobaccoCandidate[],
  request: MixRequest & {
    mode?: MixGenerationMode
    limit?: number
    recentMixes?: GenerateMixesInput["recentMixes"]
  }
): GenerateMixesResult {
  return generateMixes({
    candidates,
    tobaccoCount: request.tobaccoCount,
    bowlSize: request.totalGrams,
    targetProfile: request.targetProfile,
    preferences: request.preferences,
    exclusions: request.exclusions,
    requireStock: request.requireStock && request.useCollectionOnly,
    mode: request.mode ?? "balanced",
    limit: request.limit ?? 8,
    recentMixes: request.recentMixes,
  })
}
