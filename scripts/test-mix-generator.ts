/**
 * Mix generator test suite (no vitest required).
 * Run: npx tsx scripts/test-mix-generator.ts
 */
import {
  calculateGrams,
  calculateMixSimilarity,
  estimateMixCold,
  generateMixes,
  validateMixAgainstInventory,
} from "../src/lib/mix-generator"
import {
  createDefaultState,
  prepareMix,
  saveMixFromSuggestion,
  undoMixPreparation,
} from "../src/lib/store"
import { FlavorProfile, MixSuggestion, TobaccoCandidate } from "../src/types"
import { getDefaultLimits, isColdAccentTobacco } from "../src/lib/mix-generator/limits"
import { RankedCandidate } from "../src/lib/mix-generator/types"

type TestResult = { name: string; ok: boolean; detail?: string }

const results: TestResult[] = []

function pass(name: string, detail?: string) {
  results.push({ name, ok: true, detail })
}
function fail(name: string, detail: string) {
  results.push({ name, ok: false, detail })
}

function profile(partial: Partial<FlavorProfile>): FlavorProfile {
  return {
    strength: 3,
    cold: 0,
    sweetness: 3,
    sourness: 2,
    fruity: 3,
    dessert: 1,
    spicy: 0,
    herbal: 0,
    intensity: 3,
    ...partial,
  }
}

function tobacco(
  id: string,
  name: string,
  grams: number,
  p: Partial<FlavorProfile> = {},
  tags: string[] = ["fruity"]
): TobaccoCandidate {
  return {
    id,
    name,
    brandName: "Test",
    tags,
    profile: profile(p),
    gramsAvailable: grams,
  }
}

function asRanked(t: TobaccoCandidate): RankedCandidate {
  return {
    ...t,
    fitness: 0.7,
    direction: "fruity",
    isColdAccent: isColdAccentTobacco(t),
    limits: getDefaultLimits(t),
  }
}

const collection: TobaccoCandidate[] = [
  tobacco("mango", "Mango Lassi", 30, { fruity: 4, sweetness: 4 }),
  tobacco("passion", "Passion Fruit", 25, { fruity: 4, sourness: 3 }),
  tobacco("pineapple", "Pineapple", 20, { fruity: 4, sourness: 2 }),
  tobacco("lulo", "Lulo", 8, { fruity: 3, sourness: 4 }),
  tobacco("undercoal", "Undercoal", 40, { fruity: 2, sweetness: 2, intensity: 2 }),
  tobacco("limoncello", "Limoncello", 25, { sourness: 4, fruity: 3 }, ["citrus", "lemon"]),
  tobacco("icegum", "Ice Fruit Gum", 10, { cold: 3, fruity: 3, sweetness: 3 }, ["cold", "fruity"]),
  tobacco("supernova", "Supernova", 5, { cold: 5, intensity: 4 }, ["cold"]),
]

const baseTarget = profile({ cold: 1, fruity: 4, sweetness: 3 })

// --- Test 1: cannot use 15g from 10g stock ---
{
  const name = "Test1 inventory cap 10g vs 15g request"
  const t = asRanked(tobacco("x", "X", 10))
  const grams = calculateGrams([t, asRanked(tobacco("y", "Y", 50))], [75, 25], 20)
  // 75% of 20 = 15 > 10 → should fail or redistribute; must not exceed 10 for x
  if (!grams) pass(name, "rejected infeasible plan")
  else if (grams[0] <= 10.05) pass(name, `got ${grams[0]}g`)
  else fail(name, `used ${grams[0]}g > 10`)
}

// --- Test 2: max 5g from 5g stock in 20g bowl ---
{
  const name = "Test2 max use 5g leftover"
  const a = asRanked(tobacco("a", "A", 5, { fruity: 4 }))
  const b = asRanked(tobacco("b", "B", 40, { fruity: 3 }))
  const c = asRanked(tobacco("c", "C", 40, { fruity: 3 }))
  const grams = calculateGrams([a, b, c], [25, 40, 35], 20)
  if (!grams) fail(name, "null grams")
  else if (grams[0] <= 5.05 && Math.abs(grams.reduce((s, g) => s + g, 0) - 20) <= 0.2)
    pass(name, `A=${grams[0]} sum=${grams.reduce((s, g) => s + g, 0)}`)
  else fail(name, JSON.stringify(grams))
}

// --- Test 3: exactly 3 ingredients ---
{
  const name = "Test3 tobaccoCount=3 exact"
  const result = generateMixes({
    candidates: collection,
    tobaccoCount: 3,
    bowlSize: 20,
    targetProfile: baseTarget,
    preferences: ["фруктовый"],
    exclusions: [],
    requireStock: true,
    mode: "balanced",
    limit: 8,
  })
  if (result.mixes.length === 0) fail(name, result.error ?? "no mixes")
  else if (result.mixes.every((m) => m.components.length === 3))
    pass(name, `${result.mixes.length} mixes`)
  else fail(name, result.mixes.map((m) => m.components.length).join(","))
}

// --- Test 4: exactly 4 ingredients ---
{
  const name = "Test4 tobaccoCount=4 exact"
  const result = generateMixes({
    candidates: collection,
    tobaccoCount: 4,
    bowlSize: 20,
    targetProfile: baseTarget,
    preferences: ["фруктовый"],
    exclusions: [],
    requireStock: true,
    mode: "balanced",
    limit: 6,
  })
  if (result.mixes.length === 0) fail(name, result.error ?? "no mixes")
  else if (result.mixes.every((m) => m.components.length === 4))
    pass(name, `${result.mixes.length} mixes`)
  else fail(name, result.mixes.map((m) => m.components.length).join(","))
}

// --- Test 5: diversity among up to 10 mixes ---
{
  const name = "Test5 diversity not near-duplicates"
  const result = generateMixes({
    candidates: collection,
    tobaccoCount: 3,
    bowlSize: 20,
    targetProfile: baseTarget,
    preferences: ["фруктовый", "кислый"],
    exclusions: [],
    requireStock: true,
    mode: "balanced",
    limit: 10,
  })
  let maxSim = 0
  for (let i = 0; i < result.mixes.length; i++) {
    for (let j = i + 1; j < result.mixes.length; j++) {
      const sim = calculateMixSimilarity(
        {
          tobaccoIds: result.mixes[i].components.map((c) => c.tobaccoId),
          percents: result.mixes[i].components.map((c) => c.percent),
          profile: result.mixes[i].profile,
        },
        {
          tobaccoIds: result.mixes[j].components.map((c) => c.tobaccoId),
          percents: result.mixes[j].components.map((c) => c.percent),
          profile: result.mixes[j].profile,
        }
      )
      maxSim = Math.max(maxSim, sim)
    }
  }
  if (result.mixes.length < 2) fail(name, `only ${result.mixes.length} mixes`)
  else if (maxSim < 0.92) pass(name, `n=${result.mixes.length} maxSim=${maxSim.toFixed(2)}`)
  else fail(name, `maxSim=${maxSim.toFixed(2)} too high`)
}

// --- Test 6: cold 0 no SuperNova ---
{
  const name = "Test6 cold=0 no supernova/cold accents"
  const result = generateMixes({
    candidates: collection,
    tobaccoCount: 3,
    bowlSize: 20,
    targetProfile: profile({ cold: 0, fruity: 4 }),
    preferences: ["фруктовый"],
    exclusions: ["без холода"],
    requireStock: true,
    mode: "balanced",
    limit: 8,
  })
  const hasColdAccent = result.mixes.some((m) =>
    m.components.some((c) => /supernova|ice fruit gum/i.test(c.name))
  )
  if (result.mixes.length === 0) fail(name, result.error ?? "empty")
  else if (!hasColdAccent) pass(name, `${result.mixes.length} mixes`)
  else fail(name, "found cold accent")
}

// --- Test 7: cold 1 stays light ---
{
  const name = "Test7 cold=1 stays light"
  const result = generateMixes({
    candidates: collection,
    tobaccoCount: 3,
    bowlSize: 20,
    targetProfile: profile({ cold: 1, fruity: 4 }),
    preferences: ["фруктовый"],
    exclusions: [],
    requireStock: true,
    mode: "balanced",
    limit: 6,
  })
  const okCold = result.mixes.every((m) => {
    const cold = estimateMixCold(
      m.components.map((c) => ({ profile: c.profile })),
      m.components.map((c) => c.percent)
    )
    return cold <= 2.5
  })
  if (result.mixes.length === 0) fail(name, result.error ?? "empty")
  else if (okCold) pass(name, `${result.mixes.length} mixes`)
  else fail(name, "cold too high")
}

// --- Test 8: prepare deducts grams ---
{
  const name = "Test8 prepare deducts grams"
  let state = createDefaultState()
  state = {
    ...state,
    collection: [
      {
        id: "c1",
        tobaccoId: "mango",
        grams: 30,
        rating: 4,
        note: null,
        updatedAt: new Date().toISOString(),
      },
      {
        id: "c2",
        tobaccoId: "passion",
        grams: 25,
        rating: 4,
        note: null,
        updatedAt: new Date().toISOString(),
      },
      {
        id: "c3",
        tobaccoId: "undercoal",
        grams: 40,
        rating: 4,
        note: null,
        updatedAt: new Date().toISOString(),
      },
    ],
  }

  const suggestion: MixSuggestion = {
    id: "t",
    name: "Test Mix",
    variantType: "safe",
    score: 0.9,
    totalGrams: 20,
    components: [
      {
        tobaccoId: "mango",
        name: "Mango",
        brandName: "T",
        role: "base",
        percent: 45,
        grams: 9,
        profile: profile({ fruity: 4 }),
        gramsAvailable: 30,
        sufficient: true,
      },
      {
        tobaccoId: "passion",
        name: "Passion",
        brandName: "T",
        role: "support",
        percent: 30,
        grams: 6,
        profile: profile({ fruity: 4 }),
        gramsAvailable: 25,
        sufficient: true,
      },
      {
        tobaccoId: "undercoal",
        name: "Undercoal",
        brandName: "T",
        role: "accent",
        percent: 25,
        grams: 5,
        profile: profile({}),
        gramsAvailable: 40,
        sufficient: true,
      },
    ],
    profile: profile({ fruity: 4 }),
    explanation: "test",
    availability: { available: true, warnings: [] },
  }

  state = saveMixFromSuggestion(state, suggestion)
  const mixId = state.mixes[0].id
  const prepared = prepareMix(state, mixId)
  const mango = prepared.state.collection.find((c) => c.tobaccoId === "mango")
  if (prepared.ok && mango && Math.abs(mango.grams - 21) < 0.05) pass(name, `mango=${mango.grams}`)
  else fail(name, prepared.error ?? `mango=${mango?.grams}`)
}

// --- Test 9: undo restores grams ---
{
  const name = "Test9 undo restores grams"
  let state = createDefaultState()
  state = {
    ...state,
    collection: [
      {
        id: "c1",
        tobaccoId: "mango",
        grams: 30,
        rating: null,
        note: null,
        updatedAt: new Date().toISOString(),
      },
      {
        id: "c2",
        tobaccoId: "passion",
        grams: 25,
        rating: null,
        note: null,
        updatedAt: new Date().toISOString(),
      },
    ],
  }
  const suggestion: MixSuggestion = {
    id: "t2",
    name: "Undo Mix",
    variantType: "safe",
    score: 1,
    totalGrams: 20,
    components: [
      {
        tobaccoId: "mango",
        name: "Mango",
        brandName: "T",
        role: "base",
        percent: 50,
        grams: 10,
        profile: profile({}),
        gramsAvailable: 30,
        sufficient: true,
      },
      {
        tobaccoId: "passion",
        name: "Passion",
        brandName: "T",
        role: "support",
        percent: 50,
        grams: 10,
        profile: profile({}),
        gramsAvailable: 25,
        sufficient: true,
      },
    ],
    profile: profile({}),
    explanation: "t",
    availability: { available: true, warnings: [] },
  }
  state = saveMixFromSuggestion(state, suggestion)
  const mixId = state.mixes[0].id
  const prepared = prepareMix(state, mixId)
  const undone = undoMixPreparation(prepared.state, mixId)
  const mango = undone.state.collection.find((c) => c.tobaccoId === "mango")
  if (undone.ok && mango && Math.abs(mango.grams - 30) < 0.05) pass(name, `mango=${mango.grams}`)
  else fail(name, undone.error ?? `mango=${mango?.grams}`)
}

// --- Test 10: insufficient tobaccos message ---
{
  const name = "Test10 insufficient for 5 components"
  const tiny = collection.slice(0, 3)
  const result = generateMixes({
    candidates: tiny,
    tobaccoCount: 5,
    bowlSize: 20,
    targetProfile: baseTarget,
    preferences: [],
    exclusions: [],
    requireStock: true,
    mode: "balanced",
    limit: 5,
  })
  if (result.mixes.length === 0 && result.error && /недостаточно/i.test(result.error))
    pass(name, result.error)
  else fail(name, result.error ?? `mixes=${result.mixes.length}`)
}

// --- Inventory validation PASS suite ---
{
  const name = "Inventory validation suite"
  const result = generateMixes({
    candidates: collection,
    tobaccoCount: 3,
    bowlSize: 20,
    targetProfile: baseTarget,
    preferences: ["фруктовый"],
    exclusions: [],
    requireStock: true,
    mode: "balanced",
    limit: 5,
  })
  const allValid = result.mixes.every((m) => {
    const v = validateMixAgainstInventory(
      {
        bowlSize: 20,
        components: m.components.map((c) => ({
          tobaccoId: c.tobaccoId,
          percent: c.percent,
          grams: c.grams,
        })),
      },
      collection,
      { tobaccoCount: 3, targetCold: 1 }
    )
    return v.ok
  })
  if (result.mixes.length > 0 && allValid) pass(name, `${result.mixes.length} valid`)
  else fail(name, "invalid mixes leaked")
}

// --- Gram calculation exact bowl ---
{
  const name = "Gram calculation bowl sum"
  const a = asRanked(tobacco("a", "A", 50))
  const b = asRanked(tobacco("b", "B", 50))
  const c = asRanked(tobacco("c", "C", 50))
  const grams = calculateGrams([a, b, c], [45, 30, 25], 20)
  const sum = grams?.reduce((s, g) => s + g, 0) ?? -1
  if (grams && Math.abs(sum - 20) <= 0.15) pass(name, `sum=${sum}`)
  else fail(name, `sum=${sum}`)
}

// --- Similarity near-identical ---
{
  const name = "Similarity near-identical mixes"
  const sim = calculateMixSimilarity(
    { tobaccoIds: ["a", "b", "c"], percents: [45, 30, 25] },
    { tobaccoIds: ["a", "b", "c"], percents: [40, 35, 25] }
  )
  if (sim > 0.85) pass(name, `sim=${sim.toFixed(2)}`)
  else fail(name, `sim=${sim.toFixed(2)} too low`)
}

// Print report
const passed = results.filter((r) => r.ok).length
const total = results.length
console.log("")
console.log("Mix generator tests:", `${passed} passed / ${total} total`)
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"} · ${r.name}${r.detail ? ` — ${r.detail}` : ""}`)
}

const groups = {
  inventory: results.filter((r) => /Test1|Test2|Inventory validation/i.test(r.name)),
  grams: results.filter((r) => /Gram calculation|Test2/i.test(r.name)),
  diversity: results.filter((r) => /Test5|Similarity/i.test(r.name)),
  cold: results.filter((r) => /Test6|Test7/i.test(r.name)),
}

function groupStatus(items: TestResult[]) {
  return items.every((i) => i.ok) ? "PASS" : "FAIL"
}

console.log("")
console.log("Inventory validation:", groupStatus(groups.inventory))
console.log("Gram calculation:", groupStatus(groups.grams))
console.log("Diversity validation:", groupStatus(groups.diversity))
console.log("Cold validation:", groupStatus(groups.cold))

if (passed < total) process.exit(1)
