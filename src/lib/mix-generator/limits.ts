import { TobaccoCandidate } from "@/types"
import { InventoryLimits } from "./types"

const COLD_ACCENT_NAME =
  /supernova|super\s*nova|супернова|айс\b|ice\b|freeze|frost|mint|мят|холод|shock/i

export function isColdAccentTobacco(tobacco: TobaccoCandidate): boolean {
  if (tobacco.profile.cold >= 4) return true
  if (COLD_ACCENT_NAME.test(tobacco.name)) return true
  return tobacco.tags.some((t) => /cold|mint|мят|холод|ice/i.test(t)) && tobacco.profile.cold >= 3
}

export function getDefaultLimits(tobacco: TobaccoCandidate): InventoryLimits {
  if (isColdAccentTobacco(tobacco)) {
    return { minMixGrams: 0.3, maxMixGrams: null }
  }
  if (tobacco.profile.intensity >= 4.5 && tobacco.profile.cold >= 3) {
    return { minMixGrams: 0.5, maxMixGrams: null }
  }
  return { minMixGrams: 1, maxMixGrams: null }
}

export function getAvailableGrams(tobacco: TobaccoCandidate): number {
  return tobacco.gramsAvailable ?? Number.POSITIVE_INFINITY
}
