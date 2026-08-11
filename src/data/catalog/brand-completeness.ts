export type BrandCompletenessLevel = "HIGH" | "MEDIUM" | "LOW" | "NONE"

export type BrandCompleteness = {
  brandId: string
  found: number
  sources: number
  lines: number
  level: BrandCompletenessLevel
  notes?: string
}

/**
 * Manual completeness after RU-market research pass (2026-08-11).
 * HIGH = multi-page / multi-store coverage; LOW = no reliable RU listing found.
 */
export const BRAND_COMPLETENESS: Record<string, BrandCompletenessLevel> = {
  darkside: "HIGH",
  musthave: "HIGH",
  blackburn: "HIGH",
  element: "HIGH",
  duft: "HIGH",
  sebero: "HIGH",
  chabacco: "HIGH",
  spectrum: "HIGH",
  satyr: "HIGH",
  jam: "HIGH",
  dogma: "HIGH",
  serbetli: "HIGH",
  "al-fakher": "HIGH",
  kraken: "HIGH",
  bliss: "HIGH",
  fake: "HIGH",
  joy: "HIGH",
  palitra: "HIGH",
  snobless: "HIGH",
  take: "HIGH",
  wto: "HIGH",
  helix: "HIGH",
  tangiers: "HIGH",
  hlgn: "HIGH",
  molodost: "HIGH",
  severnyy: "HIGH",
  overdose: "HIGH",
  starline: "HIGH",
  bonche: "HIGH",
  banger: "HIGH",
  "sapphire-crown": "HIGH",
  jent: "HIGH",
  trofimoff: "HIGH",
  nash: "HIGH",
  huligan: "HIGH",
  sarma: "HIGH",
  adalya: "HIGH",
  deus: "MEDIUM",
  brusko: "MEDIUM",
  "daily-hookah": "MEDIUM",
  "smoke-angels": "MEDIUM",
  cobra: "MEDIUM",
  morpheus: "MEDIUM",
  aircraft: "MEDIUM",
  mattpear: "HIGH",
  iskra: "HIGH",
  funel: "LOW",
  "dead-horse": "LOW",
  blackleaf: "LOW",
  unity: "LOW",
  craftium: "LOW",
  "northern-forest": "LOW",
  "social-smoke": "LOW",
  fumari: "NONE",
  zomo: "NONE",
  jibiar: "NONE",
  azure: "NONE",
  overdozz: "LOW",
}

export function computeBrandCompleteness(
  brandId: string,
  found: number,
  sources: number,
  lines: number
): BrandCompleteness {
  const level =
    BRAND_COMPLETENESS[brandId] ??
    (found === 0
      ? "NONE"
      : sources >= 2 && found >= 40
        ? "HIGH"
        : sources >= 1 && found >= 15
          ? "MEDIUM"
          : found > 0
            ? "LOW"
            : "NONE")
  return { brandId, found, sources, lines, level }
}
