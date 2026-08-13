import {
  MixComponent,
  MixGenerationMode,
  MixRequest,
  MixSuggestion,
  MixVariantType,
  TobaccoCandidate,
} from "@/types"
import { explainMix } from "@/lib/recommendations/explanations"
import {
  applyPreferenceFilter,
  CandidateDebug,
  filterInventory,
  normalizeCandidate,
} from "./inventory-filter"
import { strategiesForMode } from "./mix-strategies"
import { buildCandidates } from "./candidate-builder"
import { filterByDiversity } from "./diversity-filter"
import { assertValidMix } from "./inventory-validator"
import { normalizeGramsAvailable } from "./limits"
import { estimateMixCold } from "./cold-calculator"
import { BuiltMixCandidate, GenerateMixesInput, GenerateMixesResult } from "./types"

export type { GenerateMixesInput, GenerateMixesResult } from "./types"
export { calculateMixSimilarity } from "./diversity-filter"
export { validateMixAgainstInventory, assertValidMix } from "./inventory-validator"
export { calculateGrams, percentsFromGrams } from "./gram-calculator"
export { estimateMixCold, coldScore } from "./cold-calculator"

export type MixDebugReport = {
  collectionCount: number
  inventoryCandidates: number
  preferenceCandidates: number
  excludedCandidates: number
  coldBlocked: number
  combinationsGenerated: number
  combinationsAfterGramValidation: number
  combinationsAfterDiversity: number
  finalMixes: number
  rejectionReasons: Record<string, number>
  candidateDebug: CandidateDebug[]
  warnings: string[]
  fallbackUsed: string | null
}

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

function isDevDebug(): boolean {
  return (
    typeof process !== "undefined" &&
    process.env.NODE_ENV !== "production"
  )
}

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

function logDebug(report: MixDebugReport) {
  if (!isDevDebug()) return
  // eslint-disable-next-line no-console
  console.log(
    [
      "",
      "[MIX DEBUG]",
      `Collection: ${report.collectionCount} tobaccos`,
      `After inventory filter: ${report.inventoryCandidates}`,
      `After preferences (soft rank): ${report.preferenceCandidates}`,
      `Excluded by user: ${report.excludedCandidates}`,
      `Cold accents blocked: ${report.coldBlocked}`,
      `Combinations generated: ${report.combinationsGenerated}`,
      `After gram validation: ${report.combinationsAfterGramValidation}`,
      `After diversity filter: ${report.combinationsAfterDiversity}`,
      `Final mixes: ${report.finalMixes}`,
      report.fallbackUsed ? `Fallback used: ${report.fallbackUsed}` : null,
      report.warnings.length ? `Warnings: ${report.warnings.join(" | ")}` : null,
      Object.keys(report.rejectionReasons).length
        ? `Rejection reasons: ${JSON.stringify(report.rejectionReasons)}`
        : null,
      "",
    ]
      .filter(Boolean)
      .join("\n")
  )
}

function finalizeSuggestions(
  built: BuiltMixCandidate[],
  pool: ReturnType<typeof applyPreferenceFilter>,
  input: GenerateMixesInput,
  limit: number
): { suggestions: MixSuggestion[]; afterDiversity: number } {
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
    const validation = assertValidMix(suggestion, pool, {
      tobaccoCount: input.tobaccoCount,
      bowlSize: input.bowlSize,
    })
    if (!validation.ok) continue
    if (suggestion.components.length !== input.tobaccoCount) continue
    suggestions.push(suggestion)
    if (suggestions.length >= limit) break
  }
  return { suggestions, afterDiversity: diverse.length }
}

function buildErrorMessage(
  input: GenerateMixesInput,
  inventoryCount: number,
  report: MixDebugReport
): string {
  if (inventoryCount === 0) {
    if (report.excludedCandidates > 0) {
      return `После исключений не осталось подходящих табаков (${report.excludedCandidates} отфильтровано). Снимите часть исключений.`
    }
    return "В коллекции нет табаков с валидным остатком в граммах."
  }
  if (inventoryCount < input.tobaccoCount) {
    return `После исключений доступно ${inventoryCount} табак(а/ов), а выбрано ${input.tobaccoCount}. Добавьте табаки в коллекцию или выберите ${inventoryCount}.`
  }
  if (report.combinationsAfterGramValidation === 0) {
    return `В коллекции ${inventoryCount} подходящих табаков, но для чаши ${input.bowlSize} г не удалось собрать микс из ${input.tobaccoCount} компонентов без превышения остатков. Уменьшите вес чаши или число табаков.`
  }
  return `В коллекции ${inventoryCount} подходящих табаков, но валидный микс из ${input.tobaccoCount} компонентов для чаши ${input.bowlSize} г не собран. Попробуйте другой режим или ослабьте исключения.`
}

export function generateMixes(input: GenerateMixesInput): GenerateMixesResult & {
  debug?: MixDebugReport
} {
  const limit = input.limit ?? 8
  const targetCold = input.targetProfile.cold
  const warnings: string[] = []
  let fallbackUsed: string | null = null

  const normalized = input.candidates.map(normalizeCandidate)
  const stocked = normalized.filter((c) => {
    const g = normalizeGramsAvailable(c.gramsAvailable)
    return g !== null && g > 0
  })

  const rejectionReasons: Record<string, number> = {}

  if (input.requireStock && stocked.length < input.tobaccoCount) {
    const report: MixDebugReport = {
      collectionCount: normalized.length,
      inventoryCandidates: stocked.length,
      preferenceCandidates: 0,
      excludedCandidates: 0,
      coldBlocked: 0,
      combinationsGenerated: 0,
      combinationsAfterGramValidation: 0,
      combinationsAfterDiversity: 0,
      finalMixes: 0,
      rejectionReasons: { INSUFFICIENT_COLLECTION: stocked.length },
      candidateDebug: [],
      warnings,
      fallbackUsed: null,
    }
    logDebug(report)
    return {
      mixes: [],
      error: `В коллекции недостаточно табаков для микса из ${input.tobaccoCount} компонентов. Сейчас с остатком > 0: ${stocked.length}. Попробуйте выбрать ${Math.max(2, stocked.length)}.`,
      debug: report,
    }
  }

  let { passed: filtered, debug: candidateDebug } = filterInventory(normalized, {
    exclusions: input.exclusions,
    requireStock: input.requireStock,
    bowlSize: input.bowlSize,
    tobaccoCount: input.tobaccoCount,
    targetCold,
  })

  for (const d of candidateDebug) {
    if (!d.rejected) continue
    rejectionReasons[d.reason] = (rejectionReasons[d.reason] ?? 0) + 1
  }

  const excludedCandidates = candidateDebug.filter((d) => d.reason === "EXCLUDED_BY_USER").length
  const coldBlocked = candidateDebug.filter((d) => d.reason === "COLD_ACCENT_BLOCKED").length

  // Fallback #1: if exclusions wiped everything but collection has stock — clear soft message path
  // (exclusions are HARD — do not remove them automatically)

  let ranked = applyPreferenceFilter(filtered, input.preferences, input.targetProfile)

  // Soft note when desired cold but no cold tobaccos in pool
  const hasColdInPool = ranked.some((t) => t.profile.cold >= 2 || t.isColdAccent)
  if (targetCold >= 2 && !hasColdInPool) {
    warnings.push(
      "В коллекции нет подходящего холодящего табака, поэтому миксы будут без дополнительного холода."
    )
  }

  if (ranked.length < input.tobaccoCount) {
    const report: MixDebugReport = {
      collectionCount: normalized.length,
      inventoryCandidates: filtered.length,
      preferenceCandidates: ranked.length,
      excludedCandidates,
      coldBlocked,
      combinationsGenerated: 0,
      combinationsAfterGramValidation: 0,
      combinationsAfterDiversity: 0,
      finalMixes: 0,
      rejectionReasons,
      candidateDebug,
      warnings,
      fallbackUsed: null,
    }
    logDebug(report)
    return {
      mixes: [],
      error: buildErrorMessage(input, filtered.length, report),
      debug: report,
    }
  }

  const runBuild = (pool: typeof ranked, mode: MixGenerationMode) =>
    buildCandidates({
      pool,
      tobaccoCount: input.tobaccoCount,
      bowlSize: input.bowlSize,
      strategies: strategiesForMode(mode),
      preferences: input.preferences,
      targetCold,
      mode,
    })

  let built = runBuild(ranked, input.mode)
  let { suggestions, afterDiversity } = finalizeSuggestions(built, ranked, input, limit)

  // Fallback #2: ignore preference ranking order — use full inventory pool shuffled by id
  if (suggestions.length === 0) {
    fallbackUsed = "drop soft preference ranking bias"
    ranked = applyPreferenceFilter(filtered, [], input.targetProfile)
    built = runBuild(ranked, input.mode)
    ;({ suggestions, afterDiversity } = finalizeSuggestions(built, ranked, input, limit))
  }

  // Fallback #3: try balanced mode if another mode produced nothing
  if (suggestions.length === 0 && input.mode !== "balanced") {
    fallbackUsed = "fallback to balanced mode"
    built = runBuild(ranked, "balanced")
    ;({ suggestions, afterDiversity } = finalizeSuggestions(
      built,
      ranked,
      { ...input, mode: "balanced" },
      limit
    ))
  }

  // Fallback #4: expand combo pool — use all filtered, not just top fitness
  if (suggestions.length === 0) {
    fallbackUsed = "use full inventory pool"
    const fullPool = [...filtered].sort((a, b) => a.id.localeCompare(b.id))
    built = buildCandidates({
      pool: fullPool,
      tobaccoCount: input.tobaccoCount,
      bowlSize: input.bowlSize,
      strategies: ["balanced", "simple", "dominant"],
      preferences: [],
      targetCold,
      mode: "balanced",
      comboLimit: 400,
    })
    ;({ suggestions, afterDiversity } = finalizeSuggestions(
      built,
      fullPool,
      { ...input, mode: "balanced", preferences: [] },
      limit
    ))
  }

  const report: MixDebugReport = {
    collectionCount: normalized.length,
    inventoryCandidates: filtered.length,
    preferenceCandidates: ranked.length,
    excludedCandidates,
    coldBlocked,
    combinationsGenerated: built.length > 0 ? built.length : 0,
    combinationsAfterGramValidation: built.length,
    combinationsAfterDiversity: afterDiversity,
    finalMixes: suggestions.length,
    rejectionReasons,
    candidateDebug,
    warnings,
    fallbackUsed,
  }
  logDebug(report)

  if (suggestions.length === 0) {
    return {
      mixes: [],
      error: buildErrorMessage(input, filtered.length, report),
      debug: report,
    }
  }

  // Attach cold warning to first suggestion explanation if needed
  if (warnings.length > 0) {
    suggestions = suggestions.map((s, i) =>
      i === 0
        ? { ...s, explanation: `${s.explanation} ${warnings[0]}` }
        : s
    )
  }

  return { mixes: suggestions, error: null, debug: report }
}

/** Structured debug for UI / tests. */
export function debugMixGeneration(input: GenerateMixesInput): MixDebugReport {
  const result = generateMixes(input)
  return (
    result.debug ?? {
      collectionCount: input.candidates.length,
      inventoryCandidates: 0,
      preferenceCandidates: 0,
      excludedCandidates: 0,
      coldBlocked: 0,
      combinationsGenerated: 0,
      combinationsAfterGramValidation: 0,
      combinationsAfterDiversity: 0,
      finalMixes: result.mixes.length,
      rejectionReasons: {},
      candidateDebug: [],
      warnings: [],
      fallbackUsed: null,
    }
  )
}

export function recommendMixes(
  candidates: TobaccoCandidate[],
  request: MixRequest & {
    mode?: MixGenerationMode
    limit?: number
    recentMixes?: GenerateMixesInput["recentMixes"]
  }
): MixSuggestion[] {
  return generateMixesWithMeta(candidates, request).mixes
}

export function generateMixesWithMeta(
  candidates: TobaccoCandidate[],
  request: MixRequest & {
    mode?: MixGenerationMode
    limit?: number
    recentMixes?: GenerateMixesInput["recentMixes"]
  }
): GenerateMixesResult & { debug?: MixDebugReport } {
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

/** Counts for Mix Builder UI. */
export function getCollectionAvailability(
  candidates: TobaccoCandidate[],
  exclusions: GenerateMixesInput["exclusions"] = [],
  targetCold = 0
) {
  const normalized = candidates.map(normalizeCandidate)
  const inStock = normalized.filter((c) => (normalizeGramsAvailable(c.gramsAvailable) ?? 0) > 0)
  const { passed } = filterInventory(normalized, {
    exclusions,
    requireStock: true,
    bowlSize: 20,
    tobaccoCount: 3,
    targetCold,
  })
  return {
    collectionCount: normalized.length,
    inStockCount: inStock.length,
    availableForMix: passed.length,
  }
}
