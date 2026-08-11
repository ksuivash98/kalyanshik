import { TobaccoSource, TobaccoSourceType } from "@/types/catalog"

const VERIFIED_AT = "2026-08-11"

const RU_TLDS = [".ru", ".рф", ".su"]

const RU_ALLOWED_HOSTS = new Set([
  "darkside.company",
  "blckburn.com",
  "jammtobacco.com",
])

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return ""
  }
}

export function isRussianSourceUrl(url: string): boolean {
  const host = extractDomain(url)
  if (!host) return false
  if (RU_ALLOWED_HOSTS.has(host)) return true
  if (RU_TLDS.some((tld) => host.endsWith(tld))) return true
  if (host.includes("xn--")) return true
  return false
}

export function makeSource(
  url: string,
  sourceType: TobaccoSourceType = "RUSSIAN_STORE",
  checkedAt = VERIFIED_AT
): TobaccoSource {
  if (!isRussianSourceUrl(url)) {
    throw new Error(`Non-Russian source blocked: ${url}`)
  }
  return {
    url,
    domain: extractDomain(url),
    sourceType,
    checkedAt,
  }
}
