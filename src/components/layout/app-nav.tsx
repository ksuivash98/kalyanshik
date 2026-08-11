"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FlaskConical,
  Home,
  Library,
  PlusCircle,
  Sparkles,
  Warehouse,
} from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/collection", label: "Коллекция", icon: Warehouse },
  { href: "/catalog", label: "Каталог", icon: Library },
  { href: "/create-mix", label: "Создать микс", icon: PlusCircle },
  { href: "/mixes", label: "Мои миксы", icon: FlaskConical },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0a09]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 text-stone-950 shadow-lg shadow-amber-900/30">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="font-semibold tracking-wide text-stone-50">Hookah Mix</div>
              <div className="text-[11px] text-stone-500">цифровой помощник кальянщика</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-white/10 text-amber-300"
                      : "text-stone-400 hover:bg-white/5 hover:text-stone-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0c0a09]/95 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-2">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px]",
                  active ? "text-amber-300" : "text-stone-500"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
