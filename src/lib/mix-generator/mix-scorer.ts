import { PreferenceTag } from "@/types"
import { preferenceScoreForMix } from "./inventory-filter"
import { comboCompatibility } from "./flavor-compatibility"
import { coldScore, estimateMixCold } from "./cold-calculator"
import { BuiltMixCandidate, RankedCandidate } from "./types"

export function inventoryScore(
  tobaccos: RankedCandidate[],
  grams: number[]
): number {
  let score = 1
  for (let i = 0; i < tobaccos.length; i++) {
    const available = tobaccos[i].gramsAvailable
    if (available === null) continue
    if (grams[i] > available + 1e-9) return 0
    const ratio = grams[i] / Math.max(available, 0.1)
    // Prefer not emptying everything unless leftovers mode
    if (ratio > 0.95) score -= 0.05
    else if (ratio < 0.2) score += 0.02
  }
  return Math.max(0, Math.min(1, score))
}

export function practicalityScore(
  tobaccos: RankedCandidate[],
  grams: number[]
): number {
  let score = 1
  for (let i = 0; i < grams.length; i++) {
    if (grams[i] < 0.2) score -= 0.5
    else if (grams[i] < tobaccos[i].limits.minMixGrams) score -= 0.4
    else if (grams[i] < 0.5 && !tobaccos[i].isColdAccent) score -= 0.15
  }
  return Math.max(0, score)
}

export function leftoversBonus(
  tobaccos: RankedCandidate[],
  grams: number[]
): number {
  let usedSmall = 0
  let smallCount = 0
  for (let i = 0; i < tobaccos.length; i++) {
    const available = tobaccos[i].gramsAvailable
    if (available === null || available > 10) continue
    smallCount++
    if (grams[i] >= Math.min(available, tobaccos[i].limits.minMixGrams)) {
      usedSmall++
    }
  }
  if (smallCount === 0) return 0
  return usedSmall / smallCount
}

export function scoreMixCandidate(input: {
  tobaccos: RankedCandidate[]
  percents: number[]
  grams: number[]
  preferences: PreferenceTag[]
  targetCold: number
  experimentalBias: number
  leftoversBias: number
}): BuiltMixCandidate["scoreBreakdown"] & { total: number } {
  const { tobaccos, percents, grams, preferences, targetCold } = input
  const inventory = inventoryScore(tobaccos, grams)
  const preference = preferenceScoreForMix(tobaccos, percents, preferences)
  const compatibility = comboCompatibility(tobaccos)
  const cold = coldScore(estimateMixCold(tobaccos, percents), targetCold)
  const practicality = practicalityScore(tobaccos, grams)
  const experimental =
    input.experimentalBias > 0
      ? Math.max(0, 1 - compatibility) * input.experimentalBias
      : 0
  const leftovers =
    input.leftoversBias > 0
      ? leftoversBonus(tobaccos, grams) * input.leftoversBias
      : 0

  const diversity = 0 // filled later relative to selected set

  const total =
    inventory * 0.22 +
    preference * 0.18 +
    compatibility * (input.experimentalBias > 0 ? 0.1 : 0.2) +
    cold * 0.2 +
    practicality * 0.12 +
    experimental * 0.1 +
    leftovers * 0.15 +
    diversity * 0.08

  return {
    inventory,
    preference,
    compatibility,
    cold,
    diversity,
    practicality,
    experimental,
    total: Math.max(0, Math.min(1.5, total)),
  }
}
