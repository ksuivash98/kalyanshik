import {
  ExclusionTag,
  FlavorProfile,
  PreferenceTag,
  TobaccoCandidate,
} from "@/types"
import { scoreProfileMatch } from "./profile"

const EXCLUSION_RULES: Record<
  ExclusionTag,
  (tobacco: TobaccoCandidate) => boolean
> = {
  "без мяты": (t) =>
    !t.tags.some((tag) => /мят|mint|холод/i.test(tag)) && t.profile.cold < 4,
  "без аниса": (t) => !t.tags.some((tag) => /анис|anise|лик[её]р/i.test(tag)),
  "без цитруса": (t) =>
    !t.tags.some((tag) => /цитрус|лимон|лайм|апельсин|грейпфрут/i.test(tag)),
  "без сладости": (t) => t.profile.sweetness <= 2,
  "без холода": (t) => t.profile.cold <= 1,
}

const PREFERENCE_BOOST: Record<PreferenceTag, (t: TobaccoCandidate) => number> = {
  фруктовый: (t) => (t.profile.fruity >= 3 || t.tags.includes("фруктовый") ? 0.08 : 0),
  ягодный: (t) => (t.tags.includes("ягодный") ? 0.1 : 0),
  цитрусовый: (t) => (t.tags.includes("цитрусовый") ? 0.1 : 0),
  сладкий: (t) => (t.profile.sweetness >= 3 ? 0.08 : 0),
  кислый: (t) => (t.profile.sourness >= 3 ? 0.08 : 0),
  десертный: (t) => (t.profile.dessert >= 3 || t.tags.includes("десертный") ? 0.1 : 0),
  напиток: (t) => (t.tags.includes("напиток") ? 0.1 : 0),
  свежий: (t) => (t.tags.includes("свежий") || t.profile.cold >= 2 ? 0.06 : 0),
  пряный: (t) => (t.profile.spicy >= 2 || t.tags.includes("пряный") ? 0.08 : 0),
  травянистый: (t) =>
    t.profile.herbal >= 2 || t.tags.includes("травянистый") ? 0.08 : 0,
}

export function filterCandidates(
  candidates: TobaccoCandidate[],
  options: {
    exclusions: ExclusionTag[]
    requireStock: boolean
    minGrams?: number
  }
): TobaccoCandidate[] {
  return candidates.filter((tobacco) => {
    if (options.requireStock) {
      const min = options.minGrams ?? 1
      if (tobacco.gramsAvailable === null || tobacco.gramsAvailable < min) {
        return false
      }
    }

    for (const exclusion of options.exclusions) {
      if (!EXCLUSION_RULES[exclusion](tobacco)) {
        return false
      }
    }

    return true
  })
}

export function rankCandidates(
  candidates: TobaccoCandidate[],
  target: FlavorProfile,
  preferences: PreferenceTag[]
): Array<TobaccoCandidate & { fitness: number }> {
  return candidates
    .map((tobacco) => {
      let fitness = scoreProfileMatch(tobacco.profile, target)
      for (const pref of preferences) {
        fitness += PREFERENCE_BOOST[pref](tobacco)
      }
      return { ...tobacco, fitness: Math.min(fitness, 1) }
    })
    .sort((a, b) => b.fitness - a.fitness)
}
