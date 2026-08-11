import { estimateProfileFromTags } from "@/lib/catalog/estimate-profile"
import { makeSource, isRussianSourceUrl } from "@/lib/catalog/ru-sources"
import { slugify } from "@/lib/catalog/normalizer"
import { TobaccoSeed, TobaccoSource, TobaccoStatus } from "@/types/catalog"

export { isRussianSourceUrl, makeSource } from "@/lib/catalog/ru-sources"

export const VERIFIED_AT = "2026-08-11"

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
  sources: TobaccoSource[] | string | string[]
  strengthHint?: number | null
  lastVerifiedAt?: string
}

function toSources(input: MakeTobaccoInput["sources"]): TobaccoSource[] {
  if (typeof input === "string") return [makeSource(input)]
  if (Array.isArray(input) && input.length > 0) {
    if (typeof input[0] === "string") {
      return (input as string[]).map((u) => makeSource(u))
    }
    return input as TobaccoSource[]
  }
  throw new Error("At least one Russian source is required")
}

export function makeTobacco(input: MakeTobaccoInput): TobaccoSeed {
  const name = input.name.trim()
  const tags = input.tags ?? []
  const status = input.status ?? "ACTIVE"
  const sources = toSources(input.sources)
  if (sources.length === 0) throw new Error(`No sources for ${input.brandId}/${name}`)
  for (const s of sources) {
    if (!isRussianSourceUrl(s.url)) {
      throw new Error(`Non-Russian source blocked: ${s.url}`)
    }
  }

  const estimatedProfile = estimateProfileFromTags(tags, {
    strength: input.strengthHint ?? null,
    intensity: 3,
  })

  const lastVerifiedAt = input.lastVerifiedAt ?? VERIFIED_AT
  const lineSlug = slugify(input.line ?? "classic")
  const nameSlug = slugify(name)

  return {
    id: `${input.brandId}-${lineSlug}-${nameSlug}`,
    brandId: input.brandId,
    name,
    slug: nameSlug,
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
    sources,
    sourceUrl: sources[0].url,
    lastVerifiedAt,
    active: status === "ACTIVE" || status === "LIMITED",
  }
}
