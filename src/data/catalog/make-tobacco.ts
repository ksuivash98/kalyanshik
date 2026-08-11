import { estimateProfileFromTags } from "@/lib/catalog/estimate-profile"
import { slugify } from "@/lib/catalog/normalizer"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

const VERIFIED_AT = "2026-08-11"

type MakeTobaccoInput = {
  brandId: string
  name: string
  line?: string | null
  tags?: string[]
  flavorNotes?: string[]
  aliases?: string[]
  description?: string | null
  status?: TobaccoStatus
  limitedEdition?: boolean
  discontinued?: boolean
  sourceUrl: string
  strengthHint?: number | null
}

export function makeTobacco(input: MakeTobaccoInput): TobaccoSeed {
  const name = input.name.trim()
  const tags = input.tags ?? []
  const status = input.status ?? "ACTIVE"
  const estimatedProfile = estimateProfileFromTags(tags, {
    strength: input.strengthHint ?? null,
    intensity: 3,
  })

  return {
    id: `${input.brandId}-${slugify(name)}`,
    brandId: input.brandId,
    name,
    slug: slugify(name),
    line: input.line ?? null,
    aliases: input.aliases ?? [],
    tags,
    flavorNotes: input.flavorNotes ?? tags,
    official: {
      name,
      description: input.description ?? null,
      flavorNotes: input.flavorNotes ?? [],
      line: input.line ?? null,
      strength: null,
      strengthSource: "UNKNOWN",
    },
    estimatedProfile,
    status,
    discontinued: input.discontinued ?? status === "DISCONTINUED",
    limitedEdition: input.limitedEdition ?? status === "LIMITED",
    releaseYear: null,
    sourceUrl: input.sourceUrl,
    lastVerifiedAt: VERIFIED_AT,
    active: status === "ACTIVE" || status === "LIMITED",
  }
}
