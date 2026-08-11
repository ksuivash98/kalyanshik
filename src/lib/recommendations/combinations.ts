import { MixRole } from "@/types"

export type RolePlan = {
  role: MixRole
  percent: number
}

const ROLE_PLANS: Record<number, RolePlan[]> = {
  2: [
    { role: "base", percent: 60 },
    { role: "support", percent: 40 },
  ],
  3: [
    { role: "base", percent: 50 },
    { role: "support", percent: 30 },
    { role: "accent", percent: 20 },
  ],
  4: [
    { role: "base", percent: 40 },
    { role: "support", percent: 30 },
    { role: "support", percent: 20 },
    { role: "accent", percent: 10 },
  ],
  5: [
    { role: "base", percent: 40 },
    { role: "support", percent: 25 },
    { role: "support", percent: 15 },
    { role: "accent", percent: 12 },
    { role: "accent", percent: 8 },
  ],
}

export function getRolePlan(count: number): RolePlan[] {
  return ROLE_PLANS[count] ?? ROLE_PLANS[3]
}

export function generateCombinations<T>(
  items: T[],
  size: number,
  limit = 120
): T[][] {
  if (size <= 0 || items.length < size) return []

  const results: T[][] = []

  function walk(start: number, path: T[]) {
    if (results.length >= limit) return
    if (path.length === size) {
      results.push([...path])
      return
    }
    for (let i = start; i < items.length; i++) {
      path.push(items[i])
      walk(i + 1, path)
      path.pop()
      if (results.length >= limit) return
    }
  }

  walk(0, [])
  return results
}

export function diversifyCombinations<T extends { id: string }>(
  combinations: T[][],
  take: number
): T[][] {
  const selected: T[][] = []
  const usedPairs = new Set<string>()

  for (const combo of combinations) {
    const ids = combo.map((c) => c.id).sort()
    const pairKey = ids.slice(0, 2).join("|")
    if (selected.length > 0 && usedPairs.has(pairKey)) continue
    selected.push(combo)
    usedPairs.add(pairKey)
    if (selected.length >= take) break
  }

  if (selected.length < take) {
    for (const combo of combinations) {
      if (selected.includes(combo)) continue
      selected.push(combo)
      if (selected.length >= take) break
    }
  }

  return selected
}
