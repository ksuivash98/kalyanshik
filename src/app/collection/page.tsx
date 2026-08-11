import { getDemoUser } from "@/lib/auth"
import { getUserCollection, toFlavorProfile } from "@/lib/data/tobaccos"
import { CollectionClient } from "@/components/collection/collection-client"

export const dynamic = "force-dynamic"

export default async function CollectionPage() {
  const user = await getDemoUser()
  const items = await getUserCollection(user.id)

  return (
    <CollectionClient
      initialItems={items.map((item) => ({
        id: item.id,
        grams: item.grams,
        rating: item.rating,
        note: item.note,
        tobacco: {
          id: item.tobacco.id,
          name: item.tobacco.name,
          tags: item.tobacco.tags,
          brand: { name: item.tobacco.brand.name },
          profile: item.tobacco.profile
            ? toFlavorProfile(item.tobacco.profile)
            : null,
        },
      }))}
    />
  )
}
