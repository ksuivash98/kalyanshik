import { MixStrategyId, PercentPlan } from "./types"

function plan(
  strategy: MixStrategyId,
  percents: number[],
  roles: PercentPlan["roles"]
): PercentPlan {
  return { strategy, percents, roles }
}

/** Strategy percent templates keyed by tobacco count. */
export function getStrategyPlans(
  strategy: MixStrategyId,
  count: number
): PercentPlan[] {
  if (strategy === "simple") {
    if (count === 2) return [plan("simple", [70, 30], ["base", "support"])]
    if (count === 3)
      return [plan("simple", [60, 25, 15], ["base", "support", "accent"])]
    if (count === 4)
      return [plan("simple", [55, 25, 12, 8], ["base", "support", "support", "accent"])]
    return [plan("simple", [50, 20, 15, 10, 5], ["base", "support", "support", "accent", "accent"])]
  }

  if (strategy === "dominant") {
    if (count === 2) return [plan("dominant", [65, 35], ["base", "support"])]
    if (count === 3)
      return [plan("dominant", [60, 25, 15], ["base", "support", "accent"])]
    if (count === 4)
      return [plan("dominant", [55, 25, 12, 8], ["base", "support", "support", "accent"])]
    return [plan("dominant", [50, 22, 14, 8, 6], ["base", "support", "support", "accent", "accent"])]
  }

  if (strategy === "complex") {
    if (count === 2) return [plan("complex", [55, 45], ["base", "support"])]
    if (count === 3)
      return [plan("complex", [40, 35, 25], ["base", "support", "accent"])]
    if (count === 4)
      return [plan("complex", [30, 25, 25, 20], ["base", "support", "support", "accent"])]
    return [plan("complex", [30, 25, 20, 15, 10], ["base", "support", "support", "accent", "accent"])]
  }

  if (strategy === "experimental") {
    if (count === 2)
      return [
        plan("experimental", [55, 45], ["base", "support"]),
        plan("experimental", [50, 50], ["base", "support"]),
      ]
    if (count === 3)
      return [
        plan("experimental", [40, 35, 25], ["base", "support", "accent"]),
        plan("experimental", [45, 30, 25], ["base", "support", "accent"]),
      ]
    if (count === 4)
      return [
        plan("experimental", [35, 25, 25, 15], ["base", "support", "support", "accent"]),
        plan("experimental", [30, 30, 25, 15], ["base", "support", "support", "accent"]),
      ]
    return [
      plan("experimental", [28, 24, 20, 16, 12], ["base", "support", "support", "accent", "accent"]),
    ]
  }

  if (strategy === "leftovers") {
    // Percents will often be overridden by leftover-first allocation.
    if (count === 2) return [plan("leftovers", [50, 50], ["base", "support"])]
    if (count === 3)
      return [plan("leftovers", [45, 35, 20], ["base", "support", "accent"])]
    if (count === 4)
      return [plan("leftovers", [40, 30, 20, 10], ["base", "support", "support", "accent"])]
    return [plan("leftovers", [35, 25, 20, 12, 8], ["base", "support", "support", "accent", "accent"])]
  }

  // balanced (default)
  if (count === 2) return [plan("balanced", [60, 40], ["base", "support"])]
  if (count === 3)
    return [
      plan("balanced", [45, 30, 25], ["base", "support", "accent"]),
      plan("balanced", [50, 30, 20], ["base", "support", "accent"]),
    ]
  if (count === 4)
    return [
      plan("balanced", [40, 30, 20, 10], ["base", "support", "support", "accent"]),
      plan("balanced", [40, 25, 20, 15], ["base", "support", "support", "accent"]),
    ]
  return [
    plan("balanced", [40, 25, 15, 12, 8], ["base", "support", "support", "accent", "accent"]),
  ]
}

export function strategiesForMode(mode: string): MixStrategyId[] {
  if (mode === "dominant") return ["dominant", "simple", "balanced"]
  if (mode === "experimental") return ["experimental", "complex", "balanced"]
  if (mode === "leftovers") return ["leftovers", "simple", "balanced"]
  return ["balanced", "simple", "dominant", "complex"]
}
