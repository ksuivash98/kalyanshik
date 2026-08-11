"use client"

import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { useAppStore } from "@/components/providers/app-store-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProfileBars } from "@/components/shared/profile-bars"
import { CATALOG, getBrands } from "@/data/catalog"

export function CatalogClient() {
  const { ready, state, addTobacco } = useAppStore()
  const [query, setQuery] = useState("")
  const [brand, setBrand] = useState("all")
  const [message, setMessage] = useState<string | null>(null)

  const inCollection = useMemo(
    () => new Set(state.collection.map((c) => c.tobaccoId)),
    [state.collection]
  )

  const brands = getBrands()

  const filtered = useMemo(() => {
    return CATALOG.filter((t) => {
      const q = query.trim().toLowerCase()
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      const matchBrand = brand === "all" || t.brand === brand
      return matchQuery && matchBrand
    })
  }, [query, brand])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof CATALOG>()
    for (const t of filtered) {
      const list = map.get(t.brand) ?? []
      list.push(t)
      map.set(t.brand, list)
    }
    return [...map.entries()]
  }, [filtered])

  if (!ready) {
    return <div className="py-20 text-center text-stone-500">Загрузка...</div>
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold text-stone-50">Каталог табаков</h1>
        <p className="mt-2 text-stone-400">
          Общая база вкусов. Характеристики ориентировочные — для подбора миксов в MVP.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input
            className="pl-9"
            placeholder="Поиск по бренду, вкусу или тегу"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-stone-100"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="all">Все бренды</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {message ? <p className="text-sm text-amber-300">{message}</p> : null}

      <div className="space-y-8">
        {grouped.map(([brandName, list]) => (
          <section key={brandName} className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-100">{brandName}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((tobacco) => {
                const owned = inCollection.has(tobacco.id)
                return (
                  <Card key={tobacco.id} className="transition hover:border-white/20">
                    <CardHeader>
                      <CardTitle>{tobacco.name}</CardTitle>
                      <CardDescription>{tobacco.brand}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ProfileBars profile={tobacco.profile} compact />
                      <div className="flex flex-wrap gap-1.5">
                        {tobacco.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                      <Button
                        className="w-full"
                        variant={owned ? "secondary" : "default"}
                        disabled={owned}
                        onClick={() => {
                          addTobacco(tobacco.id, 50)
                          setMessage("Добавлено в коллекцию")
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        {owned ? "Уже в коллекции" : "В коллекцию"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
