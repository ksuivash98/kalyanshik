import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). */
const ITEMS = [
  {
    name: "Ананас Тёмные ягоды",
    line: "Classic",
    tags: ["berry", "pineapple"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Апельсин",
    line: "Classic",
    tags: ["orange"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "База",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Карибский табак",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Клюква Джин",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Кола",
    line: "Classic",
    tags: ["cola"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Лайм",
    line: "Classic",
    tags: ["lime"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Ландыш",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Малина Клубника",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Манго Цитрус",
    line: "Classic",
    tags: ["mango","citrus"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Тропик",
    line: "Classic",
    tags: ["tropical"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Фруктовый Йогурт",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Черника",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
  {
    name: "Ягоды Грейпфрут",
    line: "Classic",
    tags: ["berry", "grapefruit"],
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/morpheus/", "https://moredyma.su/tabak-dlya-kalyana/morpheus/"],
    strengthHint: 3,
  },
] as const

export const MORPHEUS_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "morpheus",
    name: item.name,
    line: item.line,
    tags: ["grapefruit"],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
    status: ("status" in item ? (item as { status?: TobaccoStatus }).status : "ACTIVE") as TobaccoStatus | undefined,
  })
)
