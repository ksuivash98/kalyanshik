import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). */
const ITEMS = [
  {
    name: "Бленд огневой сушки",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
    strengthHint: 4,
  },
  {
    name: "Ceylon Chips (Кокосовые чипсы)",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
    strengthHint: 4,
  },
  {
    name: "French Cider (Французский сидр)",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
    strengthHint: 4,
  },
  {
    name: "Polish Rum Biscuit (Польский ромовый бисквит)",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://moredyma.su/tabak-dlya-kalyana/aircraft/"],
    strengthHint: 4,
  },
  {
    name: "Strawberries (Клубника)",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/aircraft_33313.html"],
    strengthHint: 4,
    status: "DISCONTINUED",
  },
  {
    name: "British Banoffee (Британский Баноффи)",
    line: "Classic",
    tags: ["dessert"],
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"],
    strengthHint: 4,
    status: "DISCONTINUED",
  },
  {
    name: "California Cola (Калифорнийская кола)",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"],
    strengthHint: 4,
    status: "DISCONTINUED",
  },
  {
    name: "Lombardy Nut (Ломбардский орех)",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"],
    strengthHint: 4,
    status: "DISCONTINUED",
  },
  {
    name: "Raffaelo (Рафаэло)",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/aircraft/?filter=1398"],
    strengthHint: 4,
    status: "DISCONTINUED",
  },
] as const

export const AIRCRAFT_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "aircraft",
    name: item.name,
    line: item.line,
    tags: [...item.tags],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
    status: ("status" in item
      ? (item as { status?: TobaccoStatus }).status
      : "ACTIVE") as TobaccoStatus | undefined,
  })
)
