import {
  ExclusionTag,
  FlavorProfile,
  PreferenceTag,
  TobaccoCandidate,
} from "@/types"
import { scoreProfileMatch } from "@/lib/recommendations/profile"
import { classifyDirection } from "./flavor-compatibility"
import { getDefaultLimits, isColdAccentTobacco } from "./limits"
import { RankedCandidate } from "./types"

const EXCLUSION_RULES: Record<
  ExclusionTag,
  (tobacco: TobaccoCandidate) => boolean
> = {
  "без мяты": (t) =>
    !t.tags.some((tag) => /мят|mint|холод/i.test(tag)) && t.profile.cold < 4,
  "без аниса": (t) => !t.tags.some((tag) => /анис|anise|лик[её]р/i.test(tag)),
  "без цитруса": (t) =>
    !t.tags.some((tag) =>
      /цитрус|лимон|лайм|апельсин|грейпфрут|citrus|lemon|lime|orange|grapefruit/i.test(
        tag
      )
    ),
  "без сладости": (t) => t.profile.sweetness <= 2,
  "без холода": (t) => t.profile.cold <= 1,
}

const PREFERENCE_BOOST: Record<PreferenceTag, (t: TobaccoCandidate) => number> = {
  фруктовый: (t) => (t.profile.fruity >= 3 ? 0.1 : 0),
  ягодный: (t) =>
    t.tags.some((x) => /berry|ягод|strawberry|raspberry|blueberry|cherry/i.test(x))
      ? 0.12
      : 0,
  цитрусовый: (t) =>
    t.tags.some((x) => /citrus|lemon|lime|orange|grapefruit/i.test(x)) ? 0.12 : 0,
  сладкий: (t) => (t.profile.sweetness >= 3 ? 0.08 : 0),
  кислый: (t) => (t.profile.sourness >= 3 ? 0.1 : 0),
  десертный: (t) => (t.profile.dessert >= 3 ? 0.12 : 0),
  напиток: (t) =>
    t.tags.some((x) => /cola|tea|coffee|drink|lemonade|mojito/i.test(x)) ? 0.12 : 0,
  свежий: (t) => (t.profile.cold >= 2 ? 0.06 : 0),
  пряный: (t) => (t.profile.spicy >= 2 ? 0.1 : 0),
  травянистый: (t) => (t.profile.herbal >= 2 ? 0.1 : 0),
}

export function filterInventory(
  candidates: TobaccoCandidate[],
  options: {
    exclusions: ExclusionTag[]
    requireStock: boolean
    bowlSize: number
    tobaccoCount: number
    targetCold: number
  }
): RankedCandidate[] {
  const minUseful = options.requireStock
    ? Math.min(1, options.bowlSize / (options.tobaccoCount * 4))
    : 0

  return candidates
    .filter((tobacco) => {
      const limits = getDefaultLimits(tobacco)
      if (options.requireStock) {
        if (tobacco.gramsAvailable === null) return false
        if (tobacco.gramsAvailable + 1e-9 < Math.max(limits.minMixGrams, minUseful)) {
          return false
        }
      }

      // Cold 0: drop pure cold accents
      if (options.targetCold <= 0 && isColdAccentTobacco(tobacco)) {
        return false
      }

      for (const exclusion of options.exclusions) {
        if (!EXCLUSION_RULES[exclusion](tobacco)) return false
      }
      return true
    })
    .map((tobacco) => {
      let fitness = scoreProfileMatch(tobacco.profile, {
        strength: 3,
        cold: options.targetCold,
        sweetness: 3,
        sourness: 2,
        fruity: 3,
        dessert: 2,
        spicy: 1,
        herbal: 1,
        intensity: 3,
      } satisfies FlavorProfile)
      return {
        ...tobacco,
        fitness,
        direction: classifyDirection(tobacco),
        isColdAccent: isColdAccentTobacco(tobacco),
        limits: getDefaultLimits(tobacco),
      }
    })
}

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
      // Mild leftover boost later in leftovers mode — keep base ranking fair
      if ((tobacco.gramsAvailable ?? 99) <= 8) fitness += 0.02
      return { ...tobacco, fitness: Math.min(1.2, fitness) }
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
    score += (local / preferences.length) * (percents[i] / 100)
  }
  return Math.min(1, score)
}
