"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { MixSuggestion } from "@/types"
import {
  AppState,
  addToCollection,
  buildCandidates,
  createDefaultState,
  deleteMix,
  loadState,
  prepareMix,
  rateMix,
  removeCollectionItem,
  saveAndPrepareMix,
  saveMixFromSuggestion,
  saveState,
  undoMixPreparation,
  updateCollectionItem,
} from "@/lib/store"

type StoreContextValue = {
  ready: boolean
  state: AppState
  addTobacco: (
    tobaccoId: string,
    grams?: number,
    extras?: { rating?: number | null; note?: string | null }
  ) => void
  updateTobacco: (
    id: string,
    patch: { grams?: number; rating?: number | null; note?: string | null }
  ) => void
  removeTobacco: (id: string) => void
  saveMix: (suggestion: MixSuggestion) => void
  prepareSavedMix: (mixId: string) => { ok: boolean; error: string | null }
  undoPreparedMix: (mixId: string) => { ok: boolean; error: string | null }
  saveAndPrepare: (
    suggestion: MixSuggestion
  ) => { ok: boolean; error: string | null; mixId: string | null }
  removeMix: (id: string) => void
  setMixRating: (id: string, score: number, comment: string | null) => void
  getCandidates: (useCollectionOnly: boolean) => ReturnType<typeof buildCandidates>
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(createDefaultState)
  const [ready, setReady] = useState(false)
  const stateRef = useMemo(() => ({ current: state }), [])
  stateRef.current = state

  useEffect(() => {
    setState(loadState())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    saveState(state)
  }, [state, ready])

  const addTobacco = useCallback(
    (
      tobaccoId: string,
      grams = 50,
      extras?: { rating?: number | null; note?: string | null }
    ) => {
      setState((prev) => addToCollection(prev, tobaccoId, grams, extras))
    },
    []
  )

  const updateTobacco = useCallback(
    (
      id: string,
      patch: { grams?: number; rating?: number | null; note?: string | null }
    ) => {
      setState((prev) => updateCollectionItem(prev, id, patch))
    },
    []
  )

  const removeTobacco = useCallback((id: string) => {
    setState((prev) => removeCollectionItem(prev, id))
  }, [])

  const saveMix = useCallback((suggestion: MixSuggestion) => {
    setState((prev) => saveMixFromSuggestion(prev, suggestion))
  }, [])

  const prepareSavedMix = useCallback((mixId: string) => {
    const next = prepareMix(stateRef.current, mixId)
    if (next.ok) setState(next.state)
    return { ok: next.ok, error: next.error }
  }, [stateRef])

  const undoPreparedMix = useCallback((mixId: string) => {
    const next = undoMixPreparation(stateRef.current, mixId)
    if (next.ok) setState(next.state)
    return { ok: next.ok, error: next.error }
  }, [stateRef])

  const saveAndPrepare = useCallback((suggestion: MixSuggestion) => {
    const next = saveAndPrepareMix(stateRef.current, suggestion)
    if (next.ok) setState(next.state)
    return { ok: next.ok, error: next.error, mixId: next.mixId }
  }, [stateRef])

  const removeMix = useCallback((id: string) => {
    setState((prev) => deleteMix(prev, id))
  }, [])

  const setMixRating = useCallback(
    (id: string, score: number, comment: string | null) => {
      setState((prev) => rateMix(prev, id, score, comment))
    },
    []
  )

  const getCandidates = useCallback(
    (useCollectionOnly: boolean) => buildCandidates(state, useCollectionOnly),
    [state]
  )

  const value = useMemo(
    () => ({
      ready,
      state,
      addTobacco,
      updateTobacco,
      removeTobacco,
      saveMix,
      prepareSavedMix,
      undoPreparedMix,
      saveAndPrepare,
      removeMix,
      setMixRating,
      getCandidates,
    }),
    [
      ready,
      state,
      addTobacco,
      updateTobacco,
      removeTobacco,
      saveMix,
      prepareSavedMix,
      undoPreparedMix,
      saveAndPrepare,
      removeMix,
      setMixRating,
      getCandidates,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider")
  return ctx
}
