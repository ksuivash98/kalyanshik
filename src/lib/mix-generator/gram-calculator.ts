import { round1 } from "@/lib/utils"
import { RankedCandidate } from "./types"

/**
 * Convert percents to grams for a bowl, respecting min doses and inventory.
 * Returns null if the plan cannot fit bowl + inventory + min doses.
 */
export function calculateGrams(
  tobaccos: RankedCandidate[],
  percents: number[],
  bowlSize: number
): number[] | null {
  if (tobaccos.length !== percents.length || tobaccos.length === 0) return null

  const percentSum = percents.reduce((s, p) => s + p, 0)
  if (Math.abs(percentSum - 100) > 0.6) return null

  // Initial allocation
  let grams = percents.map((p) => (bowlSize * p) / 100)

  // Enforce minimum practical doses by borrowing from largest slots
  for (let i = 0; i < grams.length; i++) {
    const min = tobaccos[i].limits.minMixGrams
    if (grams[i] + 1e-9 < min) {
      const need = min - grams[i]
      let donor = -1
      let donorSpare = 0
      for (let j = 0; j < grams.length; j++) {
        if (j === i) continue
        const spare = grams[j] - tobaccos[j].limits.minMixGrams
        if (spare > donorSpare) {
          donorSpare = spare
          donor = j
        }
      }
      if (donor < 0 || donorSpare < need - 1e-9) return null
      grams[donor] -= need
      grams[i] = min
    }
  }

  // Cap by inventory / maxMixGrams
  for (let i = 0; i < grams.length; i++) {
    const available = tobaccos[i].gramsAvailable
    const maxCap =
      tobaccos[i].limits.maxMixGrams ?? Number.POSITIVE_INFINITY
    const hardMax =
      available === null
        ? maxCap
        : Math.min(available, maxCap)
    if (grams[i] > hardMax + 1e-9) {
      // Try to redistribute excess to others that have room
      let excess = grams[i] - hardMax
      grams[i] = hardMax
      for (let j = 0; j < grams.length && excess > 1e-9; j++) {
        if (j === i) continue
        const availJ =
          tobaccos[j].gramsAvailable === null
            ? Number.POSITIVE_INFINITY
            : tobaccos[j].gramsAvailable!
        const maxJ = Math.min(
          availJ,
          tobaccos[j].limits.maxMixGrams ?? Number.POSITIVE_INFINITY
        )
        const room = maxJ - grams[j]
        if (room <= 0) continue
        const take = Math.min(room, excess)
        grams[j] += take
        excess -= take
      }
      if (excess > 0.05) return null
    }
  }

  // Normalize to exact bowl size (largest component absorbs rounding)
  const sum = grams.reduce((s, g) => s + g, 0)
  if (sum <= 0) return null
  if (Math.abs(sum - bowlSize) > 0.01) {
    const scale = bowlSize / sum
    grams = grams.map((g) => g * scale)
  }

  // Final inventory check after scale
  for (let i = 0; i < grams.length; i++) {
    const available = tobaccos[i].gramsAvailable
    if (available !== null && grams[i] > available + 0.05) return null
    if (grams[i] + 1e-9 < tobaccos[i].limits.minMixGrams) return null
  }

  // Round to 1 decimal and fix sum drift on the largest slot
  const rounded = grams.map((g) => round1(g))
  const roundedSum = round1(rounded.reduce((s, g) => s + g, 0))
  const drift = round1(bowlSize - roundedSum)
  if (Math.abs(drift) >= 0.1) {
    let largest = 0
    for (let i = 1; i < rounded.length; i++) {
      if (rounded[i] > rounded[largest]) largest = i
    }
    const next = round1(rounded[largest] + drift)
    const avail = tobaccos[largest].gramsAvailable
    if (next < tobaccos[largest].limits.minMixGrams) return null
    if (avail !== null && next > avail + 0.05) return null
    rounded[largest] = next
  }

  const finalSum = round1(rounded.reduce((s, g) => s + g, 0))
  if (Math.abs(finalSum - bowlSize) > 0.15) return null

  return rounded
}

export function percentsFromGrams(grams: number[], bowlSize: number): number[] {
  const raw = grams.map((g) => (g / bowlSize) * 100)
  const rounded = raw.map((p) => Math.round(p * 10) / 10)
  const sum = rounded.reduce((s, p) => s + p, 0)
  const drift = Math.round((100 - sum) * 10) / 10
  if (Math.abs(drift) >= 0.1 && rounded.length > 0) {
    let largest = 0
    for (let i = 1; i < rounded.length; i++) {
      if (rounded[i] > rounded[largest]) largest = i
    }
    rounded[largest] = Math.round((rounded[largest] + drift) * 10) / 10
  }
  return rounded
}
