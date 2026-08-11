import {
  DEFAULT_WEIGHTS,
  FlavorKey,
  FlavorProfile,
  FLAVOR_KEYS,
  ScoringWeights,
} from "@/types"
import { clamp } from "@/lib/utils"

export function emptyProfile(): FlavorProfile {
  return {
    strength: 0,
    cold: 0,
    sweetness: 0,
    sourness: 0,
    fruity: 0,
    dessert: 0,
    spicy: 0,
    herbal: 0,
    intensity: 0,
  }
}

export function defaultTargetProfile(): FlavorProfile {
  return {
    strength: 3,
    cold: 2,
    sweetness: 3,
    sourness: 2,
    fruity: 3,
    dessert: 2,
    spicy: 1,
    herbal: 1,
    intensity: 3,
  }
}

export function matchScore(actual: number, target: number, max = 5): number {
  const distance = Math.abs(actual - target)
  return clamp(1 - distance / max, 0, 1)
}

export function scoreProfileMatch(
  actual: FlavorProfile,
  target: FlavorProfile,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  let totalWeight = 0
  let weighted = 0

  for (const key of FLAVOR_KEYS) {
    const weight = weights[key] ?? DEFAULT_WEIGHTS[key]
    totalWeight += weight
    weighted += matchScore(actual[key], target[key]) * weight
  }

  if (totalWeight === 0) return 0
  return weighted / totalWeight
}

export function blendProfiles(
  items: Array<{ profile: FlavorProfile; percent: number }>
): FlavorProfile {
  const result = emptyProfile()

  for (const item of items) {
    const weight = item.percent / 100
    for (const key of FLAVOR_KEYS) {
      result[key] += item.profile[key] * weight
    }
  }

  for (const key of FLAVOR_KEYS) {
    result[key] = Math.round(result[key] * 10) / 10
  }

  return result
}

export function profileDistance(
  a: FlavorProfile,
  b: FlavorProfile
): number {
  return (
    FLAVOR_KEYS.reduce((sum, key) => sum + Math.abs(a[key] - b[key]), 0) /
    FLAVOR_KEYS.length
  )
}

export function getDominantTraits(
  profile: FlavorProfile,
  limit = 3
): FlavorKey[] {
  return [...FLAVOR_KEYS]
    .sort((a, b) => profile[b] - profile[a])
    .slice(0, limit)
}
