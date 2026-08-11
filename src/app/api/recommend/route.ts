import { NextResponse } from "next/server"
import { getDemoUser } from "@/lib/auth"
import { getCandidatesForMix } from "@/lib/data/tobaccos"
import { recommendMixes } from "@/lib/recommendations"
import { mixRequestSchema } from "@/lib/validation"
import { ExclusionTag, PreferenceTag } from "@/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = mixRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные параметры", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const user = await getDemoUser()
    const data = parsed.data
    const candidates = await getCandidatesForMix(user.id, data.useCollectionOnly)

    const suggestions = recommendMixes(candidates, {
      tobaccoCount: data.tobaccoCount,
      totalGrams: data.totalGrams,
      targetProfile: data.targetProfile,
      preferences: data.preferences as PreferenceTag[],
      exclusions: data.exclusions as ExclusionTag[],
      useCollectionOnly: data.useCollectionOnly,
      requireStock: data.requireStock,
    })

    if (suggestions.length === 0) {
      return NextResponse.json(
        {
          error:
            "Не удалось подобрать микс. Добавьте больше табаков в коллекцию или смягчите фильтры.",
          suggestions: [],
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Ошибка подбора микса" }, { status: 500 })
  }
}
