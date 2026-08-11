"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { RefreshCw, Star, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ProfileBars } from "@/components/shared/profile-bars"
import { FlavorProfile } from "@/types"

export type MixListItem = {
  id: string
  name: string
  totalGrams: number
  tobaccoCount: number
  explanation: string | null
  variantType: string | null
  createdAt: string
  profile: FlavorProfile
  ingredients: Array<{
    id: string
    role: string
    percent: number
    grams: number
    tobacco: { name: string; brand: { name: string } }
  }>
  rating: { score: number; comment: string | null } | null
}

export function MixesClient({ initialMixes }: { initialMixes: MixListItem[] }) {
  const [mixes, setMixes] = useState(initialMixes)
  const [selectedId, setSelectedId] = useState<string | null>(initialMixes[0]?.id ?? null)
  const [score, setScore] = useState(5)
  const [comment, setComment] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const selected = mixes.find((m) => m.id === selectedId) ?? null

  function removeMix(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/mixes?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        setMessage("Не удалось удалить микс")
        return
      }
      setMixes((prev) => prev.filter((m) => m.id !== id))
      setSelectedId((prev) => (prev === id ? null : prev))
      setMessage("Микс удалён")
    })
  }

  function rateMix(id: string) {
    startTransition(async () => {
      const res = await fetch("/api/mixes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, score, comment }),
      })
      if (!res.ok) {
        setMessage("Не удалось сохранить оценку")
        return
      }
      const data = await res.json()
      setMixes((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, rating: { score: data.rating.score, comment: data.rating.comment } }
            : m
        )
      )
      setMessage("Оценка сохранена")
    })
  }

  function remake(id: string) {
    startTransition(async () => {
      const res = await fetch("/api/mixes/remake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mixId: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? "Не удалось повторить микс")
        return
      }
      const lines = [
        `Готово к приготовлению: ${data.mix.name}`,
        ...data.mix.ingredients.map(
          (i: { brandName: string; name: string; grams: number; percent: number }) =>
            `• ${i.brandName} ${i.name} — ${i.grams} г (${i.percent}%)`
        ),
        ...(data.messages ?? []),
      ]
      setMessage(lines.join("\n"))
    })
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
                  selectedId === mix.id
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
                      {selected.variantType ? ` · ${selected.variantType}` : ""}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => remake(selected.id)}
                      disabled={pending}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Приготовить снова
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMix(selected.id)}
                      disabled={pending}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  {selected.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-sm"
                    >
                      <span>
                        {ing.tobacco.brand.name} {ing.tobacco.name}
                        <Badge className="ml-2">{ing.role}</Badge>
                      </span>
                      <span className="text-stone-400">
                        {ing.percent}% · {ing.grams} г
                      </span>
                    </div>
                  ))}
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
                    placeholder="Комментарий, например: очень вкусно, холод можно увеличить"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button onClick={() => rateMix(selected.id)} disabled={pending}>
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
