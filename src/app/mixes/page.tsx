import { getDemoUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MixesClient } from "@/components/mixes/mixes-client"

export const dynamic = "force-dynamic"

export default async function MixesPage() {
  const user = await getDemoUser()
  const mixes = await prisma.mix.findMany({
    where: { userId: user.id },
    include: {
      ingredients: {
        include: { tobacco: { include: { brand: true } } },
      },
      rating: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <MixesClient
      initialMixes={mixes.map((mix) => ({
        id: mix.id,
        name: mix.name,
        totalGrams: mix.totalGrams,
        tobaccoCount: mix.tobaccoCount,
        explanation: mix.explanation,
        variantType: mix.variantType,
        createdAt: mix.createdAt.toISOString(),
        profile: {
          strength: mix.strength,
          cold: mix.cold,
          sweetness: mix.sweetness,
          sourness: mix.sourness,
          fruity: mix.fruity,
          dessert: mix.dessert,
          spicy: mix.spicy,
          herbal: mix.herbal,
          intensity: mix.intensity,
        },
        ingredients: mix.ingredients.map((ing) => ({
          id: ing.id,
          role: ing.role,
          percent: ing.percent,
          grams: ing.grams,
          tobacco: {
            name: ing.tobacco.name,
            brand: { name: ing.tobacco.brand.name },
          },
        })),
        rating: mix.rating
          ? { score: mix.rating.score, comment: mix.rating.comment }
          : null,
      }))}
    />
  )
}
