import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/** Russian market sources only (2026-08-11). */
const ITEMS = [
  {
    name: "БОРОДА ИЗ ВАТЫ (Елки мандарин) 100",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "БОРОДА ИЗ ВАТЫ (Елки мандарин) 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "БОСИКОМ ПО РОСЕ (Киви, лайм и алоэ) 100",
    line: "Classic",
    tags: ["lime"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "БОСИКОМ ПО РОСЕ (Киви, лайм и алоэ) 25",
    line: "Classic",
    tags: ["lime"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ГОЛ В ДЕВЯТКУ (Ежевика, Клубника, Каламанси) 100",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ГОЛ В ДЕВЯТКУ (Ежевика, Клубника, Каламанси) 25",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "МУЛЬТИКИ НА ЗАВТРАК (Рисовая каша с кокосом) 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ПЕРВАЯ ВЕЧЕРИНКА (Малина, лимон, клюква) 25",
    line: "Classic",
    tags: ["lemon","berry"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ПЕРВАЯ ДРАКА (клюквенный лимонад) 25",
    line: "Classic",
    tags: ["lemon"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ПЕРВАЯ ЛЮБОВЬ (Вишня, миндаль) 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ПЕРВАЯ ПОБЕДА (Манго, арбуз, кокос, свежесть) 25",
    line: "Classic",
    tags: ["mango","watermelon"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ПЕРВЫЕ ДЕНЬГИ (Кола, вишня) 25",
    line: "Classic",
    tags: ["cola"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ПЕРВЫЙ СЕКС (Лимонные леденцы) 25",
    line: "Classic",
    tags: ["lemon"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ПРЫЖОК С ПАРАШЮТОМ (Очень вкусная груша) 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ПУТЕШЕСТВИЕ АВТОСТОПОМ (Смородина, клубника, мандарин) 25",
    line: "Classic",
    tags: ["berry"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "РАССВЕТ НА КРЫШЕ (Земляника) 100",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "РАССВЕТ НА КРЫШЕ (Земляника) 25",
    line: "Classic",
    tags: ["fruity"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "СТАРТАП С ДРУЗЬЯМИ (Венские вафли, коктейльная вишня, грейпфрут и лимон) 25",
    line: "Classic",
    tags: ["lemon","dessert"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ЧТО-НИБУДЬ К ЧАЙКУ (Пончик) 25",
    line: "Classic",
    tags: ["tea"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
  {
    name: "ЯБЛОКО (Яблоко) 25",
    line: "Classic",
    tags: ["apple"],
    sources: ["https://justfreid.ru/catalog/tabak/molodost/"],
    strengthHint: 3,
  },
] as const

export const MOLODOST_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "molodost",
    name: item.name,
    line: item.line,
    tags: [...item.tags],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
    status: ("status" in item ? (item as { status?: TobaccoStatus }).status : "ACTIVE") as TobaccoStatus | undefined,
  })
)
