import { BRANDS } from "./brands"
import { FLAVOR_TAGS } from "./flavor-tags"
import { ADALYA_TOBACCOS } from "./tobaccos/adalya"
import { AL_FAKHER_TOBACCOS } from "./tobaccos/al-fakher"
import { AZURE_TOBACCOS } from "./tobaccos/azure"
import { BLACKBURN_TOBACCOS } from "./tobaccos/blackburn"
import { BONCHE_TOBACCOS } from "./tobaccos/bonche"
import { CHABACCO_TOBACCOS } from "./tobaccos/chabacco"
import { DAILY_HOOKAH_TOBACCOS } from "./tobaccos/daily-hookah"
import { DARKSIDE_TOBACCOS } from "./tobaccos/darkside"
import { DUFT_TOBACCOS } from "./tobaccos/duft"
import { ELEMENT_TOBACCOS } from "./tobaccos/element"
import { FUMARI_TOBACCOS } from "./tobaccos/fumari"
import { JAM_TOBACCOS } from "./tobaccos/jam"
import { JIBIAR_TOBACCOS } from "./tobaccos/jibiar"
import { MUSTHAVE_TOBACCOS } from "./tobaccos/musthave"
import { OVERDOZZ_TOBACCOS } from "./tobaccos/overdozz"
import { SATYR_TOBACCOS } from "./tobaccos/satyr"
import { SEBERO_TOBACCOS } from "./tobaccos/sebero"
import { SERBETLI_TOBACCOS } from "./tobaccos/serbetli"
import { SOCIAL_SMOKE_TOBACCOS } from "./tobaccos/social-smoke"
import { SPECTRUM_TOBACCOS } from "./tobaccos/spectrum"
import { STARLINE_TOBACCOS } from "./tobaccos/starline"
import { TANGIERS_TOBACCOS } from "./tobaccos/tangiers"
import { ZOMO_TOBACCOS } from "./tobaccos/zomo"
import { CatalogDatabase, TobaccoFlavorProfile, TobaccoSeed } from "@/types/catalog"
import { dedupeByBrandName } from "@/lib/catalog/deduplicator"
import { validateCatalog } from "@/lib/catalog/validator"

const ALL_TOBACCOS: TobaccoSeed[] = dedupeByBrandName([
  ...DARKSIDE_TOBACCOS,
  ...MUSTHAVE_TOBACCOS,
  ...BLACKBURN_TOBACCOS,
  ...ELEMENT_TOBACCOS,
  ...DUFT_TOBACCOS,
  ...SEBERO_TOBACCOS,
  ...CHABACCO_TOBACCOS,
  ...SPECTRUM_TOBACCOS,
  ...SATYR_TOBACCOS,
  ...DAILY_HOOKAH_TOBACCOS,
  ...BONCHE_TOBACCOS,
  ...STARLINE_TOBACCOS,
  ...OVERDOZZ_TOBACCOS,
  ...JAM_TOBACCOS,
  ...AL_FAKHER_TOBACCOS,
  ...ADALYA_TOBACCOS,
  ...SERBETLI_TOBACCOS,
  ...TANGIERS_TOBACCOS,
  ...FUMARI_TOBACCOS,
  ...AZURE_TOBACCOS,
  ...SOCIAL_SMOKE_TOBACCOS,
  ...ZOMO_TOBACCOS,
  ...JIBIAR_TOBACCOS,
])

export const CATALOG_DB: CatalogDatabase = {
  brands: BRANDS,
  tobaccos: ALL_TOBACCOS,
  flavorTags: FLAVOR_TAGS,
  meta: {
    generatedAt: "2026-08-11",
    sources: [
      "https://hookahstuff.com/collections/darkside-core-line-hookah-shisha-tobacco",
      "https://musthave.ru/category/tabak-dlya-kalyana/",
      "https://en.blckburn.com/",
      "https://en.element-tobacco.ru/tobacco",
      "https://kalyan-expert.ru/",
      "https://smokedex.info/en/shisha/brand/spectrum",
      "https://worldhookahmarket.com/",
      "http://4kalyans.ru/tabak/daily-hookah-2.html",
      "https://hookahland.ae/Shop?Filters.BrandSlug=starline-tobacco-blonde-leaf-shisha",
      "https://www.alfakher.com/products-usa",
      "https://www.fumari.com/official-hookah-flavors/",
      "https://b2hookah.com/products/serbetli-shisha-tobacco",
      "https://hookahministry.com/categories/tangiers-hookah-tobacco-noir-line-medium-nicotine-content-250-gr",
      "https://hookahjunkie.com/products/azure-black-line-250-gram",
      "https://socialsmoke.com/pages/hookah-tobacco",
      "https://utopiaclouds.com/products/zomo",
      "https://www.jibiartobacco.us/catalog/",
      "https://jammtobacco.com/jam",
      "https://www.texashookah.com/overdozz-shisha-200g.html",
    ],
  },
}

export const CATALOG_VALIDATION = validateCatalog(CATALOG_DB)

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

/** @deprecated use CATALOG_DB — compatibility shim for older imports */
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
  "darkside-mango-lassi",
  "darkside-cola",
  "darkside-bananapapa",
  "musthave-banana-mama",
  "musthave-pineapple-rings",
  "musthave-nord-star",
  "blackburn-rising-star",
  "blackburn-cane-mint",
].filter((id) => CATALOG_DB.tobaccos.some((t) => t.id === id))

export function getBrands() {
  return [...CATALOG_DB.brands].sort((a, b) => a.name.localeCompare(b.name))
}
