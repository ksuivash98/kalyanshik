import { FlavorProfile } from "@/types"
import { blendProfiles, profileDistance } from "@/lib/recommendations/profile"
import { BuiltMixCandidate } from "./types"

export type MixIdentity = {
  tobaccoIds: string[]
  percents?: number[]
  profile?: FlavorProfile
}

/**
 * Similarity 0..1 where 1 = identical mixes.
 * Considers shared ingredients, percent overlap, and profile distance.
 */
export function calculateMixSimilarity(a: MixIdentity, b: MixIdentity): number {
  const setA = new Set(a.tobaccoIds)
  const setB = new Set(b.tobaccoIds)
  const intersection = [...setA].filter((id) => setB.has(id))
  const union = new Set([...a.tobaccoIds, ...b.tobaccoIds])
  const jaccard = union.size === 0 ? 0 : intersection.length / union.size

  let percentSim = jaccard
  if (a.percents && b.percents && a.tobaccoIds.length === a.percents.length) {
    const mapA = new Map(a.tobaccoIds.map((id, i) => [id, a.percents![i]]))
    const mapB = new Map(b.tobaccoIds.map((id, i) => [id, b.percents![i]]))
    let shared = 0
    let total = 0
    for (const id of union) {
      const pa = mapA.get(id) ?? 0
      const pb = mapB.get(id) ?? 0
      shared += Math.min(pa, pb)
      total += Math.max(pa, pb)
    }
    percentSim = total === 0 ? 0 : shared / total
  }

  let profileSim = 0.5
  if (a.profile && b.profile) {
    const dist = profileDistance(a.profile, b.profile)
    profileSim = Math.max(0, 1 - dist / 3)
  }

  // Ingredient overlap dominates — changing only 1 of 3 is still very similar
  const changed = union.size - intersection.length
  const changePenalty =
    a.tobaccoIds.length <= 3 && changed <= 1
      ? 0.25
      : a.tobaccoIds.length >= 4 && changed <= 1
        ? 0.2
        : 0

  return Math.min(
    1,
    jaccard * 0.45 + percentSim * 0.35 + profileSim * 0.2 + changePenalty
  )
}

export function filterByDiversity(
  candidates: BuiltMixCandidate[],
  options: {
    limit: number
    threshold?: number
    recent?: MixIdentity[]
    minComponentChanges?: number
  }
): BuiltMixCandidate[] {
  const threshold = options.threshold ?? 0.72
  const minChanges = options.minComponentChanges ?? 2
  const selected: BuiltMixCandidate[] = []

  const sorted = [...candidates].sort((a, b) => b.score - a.score)

  for (const candidate of sorted) {
    if (selected.length >= options.limit) break

    const identity: MixIdentity = {
      tobaccoIds: candidate.tobaccos.map((t) => t.id),
      percents: candidate.percents,
      profile: candidate.profile,
    }

    // Skip if too close to a recent prepared mix
    if (
      options.recent?.some(
        (r) => calculateMixSimilarity(identity, r) >= threshold
      )
    ) {
      continue
    }

    let ok = true
    for (const prev of selected) {
      const prevIdentity: MixIdentity = {
        tobaccoIds: prev.tobaccos.map((t) => t.id),
        percents: prev.percents,
        profile: prev.profile,
      }
      const sim = calculateMixSimilarity(identity, prevIdentity)
      if (sim >= threshold) {
        ok = false
        break
      }
      const shared = identity.tobaccoIds.filter((id) =>
        prevIdentity.tobaccoIds.includes(id)
      ).length
      const changes =
        identity.tobaccoIds.length + prevIdentity.tobaccoIds.length - 2 * shared
      // Prefer at least ~2 component changes when possible
      if (
        selected.length > 0 &&
        changes < minChanges &&
        selected.length < Math.ceil(options.limit / 2)
      ) {
        // Soft reject early slots; allow later if pool is thin
        ok = false
        break
      }
    }
    if (ok) selected.push(candidate)
  }

  // If diversity was too strict, fill remaining with next-best not already selected
  if (selected.length < options.limit) {
    for (const candidate of sorted) {
      if (selected.length >= options.limit) break
      if (selected.includes(candidate)) continue
      const identity: MixIdentity = {
        tobaccoIds: candidate.tobaccos.map((t) => t.id),
        percents: candidate.percents,
        profile: candidate.profile,
      }
      const tooClose = selected.some((prev) => {
        const sim = calculateMixSimilarity(identity, {
          tobaccoIds: prev.tobaccos.map((t) => t.id),
          percents: prev.percents,
          profile: prev.profile,
        })
        return sim >= 0.92
      })
      if (!tooClose) selected.push(candidate)
    }
  }

  return selected
}

export function blendCandidateProfile(
  tobaccos: BuiltMixCandidate["tobaccos"],
  percents: number[]
): FlavorProfile {
  return blendProfiles(
    tobaccos.map((t, i) => ({ profile: t.profile, percent: percents[i] }))
  )
}
