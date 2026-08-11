import { FlavorKey, FLAVOR_LABELS, FlavorProfile } from "@/types"
import { cn } from "@/lib/utils"

const KEYS: FlavorKey[] = [
  "strength",
  "cold",
  "sweetness",
  "sourness",
  "fruity",
  "intensity",
]

export function ProfileBars({
  profile,
  className,
  compact = false,
}: {
  profile: FlavorProfile
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {KEYS.map((key) => {
        const value = profile[key]
        const pct = Math.min(100, (value / 5) * 100)
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>{FLAVOR_LABELS[key]}</span>
              {!compact ? <span>{value}</span> : null}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-700 to-amber-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
