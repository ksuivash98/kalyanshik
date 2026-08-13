import { MixSuggestion, TobaccoCandidate } from "@/types"
import { ValidationResult } from "./types"
import { normalizeGramsAvailable } from "./limits"

/**
 * HARD validation only: inventory, percents, bowl sum, ingredient count.
 * Cold / preferences are scoring concerns — not hard rejects here.
 */
export function validateMixAgainstInventory(
  mix: {
    bowlSize: number
    components: Array<{
      tobaccoId: string
      percent: number
      grams: number
    }>
  },
  collection: TobaccoCandidate[],
  options?: {
    tobaccoCount?: number
  }
): ValidationResult {
  const reasons: string[] = []
  const byId = new Map(collection.map((c) => [c.id, c]))

  if (options?.tobaccoCount != null && mix.components.length !== options.tobaccoCount) {
    reasons.push(
      `Ожидалось ${options.tobaccoCount} табак(ов), получено ${mix.components.length}`
    )
  }

  const percentSum = mix.components.reduce((s, c) => s + c.percent, 0)
  if (Math.abs(percentSum - 100) > 0.6) {
    reasons.push(`Сумма процентов ${percentSum.toFixed(1)}% ≠ 100%`)
  }

  const gramsSum = mix.components.reduce((s, c) => s + c.grams, 0)
  if (Math.abs(gramsSum - mix.bowlSize) > 0.2) {
    reasons.push(`Сумма грамм ${gramsSum.toFixed(1)} ≠ чаша ${mix.bowlSize}`)
  }

  for (const component of mix.components) {
    const item = byId.get(component.tobaccoId)
    if (!item) {
      reasons.push(`TOBACCO_NOT_FOUND_IN_COLLECTION: ${component.tobaccoId}`)
      continue
    }
    const available = normalizeGramsAvailable(item.gramsAvailable as number | string | null)
    if (available !== null && component.grams > available + 0.05) {
      reasons.push(
        `INSUFFICIENT_GRAMS: ${item.name}: нужно ${component.grams} г, в наличии ${available} г`
      )
    }
    if (component.grams < 0.2) {
      reasons.push(`${item.name}: слишком малая доза ${component.grams} г`)
    }
    if (component.percent <= 0) {
      reasons.push(`${item.name}: невалидный процент`)
    }
  }

  return { ok: reasons.length === 0, reasons }
}

export function assertValidMix(
  suggestion: MixSuggestion,
  collection: TobaccoCandidate[],
  options: {
    tobaccoCount: number
    bowlSize: number
  }
): ValidationResult {
  return validateMixAgainstInventory(
    {
      bowlSize: options.bowlSize,
      components: suggestion.components.map((c) => ({
        tobaccoId: c.tobaccoId,
        percent: c.percent,
        grams: c.grams,
      })),
    },
    collection,
    {
      tobaccoCount: options.tobaccoCount,
    }
  )
}
