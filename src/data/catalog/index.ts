import { BRANDS } from "./brands"
import { FLAVOR_TAGS } from "./flavor-tags"
import { ADALYA_TOBACCOS } from "./tobaccos/adalya"
import { AIRCRAFT_TOBACCOS } from "./tobaccos/aircraft"
import { AL_FAKHER_TOBACCOS } from "./tobaccos/al-fakher"
import { BANGER_TOBACCOS } from "./tobaccos/banger"
import { BLACKBURN_TOBACCOS } from "./tobaccos/blackburn"
import { BLISS_TOBACCOS } from "./tobaccos/bliss"
import { BONCHE_TOBACCOS } from "./tobaccos/bonche"
import { BRUSKO_TOBACCOS } from "./tobaccos/brusko"
import { CHABACCO_TOBACCOS } from "./tobaccos/chabacco"
import { COBRA_TOBACCOS } from "./tobaccos/cobra"
import { DAILY_HOOKAH_TOBACCOS } from "./tobaccos/daily-hookah"
import { DARKSIDE_TOBACCOS } from "./tobaccos/darkside"
import { DEUS_TOBACCOS } from "./tobaccos/deus"
import { DOGMA_TOBACCOS } from "./tobaccos/dogma"
import { DUFT_TOBACCOS } from "./tobaccos/duft"
import { ELEMENT_TOBACCOS } from "./tobaccos/element"
import { FAKE_TOBACCOS } from "./tobaccos/fake"
import { HELIX_TOBACCOS } from "./tobaccos/helix"
import { HLGN_TOBACCOS } from "./tobaccos/hlgn"
import { HULIGAN_TOBACCOS } from "./tobaccos/huligan"
import { JAM_TOBACCOS } from "./tobaccos/jam"
import { ISKRA_TOBACCOS } from "./tobaccos/iskra"
import { JENT_TOBACCOS } from "./tobaccos/jent"
import { JOY_TOBACCOS } from "./tobaccos/joy"
import { KRAKEN_TOBACCOS } from "./tobaccos/kraken"
import { MOLODOST_TOBACCOS } from "./tobaccos/molodost"
import { MORPHEUS_TOBACCOS } from "./tobaccos/morpheus"
import { MATTPEAR_TOBACCOS } from "./tobaccos/mattpear"
import { MUSTHAVE_TOBACCOS } from "./tobaccos/musthave"
import { MUASSEL_TOBACCOS } from "./tobaccos/muassel"
import { NASH_TOBACCOS } from "./tobaccos/nash"
import { OVERDOSE_TOBACCOS } from "./tobaccos/overdose"
import { PALITRA_TOBACCOS } from "./tobaccos/palitra"
import { SAPPHIRE_CROWN_TOBACCOS } from "./tobaccos/sapphire-crown"
import { SARMA_TOBACCOS } from "./tobaccos/sarma"
import { SATYR_TOBACCOS } from "./tobaccos/satyr"
import { SEBERO_TOBACCOS } from "./tobaccos/sebero"
import { SERBETLI_TOBACCOS } from "./tobaccos/serbetli"
import { SEVERNYY_TOBACCOS } from "./tobaccos/severnyy"
import { SMOKE_ANGELS_TOBACCOS } from "./tobaccos/smoke-angels"
import { SNOBLESS_TOBACCOS } from "./tobaccos/snobless"
import { SPECTRUM_TOBACCOS } from "./tobaccos/spectrum"
import { STARLINE_TOBACCOS } from "./tobaccos/starline"
import { TAKE_TOBACCOS } from "./tobaccos/take"
import { TANGIERS_TOBACCOS } from "./tobaccos/tangiers"
import { TROFIMOFF_TOBACCOS } from "./tobaccos/trofimoff"
import { WTO_TOBACCOS } from "./tobaccos/wto"
import { BRAND_COMPLETENESS } from "./brand-completeness"
import { CatalogDatabase, TobaccoFlavorProfile, TobaccoSeed } from "@/types/catalog"
import { dedupeByBrandName } from "@/lib/catalog/deduplicator"
import { validateCatalog } from "@/lib/catalog/validator"

const ALL_TOBACCOS: TobaccoSeed[] = dedupeByBrandName([
  ...ADALYA_TOBACCOS,
  ...AIRCRAFT_TOBACCOS,
  ...AL_FAKHER_TOBACCOS,
  ...BANGER_TOBACCOS,
  ...BLACKBURN_TOBACCOS,
  ...BLISS_TOBACCOS,
  ...BONCHE_TOBACCOS,
  ...BRUSKO_TOBACCOS,
  ...CHABACCO_TOBACCOS,
  ...COBRA_TOBACCOS,
  ...DAILY_HOOKAH_TOBACCOS,
  ...DARKSIDE_TOBACCOS,
  ...DEUS_TOBACCOS,
  ...DOGMA_TOBACCOS,
  ...DUFT_TOBACCOS,
  ...ELEMENT_TOBACCOS,
  ...FAKE_TOBACCOS,
  ...HELIX_TOBACCOS,
  ...HLGN_TOBACCOS,
  ...HULIGAN_TOBACCOS,
  ...JAM_TOBACCOS,
  ...ISKRA_TOBACCOS,
  ...JENT_TOBACCOS,
  ...JOY_TOBACCOS,
  ...KRAKEN_TOBACCOS,
  ...MOLODOST_TOBACCOS,
  ...MORPHEUS_TOBACCOS,
  ...MATTPEAR_TOBACCOS,
  ...MUSTHAVE_TOBACCOS,
  ...MUASSEL_TOBACCOS,
  ...NASH_TOBACCOS,
  ...OVERDOSE_TOBACCOS,
  ...PALITRA_TOBACCOS,
  ...SAPPHIRE_CROWN_TOBACCOS,
  ...SARMA_TOBACCOS,
  ...SATYR_TOBACCOS,
  ...SEBERO_TOBACCOS,
  ...SERBETLI_TOBACCOS,
  ...SEVERNYY_TOBACCOS,
  ...SMOKE_ANGELS_TOBACCOS,
  ...SNOBLESS_TOBACCOS,
  ...SPECTRUM_TOBACCOS,
  ...STARLINE_TOBACCOS,
  ...TAKE_TOBACCOS,
  ...TANGIERS_TOBACCOS,
  ...TROFIMOFF_TOBACCOS,
  ...WTO_TOBACCOS,
])

export const CATALOG_DB: CatalogDatabase = {
  brands: BRANDS,
  tobaccos: ALL_TOBACCOS,
  flavorTags: FLAVOR_TAGS,
  meta: {
    generatedAt: "2026-08-11",
    sources: [
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/",
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/",
      "https://justfreid.ru/catalog/tabak/",
      "https://musthave.ru/category/tabak-dlya-kalyana/",
      "https://element-tobacco.ru/tobacco",
      "https://moredyma.su/tabak-dlya-kalyana/",
      "https://hookahhouse.ru/catalog/tabak_dlya_kalyana/",
    ],
  },
}

export const CATALOG_VALIDATION = validateCatalog(CATALOG_DB)
export { BRAND_COMPLETENESS }

export function getBrandById(id: string) {
  return CATALOG_DB.brands.find((b) => b.id === id)
}

export function getTobaccoById(id: string) {
  return CATALOG_DB.tobaccos.find((t) => t.id === id)
}

export function getTobaccosByBrand(brandId: string) {
  return CATALOG_DB.tobaccos.filter((t) => t.brandId === brandId)
}

export function toRecommendationProfile(
  tobacco: TobaccoSeed
): TobaccoFlavorProfile {
  const p = tobacco.estimatedProfile
  return {
    tobaccoId: tobacco.id,
    strength: p.strength ?? 3,
    cold: p.cold ?? 0,
    sweetness: p.sweetness ?? 2,
    sourness: p.sourness ?? 1,
    fruity: p.fruity ?? 1,
    dessert: p.dessert ?? 0,
    spicy: p.spicy ?? 0,
    herbal: p.herbal ?? 0,
    intensity: p.intensity ?? 3,
    source: p.source,
    estimated: p.estimated,
  }
}

/** @deprecated use CATALOG_DB */
export const CATALOG = CATALOG_DB.tobaccos.map((t) => {
  const brand = getBrandById(t.brandId)
  const profile = toRecommendationProfile(t)
  return {
    id: t.id,
    brand: brand?.name ?? t.brandId,
    name: t.name,
    tags: t.tags,
    profile: {
      strength: profile.strength,
      cold: profile.cold,
      sweetness: profile.sweetness,
      sourness: profile.sourness,
      fruity: profile.fruity,
      dessert: profile.dessert,
      spicy: profile.spicy,
      herbal: profile.herbal,
      intensity: profile.intensity,
    },
  }
})

export const STARTER_COLLECTION_IDS = [
  "darkside-core-mango-lassi",
  "darkside-core-cola",
  "darkside-core-bananapapa",
  "musthave-classic-banana-mama",
  "musthave-classic-pineapple-rings",
  "musthave-classic-nord-star",
  "blackburn-classic-rising-star",
  "blackburn-classic-cane-mint",
].filter((id) => CATALOG_DB.tobaccos.some((t) => t.id === id))

export function getBrands() {
  return [...CATALOG_DB.brands].sort((a, b) => a.name.localeCompare(b.name))
}
