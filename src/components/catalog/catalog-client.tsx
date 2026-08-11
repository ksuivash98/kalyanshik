"use client"

import { useMemo, useState } from "react"
import { Info, Plus, Search } from "lucide-react"
import { useAppStore } from "@/components/providers/app-store-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  CATALOG_DB,
  CATALOG_VALIDATION,
  getBrandById,
  toRecommendationProfile,
} from "@/data/catalog"
import { FLAVOR_TAG_BY_ID } from "@/data/catalog/flavor-tags"
import { LeafType, TobaccoStatus } from "@/types/catalog"

export function CatalogClient() {
  const { ready, state, addTobacco } = useAppStore()
  const [query, setQuery] = useState("")
  const [brandId, setBrandId] = useState("all")
  const [country, setCountry] = useState("all")
  const [line, setLine] = useState("all")
  const [leafType, setLeafType] = useState<"all" | LeafType>("all")
  const [status, setStatus] = useState<"all" | TobaccoStatus>("all")
  const [category, setCategory] = useState("all")
  const [strength, setStrength] = useState("all")
  const [cold, setCold] = useState("all")
  const [onlyWithStockInCollection, setOnlyWithStockInCollection] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const inCollection = useMemo(
    () => new Set(state.collection.map((c) => c.tobaccoId)),
    [state.collection]
  )

  const countries = useMemo(
    () =>
      [...new Set(CATALOG_DB.brands.map((b) => b.country).filter(Boolean))].sort(),
    []
  )

  const lines = useMemo(() => {
    const set = new Set<string>()
    for (const t of CATALOG_DB.tobaccos) {
      if (t.line) set.add(t.line)
    }
    return [...set].sort()
  }, [])

  const filtered = useMemo(() => {
    return CATALOG_DB.tobaccos.filter((t) => {
      const brand = getBrandById(t.brandId)
      if (!brand) return false
      const profile = toRecommendationProfile(t)
      const q = query.trim().toLowerCase()
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        brand.name.toLowerCase().includes(q) ||
        t.aliases.some((a) => a.toLowerCase().includes(q)) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      const matchBrand = brandId === "all" || t.brandId === brandId
      const matchCountry = country === "all" || brand.country === country
      const matchLine = line === "all" || t.line === line
      const matchLeaf = leafType === "all" || brand.leafType === leafType
      const matchStatus = status === "all" || t.status === status
      const matchCategory =
        category === "all" ||
        t.tags.some((tag) => FLAVOR_TAG_BY_ID[tag]?.category === category)
      const matchStrength =
        strength === "all" || profile.strength === Number(strength)
      const matchCold = cold === "all" || profile.cold === Number(cold)
      const matchOwned = !onlyWithStockInCollection || inCollection.has(t.id)
      return (
        matchQuery &&
        matchBrand &&
        matchCountry &&
        matchLine &&
        matchLeaf &&
        matchStatus &&
        matchCategory &&
        matchStrength &&
        matchCold &&
        matchOwned
      )
    })
  }, [
    query,
    brandId,
    country,
    line,
    leafType,
    status,
    category,
    strength,
    cold,
    onlyWithStockInCollection,
    inCollection,
  ])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const t of filtered) {
      const brand = getBrandById(t.brandId)
      const key = brand?.name ?? t.brandId
      const list = map.get(key) ?? []
      list.push(t)
      map.set(key, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  if (!ready) {
    return <div className="py-20 text-center text-stone-500">Загрузка...</div>
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold text-stone-50">Каталог табаков</h1>
        <p className="mt-2 text-stone-400">
          {CATALOG_VALIDATION.tobaccoProducts} вкусов · {CATALOG_VALIDATION.brands} брендов ·
          только подтверждённые позиции с sourceUrl
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
        <div className="mb-1 flex items-center gap-2 font-medium">
          <Info className="h-4 w-4" />
          Важно о данных
        </div>
        Вкусовые шкалы помечены как «Оценка приложения» — это не официальные цифры
        производителя. Active: {CATALOG_VALIDATION.active}, discontinued:{" "}
        {CATALOG_VALIDATION.discontinued}.
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <Input
          className="pl-9"
          placeholder="Поиск табака или бренда..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
        >
          <option value="all">Бренд</option>
          {CATALOG_DB.brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="all">Страна</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={line}
          onChange={(e) => setLine(e.target.value)}
        >
          <option value="all">Линейка</option>
          {lines.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={leafType}
          onChange={(e) => setLeafType(e.target.value as "all" | LeafType)}
        >
          <option value="all">Тип листа</option>
          {(["BLONDE", "DARK", "RED", "MIXED", "UNKNOWN"] as LeafType[]).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | TobaccoStatus)}
        >
          <option value="all">Статус</option>
          {(["ACTIVE", "DISCONTINUED", "LIMITED", "UNKNOWN"] as TobaccoStatus[]).map(
            (v) => (
              <option key={v} value={v}>
                {v}
              </option>
            )
          )}
        </select>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Вкусовая категория</option>
          {[
            "FRUIT",
            "CITRUS",
            "BERRY",
            "DESSERT",
            "DRINK",
            "HERBAL",
            "SPICE",
            "MINT_COLD",
          ].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={strength}
          onChange={(e) => setStrength(e.target.value)}
        >
          <option value="all">Крепость (оценка)</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
          value={cold}
          onChange={(e) => setCold(e.target.value)}
        >
          <option value="all">Холод (оценка)</option>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <Switch
        checked={onlyWithStockInCollection}
        onCheckedChange={setOnlyWithStockInCollection}
        label="Только уже добавленные в мою коллекцию"
      />

      {message ? <p className="text-sm text-amber-300">{message}</p> : null}

      <p className="text-sm text-stone-500">Найдено: {filtered.length}</p>

      <div className="space-y-8">
        {grouped.map(([brandName, list]) => (
          <section key={brandName} className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-100">{brandName}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((tobacco) => {
                const brand = getBrandById(tobacco.brandId)!
                const profile = toRecommendationProfile(tobacco)
                const owned = inCollection.has(tobacco.id)
                const tagLabels = tobacco.tags
                  .map((t) => FLAVOR_TAG_BY_ID[t]?.labelRu ?? t)
                  .slice(0, 3)

                return (
                  <Card key={tobacco.id} className="transition hover:border-white/20">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardDescription>{brand.name}</CardDescription>
                          <CardTitle>{tobacco.name}</CardTitle>
                        </div>
                        <Badge>{tobacco.status}</Badge>
                      </div>
                      {tobacco.line ? (
                        <p className="text-xs text-stone-500">Линейка: {tobacco.line}</p>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {tagLabels.map((label) => (
                          <Badge key={label}>{label}</Badge>
                        ))}
                      </div>

                      <div className="space-y-1 text-sm text-stone-300">
                        <div className="flex justify-between">
                          <span>Мята / холод</span>
                          <span>
                            {profile.cold}/5{" "}
                            <span className="text-[10px] text-stone-500">
                              Оценка приложения
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Сладость</span>
                          <span>
                            {profile.sweetness}/5{" "}
                            <span className="text-[10px] text-stone-500">
                              Оценка приложения
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Крепость</span>
                          <span>
                            {profile.strength}/5{" "}
                            <span className="text-[10px] text-stone-500">
                              Оценка приложения
                            </span>
                          </span>
                        </div>
                      </div>

                      <a
                        href={tobacco.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-amber-400/80 hover:underline"
                      >
                        Источник
                      </a>

                      <Button
                        className="w-full"
                        variant={owned ? "secondary" : "default"}
                        disabled={owned}
                        onClick={() => {
                          addTobacco(tobacco.id, 50)
                          setMessage("Добавлено в мою коллекцию")
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        {owned ? "Уже в коллекции" : "Добавить в мою коллекцию"}
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
