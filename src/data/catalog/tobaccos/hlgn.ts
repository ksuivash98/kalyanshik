import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). */
const ITEMS = [
  {
    name: "BAN - Банановое суфле 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "BOO - Яблоко-Гранат 25",
    line: "Classic",
    tags: ["apple"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "FIFI - Шоколадно-ореховая ириска 25",
    line: "Classic",
    tags: ["cola"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "GREEN QUEEN - Мятный чай с медом 25",
    line: "Classic",
    tags: ["tea"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "HARD - CHUDO - Абрикосовый йогурт 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "HARD - DINO - Мятная жвачка 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "HARD - PANAMA - Фруктовый салатик 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "HARD - VITA - Клементин (Мандарин) 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "HEALTHY - Лимон-имбирь 25",
    line: "Classic",
    tags: ["lemon"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "LOVE - Смородина-ромашка 25",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "MYSTIC - Кислая Черника 25",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "OG Клуб - Клубника-ревень 25",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "OGO - Сакура-маракуйя 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "PANAMA - Фруктовый салатик 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "PINK - Ягоды, мангустин 25",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "POOL - Кислый Лимонад с Гуавой 25",
    line: "Classic",
    tags: ["lemon"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "RAP ROSE - Малиново-розовый лимонад 25",
    line: "Classic",
    tags: ["lemon","berry"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "TANOS - Кислая слива 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "TURBO - Арбузно-дынная жвачка 25",
    line: "Classic",
    tags: ["watermelon","melon"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
  {
    name: "VERA - Напиток с Алоэ Вера 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/hlgn/"],
    strengthHint: 3,
  },
] as const

export const HLGN_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "hlgn",
    name: item.name,
    line: item.line,
    tags: [...item.tags],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
    status: ("status" in item ? (item as { status?: TobaccoStatus }).status : "ACTIVE") as TobaccoStatus | undefined,
  })
)
