import {
  CATALOG_DB,
  STARTER_COLLECTION_IDS,
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
}

export type AppState = {
  collection: StoredCollectionItem[]
  mixes: StoredMix[]
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

export function createDefaultState(): AppState {
  return {
    collection: STARTER_COLLECTION_IDS.map((tobaccoId) => ({
      id: uid("col"),
      tobaccoId,
      grams: tobaccoId.includes("nord-star") || tobaccoId.includes("cane-mint") ? 20 : 25,
      rating: 4,
      note: "Добавлено из стартовой коллекции",
      updatedAt: new Date().toISOString(),
    })),
    mixes: [],
  }
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
    return JSON.parse(raw) as AppState
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
  grams = 50
): AppState {
  const existing = state.collection.find((c) => c.tobaccoId === tobaccoId)
  if (existing) {
    return {
      ...state,
      collection: state.collection.map((c) =>
        c.tobaccoId === tobaccoId
          ? { ...c, grams, updatedAt: new Date().toISOString() }
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
        rating: 4,
        note: null,
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
  }
  return { ...state, mixes: [mix, ...state.mixes] }
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
