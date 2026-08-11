import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). Verified on gustogo.ru + dotsmoke.ru. */
const ITEMS = [
  {
    name: "Apple",
    line: "Classic",
    tags: ["apple", "fruity"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Banana Bomb",
    line: "Classic",
    tags: ["dessert", "fruity"],
    sources: ["https://gustogo.ru/tabak/iskra-100"],
    strengthHint: 3,
  },
  {
    name: "Black Currant",
    line: "Classic",
    tags: ["berry"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Blueberry",
    line: "Classic",
    tags: ["berry"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Cheesecake",
    line: "Classic",
    tags: ["dessert"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Cucumber Lemonade",
    line: "Classic",
    tags: ["drink", "citrus"],
    sources: ["https://gustogo.ru/tabak/iskra-100"],
    strengthHint: 3,
  },
  {
    name: "F/O/G",
    line: "Classic",
    tags: ["fruity", "citrus", "grape"],
    sources: ["https://gustogo.ru/tabak/iskra-100"],
    strengthHint: 3,
  },
  {
    name: "Ice Cream",
    line: "Classic",
    tags: ["dessert", "cream"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Jelly",
    line: "Classic",
    tags: ["dessert"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Kiwi",
    line: "Classic",
    tags: ["fruity"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Lemon",
    line: "Classic",
    tags: ["lemon", "citrus"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Mango",
    line: "Classic",
    tags: ["mango", "fruity"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Nectarine",
    line: "Classic",
    tags: ["peach", "fruity"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Orange",
    line: "Classic",
    tags: ["orange", "citrus"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Passion Aloe",
    line: "Classic",
    tags: ["tropical", "fruity"],
    sources: ["https://gustogo.ru/tabak/iskra-100"],
    strengthHint: 3,
  },
  {
    name: "Pineapple",
    line: "Classic",
    tags: ["tropical", "fruity"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Pink Lemonade",
    line: "Classic",
    tags: ["drink", "berry", "lemon"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Raspberry",
    line: "Classic",
    tags: ["berry"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Strawberry",
    line: "Classic",
    tags: ["berry"],
    sources: [
      "https://gustogo.ru/tabak/iskra-100",
      "https://dotsmoke.ru/collection/iskra",
    ],
    strengthHint: 3,
  },
  {
    name: "Watermelon Melon",
    line: "Classic",
    tags: ["watermelon", "melon"],
    sources: ["https://gustogo.ru/tabak/iskra-100"],
    strengthHint: 3,
  },
] as const

export const ISKRA_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "iskra",
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
