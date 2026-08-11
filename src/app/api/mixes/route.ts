import { NextResponse } from "next/server"
import { getDemoUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mixRatingSchema, saveMixSchema } from "@/lib/validation"

export async function GET() {
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
  return NextResponse.json({ mixes })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = saveMixSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const user = await getDemoUser()
    const data = parsed.data

    for (const ingredient of data.ingredients) {
      const stock = await prisma.userTobacco.findUnique({
        where: {
          userId_tobaccoId: {
            userId: user.id,
            tobaccoId: ingredient.tobaccoId,
          },
        },
      })
      if (stock && stock.grams < ingredient.grams) {
        return NextResponse.json(
          {
            error: `Недостаточно табака для сохранения: требуется ${ingredient.grams} г`,
            code: "INSUFFICIENT_STOCK",
          },
          { status: 400 }
        )
      }
    }

    const mix = await prisma.mix.create({
      data: {
        userId: user.id,
        name: data.name,
        totalGrams: data.totalGrams,
        tobaccoCount: data.tobaccoCount,
        strength: data.profile.strength,
        cold: data.profile.cold,
        sweetness: data.profile.sweetness,
        sourness: data.profile.sourness,
        fruity: data.profile.fruity,
        dessert: data.profile.dessert,
        spicy: data.profile.spicy,
        herbal: data.profile.herbal,
        intensity: data.profile.intensity,
        explanation: data.explanation ?? null,
        variantType: data.variantType ?? null,
        ingredients: {
          create: data.ingredients.map((i) => ({
            tobaccoId: i.tobaccoId,
            role: i.role,
            percent: i.percent,
            grams: i.grams,
          })),
        },
      },
      include: {
        ingredients: {
          include: { tobacco: { include: { brand: true } } },
        },
        rating: true,
      },
    })

    return NextResponse.json({ mix })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Не удалось сохранить микс" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id обязателен" }, { status: 400 })
    }

    const user = await getDemoUser()
    const mix = await prisma.mix.findFirst({ where: { id, userId: user.id } })
    if (!mix) {
      return NextResponse.json({ error: "Микс не найден" }, { status: 404 })
    }

    await prisma.mix.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Не удалось удалить" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...rest } = body as { id?: string; score?: number; comment?: string | null }
    if (!id) {
      return NextResponse.json({ error: "id обязателен" }, { status: 400 })
    }

    const parsed = mixRatingSchema.safeParse(rest)
    if (!parsed.success) {
      return NextResponse.json({ error: "Некорректная оценка" }, { status: 400 })
    }

    const user = await getDemoUser()
    const mix = await prisma.mix.findFirst({ where: { id, userId: user.id } })
    if (!mix) {
      return NextResponse.json({ error: "Микс не найден" }, { status: 404 })
    }

    const rating = await prisma.mixRating.upsert({
      where: { mixId: id },
      create: {
        mixId: id,
        score: parsed.data.score,
        comment: parsed.data.comment ?? null,
      },
      update: {
        score: parsed.data.score,
        comment: parsed.data.comment ?? null,
      },
    })

    return NextResponse.json({ rating })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Не удалось сохранить оценку" }, { status: 500 })
  }
}
