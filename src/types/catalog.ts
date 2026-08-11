export type LeafType = "BLONDE" | "DARK" | "RED" | "MIXED" | "UNKNOWN"
export type BrandRegion =
  | "RU"
  | "EU"
  | "US"
  | "ME"
  | "OTHER"
  | "UNKNOWN"

export type TobaccoStatus = "ACTIVE" | "DISCONTINUED" | "LIMITED" | "UNKNOWN"

export type ProfileSource = "OFFICIAL" | "ESTIMATED" | "USER" | "UNKNOWN"

export type FlavorCategory =
  | "FRUIT"
  | "CITRUS"
  | "BERRY"
  | "DESSERT"
  | "DRINK"
  | "HERBAL"
  | "SPICE"
  | "MINT_COLD"
  | "OTHER"

export type FlavorTagDef = {
  id: string
  category: FlavorCategory
  labelRu: string
  labelEn: string
}

export type BrandSeed = {
  id: string
  name: string
  slug: string
  country: string
  region: BrandRegion
  leafType: LeafType
  description: string
  officialWebsite: string | null
  lines: string[]
  active: boolean
  verificationNotes?: string
}

export type OfficialTobaccoData = {
  name: string
  description: string | null
  flavorNotes: string[]
  line: string | null
  strength: number | null
  strengthSource: ProfileSource
}

export type EstimatedFlavorProfile = {
  estimated: true
  strength: number | null
  cold: number | null
  sweetness: number | null
  sourness: number | null
  fruity: number | null
  dessert: number | null
  spicy: number | null
  herbal: number | null
  intensity: number | null
  source: ProfileSource
}

export type TobaccoSeed = {
  id: string
  brandId: string
  name: string
  slug: string
  line: string | null
  aliases: string[]
  tags: string[]
  flavorNotes: string[]
  official: OfficialTobaccoData
  estimatedProfile: EstimatedFlavorProfile
  status: TobaccoStatus
  discontinued: boolean
  limitedEdition: boolean
  releaseYear: number | null
  sourceUrl: string
  lastVerifiedAt: string
  active: boolean
}

export type CatalogDatabase = {
  brands: BrandSeed[]
  tobaccos: TobaccoSeed[]
  flavorTags: FlavorTagDef[]
  meta: {
    generatedAt: string
    sources: string[]
  }
}

/** Runtime profile for recommendation engine */
export type TobaccoFlavorProfile = {
  tobaccoId: string
  strength: number
  cold: number
  sweetness: number
  sourness: number
  fruity: number
  dessert: number
  spicy: number
  herbal: number
  intensity: number
  source: ProfileSource
  estimated: boolean
}
