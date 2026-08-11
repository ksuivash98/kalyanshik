"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SliderProps = {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  className?: string
  label?: string
}

export function Slider({
  value,
  min = 0,
  max = 5,
  step = 1,
  onChange,
  className,
  label,
}: SliderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-300">{label}</span>
          <span className="font-medium text-amber-400">{value}</span>
        </div>
      ) : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="hm-slider w-full"
      />
    </div>
  )
}
