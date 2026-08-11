import {
  MixComponent,
  MixRequest,
  MixSuggestion,
  MixVariantType,
  TobaccoCandidate,
} from "@/types"
import { round1 } from "@/lib/utils"
import {
  diversifyCombinations,
  generateCombinations,
  getRolePlan,
} from "./combinations"
import { explainMix } from "./explanations"
import { blendProfiles, scoreProfileMatch } from "./profile"
import { filterCandidates, rankCandidates } from "./scoring"

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
]

function hashSeed(parts: string[]): number {
  return parts.join("|").split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
}

function buildMixName(
  components: Array<{ tobaccoId: string }>,
  variant: MixVariantType
): string {
  const seed = hashSeed([variant, ...components.map((c) => c.tobaccoId)])
  const prefix = NAME_PREFIX[seed % NAME_PREFIX.length]
  const suffix = NAME_SUFFIX[(seed * 7) % NAME_SUFFIX.length]
  return `${prefix} ${suffix}`
}

function assignRoles(
  combo: TobaccoCandidate[],
  totalGrams: number
): MixComponent[] {
  const ranked = [...combo].sort((a, b) => {
    const aScore =
      a.profile.intensity * 0.4 + a.profile.fruity * 0.3 + a.profile.sweetness * 0.3
    const bScore =
      b.profile.intensity * 0.4 + b.profile.fruity * 0.3 + b.profile.sweetness * 0.3
    return bScore - aScore
  })

  const plan = getRolePlan(combo.length)

  return plan.map((slot, index) => {
    const tobacco = ranked[index]
    const grams = round1((totalGrams * slot.percent) / 100)
    const available = tobacco.gramsAvailable
    return {
      tobaccoId: tobacco.id,
      name: tobacco.name,
      brandName: tobacco.brandName,
      role: slot.role,
      percent: slot.percent,
      grams,
      profile: tobacco.profile,
      gramsAvailable: available,
      sufficient: available === null || available >= grams,
    }
  })
}

function checkAvailability(components: MixComponent[]): {
  available: boolean
  warnings: string[]
  alternatives: string[]
} {
  const warnings: string[] = []

  for (const component of components) {
    if (!component.sufficient && component.gramsAvailable !== null) {
      warnings.push(
        `${component.name}: нужно ${component.grams} г, в наличии ${component.gramsAvailable} г`
      )
    }
  }

  return {
    available: warnings.length === 0,
    warnings,
    alternatives: [],
  }
}

function scaleToAvailable(components: MixComponent[]): MixComponent[] {
  const ratios = components.map((c) => {
    if (c.gramsAvailable === null) return 1
    if (c.grams <= 0) return 1
    return Math.min(1, c.gramsAvailable / c.grams)
  })
  const scale = Math.min(...ratios, 1)
  if (scale >= 0.999) return components

  return components.map((c) => ({
    ...c,
    grams: round1(c.grams * scale),
    sufficient: true,
  }))
}

function buildSuggestion(
  combo: TobaccoCandidate[],
  request: MixRequest,
  variantType: MixVariantType,
  scoreBias: number
): MixSuggestion {
  let components = assignRoles(combo, request.totalGrams)
  let availability = checkAvailability(components)

  if (!availability.available && request.requireStock) {
    components = scaleToAvailable(components)
    availability = checkAvailability(components)
    if (!availability.available) {
      availability.alternatives.push(
        "Уменьшите общий вес микса или пополните запас табаков"
      )
    } else {
      availability.warnings.push("Граммовка уменьшена под текущее наличие")
    }
  }

  const profile = blendProfiles(
    components.map((c) => ({ profile: c.profile, percent: c.percent }))
  )
  const baseScore = scoreProfileMatch(profile, request.targetProfile)
  const score = Math.max(0, Math.min(1, baseScore + scoreBias))
  const actualTotalGrams = round1(
    components.reduce((sum, c) => sum + c.grams, 0)
  )

  return {
    id: `${variantType}-${combo.map((c) => c.id).sort().join("-")}`,
    name: buildMixName(
      components.map((c) => ({ tobaccoId: c.tobaccoId })),
      variantType
    ),
    variantType,
    score,
    totalGrams: actualTotalGrams || request.totalGrams,
    components,
    profile,
    explanation: explainMix(components),
    availability,
  }
}

export function recommendMixes(
  candidates: TobaccoCandidate[],
  request: MixRequest
): MixSuggestion[] {
  const filtered = filterCandidates(candidates, {
    exclusions: request.exclusions,
    requireStock: request.requireStock && request.useCollectionOnly,
    minGrams: request.totalGrams / (request.tobaccoCount * 2),
  })

  const ranked = rankCandidates(
    filtered,
    request.targetProfile,
    request.preferences
  )

  if (ranked.length < request.tobaccoCount) {
    return []
  }

  const poolSize = Math.min(ranked.length, Math.max(8, request.tobaccoCount * 4))
  const pool = ranked.slice(0, poolSize)
  const combinations = generateCombinations(pool, request.tobaccoCount, 150)

  const scored = combinations
    .map((combo) => buildSuggestion(combo, request, "safe", 0))
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) return []

  const diverseCombos = diversifyCombinations(
    combinations.map((combo) => combo.map((c) => ({ id: c.id }))),
    Math.min(18, combinations.length)
  )

  const diverseSuggestions = diverseCombos
    .map((comboIds) => {
      const combo: TobaccoCandidate[] = []
      for (const item of comboIds) {
        const found = pool.find((p) => p.id === item.id)
        if (found) combo.push(found)
      }
      if (combo.length !== request.tobaccoCount) return null
      return buildSuggestion(combo, request, "safe", 0)
    })
    .filter((s): s is MixSuggestion => Boolean(s))
    .sort((a, b) => b.score - a.score)

  const unique = Array.from(
    new Map(
      [...diverseSuggestions, ...scored].map((s) => [
        s.components
          .map((c) => c.tobaccoId)
          .sort()
          .join("-"),
        s,
      ])
    ).values()
  ).sort((a, b) => b.score - a.score)

  const safe = unique[0]
  const midIndex = Math.min(Math.floor(unique.length / 3), unique.length - 1)
  const interesting =
    unique.find((s, idx) => idx > 0 && idx <= midIndex + 1) ?? unique[1] ?? safe
  const experimental = unique[unique.length - 1] ?? safe

  const picked = [safe, interesting, experimental].filter(Boolean) as MixSuggestion[]
  const variants: MixVariantType[] = ["safe", "interesting", "experimental"]
  const biases = [0, -0.03, -0.08]

  const result: MixSuggestion[] = []
  const seen = new Set<string>()

  for (let i = 0; i < picked.length; i++) {
    const base = picked[i]
    const key = base.components
      .map((c) => c.tobaccoId)
      .sort()
      .join("-")
    if (seen.has(key) && result.length > 0) continue
    seen.add(key)

    const variantType = variants[Math.min(i, variants.length - 1)]
    result.push({
      ...base,
      variantType,
      score: Math.max(0, base.score + biases[i]),
      name: buildMixName(
        base.components.map((c) => ({ tobaccoId: c.tobaccoId })),
        variantType
      ),
      id: `${variantType}-${key}`,
    })
  }

  while (result.length < 3 && unique.length > result.length) {
    const next = unique[result.length]
    const key = next.components
      .map((c) => c.tobaccoId)
      .sort()
      .join("-")
    if (seen.has(key)) break
    seen.add(key)
    const variantType = variants[result.length]
    result.push({
      ...next,
      variantType,
      score: Math.max(0, next.score + biases[result.length]),
      name: buildMixName(
        next.components.map((c) => ({ tobaccoId: c.tobaccoId })),
        variantType
      ),
      id: `${variantType}-${key}`,
    })
  }

  return result.slice(0, 3)
}

export function findReplacement(
  missing: TobaccoCandidate,
  pool: TobaccoCandidate[],
  usedIds: Set<string>
): TobaccoCandidate | null {
  const candidates = pool
    .filter((t) => !usedIds.has(t.id))
    .filter((t) => (t.gramsAvailable ?? 0) > 0)
    .map((t) => ({
      tobacco: t,
      distance:
        Math.abs(t.profile.sweetness - missing.profile.sweetness) +
        Math.abs(t.profile.fruity - missing.profile.fruity) +
        Math.abs(t.profile.sourness - missing.profile.sourness) +
        Math.abs(t.profile.cold - missing.profile.cold),
    }))
    .sort((a, b) => a.distance - b.distance)

  return candidates[0]?.tobacco ?? null
}
