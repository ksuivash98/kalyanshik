"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { RefreshCw, Star, Trash2 } from "lucide-react"
import { useAppStore } from "@/components/providers/app-store-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ProfileBars } from "@/components/shared/profile-bars"
import { getBrandById, getTobaccoById } from "@/data/catalog"
import { findReplacement } from "@/lib/recommendations"
import { TobaccoCandidate } from "@/types"

export function MixesClient() {
  const { ready, state, removeMix, setMixRating, getCandidates } = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [score, setScore] = useState(5)
  const [comment, setComment] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  const mixes = state.mixes
  const selected = useMemo(
    () => mixes.find((m) => m.id === (selectedId ?? mixes[0]?.id)) ?? null,
    [mixes, selectedId]
  )

  function remake(mixId: string) {
    const mix = mixes.find((m) => m.id === mixId)
    if (!mix) return

    const candidates = getCandidates(true)
    const used = new Set<string>()
    const lines: string[] = [`Готово к приготовлению: ${mix.name}`]
    const notes: string[] = []

    for (const ingredient of mix.ingredients) {
      const tobacco = getTobaccoById(ingredient.tobaccoId)
      const brand = tobacco ? getBrandById(tobacco.brandId) : null
      const stock = candidates.find((c) => c.id === ingredient.tobaccoId)
      const needed = ingredient.grams

      if (stock && (stock.gramsAvailable ?? 0) >= needed) {
        used.add(stock.id)
        lines.push(
          `• ${stock.brandName} ${stock.name} — ${needed} г (${ingredient.percent}%)`
        )
        continue
      }

      const missing: TobaccoCandidate = {
        id: ingredient.tobaccoId,
        name: tobacco?.name ?? "Табак",
        brandName: brand?.name ?? "",
        tags: tobacco?.tags ?? [],
        profile: tobacco
          ? {
              strength: tobacco.estimatedProfile.strength ?? 3,
              cold: tobacco.estimatedProfile.cold ?? 0,
              sweetness: tobacco.estimatedProfile.sweetness ?? 3,
              sourness: tobacco.estimatedProfile.sourness ?? 0,
              fruity: tobacco.estimatedProfile.fruity ?? 3,
              dessert: tobacco.estimatedProfile.dessert ?? 0,
              spicy: tobacco.estimatedProfile.spicy ?? 0,
              herbal: tobacco.estimatedProfile.herbal ?? 0,
              intensity: tobacco.estimatedProfile.intensity ?? 3,
            }
          : {
              strength: 3,
              cold: 0,
              sweetness: 3,
              sourness: 0,
              fruity: 3,
              dessert: 0,
              spicy: 0,
              herbal: 0,
              intensity: 3,
            },
        gramsAvailable: stock?.gramsAvailable ?? 0,
      }

      const replacement = findReplacement(missing, candidates, used)
      if (!replacement) {
        setMessage(`${missing.name} недостаточно, замена не найдена`)
        return
      }

      used.add(replacement.id)
      notes.push(
        `${missing.name} недостаточно для этого микса. Найдена замена: ${replacement.name}.`
      )
      lines.push(
        `• ${replacement.brandName} ${replacement.name} — ${needed} г (${ingredient.percent}%)`
      )
    }

    setMessage([...lines, ...notes].join("\n"))
  }

  if (!ready) {
    return <div className="py-20 text-center text-stone-500">Загрузка...</div>
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold text-stone-50">Мои миксы</h1>
        <p className="mt-2 text-stone-400">
          Открывайте, оценивайте и готовьте снова с учётом текущего наличия.
        </p>
      </div>

      {message ? (
        <pre className="whitespace-pre-wrap rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {message}
        </pre>
      ) : null}

      {mixes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-stone-400">
            Пока нет сохранённых миксов.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            {mixes.map((mix) => (
              <button
                key={mix.id}
                type="button"
                onClick={() => {
                  setSelectedId(mix.id)
                  setScore(mix.rating?.score ?? 5)
                  setComment(mix.rating?.comment ?? "")
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  (selectedId ?? mixes[0]?.id) === mix.id
                    ? "border-amber-500/40 bg-amber-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                }`}
              >
                <div className="font-medium text-stone-100">{mix.name}</div>
                <div className="mt-1 text-xs text-stone-500">
                  {format(new Date(mix.createdAt), "d MMMM yyyy", { locale: ru })} ·{" "}
                  {mix.totalGrams} г
                </div>
                {mix.rating ? (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-300">
                    <Star className="h-3 w-3 fill-current" />
                    {mix.rating.score}/5
                  </div>
                ) : null}
              </button>
            ))}
          </div>

          {selected ? (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{selected.name}</CardTitle>
                    <CardDescription>
                      {selected.tobaccoCount} табака · {selected.totalGrams} г
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => remake(selected.id)}>
                      <RefreshCw className="h-4 w-4" />
                      Приготовить снова
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        removeMix(selected.id)
                        setSelectedId(null)
                        setMessage("Микс удалён")
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  {selected.ingredients.map((ing) => {
                    const tobacco = getTobaccoById(ing.tobaccoId)
                    const brand = tobacco ? getBrandById(tobacco.brandId) : null
                    return (
                      <div
                        key={`${selected.id}-${ing.tobaccoId}`}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-sm"
                      >
                        <span>
                          {brand?.name} {tobacco?.name}
                          <Badge className="ml-2">{ing.role}</Badge>
                        </span>
                        <span className="text-stone-400">
                          {ing.percent}% · {ing.grams} г
                        </span>
                      </div>
                    )
                  })}
                </div>

                <ProfileBars profile={selected.profile} />

                {selected.explanation ? (
                  <p className="text-sm leading-relaxed text-stone-400">
                    {selected.explanation}
                  </p>
                ) : null}

                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-medium text-stone-100">Оценка</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setScore(n)}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          score >= n
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-white/5 text-stone-500"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Комментарий"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      setMixRating(selected.id, score, comment || null)
                      setMessage("Оценка сохранена")
                    }}
                  >
                    Сохранить оценку
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
