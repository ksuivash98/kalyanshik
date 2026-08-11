"use client"

import { useMemo, useState, useTransition } from "react"
import { Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProfileBars } from "@/components/shared/profile-bars"
import { parseTags } from "@/lib/utils"
import { FlavorProfile } from "@/types"

export type CatalogTobacco = {
  id: string
  name: string
  tags: string
  brand: { name: string }
  profile: FlavorProfile | null
  inCollection: boolean
}

export function CatalogClient({ tobaccos }: { tobaccos: CatalogTobacco[] }) {
  const [query, setQuery] = useState("")
  const [brand, setBrand] = useState("all")
  const [items, setItems] = useState(tobaccos)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const brands = useMemo(
    () => [...new Set(tobaccos.map((t) => t.brand.name))].sort(),
    [tobaccos]
  )

  const filtered = useMemo(() => {
    return items.filter((t) => {
      const q = query.trim().toLowerCase()
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.brand.name.toLowerCase().includes(q) ||
        parseTags(t.tags).some((tag) => tag.toLowerCase().includes(q))
      const matchBrand = brand === "all" || t.brand.name === brand
      return matchQuery && matchBrand
    })
  }, [items, query, brand])

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogTobacco[]>()
    for (const t of filtered) {
      const list = map.get(t.brand.name) ?? []
      list.push(t)
      map.set(t.brand.name, list)
    }
    return [...map.entries()]
  }, [filtered])

  function addToCollection(tobaccoId: string) {
    startTransition(async () => {
      setMessage(null)
      const res = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tobaccoId, grams: 50, rating: 4 }),
      })
      if (!res.ok) {
        setMessage("Не удалось добавить в коллекцию")
        return
      }
      setItems((prev) =>
        prev.map((t) => (t.id === tobaccoId ? { ...t, inCollection: true } : t))
      )
      setMessage("Добавлено в коллекцию")
    })
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
                const tags = parseTags(tobacco.tags)
                return (
                  <Card key={tobacco.id} className="transition hover:border-white/20">
                    <CardHeader>
                      <CardTitle>{tobacco.name}</CardTitle>
                      <CardDescription>{tobacco.brand.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {tobacco.profile ? (
                        <ProfileBars profile={tobacco.profile} compact />
                      ) : null}
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                      <Button
                        className="w-full"
                        variant={tobacco.inCollection ? "secondary" : "default"}
                        disabled={tobacco.inCollection || pending}
                        onClick={() => addToCollection(tobacco.id)}
                      >
                        <Plus className="h-4 w-4" />
                        {tobacco.inCollection ? "Уже в коллекции" : "В коллекцию"}
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
