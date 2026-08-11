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
import { defaultTargetProfile, recommendMixes } from "@/lib/recommendations"
import { mixRequestSchema } from "@/lib/validation"
import {
  EXCLUSION_TAGS,
  ExclusionTag,
  FlavorProfile,
  FLAVOR_LABELS,
  MixSuggestion,
  PREFERENCE_TAGS,
  PreferenceTag,
} from "@/types"
import { cn } from "@/lib/utils"

const STEPS = ["Количество", "Вес", "Характеристики", "Предпочтения", "Источник"]
const WEIGHT_PRESETS = [10, 12, 15, 20]

export function MixBuilder() {
  const { ready, getCandidates } = useAppStore()
  const [step, setStep] = useState(0)
  const [tobaccoCount, setTobaccoCount] = useState<2 | 3 | 4 | 5>(3)
  const [totalGrams, setTotalGrams] = useState(12)
  const [customGrams, setCustomGrams] = useState("")
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
    }
    const parsed = mixRequestSchema.safeParse(payload)
    if (!parsed.success) {
      setError("Некорректные параметры подбора")
      setPending(false)
      return
    }

    const candidates = getCandidates(useCollectionOnly)
    const result = recommendMixes(candidates, {
      ...parsed.data,
      preferences: parsed.data.preferences as PreferenceTag[],
      exclusions: parsed.data.exclusions as ExclusionTag[],
    })

    if (result.length === 0) {
      setError(
        "Не удалось подобрать микс. Добавьте больше табаков в коллекцию или смягчите фильтры."
      )
      setSuggestions([])
      setPending(false)
      return
    }

    setSuggestions(result)
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
          Пошаговый подбор по профилю вкуса, ролям компонентов и наличию.
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
                {step === 0 && "Сколько табаков будет в миксе?"}
                {step === 1 && "Общий вес закладки"}
                {step === 2 && "Желаемый вкусовой профиль"}
                {step === 3 && "Теги предпочтений и исключения"}
                {step === 4 && "Откуда брать табаки для подбора"}
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
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                    placeholder="Свой вес, например 18"
                    value={customGrams}
                    onChange={(e) => setCustomGrams(e.target.value)}
                  />
                </div>
              )}

              {step === 2 && (
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

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-stone-300">Предпочтения</h3>
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
                    <h3 className="mb-3 text-sm font-medium text-stone-300">Исключения</h3>
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
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <Switch
                    checked={useCollectionOnly}
                    onCheckedChange={setUseCollectionOnly}
                    label="Использовать только мою коллекцию"
                  />
                  <Switch
                    checked={requireStock}
                    onCheckedChange={setRequireStock}
                    label="Учитывать наличие (граммы)"
                  />
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
            <h2 className="text-xl font-semibold text-stone-50">Варианты миксов</h2>
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
