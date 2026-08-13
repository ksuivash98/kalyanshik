import { FlavorProfile } from "@/types"
import { RankedCandidate } from "./types"
import { isColdAccentTobacco } from "./limits"

/** Expected cold contribution guidelines for SuperNova-like accents (percent of bowl). */
export function suggestedColdAccentPercent(targetCold: number): { min: number; max: number } {
  if (targetCold <= 0) return { min: 0, max: 0 }
  if (targetCold === 1) return { min: 0, max: 1 }
  if (targetCold === 2) return { min: 1, max: 3 }
  if (targetCold === 3) return { min: 3, max: 6 }
  if (targetCold === 4) return { min: 6, max: 10 }
  return { min: 8, max: 15 }
}

export function estimateMixCold(
  tobaccos: Array<{ profile: FlavorProfile }>,
  percents: number[]
): number {
  let cold = 0
  for (let i = 0; i < tobaccos.length; i++) {
    cold += tobaccos[i].profile.cold * (percents[i] / 100)
  }
  return Math.round(cold * 10) / 10
}

export function coldScore(actualCold: number, targetCold: number): number {
  const distance = Math.abs(actualCold - targetCold)
  return Math.max(0, 1 - distance / 5)
}

/**
 * HARD cold rules only:
 * - target 0 / exclusion path: no concentrated cold accents
 * Soft cold matching is handled by scoring, not rejection.
 */
export function isColdHardReject(
  tobaccos: RankedCandidate[],
  percents: number[],
  targetCold: number
): boolean {
  if (targetCold > 0) return false
  return tobaccos.some((t, i) => isColdAccentTobacco(t) && percents[i] > 0)
}

/** @deprecated use isColdHardReject + coldScore — kept for soft guidance only */
export function isColdAcceptable(
  tobaccos: RankedCandidate[],
  percents: number[],
  targetCold: number
): boolean {
  return !isColdHardReject(tobaccos, percents, targetCold)
}
