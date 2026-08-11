"use client"

import Link from "next/link"
import { ArrowRight, Plus, Sparkles } from "lucide-react"
import { useAppStore } from "@/components/providers/app-store-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTobaccoById } from "@/data/catalog"

export function HomeDashboard() {
  const { ready, state } = useAppStore()
  const recentMixes = state.mixes.slice(0, 3)

  if (!ready) {
    return <div className="py-20 text-center text-stone-500">Загрузка...</div>
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 via-stone-950 to-black p-8 md:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber-600/20 blur-3xl" />
        <div className="relative max-w-2xl space-y-5">
          <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-300">
            <Sparkles className="mr-1 h-3 w-3" />
            GitHub Pages · данные в браузере
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-50 md:text-5xl">
            Что будем курить сегодня?
          </h1>
          <p className="max-w-xl text-base text-stone-400 md:text-lg">
            Соберите микс по крепости, холоду и вкусу — алгоритм подберёт безопасный,
            интересный и экспериментальный варианты.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/create-mix">
              <Button size="lg">
                Создать микс
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/catalog">
              <Button size="lg" variant="secondary">
                <Plus className="h-4 w-4" />
                Добавить табак
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>В коллекции</CardDescription>
            <CardTitle className="text-3xl">{state.collection.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/collection" className="text-sm text-amber-400 hover:underline">
              Открыть коллекцию →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Сохранённых миксов</CardDescription>
            <CardTitle className="text-3xl">{state.mixes.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/mixes" className="text-sm text-amber-400 hover:underline">
              Мои миксы →
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-stone-50">Последние миксы</h2>
            <p className="text-sm text-stone-500">Хранятся локально в вашем браузере</p>
          </div>
          <Link href="/create-mix">
            <Button variant="outline" size="sm">
              Создать микс →
            </Button>
          </Link>
        </div>

        {recentMixes.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-stone-400">
              Пока нет сохранённых миксов. Создайте первый — это займёт пару минут.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recentMixes.map((mix) => (
              <Card key={mix.id} className="transition hover:border-amber-500/30">
                <CardHeader>
                  <CardTitle>{mix.name}</CardTitle>
                  <CardDescription>
                    {mix.tobaccoCount} табака · {mix.totalGrams} г
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-stone-400">
                  {mix.ingredients.slice(0, 3).map((ing) => {
                    const tobacco = getTobaccoById(ing.tobaccoId)
                    return (
                      <div key={`${mix.id}-${ing.tobaccoId}`} className="flex justify-between">
                        <span>
                          {tobacco?.brand} {tobacco?.name}
                        </span>
                        <span>{ing.percent}%</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
