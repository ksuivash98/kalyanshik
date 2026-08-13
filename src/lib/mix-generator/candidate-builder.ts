import { FlavorDirection, MixStrategyId, PercentPlan, RankedCandidate } from "./types"
import { DIRECTION_PRIORITY } from "./flavor-compatibility"
import { getStrategyPlans } from "./mix-strategies"
import { calculateGrams, percentsFromGrams } from "./gram-calculator"
import { isColdAcceptable } from "./cold-calculator"
import { blendCandidateProfile } from "./diversity-filter"
import { scoreMixCandidate } from "./mix-scorer"
import { BuiltMixCandidate } from "./types"
import { PreferenceTag } from "@/types"

function combinations<T>(items: T[], size: number, limit: number): T[][] {
  if (size <= 0 || items.length < size) return []
  const results: T[][] = []
  function walk(start: number, path: T[]) {
    if (results.length >= limit) return
    if (path.length === size) {
      results.push([...path])
      return
    }
    for (let i = start; i < items.length; i++) {
      path.push(items[i])
      walk(i + 1, path)
      path.pop()
      if (results.length >= limit) return
    }
  }
  walk(0, [])
  return results
}

function orderByRoleFitness(combo: RankedCandidate[]): RankedCandidate[] {
  return [...combo].sort((a, b) => {
    const score = (t: RankedCandidate) =>
      t.profile.intensity * 0.35 +
      t.profile.fruity * 0.25 +
      t.profile.sweetness * 0.2 +
      t.fitness * 0.2
    return score(b) - score(a)
  })
}

function tryBuild(
  ordered: RankedCandidate[],
  plan: PercentPlan,
  bowlSize: number,
  preferences: PreferenceTag[],
  targetCold: number,
  experimentalBias: number,
  leftoversBias: number,
  direction: FlavorDirection
): BuiltMixCandidate | null {
  // For cold accents in last slot, optionally shrink percent toward suggested band
  let percents = [...plan.percents]
  const last = ordered[ordered.length - 1]
  if (last?.isColdAccent && targetCold > 0) {
    const accentMax = targetCold <= 1 ? 1 : targetCold <= 2 ? 3 : targetCold <= 3 ? 6 : 10
    if (percents[percents.length - 1] > accentMax) {
      const excess = percents[percents.length - 1] - accentMax
      percents[percents.length - 1] = accentMax
      percents[0] += excess
    }
  }
  if (last?.isColdAccent && targetCold <= 0) return null

  if (!isColdAcceptable(ordered, percents, targetCold)) return null

  const grams = calculateGrams(ordered, percents, bowlSize)
  if (!grams) return null

  // Recompute percents from final grams for consistency
  const finalPercents = percentsFromGrams(grams, bowlSize)
  if (!isColdAcceptable(ordered, finalPercents, targetCold)) return null

  const profile = blendCandidateProfile(ordered, finalPercents)
  const scores = scoreMixCandidate({
    tobaccos: ordered,
    percents: finalPercents,
    grams,
    preferences,
    targetCold,
    experimentalBias,
    leftoversBias,
  })

  return {
    strategy: plan.strategy,
    direction,
    tobaccos: ordered,
    percents: finalPercents,
    roles: plan.roles,
    grams,
    profile,
    score: scores.total,
    scoreBreakdown: scores,
  }
}

function leftoverFirstGrams(
  ordered: RankedCandidate[],
  bowlSize: number
): number[] | null {
  // Use as much of the smallest stocks as practical accents/supports
  const stocks = ordered.map((t) => t.gramsAvailable ?? bowlSize)
  const mins = ordered.map((t) => t.limits.minMixGrams)
  if (stocks.reduce((s, g) => s + g, 0) < bowlSize - 0.05) return null

  const grams = ordered.map(() => 0)
  let remaining = bowlSize

  // First assign min to everyone if possible
  for (let i = 0; i < ordered.length; i++) {
    if (stocks[i] < mins[i]) return null
    grams[i] = mins[i]
    remaining -= mins[i]
  }
  if (remaining < -0.05) return null

  // Prefer filling small leftovers next
  const orderIdx = [...ordered.keys()].sort((a, b) => stocks[a] - stocks[b])
  for (const i of orderIdx) {
    if (remaining <= 0) break
    const room = stocks[i] - grams[i]
    const take = Math.min(room, remaining)
    grams[i] += take
    remaining -= take
  }

  if (remaining > 0.05) return null
  return grams.map((g) => Math.round(g * 10) / 10)
}

export function buildCandidates(input: {
  pool: RankedCandidate[]
  tobaccoCount: number
  bowlSize: number
  strategies: MixStrategyId[]
  preferences: PreferenceTag[]
  targetCold: number
  mode: string
  comboLimit?: number
}): BuiltMixCandidate[] {
  const {
    pool,
    tobaccoCount,
    bowlSize,
    strategies,
    preferences,
    targetCold,
    mode,
  } = input
  const comboLimit = input.comboLimit ?? 220
  const results: BuiltMixCandidate[] = []
  const seen = new Set<string>()

  const experimentalBias = mode === "experimental" ? 0.8 : 0.15
  const leftoversBias = mode === "leftovers" ? 1 : 0.1

  // Direction-aware pools to force variety of flavor directions
  const byDirection = new Map<FlavorDirection, RankedCandidate[]>()
  for (const d of DIRECTION_PRIORITY) byDirection.set(d, [])
  for (const t of pool) {
    const list = byDirection.get(t.direction) ?? []
    list.push(t)
    byDirection.set(t.direction, list)
  }

  const baseCombos = combinations(pool.slice(0, Math.min(pool.length, 24)), tobaccoCount, comboLimit)

  // Also build directed combos: seed from different directions
  const directed: RankedCandidate[][] = []
  for (const direction of DIRECTION_PRIORITY) {
    const seeds = (byDirection.get(direction) ?? []).slice(0, 4)
    for (const seed of seeds) {
      const rest = pool.filter((t) => t.id !== seed.id).slice(0, 18)
      const restCombos = combinations(rest, tobaccoCount - 1, 40)
      for (const restCombo of restCombos) {
        directed.push([seed, ...restCombo])
        if (directed.length > 120) break
      }
      if (directed.length > 120) break
    }
  }

  const allCombos = [...directed, ...baseCombos]

  for (const combo of allCombos) {
    if (combo.length !== tobaccoCount) continue
    // At most one strong cold accent
    const accents = combo.filter((t) => t.isColdAccent)
    if (accents.length > 1) continue
    if (targetCold <= 0 && accents.length > 0) continue

    const ordered = orderByRoleFitness(combo)
    // Put cold accent last
    ordered.sort((a, b) => Number(a.isColdAccent) - Number(b.isColdAccent))

    const direction = ordered[0]?.direction ?? "experimental"
    const keyBase = ordered
      .map((t) => t.id)
      .sort()
      .join("|")

    for (const strategy of strategies) {
      const plans = getStrategyPlans(strategy, tobaccoCount)
      for (const plan of plans) {
        let built: BuiltMixCandidate | null = null

        if (strategy === "leftovers" || mode === "leftovers") {
          const lg = leftoverFirstGrams(ordered, bowlSize)
          if (lg) {
            const percents = percentsFromGrams(lg, bowlSize)
            if (isColdAcceptable(ordered, percents, targetCold)) {
              const profile = blendCandidateProfile(ordered, percents)
              const scores = scoreMixCandidate({
                tobaccos: ordered,
                percents,
                grams: lg,
                preferences,
                targetCold,
                experimentalBias,
                leftoversBias: 1,
              })
              built = {
                strategy: "leftovers",
                direction,
                tobaccos: ordered,
                percents,
                roles: plan.roles,
                grams: lg,
                profile,
                score: scores.total + 0.05,
                scoreBreakdown: scores,
              }
            }
          }
        }

        if (!built) {
          built = tryBuild(
            ordered,
            plan,
            bowlSize,
            preferences,
            targetCold,
            experimentalBias,
            leftoversBias,
            direction
          )
        }

        if (!built) continue
        const key = `${built.strategy}:${keyBase}:${built.percents.join(",")}`
        if (seen.has(key)) continue
        seen.add(key)
        results.push(built)
      }
    }
  }

  return results
}
