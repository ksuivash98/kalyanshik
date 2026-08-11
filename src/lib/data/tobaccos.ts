import { prisma } from "@/lib/prisma"
import { parseTags } from "@/lib/utils"
import { FlavorProfile, TobaccoCandidate } from "@/types"

export function toFlavorProfile(profile: {
  strength: number
  cold: number
  sweetness: number
  sourness: number
  fruity: number
  dessert: number
  spicy: number
  herbal: number
  intensity: number
}): FlavorProfile {
  return {
    strength: profile.strength,
    cold: profile.cold,
    sweetness: profile.sweetness,
    sourness: profile.sourness,
    fruity: profile.fruity,
    dessert: profile.dessert,
    spicy: profile.spicy,
    herbal: profile.herbal,
    intensity: profile.intensity,
  }
}

export async function getCatalogTobaccos() {
  return prisma.tobacco.findMany({
    include: {
      brand: true,
      profile: true,
    },
    orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
  })
}

export async function getUserCollection(userId: string) {
  return prisma.userTobacco.findMany({
    where: { userId },
    include: {
      tobacco: {
        include: {
          brand: true,
          profile: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getCandidatesForMix(
  userId: string,
  useCollectionOnly: boolean
): Promise<TobaccoCandidate[]> {
  if (useCollectionOnly) {
    const collection = await getUserCollection(userId)
    return collection
      .filter((item) => item.tobacco.profile)
      .map((item) => ({
        id: item.tobaccoId,
        name: item.tobacco.name,
        brandName: item.tobacco.brand.name,
        tags: parseTags(item.tobacco.tags),
        profile: toFlavorProfile(item.tobacco.profile!),
        gramsAvailable: item.grams,
      }))
  }

  const collection = await getUserCollection(userId)
  const stockMap = new Map(collection.map((c) => [c.tobaccoId, c.grams]))
  const catalog = await getCatalogTobaccos()

  return catalog
    .filter((t) => t.profile)
    .map((t) => ({
      id: t.id,
      name: t.name,
      brandName: t.brand.name,
      tags: parseTags(t.tags),
      profile: toFlavorProfile(t.profile!),
      gramsAvailable: stockMap.has(t.id) ? stockMap.get(t.id)! : null,
    }))
}
