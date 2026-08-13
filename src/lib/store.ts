import {
  CATALOG_DB,
  getTobaccoById,
  toRecommendationProfile,
} from "@/data/catalog"
import { FlavorProfile, MixRole, MixSuggestion, MixVariantType } from "@/types"

const STORAGE_KEY = "hookah-mix-v2"

export type StoredCollectionItem = {
  id: string
  tobaccoId: string
  grams: number
  rating: number | null
  note: string | null
  updatedAt: string
}

export type StoredMixIngredient = {
  tobaccoId: string
  role: MixRole
  percent: number
  grams: number
}

export type StoredMix = {
  id: string
  name: string
  totalGrams: number
  tobaccoCount: number
  explanation: string | null
  variantType: MixVariantType | null
  profile: FlavorProfile
  ingredients: StoredMixIngredient[]
  rating: { score: number; comment: string | null } | null
  createdAt: string
  /** Set when user confirmed «Приготовил этот микс». */
  preparedAt: string | null
  /** Grams deducted from collection for this preparation (for undo). */
  consumption: Array<{ tobaccoId: string; gramsUsed: number }> | null
}

export type AppState = {
  collection: StoredCollectionItem[]
  mixes: StoredMix[]
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

export function createDefaultState(): AppState {
  return { collection: [], mixes: [] }
}

/** Only items that still exist in the current catalog. */
export function getValidCollection(state: AppState): StoredCollectionItem[] {
  return state.collection.filter((item) => Boolean(getTobaccoById(item.tobaccoId)))
}

function sanitizeState(state: AppState): AppState {
  const collection = getValidCollection(state)
  const mixes = (Array.isArray(state.mixes) ? state.mixes : []).map((m) => ({
    ...m,
    preparedAt: m.preparedAt ?? null,
    consumption: m.consumption ?? null,
  }))
  if (
    collection.length === state.collection.length &&
    mixes.length === state.mixes.length
  ) {
    return { collection, mixes }
  }
  return { collection, mixes }
}

export function loadState(): AppState {
  if (typeof window === "undefined") return createDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = createDefaultState()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    const parsed = JSON.parse(raw) as AppState
    const sanitized = sanitizeState({
      collection: Array.isArray(parsed.collection) ? parsed.collection : [],
      mixes: Array.isArray(parsed.mixes) ? parsed.mixes : [],
    })
    if (sanitized.collection.length !== (parsed.collection?.length ?? 0)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized))
    }
    return sanitized
  } catch {
    return createDefaultState()
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function addToCollection(
  state: AppState,
  tobaccoId: string,
  grams = 50,
  extras?: { rating?: number | null; note?: string | null }
): AppState {
  const existing = state.collection.find((c) => c.tobaccoId === tobaccoId)
  if (existing) {
    return {
      ...state,
      collection: state.collection.map((c) =>
        c.tobaccoId === tobaccoId
          ? {
              ...c,
              grams,
              rating: extras?.rating ?? c.rating,
              note: extras?.note !== undefined ? extras.note : c.note,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    }
  }
  return {
    ...state,
    collection: [
      {
        id: uid("col"),
        tobaccoId,
        grams,
        rating: extras?.rating ?? 4,
        note: extras?.note ?? null,
        updatedAt: new Date().toISOString(),
      },
      ...state.collection,
    ],
  }
}

export function updateCollectionItem(
  state: AppState,
  id: string,
  patch: Partial<Pick<StoredCollectionItem, "grams" | "rating" | "note">>
): AppState {
  return {
    ...state,
    collection: state.collection.map((c) =>
      c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
    ),
  }
}

export function removeCollectionItem(state: AppState, id: string): AppState {
  return { ...state, collection: state.collection.filter((c) => c.id !== id) }
}

export function saveMixFromSuggestion(
  state: AppState,
  suggestion: MixSuggestion
): AppState {
  const mix: StoredMix = {
    id: uid("mix"),
    name: suggestion.name,
    totalGrams: suggestion.totalGrams,
    tobaccoCount: suggestion.components.length,
    explanation: suggestion.explanation,
    variantType: suggestion.variantType,
    profile: suggestion.profile,
    ingredients: suggestion.components.map((c) => ({
      tobaccoId: c.tobaccoId,
      role: c.role,
      percent: c.percent,
      grams: c.grams,
    })),
    rating: null,
    createdAt: new Date().toISOString(),
    preparedAt: null,
    consumption: null,
  }
  return { ...state, mixes: [mix, ...state.mixes] }
}

/**
 * Confirm preparation: deduct grams from collection.
 * Does nothing (returns error via null mix) if inventory insufficient.
 */
export function prepareMix(
  state: AppState,
  mixId: string
): { state: AppState; ok: boolean; error: string | null } {
  const mix = state.mixes.find((m) => m.id === mixId)
  if (!mix) return { state, ok: false, error: "Микс не найден" }
  if (mix.preparedAt && mix.consumption) {
    return { state, ok: false, error: "Микс уже отмечен как приготовленный" }
  }

  for (const ing of mix.ingredients) {
    const item = state.collection.find((c) => c.tobaccoId === ing.tobaccoId)
    if (!item) {
      return {
        state,
        ok: false,
        error: `Табак отсутствует в коллекции`,
      }
    }
    if (item.grams + 1e-9 < ing.grams) {
      const tobacco = getTobaccoById(ing.tobaccoId)
      return {
        state,
        ok: false,
        error: `${tobacco?.name ?? "Табак"}: нужно ${ing.grams} г, есть ${item.grams} г`,
      }
    }
  }

  const consumption = mix.ingredients.map((ing) => ({
    tobaccoId: ing.tobaccoId,
    gramsUsed: ing.grams,
  }))

  const collection = state.collection.map((item) => {
    const used = consumption.find((c) => c.tobaccoId === item.tobaccoId)
    if (!used) return item
    return {
      ...item,
      grams: Math.max(0, Math.round((item.grams - used.gramsUsed) * 10) / 10),
      updatedAt: new Date().toISOString(),
    }
  })

  const mixes = state.mixes.map((m) =>
    m.id === mixId
      ? {
          ...m,
          preparedAt: new Date().toISOString(),
          consumption,
        }
      : m
  )

  return { state: { ...state, collection, mixes }, ok: true, error: null }
}

/** Restore grams deducted by prepareMix. */
export function undoMixPreparation(
  state: AppState,
  mixId: string
): { state: AppState; ok: boolean; error: string | null } {
  const mix = state.mixes.find((m) => m.id === mixId)
  if (!mix) return { state, ok: false, error: "Микс не найден" }
  if (!mix.preparedAt || !mix.consumption) {
    return { state, ok: false, error: "Нечего отменять — микс не готовили" }
  }

  const collection = state.collection.map((item) => {
    const used = mix.consumption!.find((c) => c.tobaccoId === item.tobaccoId)
    if (!used) return item
    return {
      ...item,
      grams: Math.round((item.grams + used.gramsUsed) * 10) / 10,
      updatedAt: new Date().toISOString(),
    }
  })

  const mixes = state.mixes.map((m) =>
    m.id === mixId
      ? {
          ...m,
          preparedAt: null,
          consumption: null,
        }
      : m
  )

  return { state: { ...state, collection, mixes }, ok: true, error: null }
}

/**
 * Save suggestion and immediately mark as prepared (deduct grams).
 */
export function saveAndPrepareMix(
  state: AppState,
  suggestion: MixSuggestion
): { state: AppState; mixId: string | null; ok: boolean; error: string | null } {
  const withSaved = saveMixFromSuggestion(state, suggestion)
  const mixId = withSaved.mixes[0]?.id ?? null
  if (!mixId) return { state, mixId: null, ok: false, error: "Не удалось сохранить" }
  const prepared = prepareMix(withSaved, mixId)
  return { ...prepared, mixId }
}

export function deleteMix(state: AppState, id: string): AppState {
  return { ...state, mixes: state.mixes.filter((m) => m.id !== id) }
}

export function rateMix(
  state: AppState,
  id: string,
  score: number,
  comment: string | null
): AppState {
  return {
    ...state,
    mixes: state.mixes.map((m) =>
      m.id === id ? { ...m, rating: { score, comment } } : m
    ),
  }
}

export function buildCandidates(state: AppState, useCollectionOnly: boolean) {
  if (useCollectionOnly) {
    return state.collection
      .map((item) => {
        const tobacco = getTobaccoById(item.tobaccoId)
        if (!tobacco) return null
        const brand = CATALOG_DB.brands.find((b) => b.id === tobacco.brandId)
        const profile = toRecommendationProfile(tobacco)
        return {
          id: tobacco.id,
          name: tobacco.name,
          brandName: brand?.name ?? tobacco.brandId,
          tags: tobacco.tags,
          profile: {
            strength: profile.strength,
            cold: profile.cold,
            sweetness: profile.sweetness,
            sourness: profile.sourness,
            fruity: profile.fruity,
            dessert: profile.dessert,
            spicy: profile.spicy,
            herbal: profile.herbal,
            intensity: profile.intensity,
          },
          gramsAvailable: item.grams,
        }
      })
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
  }

  const stock = new Map(state.collection.map((c) => [c.tobaccoId, c.grams]))
  return CATALOG_DB.tobaccos
    .filter((t) => t.active && t.status !== "DISCONTINUED")
    .map((tobacco) => {
      const brand = CATALOG_DB.brands.find((b) => b.id === tobacco.brandId)
      const profile = toRecommendationProfile(tobacco)
      return {
        id: tobacco.id,
        name: tobacco.name,
        brandName: brand?.name ?? tobacco.brandId,
        tags: tobacco.tags,
        profile: {
          strength: profile.strength,
          cold: profile.cold,
          sweetness: profile.sweetness,
          sourness: profile.sourness,
          fruity: profile.fruity,
          dessert: profile.dessert,
          spicy: profile.spicy,
          herbal: profile.herbal,
          intensity: profile.intensity,
        },
        gramsAvailable: stock.has(tobacco.id) ? stock.get(tobacco.id)! : null,
      }
    })
}
