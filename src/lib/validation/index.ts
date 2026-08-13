import { z } from "zod"
import {
  EXCLUSION_TAGS,
  PREFERENCE_TAGS,
} from "@/types"

export const flavorProfileSchema = z.object({
  strength: z.number().int().min(1).max(5),
  cold: z.number().int().min(0).max(5),
  sweetness: z.number().int().min(1).max(5),
  sourness: z.number().int().min(0).max(5),
  fruity: z.number().int().min(0).max(5),
  dessert: z.number().int().min(0).max(5),
  spicy: z.number().int().min(0).max(5),
  herbal: z.number().int().min(0).max(5),
  intensity: z.number().int().min(1).max(5),
})

export const mixRequestSchema = z.object({
  tobaccoCount: z.union([
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  totalGrams: z.number().positive().max(100),
  targetProfile: flavorProfileSchema,
  preferences: z.array(z.enum(PREFERENCE_TAGS as [string, ...string[]])),
  exclusions: z.array(z.enum(EXCLUSION_TAGS as [string, ...string[]])),
  useCollectionOnly: z.boolean(),
  requireStock: z.boolean().default(true),
  mode: z
    .enum(["balanced", "dominant", "experimental", "leftovers"])
    .optional()
    .default("balanced"),
  limit: z.number().int().min(1).max(20).optional(),
})

export const userTobaccoCreateSchema = z.object({
  tobaccoId: z.string().min(1),
  grams: z.number().min(0).max(5000),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
})

export const userTobaccoUpdateSchema = z.object({
  grams: z.number().min(0).max(5000).optional(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
})

export const mixIngredientSchema = z.object({
  tobaccoId: z.string().min(1),
  role: z.enum(["base", "support", "accent"]),
  percent: z.number().positive().max(100),
  grams: z.number().positive(),
})

export const saveMixSchema = z
  .object({
    name: z.string().min(1).max(120),
    totalGrams: z.number().positive(),
    tobaccoCount: z.number().int().min(2).max(5),
    profile: z.object({
      strength: z.number(),
      cold: z.number(),
      sweetness: z.number(),
      sourness: z.number(),
      fruity: z.number(),
      dessert: z.number(),
      spicy: z.number(),
      herbal: z.number(),
      intensity: z.number(),
    }),
    explanation: z.string().optional().nullable(),
    variantType: z
      .enum(["safe", "interesting", "experimental", "leftovers"])
      .optional(),
    ingredients: z.array(mixIngredientSchema).min(2).max(5),
  })
  .superRefine((data, ctx) => {
    if (data.ingredients.length !== data.tobaccoCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Количество ингредиентов не совпадает с выбранным количеством",
        path: ["ingredients"],
      })
    }

    const percentSum = data.ingredients.reduce((sum, i) => sum + i.percent, 0)
    if (Math.abs(percentSum - 100) > 0.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Сумма процентов должна быть 100%",
        path: ["ingredients"],
      })
    }
  })

export const mixRatingSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
})
