"use client"

import { useState } from "react"
import { RotateCcw, Save, Star, ChefHat, Check, AlertTriangle } from "lucide-react"
import { useAppStore } from "@/components/providers/app-store-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileBars } from "@/components/shared/profile-bars"
import { roleLabel } from "@/lib/recommendations"
import { MixSuggestion, MixVariantType } from "@/types"

const VARIANT_META: Record<
  MixVariantType,
  { title: string; color: string; emoji: string }
> = {
  safe: {
    title: "Сбалансированный",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    emoji: "🎯",
  },
  interesting: {
    title: "Яркий",
    color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    emoji: "🔥",
  },
  experimental: {
    title: "Эксперимент",
    color: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    emoji: "🧪",
  },
  leftovers: {
    title: "Остатки",
    color: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    emoji: "🧹",
  },
}

export function MixResults({ suggestions }: { suggestions: MixSuggestion[] }) {
  const { saveMix, saveAndPrepare } = useAppStore()
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [preparedIds, setPreparedIds] = useState<Record<string, string>>({})

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {suggestions.map((suggestion) => {
        const meta = VARIANT_META[suggestion.variantType] ?? VARIANT_META.safe
        const preparedMixId = preparedIds[suggestion.id]
        return (
          <Card key={suggestion.id} className="flex flex-col transition hover:border-white/20">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge className={meta.color}>
                  {meta.emoji} {meta.title}
                </Badge>
                <span className="text-xs text-stone-500">
                  score {Math.round(suggestion.score * 100)}%
                </span>
              </div>
              <CardTitle>{suggestion.name}</CardTitle>
              <CardDescription>
                {suggestion.totalGrams} г · {suggestion.components.length} табак
                {suggestion.components.length === 1
                  ? ""
                  : suggestion.components.length < 5
                    ? "а"
                    : "ов"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="space-y-2 text-sm">
                {suggestion.components.map((c) => (
                  <div
                    key={c.tobaccoId}
                    className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium text-stone-100">
                        {c.brandName} {c.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        {roleLabel(c.role)} · {c.percent}%
                        {c.gramsAvailable != null
                          ? ` · остаток ${c.gramsAvailable} г`
                          : ""}
                      </div>
                    </div>
                    <div className="text-right text-stone-300">{c.grams} г</div>
                  </div>
                ))}
              </div>

              <ProfileBars profile={suggestion.profile} />
              <p className="text-sm leading-relaxed text-stone-400">{suggestion.explanation}</p>

              {suggestion.availability.warnings.length > 0 ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                  <div className="mb-1 flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Наличие
                  </div>
                  <ul className="space-y-1">
                    {suggestion.availability.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-auto space-y-2 pt-2">
                <Button
                  className="w-full"
                  disabled={!suggestion.availability.available || Boolean(preparedMixId)}
                  onClick={() => {
                    const result = saveAndPrepare(suggestion)
                    if (!result.ok) {
                      setMessages((prev) => ({
                        ...prev,
                        [suggestion.id]: result.error ?? "Ошибка списания",
                      }))
                      return
                    }
                    if (result.mixId) {
                      setPreparedIds((prev) => ({
                        ...prev,
                        [suggestion.id]: result.mixId!,
                      }))
                    }
                    setMessages((prev) => ({
                      ...prev,
                      [suggestion.id]: "Приготовлено — граммы списаны. Отмена в «Мои миксы».",
                    }))
                  }}
                >
                  <ChefHat className="h-4 w-4" />
                  {preparedMixId ? "Уже приготовлен" : "Приготовил этот микс"}
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => {
                    saveMix(suggestion)
                    setMessages((prev) => ({
                      ...prev,
                      [suggestion.id]: "Микс сохранён без списания граммов",
                    }))
                  }}
                >
                  <Save className="h-4 w-4" />
                  Сохранить без списания
                </Button>
                {messages[suggestion.id] ? (
                  <p className="flex items-start gap-1 text-center text-xs text-emerald-400">
                    <Check className="mt-0.5 h-3 w-3 shrink-0" />
                    {messages[suggestion.id]}
                  </p>
                ) : null}
                <div className="flex items-center justify-center gap-1 text-xs text-stone-500">
                  <Star className="h-3 w-3" />
                  Просмотр рецепта граммы не меняет
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
