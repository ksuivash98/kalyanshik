import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). */
const ITEMS = [
  {
    name: "ACID BERRY",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "ACID BERRY",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "Desert corn",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "DESERT CORN",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "GREENDIZER",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "IT'S LIKE THAT ONE MAPLE PECAN",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "Pacific route",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "PACIFIC ROUTE",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "PICKLE RICK",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "REDEMPTION APPLE",
    line: "Classic",
    tags: ["apple"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "REDEMPTION APPLE",
    line: "Classic",
    tags: ["apple"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "Sinner Fruit",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "Sinner Fruit",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "ZEN LATTE",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/"],
    strengthHint: 3,
  },
  {
    name: "ZEN LATTE",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/", "https://moredyma.su/tabak-dlya-kalyana/smoke-angels/", "https://justfreid.ru/catalog/tabak/smoke-angels/"],
    strengthHint: 3,
  },
] as const

export const SMOKE_ANGELS_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "smoke-angels",
    name: item.name,
    line: item.line,
    tags: [...item.tags],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
    status: ("status" in item ? (item as { status?: TobaccoStatus }).status : "ACTIVE") as TobaccoStatus | undefined,
  })
)
