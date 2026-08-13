import { MixSuggestion, TobaccoCandidate } from "@/types"
import { estimateMixCold } from "./cold-calculator"
import { ValidationResult } from "./types"

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
    targetCold?: number
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
      reasons.push(`Табак ${component.tobaccoId} отсутствует в коллекции`)
      continue
    }
    if (item.gramsAvailable !== null && component.grams > item.gramsAvailable + 0.05) {
      reasons.push(
        `${item.name}: нужно ${component.grams} г, в наличии ${item.gramsAvailable} г`
      )
    }
    if (component.grams < 0.2) {
      reasons.push(`${item.name}: слишком малая доза ${component.grams} г`)
    }
    if (component.percent <= 0) {
      reasons.push(`${item.name}: невалидный процент`)
    }
  }

  if (options?.targetCold != null) {
    const profileItems = mix.components.map((c) => {
      const t = byId.get(c.tobaccoId)
      return {
        profile: t?.profile ?? {
          strength: 0,
          cold: 0,
          sweetness: 0,
          sourness: 0,
          fruity: 0,
          dessert: 0,
          spicy: 0,
          herbal: 0,
          intensity: 0,
        },
      }
    })
    const cold = estimateMixCold(
      profileItems,
      mix.components.map((c) => c.percent)
    )
    const tol = options.targetCold <= 2 ? 1.3 : 1.7
    if (Math.abs(cold - options.targetCold) > tol) {
      reasons.push(`Холод ${cold} не попадает в цель ${options.targetCold}`)
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
    targetCold: number
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
      targetCold: options.targetCold,
    }
  )
}
