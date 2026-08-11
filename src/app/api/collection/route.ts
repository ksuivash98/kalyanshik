import { NextResponse } from "next/server"
import { getDemoUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userTobaccoCreateSchema, userTobaccoUpdateSchema } from "@/lib/validation"

export async function GET() {
  const user = await getDemoUser()
  const items = await prisma.userTobacco.findMany({
    where: { userId: user.id },
    include: {
      tobacco: { include: { brand: true, profile: true } },
    },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = userTobaccoCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 })
    }

    const user = await getDemoUser()
    const tobacco = await prisma.tobacco.findUnique({
      where: { id: parsed.data.tobaccoId },
    })
    if (!tobacco) {
      return NextResponse.json({ error: "Табак не найден" }, { status: 404 })
    }

    const item = await prisma.userTobacco.upsert({
      where: {
        userId_tobaccoId: {
          userId: user.id,
          tobaccoId: parsed.data.tobaccoId,
        },
      },
      create: {
        userId: user.id,
        tobaccoId: parsed.data.tobaccoId,
        grams: parsed.data.grams,
        rating: parsed.data.rating ?? null,
        note: parsed.data.note ?? null,
      },
      update: {
        grams: parsed.data.grams,
        rating: parsed.data.rating ?? undefined,
        note: parsed.data.note ?? undefined,
      },
      include: {
        tobacco: { include: { brand: true, profile: true } },
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Не удалось добавить табак" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...rest } = body as { id?: string }
    if (!id) {
      return NextResponse.json({ error: "id обязателен" }, { status: 400 })
    }

    const parsed = userTobaccoUpdateSchema.safeParse(rest)
    if (!parsed.success) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 })
    }

    const user = await getDemoUser()
    const existing = await prisma.userTobacco.findFirst({
      where: { id, userId: user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 })
    }

    const item = await prisma.userTobacco.update({
      where: { id },
      data: parsed.data,
      include: {
        tobacco: { include: { brand: true, profile: true } },
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 })
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
    const existing = await prisma.userTobacco.findFirst({
      where: { id, userId: user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 })
    }

    await prisma.userTobacco.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Не удалось удалить" }, { status: 500 })
  }
}
