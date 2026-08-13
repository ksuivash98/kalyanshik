import {
  ExclusionTag,
  FlavorProfile,
  PreferenceTag,
  TobaccoCandidate,
} from "@/types"
import { scoreProfileMatch } from "@/lib/recommendations/profile"
import { classifyDirection } from "./flavor-compatibility"
import {
  getDefaultLimits,
  isColdAccentTobacco,
  isMintyTobacco,
  normalizeGramsAvailable,
} from "./limits"
import { RankedCandidate } from "./types"

export type RejectReason =
  | "INSUFFICIENT_GRAMS"
  | "EXCLUDED_BY_USER"
  | "INVALID_QUANTITY"
  | "COLD_ACCENT_BLOCKED"
  | "OK"

export type CandidateDebug = {
  tobacco: string
  tobaccoId: string
  quantityInCollection: number | null
  inventoryPass: boolean
  exclusionPass: boolean
  coldPass: boolean
  rejected: boolean
  reason: RejectReason | string
}

const EXCLUSION_RULES: Record<
  ExclusionTag,
  (tobacco: TobaccoCandidate) => boolean
> = {
  // Mint only — do NOT treat "cold" tags as mint
  "без мяты": (t) => !isMintyTobacco(t),
  "без аниса": (t) =>
    !t.tags.some((tag) => /анис|anise/i.test(tag)) && !/анис|anise/i.test(t.name),
  "без цитруса": (t) =>
    !t.tags.some((tag) =>
      /цитрус|лимон|лайм|апельсин|грейпфрут|citrus|lemon|lime|orange|grapefruit/i.test(
        tag
      )
    ) &&
    !/цитрус|лимон|лайм|апельсин|грейпфрут|citrus|lemon|lime|orange|grapefruit/i.test(
      t.name
    ),
  "без сладости": (t) => t.profile.sweetness <= 2,
  "без холода": (t) =>
    t.profile.cold <= 1 &&
    !t.tags.some((tag) => /cold|холод|mint|мят|ice|frost/i.test(tag)) &&
    !isColdAccentTobacco(t),
}

export const PREFERENCE_BOOST: Record<PreferenceTag, (t: TobaccoCandidate) => number> = {
  фруктовый: (t) => (t.profile.fruity >= 3 ? 0.1 : 0),
  ягодный: (t) =>
    t.tags.some((x) => /berry|ягод|strawberry|raspberry|blueberry|cherry/i.test(x))
      ? 0.12
      : 0,
  цитрусовый: (t) =>
    t.tags.some((x) => /citrus|lemon|lime|orange|grapefruit/i.test(x)) ||
    /лимон|лайм|цитрус|апельсин|грейпфрут/i.test(t.name)
      ? 0.12
      : 0,
  сладкий: (t) => (t.profile.sweetness >= 3 ? 0.08 : 0),
  кислый: (t) => (t.profile.sourness >= 3 ? 0.1 : 0),
  десертный: (t) => (t.profile.dessert >= 3 ? 0.12 : 0),
  напиток: (t) =>
    t.tags.some((x) => /cola|tea|coffee|drink|lemonade|mojito/i.test(x)) ? 0.12 : 0,
  свежий: (t) => (t.profile.cold >= 2 ? 0.06 : 0),
  пряный: (t) => (t.profile.spicy >= 2 ? 0.1 : 0),
  травянистый: (t) => (t.profile.herbal >= 2 ? 0.1 : 0),
}

export function normalizeCandidate(tobacco: TobaccoCandidate): TobaccoCandidate {
  return {
    ...tobacco,
    gramsAvailable: normalizeGramsAvailable(tobacco.gramsAvailable as number | string | null),
  }
}

/**
 * HARD inventory + exclusions only.
 * Preferences and target cold are NOT hard filters here.
 * Tobaccos with grams < bowlSize are kept (they can be partial components).
 */
export function filterInventory(
  candidates: TobaccoCandidate[],
  options: {
    exclusions: ExclusionTag[]
    requireStock: boolean
    bowlSize: number
    tobaccoCount: number
    targetCold: number
  }
): { passed: RankedCandidate[]; debug: CandidateDebug[] } {
  const debug: CandidateDebug[] = []
  const passed: RankedCandidate[] = []

  for (const raw of candidates) {
    const tobacco = normalizeCandidate(raw)
    const limits = getDefaultLimits(tobacco)
    const qty = tobacco.gramsAvailable
    let reason: RejectReason = "OK"
    let inventoryPass = true
    let exclusionPass = true
    let coldPass = true

    if (options.requireStock) {
      if (qty === null) {
        inventoryPass = false
        reason = "INVALID_QUANTITY"
      } else if (qty + 1e-9 < limits.minMixGrams) {
        // Only reject if less than minimum practical dose — NOT if < bowlSize
        inventoryPass = false
        reason = "INSUFFICIENT_GRAMS"
      }
    }

    for (const exclusion of options.exclusions) {
      if (!EXCLUSION_RULES[exclusion](tobacco)) {
        exclusionPass = false
        reason = "EXCLUDED_BY_USER"
        break
      }
    }

    // Only hard-block concentrated cold accents when target cold is 0
    // (or exclusion "без холода" already handled above)
    if (options.targetCold <= 0 && isColdAccentTobacco(tobacco)) {
      coldPass = false
      if (reason === "OK") reason = "COLD_ACCENT_BLOCKED"
    }

    const rejected = !inventoryPass || !exclusionPass || !coldPass
    debug.push({
      tobacco: `${tobacco.brandName} ${tobacco.name}`,
      tobaccoId: tobacco.id,
      quantityInCollection: qty,
      inventoryPass,
      exclusionPass,
      coldPass,
      rejected,
      reason: rejected ? reason : "OK",
    })

    if (rejected) continue

    passed.push({
      ...tobacco,
      fitness: scoreProfileMatch(tobacco.profile, {
        strength: 3,
        cold: options.targetCold,
        sweetness: 3,
        sourness: 2,
        fruity: 3,
        dessert: 2,
        spicy: 1,
        herbal: 1,
        intensity: 3,
      } satisfies FlavorProfile),
      direction: classifyDirection(tobacco),
      isColdAccent: isColdAccentTobacco(tobacco),
      limits,
    })
  }

  return { passed, debug }
}

/** Soft ranking only — never drops candidates for missing preference tags. */
export function applyPreferenceFilter(
  ranked: RankedCandidate[],
  preferences: PreferenceTag[],
  target: FlavorProfile
): RankedCandidate[] {
  return ranked
    .map((tobacco) => {
      let fitness = scoreProfileMatch(tobacco.profile, target)
      for (const pref of preferences) {
        const boost = PREFERENCE_BOOST[pref]
        if (boost) fitness += boost(tobacco)
      }
      if ((tobacco.gramsAvailable ?? 99) <= 8) fitness += 0.02
      return { ...tobacco, fitness: Math.min(1.35, fitness) }
    })
    .sort((a, b) => b.fitness - a.fitness)
}

export function preferenceScoreForMix(
  tobaccos: RankedCandidate[],
  percents: number[],
  preferences: PreferenceTag[]
): number {
  if (preferences.length === 0) return 0.7
  let score = 0
  for (let i = 0; i < tobaccos.length; i++) {
    let local = 0
    for (const pref of preferences) {
      const boost = PREFERENCE_BOOST[pref]
      local += boost && boost(tobaccos[i]) > 0 ? 1 : 0
    }
    // Soft: reward any overlap, don't require all prefs
    score += Math.min(1, local / Math.min(3, preferences.length)) * (percents[i] / 100)
  }
  return Math.min(1, score)
}
