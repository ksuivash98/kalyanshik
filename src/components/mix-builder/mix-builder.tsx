"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { useAppStore } from "@/components/providers/app-store-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MixResults } from "@/components/mix-builder/mix-results"
import { defaultTargetProfile } from "@/lib/recommendations"
import { recommendMixesDetailed } from "@/lib/recommendations/mixer"
import { mixRequestSchema } from "@/lib/validation"
import {
  EXCLUSION_TAGS,
  ExclusionTag,
  FlavorProfile,
  FLAVOR_LABELS,
  MixGenerationMode,
  MixSuggestion,
  PREFERENCE_TAGS,
  PreferenceTag,
} from "@/types"
import { cn } from "@/lib/utils"

const STEPS = ["Количество", "Чаша", "Режим", "Профиль", "Предпочтения"]
const WEIGHT_PRESETS = [12, 15, 18, 20, 25]

const MODE_META: Array<{
  id: MixGenerationMode
  title: string
  description: string
}> = [
  {
    id: "balanced",
    title: "🎯 Сбалансированный",
    description: "Безопасные сочетания с ровными ролями",
  },
  {
    id: "dominant",
    title: "🔥 Яркий",
    description: "Один вкус доминирует, остальные поддерживают",
  },
  {
    id: "experimental",
    title: "🧪 Экспериментальный",
    description: "Необычные пары и сложные профили",
  },
  {
    id: "leftovers",
    title: "🧹 Израсходовать остатки",
    description: "Приоритет табакам с малым остатком",
  },
]

export function MixBuilder() {
  const { ready, getCandidates, state } = useAppStore()
  const [step, setStep] = useState(0)
  const [tobaccoCount, setTobaccoCount] = useState<2 | 3 | 4 | 5>(3)
  const [totalGrams, setTotalGrams] = useState(20)
  const [customGrams, setCustomGrams] = useState("")
  const [mode, setMode] = useState<MixGenerationMode>("balanced")
  const [targetProfile, setTargetProfile] = useState<FlavorProfile>(defaultTargetProfile())
  const [preferences, setPreferences] = useState<PreferenceTag[]>([])
  const [exclusions, setExclusions] = useState<ExclusionTag[]>([])
  const [useCollectionOnly, setUseCollectionOnly] = useState(true)
  const [requireStock, setRequireStock] = useState(true)
  const [suggestions, setSuggestions] = useState<MixSuggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function togglePref(tag: PreferenceTag) {
    setPreferences((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function toggleExclusion(tag: ExclusionTag) {
    setExclusions((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function submit() {
    setPending(true)
    setError(null)
    const grams = customGrams ? Number(customGrams) : totalGrams
    const payload = {
      tobaccoCount,
      totalGrams: grams,
      targetProfile,
      preferences,
      exclusions,
      useCollectionOnly,
      requireStock,
      mode,
      limit: 8,
    }
    const parsed = mixRequestSchema.safeParse(payload)
    if (!parsed.success) {
      setError("Некорректные параметры подбора")
      setPending(false)
      return
    }

    const candidates = getCandidates(useCollectionOnly)
    const recentMixes = state.mixes.slice(0, 8).map((m) => ({
      tobaccoIds: m.ingredients.map((i) => i.tobaccoId),
      percents: m.ingredients.map((i) => i.percent),
    }))

    const result = recommendMixesDetailed(candidates, {
      ...parsed.data,
      preferences: parsed.data.preferences as PreferenceTag[],
      exclusions: parsed.data.exclusions as ExclusionTag[],
      mode: (parsed.data.mode as MixGenerationMode) ?? mode,
      recentMixes,
    })

    if (result.mixes.length === 0) {
      setError(
        result.error ??
          "Не удалось подобрать микс. Добавьте больше табаков или смягчите фильтры."
      )
      setSuggestions([])
      setPending(false)
      return
    }

    setSuggestions(result.mixes)
    setStep(5)
    setPending(false)
  }

  if (!ready) {
    return <div className="py-20 text-center text-stone-500">Загрузка...</div>
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold text-stone-50">Создать микс</h1>
        <p className="mt-2 text-stone-400">
          Подбор с учётом остатков в граммах, размера чаши, холода и разнообразия.
        </p>
      </div>

      {step < 5 ? (
        <>
          <div className="flex flex-wrap gap-2">
            {STEPS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs transition",
                  step === index
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : "border-white/10 text-stone-500 hover:text-stone-300"
                )}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Шаг {step + 1}. {STEPS[step]}
              </CardTitle>
              <CardDescription>
                {step === 0 && "Сколько табаков будет в миксе? Ровно столько попадёт в рецепт."}
                {step === 1 && "Вес чаши — сумма компонентов будет равна этому значению."}
                {step === 2 && "Стратегия генерации влияет на пропорции и разнообразие."}
                {step === 3 && "Крепость, холод и вкусовой профиль."}
                {step === 4 && "Что любите / чего избегать. Источник — ваша коллекция."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {([2, 3, 4, 5] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTobaccoCount(n)}
                      className={cn(
                        "rounded-2xl border py-6 text-2xl font-semibold transition",
                        tobaccoCount === n
                          ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                          : "border-white/10 text-stone-300 hover:bg-white/5"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {WEIGHT_PRESETS.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => {
                          setTotalGrams(w)
                          setCustomGrams("")
                        }}
                        className={cn(
                          "rounded-2xl border py-5 text-lg font-medium transition",
                          totalGrams === w && !customGrams
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                            : "border-white/10 text-stone-300 hover:bg-white/5"
                        )}
                      >
                        {w} г
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Свой вес, например 16"
                    value={customGrams}
                    onChange={(e) => setCustomGrams(e.target.value)}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {MODE_META.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        mode === item.id
                          ? "border-amber-500/50 bg-amber-500/10"
                          : "border-white/10 hover:bg-white/5"
                      )}
                    >
                      <div className="font-medium text-stone-100">{item.title}</div>
                      <div className="mt-1 text-sm text-stone-400">{item.description}</div>
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-5 md:grid-cols-2">
                  {(Object.keys(FLAVOR_LABELS) as (keyof FlavorProfile)[]).map((key) => (
                    <Slider
                      key={key}
                      label={FLAVOR_LABELS[key]}
                      min={
                        key === "strength" || key === "sweetness" || key === "intensity"
                          ? 1
                          : 0
                      }
                      max={5}
                      value={targetProfile[key]}
                      onChange={(value) =>
                        setTargetProfile((p) => ({ ...p, [key]: value }))
                      }
                    />
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-stone-300">Люблю</h3>
                    <div className="flex flex-wrap gap-2">
                      {PREFERENCE_TAGS.map((tag) => (
                        <button key={tag} type="button" onClick={() => togglePref(tag)}>
                          <Badge
                            className={cn(
                              "cursor-pointer transition",
                              preferences.includes(tag) &&
                                "border-amber-500/40 bg-amber-500/15 text-amber-200"
                            )}
                          >
                            {tag}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-stone-300">Не люблю / исключения</h3>
                    <div className="flex flex-wrap gap-2">
                      {EXCLUSION_TAGS.map((tag) => (
                        <button key={tag} type="button" onClick={() => toggleExclusion(tag)}>
                          <Badge
                            className={cn(
                              "cursor-pointer transition",
                              exclusions.includes(tag) &&
                                "border-red-500/40 bg-red-500/15 text-red-200"
                            )}
                          >
                            {tag}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Switch
                      checked={useCollectionOnly}
                      onCheckedChange={setUseCollectionOnly}
                      label="Использовать только мою коллекцию"
                    />
                    <Switch
                      checked={requireStock}
                      onCheckedChange={setRequireStock}
                      label="Строго учитывать граммы (не предлагать больше остатка)"
                    />
                  </div>
                </div>
              )}

              {error ? <p className="text-sm text-red-400">{error}</p> : null}

              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <Button
                  variant="secondary"
                  disabled={step === 0 || pending}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </Button>
                {step < 4 ? (
                  <Button onClick={() => setStep((s) => s + 1)}>
                    Далее
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={submit} disabled={pending}>
                    <Sparkles className="h-4 w-4" />
                    {pending ? "Подбираем..." : "Подобрать микс"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-stone-50">
              Варианты миксов · {suggestions.length}
            </h2>
            <Button
              variant="secondary"
              onClick={() => {
                setSuggestions([])
                setStep(0)
              }}
            >
              Новый подбор
            </Button>
          </div>
          <MixResults suggestions={suggestions} />
        </div>
      )}
    </div>
  )
}
