import {
  MixRequest,
  MixSuggestion,
  TobaccoCandidate,
} from "@/types"
import {
  generateMixesWithMeta,
  recommendMixes as generateRecommend,
} from "@/lib/mix-generator"

export function recommendMixes(
  candidates: TobaccoCandidate[],
  request: MixRequest & {
    mode?: import("@/types").MixGenerationMode
    limit?: number
    recentMixes?: Array<{ tobaccoIds: string[]; percents?: number[] }>
  }
): MixSuggestion[] {
  return generateRecommend(candidates, request)
}

export function recommendMixesDetailed(
  candidates: TobaccoCandidate[],
  request: MixRequest & {
    mode?: import("@/types").MixGenerationMode
    limit?: number
    recentMixes?: Array<{ tobaccoIds: string[]; percents?: number[] }>
  }
) {
  return generateMixesWithMeta(candidates, request)
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
