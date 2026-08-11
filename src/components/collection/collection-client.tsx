"use client"

import { useMemo, useState } from "react"
import { Pencil, Search, Trash2 } from "lucide-react"
import { useAppStore } from "@/components/providers/app-store-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ProfileBars } from "@/components/shared/profile-bars"
import { getBrandById, getTobaccoById, toRecommendationProfile } from "@/data/catalog"

export function CollectionClient() {
  const { ready, state, updateTobacco, removeTobacco } = useAppStore()
  const [query, setQuery] = useState("")
  const [brand, setBrand] = useState("all")
  const [strength, setStrength] = useState("all")
  const [cold, setCold] = useState("all")
  const [rating, setRating] = useState("all")
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ grams: 0, rating: 3, note: "" })
  const [message, setMessage] = useState<string | null>(null)

  const items = useMemo(() => {
    return state.collection
      .map((item) => {
        const tobacco = getTobaccoById(item.tobaccoId)
        if (!tobacco) return null
        const brandEntity = getBrandById(tobacco.brandId)
        const profile = toRecommendationProfile(tobacco)
        return {
          ...item,
          tobacco,
          brandName: brandEntity?.name ?? tobacco.brandId,
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
        }
      })
      .filter((i): i is NonNullable<typeof i> => Boolean(i))
  }, [state.collection])

  const brands = useMemo(
    () => [...new Set(items.map((i) => i.brandName))].sort(),
    [items]
  )

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = query.trim().toLowerCase()
      const matchQuery =
        !q ||
        item.tobacco.name.toLowerCase().includes(q) ||
        item.brandName.toLowerCase().includes(q) ||
        item.tobacco.tags.some((t) => t.toLowerCase().includes(q))
      const matchBrand = brand === "all" || item.brandName === brand
      const matchStrength =
        strength === "all" || item.profile.strength === Number(strength)
      const matchCold = cold === "all" || item.profile.cold === Number(cold)
      const matchRating =
        rating === "all" || (item.rating !== null && item.rating === Number(rating))
      const matchStock = !onlyInStock || item.grams > 0
      return matchQuery && matchBrand && matchStrength && matchCold && matchRating && matchStock
    })
  }, [items, query, brand, strength, cold, rating, onlyInStock])

  if (!ready) {
    return <div className="py-20 text-center text-stone-500">Загрузка...</div>
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold text-stone-50">Моя коллекция</h1>
        <p className="mt-2 text-stone-400">
          Граммы, оценка и заметки — ваши. Официальный каталог при этом не меняется.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input
            className="pl-9"
            placeholder="Поиск по вкусу / бренду"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="all">Бренд</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={strength}
          onChange={(e) => setStrength(e.target.value)}
        >
          <option value="all">Крепость</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <Switch
        checked={onlyInStock}
        onCheckedChange={setOnlyInStock}
        label="Показывать только то, что есть в наличии"
      />

      {message ? <p className="text-sm text-amber-300">{message}</p> : null}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-stone-400">
            Коллекция пуста. Добавьте табаки из каталога.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const editing = editingId === item.id
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>
                        {item.brandName} · {item.tobacco.name}
                      </CardTitle>
                      <CardDescription>
                        {item.grams} г · оценка {item.rating ?? "—"}/5
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(item.id)
                          setDraft({
                            grams: item.grams,
                            rating: item.rating ?? 3,
                            note: item.note ?? "",
                          })
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          removeTobacco(item.id)
                          setMessage("Удалено из коллекции")
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProfileBars profile={item.profile} compact />
                  <p className="text-[11px] text-stone-500">
                    Шкалы — оценка приложения, не официальные данные производителя
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tobacco.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  {item.note ? <p className="text-sm text-stone-400">{item.note}</p> : null}
                  {editing ? (
                    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
                      <Input
                        type="number"
                        min={0}
                        value={draft.grams}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, grams: Number(e.target.value) }))
                        }
                      />
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={draft.rating}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, rating: Number(e.target.value) }))
                        }
                      />
                      <Textarea
                        value={draft.note}
                        onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            updateTobacco(item.id, {
                              grams: draft.grams,
                              rating: draft.rating,
                              note: draft.note,
                            })
                            setEditingId(null)
                            setMessage("Сохранено")
                          }}
                        >
                          Сохранить
                        </Button>
                        <Button variant="secondary" onClick={() => setEditingId(null)}>
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
