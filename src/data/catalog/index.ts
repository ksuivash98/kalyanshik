import { BRANDS } from "./brands"
import { FLAVOR_TAGS } from "./flavor-tags"
import { BLACKBURN_TOBACCOS } from "./tobaccos/blackburn"
import { DARKSIDE_TOBACCOS } from "./tobaccos/darkside"
import { ELEMENT_TOBACCOS } from "./tobaccos/element"
import { MUSTHAVE_TOBACCOS } from "./tobaccos/musthave"
import { CatalogDatabase, TobaccoFlavorProfile, TobaccoSeed } from "@/types/catalog"
import { dedupeByBrandName } from "@/lib/catalog/deduplicator"
import { validateCatalog } from "@/lib/catalog/validator"

const ALL_TOBACCOS: TobaccoSeed[] = dedupeByBrandName([
  ...DARKSIDE_TOBACCOS,
  ...MUSTHAVE_TOBACCOS,
  ...BLACKBURN_TOBACCOS,
  ...ELEMENT_TOBACCOS,
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
      "https://lashishaclub.com/products/must-have-shisha-tobacco-125g",
      "https://en.blckburn.com/",
      "https://vape-optom.ru/collection/tabak-blackburn/product/blackburn-25gr",
      "https://en.element-tobacco.ru/tobacco",
      "https://worldhookahmarket.com/top-10-best-flavors-of-element-tobacco-which-lines-to-try/",
      "https://musthavetobacco.com/",
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
