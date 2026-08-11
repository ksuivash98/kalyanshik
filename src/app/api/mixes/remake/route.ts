import { NextResponse } from "next/server"
import { getDemoUser } from "@/lib/auth"
import { getCandidatesForMix, toFlavorProfile } from "@/lib/data/tobaccos"
import { prisma } from "@/lib/prisma"
import { findReplacement } from "@/lib/recommendations"
import { parseTags, round1 } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { mixId?: string }
    if (!body.mixId) {
      return NextResponse.json({ error: "mixId обязателен" }, { status: 400 })
    }

    const user = await getDemoUser()
    const mix = await prisma.mix.findFirst({
      where: { id: body.mixId, userId: user.id },
      include: {
        ingredients: {
          include: {
            tobacco: { include: { brand: true, profile: true } },
          },
        },
      },
    })

    if (!mix) {
      return NextResponse.json({ error: "Микс не найден" }, { status: 404 })
    }

    const candidates = await getCandidatesForMix(user.id, true)
    const used = new Set<string>()
    const messages: string[] = []
    const rebuilt = []

    for (const ingredient of mix.ingredients) {
      const stock = candidates.find((c) => c.id === ingredient.tobaccoId)
      const needed = ingredient.grams

      if (stock && (stock.gramsAvailable ?? 0) >= needed) {
        used.add(stock.id)
        rebuilt.push({
          tobaccoId: stock.id,
          name: stock.name,
          brandName: stock.brandName,
          role: ingredient.role,
          percent: ingredient.percent,
          grams: needed,
          replaced: false,
        })
        continue
      }

      const missingCandidate = {
        id: ingredient.tobaccoId,
        name: ingredient.tobacco.name,
        brandName: ingredient.tobacco.brand.name,
        tags: parseTags(ingredient.tobacco.tags),
        profile: ingredient.tobacco.profile
          ? toFlavorProfile(ingredient.tobacco.profile)
          : {
              strength: 3,
              cold: 0,
              sweetness: 3,
              sourness: 0,
              fruity: 3,
              dessert: 0,
              spicy: 0,
              herbal: 0,
              intensity: 3,
            },
        gramsAvailable: stock?.gramsAvailable ?? 0,
      }

      const replacement = findReplacement(missingCandidate, candidates, used)
      if (!replacement) {
        return NextResponse.json(
          {
            error: `${ingredient.tobacco.name} недостаточно, замена не найдена`,
            messages,
          },
          { status: 400 }
        )
      }

      used.add(replacement.id)
      messages.push(
        `${ingredient.tobacco.name} недостаточно для этого микса. Найдена замена: ${replacement.name}.`
      )
      rebuilt.push({
        tobaccoId: replacement.id,
        name: replacement.name,
        brandName: replacement.brandName,
        role: ingredient.role,
        percent: ingredient.percent,
        grams: round1(needed),
        replaced: true,
      })
    }

    return NextResponse.json({
      mix: {
        name: mix.name,
        totalGrams: mix.totalGrams,
        ingredients: rebuilt,
      },
      messages,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Не удалось повторить микс" }, { status: 500 })
  }
}
