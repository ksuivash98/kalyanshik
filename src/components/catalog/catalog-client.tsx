"use client"

import { useEffect, useMemo, useState } from "react"
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
import { normalizeTobaccoName } from "@/lib/catalog/normalizer"
import { tobaccoMatchesQuery } from "@/lib/catalog/search"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

const PAGE_SIZE = 50

type CatalogGroup = {
  key: string
  brandId: string
  name: string
  variants: TobaccoSeed[]
}

const FLAVOR_FILTERS = [
  { id: "FRUIT", label: "Фруктовый" },
  { id: "BERRY", label: "Ягодный" },
  { id: "CITRUS", label: "Цитрусовый" },
  { id: "DESSERT", label: "Десертный" },
  { id: "DRINK", label: "Напиток" },
  { id: "tea", label: "Чай", tag: true },
  { id: "coffee", label: "Кофе", tag: true },
  { id: "SPICE", label: "Пряный" },
  { id: "HERBAL", label: "Травяной" },
  { id: "cream", label: "Сливочный", tag: true },
] as const

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function CatalogClient() {
  const { ready, state, addTobacco } = useAppStore()
  const [query, setQuery] = useState("")
  const [brandIds, setBrandIds] = useState<string[]>([])
  const [linesSelected, setLinesSelected] = useState<string[]>([])
  const [status, setStatus] = useState<"all" | TobaccoStatus | "ACTIVE_LIMITED">("ACTIVE_LIMITED")
  const [flavorFilters, setFlavorFilters] = useState<string[]>([])
  const [onlyWithStockInCollection, setOnlyWithStockInCollection] = useState(false)
  const [page, setPage] = useState(1)
  const [message, setMessage] = useState<string | null>(null)
  const [draftTobacco, setDraftTobacco] = useState<TobaccoSeed | null>(null)
  const [draftGrams, setDraftGrams] = useState(50)
  const [draftRating, setDraftRating] = useState(4)
  const [draftNote, setDraftNote] = useState("")

  const inCollection = useMemo(
    () => new Set(state.collection.map((c) => c.tobaccoId)),
    [state.collection]
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
      const matchQuery = tobaccoMatchesQuery(t, brand.name, query)
      const matchBrand = brandIds.length === 0 || brandIds.includes(t.brandId)
      const matchLine =
        linesSelected.length === 0 || (t.line != null && linesSelected.includes(t.line))
      const matchStatus =
        status === "all" ||
        (status === "ACTIVE_LIMITED"
          ? t.status === "ACTIVE" || t.status === "LIMITED"
          : t.status === status)
      const matchFlavor =
        flavorFilters.length === 0 ||
        flavorFilters.some((f) => {
          if (f === "tea" || f === "coffee" || f === "cream") {
            return t.tags.includes(f)
          }
          return t.tags.some((tag) => FLAVOR_TAG_BY_ID[tag]?.category === f)
        })
      const matchOwned = !onlyWithStockInCollection || inCollection.has(t.id)
      return (
        matchQuery &&
        matchBrand &&
        matchLine &&
        matchStatus &&
        matchFlavor &&
        matchOwned
      )
    })
  }, [
    query,
    brandIds,
    linesSelected,
    status,
    flavorFilters,
    onlyWithStockInCollection,
    inCollection,
  ])

  /** One card per brand + flavor name; line variants stay as selectable SKUs. */
  const grouped = useMemo(() => {
    const map = new Map<string, CatalogGroup>()
    for (const t of filtered) {
      const key = `${t.brandId}::${normalizeTobaccoName(t.name)}`
      const existing = map.get(key)
      if (existing) {
        existing.variants.push(t)
      } else {
        map.set(key, {
          key,
          brandId: t.brandId,
          name: t.name,
          variants: [t],
        })
      }
    }
    for (const g of map.values()) {
      g.variants.sort((a, b) => (a.line || "").localeCompare(b.line || "", "ru"))
    }
    return [...map.values()].sort((a, b) => {
      const ba = getBrandById(a.brandId)?.name ?? a.brandId
      const bb = getBrandById(b.brandId)?.name ?? b.brandId
      return ba.localeCompare(bb, "ru") || a.name.localeCompare(b.name, "ru")
    })
  }, [filtered])

  useEffect(() => {
    setPage(1)
  }, [query, brandIds, linesSelected, status, flavorFilters, onlyWithStockInCollection])

  const totalPages = Math.max(1, Math.ceil(grouped.length / PAGE_SIZE))
  const pageItems = grouped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (!ready) {
    return <div className="py-20 text-center text-stone-500">Загрузка...</div>
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold text-stone-50">Каталог табаков</h1>
        <p className="mt-2 text-stone-400">
          {CATALOG_VALIDATION.tobaccoProducts} вкусов · {CATALOG_VALIDATION.brands} брендов ·
          только подтверждённые позиции с российскими источниками
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
          placeholder="Поиск: Mango, манго, Darkside, лимон, мята, ягоды..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-stone-500">Бренд</p>
          <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
            {CATALOG_DB.brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBrandIds((prev) => toggleInList(prev, b.id))}
                className={`rounded-lg px-2 py-1 text-xs ${
                  brandIds.includes(b.id)
                    ? "bg-amber-500/30 text-amber-100"
                    : "bg-white/5 text-stone-400"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-stone-500">Линейка</p>
          <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
            {lines.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLinesSelected((prev) => toggleInList(prev, l))}
                className={`rounded-lg px-2 py-1 text-xs ${
                  linesSelected.includes(l)
                    ? "bg-amber-500/30 text-amber-100"
                    : "bg-white/5 text-stone-400"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["ACTIVE_LIMITED", "Активные"],
            ["LIMITED", "Лимитированные"],
            ["DISCONTINUED", "Снятые"],
            ["all", "Все"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              status === value ? "bg-amber-500/30 text-amber-100" : "bg-white/5 text-stone-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FLAVOR_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFlavorFilters((prev) => toggleInList(prev, f.id))}
            className={`rounded-lg px-2.5 py-1 text-xs ${
              flavorFilters.includes(f.id)
                ? "bg-amber-500/30 text-amber-100"
                : "bg-white/5 text-stone-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Switch
        checked={onlyWithStockInCollection}
        onCheckedChange={setOnlyWithStockInCollection}
        label="Только уже добавленные в мою коллекцию"
      />

      {message ? <p className="text-sm text-amber-300">{message}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Найдено: {grouped.length} вкусов
          {filtered.length !== grouped.length
            ? ` (${filtered.length} SKU по линейкам)`
            : null}{" "}
          · страница {page}/{totalPages} · по {PAGE_SIZE}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Назад
          </Button>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Далее
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pageItems.map((group) => {
          const brand = getBrandById(group.brandId)!
          const primary =
            group.variants.find((v) => linesSelected.includes(v.line || "")) ??
            group.variants[0]
          const profile = toRecommendationProfile(primary)
          const ownedAny = group.variants.some((v) => inCollection.has(v.id))
          const tagLabels = [...new Set(group.variants.flatMap((v) => v.tags))]
            .map((t) => FLAVOR_TAG_BY_ID[t]?.labelRu ?? t)
            .slice(0, 4)
          const lineLabels = group.variants
            .map((v) => v.line)
            .filter((l): l is string => Boolean(l))

          return (
            <Card key={group.key} className="transition hover:border-white/20">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardDescription>{brand.name}</CardDescription>
                    <CardTitle>{group.name}</CardTitle>
                  </div>
                  <Badge>{primary.status}</Badge>
                </div>
                {lineLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {lineLabels.map((line) => (
                      <Badge key={line}>{line}</Badge>
                    ))}
                  </div>
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
                      <span className="text-[10px] text-stone-500">Оценка приложения</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Сладость</span>
                    <span>
                      {profile.sweetness}/5{" "}
                      <span className="text-[10px] text-stone-500">Оценка приложения</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Крепость</span>
                    <span>
                      {profile.strength}/5{" "}
                      <span className="text-[10px] text-stone-500">Оценка приложения</span>
                    </span>
                  </div>
                </div>

                {primary.sourceUrl ? (
                  <a
                    href={primary.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-amber-400/80 hover:underline"
                  >
                    Источник
                  </a>
                ) : null}

                <Button
                  className="w-full"
                  variant={ownedAny ? "secondary" : "default"}
                  onClick={() => {
                    setDraftTobacco(primary)
                    setDraftGrams(50)
                    setDraftRating(4)
                    setDraftNote("")
                  }}
                >
                  <Plus className="h-4 w-4" />
                  {ownedAny ? "Обновить в коллекции" : "Добавить в коллекцию"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {draftTobacco ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-stone-950 p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-50">Добавить в коллекцию</h3>
            <p className="mt-1 text-sm text-stone-400">
              {getBrandById(draftTobacco.brandId)?.name} · {draftTobacco.name}
            </p>
            <div className="mt-4 space-y-3">
              {(() => {
                const siblings = CATALOG_DB.tobaccos.filter(
                  (t) =>
                    t.brandId === draftTobacco.brandId &&
                    normalizeTobaccoName(t.name) === normalizeTobaccoName(draftTobacco.name)
                )
                if (siblings.length <= 1) return null
                return (
                  <label className="block text-sm text-stone-300">
                    Линейка
                    <select
                      className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
                      value={draftTobacco.id}
                      onChange={(e) => {
                        const next = siblings.find((s) => s.id === e.target.value)
                        if (next) setDraftTobacco(next)
                      }}
                    >
                      {siblings.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.line || "Без линейки"}
                          {s.estimatedProfile.strength != null
                            ? ` · крепость ${s.estimatedProfile.strength}/5`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                )
              })()}
              <label className="block text-sm text-stone-300">
                Количество (г)
                <Input
                  className="mt-1"
                  type="number"
                  min={1}
                  value={draftGrams}
                  onChange={(e) => setDraftGrams(Number(e.target.value) || 0)}
                />
              </label>
              <label className="block text-sm text-stone-300">
                Моя оценка
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm"
                  value={draftRating}
                  onChange={(e) => setDraftRating(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-stone-300">
                Моя заметка
                <Input
                  className="mt-1"
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="Опционально"
                />
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setDraftTobacco(null)}>
                Отмена
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  addTobacco(draftTobacco.id, draftGrams, {
                    rating: draftRating,
                    note: draftNote.trim() || null,
                  })
                  setMessage("Добавлено в мою коллекцию")
                  setDraftTobacco(null)
                }}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
