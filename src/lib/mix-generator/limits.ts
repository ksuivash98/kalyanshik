import { TobaccoCandidate } from "@/types"
import { InventoryLimits } from "./types"

/** Concentrated cold add-ins (SuperNova-like), not regular mint/fruit-ice flavors. */
const COLD_CONCENTRATE_NAME =
  /supernova|super\s*nova|супернова|nano\s*ice|абсолют|absolute\s*zero/i

export function isColdAccentTobacco(tobacco: TobaccoCandidate): boolean {
  if (COLD_CONCENTRATE_NAME.test(tobacco.name)) return true
  // Ultra-cold catalog entries used as tiny accents
  if (tobacco.profile.cold >= 5 && tobacco.tags.includes("cold") && tobacco.profile.fruity <= 1) {
    return true
  }
  return false
}

export function isMintyTobacco(tobacco: TobaccoCandidate): boolean {
  if (/мят|mint/i.test(tobacco.name)) return true
  return tobacco.tags.some((t) => /мят|mint/i.test(t))
}

export function isColdProfileTobacco(tobacco: TobaccoCandidate): boolean {
  if (isColdAccentTobacco(tobacco)) return true
  if (tobacco.profile.cold >= 3) return true
  return tobacco.tags.some((t) => /cold|холод|ice|frost|freeze/i.test(t))
}

export function getDefaultLimits(tobacco: TobaccoCandidate): InventoryLimits {
  if (isColdAccentTobacco(tobacco)) {
    return { minMixGrams: 0.3, maxMixGrams: null }
  }
  if (tobacco.profile.intensity >= 4.5 && tobacco.profile.cold >= 4) {
    return { minMixGrams: 0.5, maxMixGrams: null }
  }
  return { minMixGrams: 1, maxMixGrams: null }
}

export function normalizeGramsAvailable(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."))
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

export function getAvailableGrams(tobacco: TobaccoCandidate): number {
  const n = normalizeGramsAvailable(tobacco.gramsAvailable)
  return n === null ? Number.POSITIVE_INFINITY : n
}
