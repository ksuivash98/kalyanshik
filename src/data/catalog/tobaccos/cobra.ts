import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). */
const ITEMS = [
  {
    name: "ГРАНАТ",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "ДЖИН БОМБЕЙ",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "КЛУБНИКА",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "КОЛА",
    line: "Classic",
    tags: ["cola"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "ЛИМОН",
    line: "Classic",
    tags: ["lemon"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "МАНГО",
    line: "Classic",
    tags: ["mango"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "МАРГАРИТА",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "МОРОШКА",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "ОПУНЦИЯ",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "СГУЩЕННОЕ МОЛОКО",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "СОК КАЛАМАНСИ",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
  {
    name: "ФИАЛКА",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/cobra/"],
    strengthHint: 3,
  },
] as const

export const COBRA_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "cobra",
    name: item.name,
    line: item.line,
    tags: [...item.tags],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
    status: ("status" in item ? (item as { status?: TobaccoStatus }).status : "ACTIVE") as TobaccoStatus | undefined,
  })
)
