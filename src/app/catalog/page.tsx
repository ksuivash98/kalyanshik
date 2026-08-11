import { getDemoUser } from "@/lib/auth"
import { getCatalogTobaccos } from "@/lib/data/tobaccos"
import { prisma } from "@/lib/prisma"
import { toFlavorProfile } from "@/lib/data/tobaccos"
import { CatalogClient } from "@/components/catalog/catalog-client"

export const dynamic = "force-dynamic"

export default async function CatalogPage() {
  const user = await getDemoUser()
  const [tobaccos, collection] = await Promise.all([
    getCatalogTobaccos(),
    prisma.userTobacco.findMany({
      where: { userId: user.id },
      select: { tobaccoId: true },
    }),
  ])

  const inCollection = new Set(collection.map((c) => c.tobaccoId))

  return (
    <CatalogClient
      tobaccos={tobaccos.map((t) => ({
        id: t.id,
        name: t.name,
        tags: t.tags,
        brand: { name: t.brand.name },
        profile: t.profile ? toFlavorProfile(t.profile) : null,
        inCollection: inCollection.has(t.id),
      }))}
    />
  )
}
