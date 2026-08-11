import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"

/**
 * Russian brand Muassel (Perm). Sources: muassel.ru + justfreid.ru / hookahbaza.ru / tabac.ru.
 * Lines: Medium (4/10), Strong (6/10), Extra Strong (8/10).
 */
const ITEMS = [
  // —— Medium (official collection muassel.ru) ——
  { name: "Ветер перемен", line: "Medium", tags: ["melon", "cold"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Виноградная косточка", line: "Medium", tags: ["grape"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Виноградный леденец", line: "Medium", tags: ["grape", "dessert", "cold"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Гуаманго", line: "Medium", tags: ["tropical", "mango", "citrus"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Дикий ананас", line: "Medium", tags: ["tropical", "pineapple"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Двойное яблоко", line: "Medium", tags: ["apple"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Жвачка с корицей", line: "Medium", tags: ["dessert", "spice"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Киви", line: "Medium", tags: ["tropical", "fruity"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Красный ангел", line: "Medium", tags: ["berry", "citrus"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Летний поцелуй", line: "Medium", tags: ["melon", "cold", "herbal"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Лимонная долька", line: "Medium", tags: ["lemon", "citrus", "cold"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Личи-лимонад", line: "Medium", tags: ["fruity", "drink", "citrus"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Магрибский чай", line: "Medium", tags: ["tea", "mint", "herbal"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Малина садовая", line: "Medium", tags: ["berry"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Медовый месяц", line: "Medium", tags: ["citrus", "dessert", "honey"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Мятная свежесть", line: "Medium", tags: ["mint", "cold"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Небесный релакс", line: "Medium", tags: ["berry", "citrus"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Ночной лес", line: "Medium", tags: ["herbal", "berry"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Папайя", line: "Medium", tags: ["tropical"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Пина Колада", line: "Medium", tags: ["tropical", "dessert", "coconut"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Розовый закат", line: "Medium", tags: ["berry", "fruity"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Сладкий кактус", line: "Medium", tags: ["fruity"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Сочный манго", line: "Medium", tags: ["mango", "tropical"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Таёжные ягоды", line: "Medium", tags: ["berry", "herbal"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Томат с перцем", line: "Medium", tags: ["spicy", "herbal"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Тропический остров", line: "Medium", tags: ["tropical"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Холодная гренада", line: "Medium", tags: ["berry", "cold"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Цитрусовый манго", line: "Medium", tags: ["mango", "citrus"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Цитрусовый фреш", line: "Medium", tags: ["citrus", "cold"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Черника-малина", line: "Medium", tags: ["berry"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Шипучка", line: "Medium", tags: ["lemon", "drink", "sour"], sources: ["http://muassel.ru/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 2 },
  { name: "Шоколад с мятой", line: "Medium", tags: ["dessert", "mint", "cold"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Экзотические фрукты", line: "Medium", tags: ["tropical"], sources: ["http://muassel.ru/"], strengthHint: 2 },
  { name: "Ягодная сказка", line: "Medium", tags: ["berry"], sources: ["https://justfreid.ru/catalog/tabak/muassel/muassel_40885.html"], strengthHint: 2 },

  // —— Strong (hookahbaza.ru / justfreid.ru) ——
  { name: "Ветер перемен", line: "Strong", tags: ["melon", "cold"], sources: ["https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 3 },
  { name: "Виноградная косточка", line: "Strong", tags: ["grape"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Киви", line: "Strong", tags: ["tropical", "fruity"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Красный ангел", line: "Strong", tags: ["berry", "citrus"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Летний поцелуй", line: "Strong", tags: ["melon", "cold", "herbal"], sources: ["https://hookahbaza.ru/catalog/muassel/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 3 },
  { name: "Лимонная долька", line: "Strong", tags: ["lemon", "citrus", "cold"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Магрибский чай", line: "Strong", tags: ["tea", "mint", "herbal"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Малина садовая", line: "Strong", tags: ["berry"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Медовый месяц", line: "Strong", tags: ["citrus", "dessert", "honey"], sources: ["https://hookahbaza.ru/catalog/muassel/", "https://tabac.ru/catalog/muassel"], strengthHint: 3 },
  { name: "Мятная свежесть", line: "Strong", tags: ["mint", "cold"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Небесный релакс", line: "Strong", tags: ["berry", "citrus"], sources: ["https://hookahbaza.ru/catalog/muassel/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 3 },
  { name: "Ночной лес", line: "Strong", tags: ["herbal", "berry"], sources: ["https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 3 },
  { name: "Папайя", line: "Strong", tags: ["tropical"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Розовый закат", line: "Strong", tags: ["berry", "fruity"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Сладкий кактус", line: "Strong", tags: ["fruity"], sources: ["https://hookahbaza.ru/catalog/muassel/", "https://tabac.ru/catalog/muassel"], strengthHint: 3 },
  { name: "Таёжные ягоды", line: "Strong", tags: ["berry", "herbal"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Томат с перцем", line: "Strong", tags: ["spicy", "herbal"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Тропический остров", line: "Strong", tags: ["tropical"], sources: ["https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 3 },
  { name: "Холодная гренада", line: "Strong", tags: ["berry", "cold"], sources: ["https://hookahbaza.ru/catalog/muassel/", "https://justfreid.ru/catalog/tabak/muassel/"], strengthHint: 3 },
  { name: "Цитрусовый манго", line: "Strong", tags: ["mango", "citrus"], sources: ["https://hookahbaza.ru/catalog/muassel/", "https://justfreid.ru/catalog/tabak/muassel/", "https://tabac.ru/catalog/muassel"], strengthHint: 3 },
  { name: "Цитрусовый фреш", line: "Strong", tags: ["citrus", "cold"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Шипучка", line: "Strong", tags: ["lemon", "drink", "sour"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },
  { name: "Экзотические фрукты", line: "Strong", tags: ["tropical"], sources: ["https://hookahbaza.ru/catalog/muassel/"], strengthHint: 3 },

  // —— Extra Strong (tabac.ru) ——
  { name: "Виноградный леденец", line: "Extra Strong", tags: ["grape", "dessert", "cold"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
  { name: "Дикий ананас", line: "Extra Strong", tags: ["tropical", "pineapple"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
  { name: "Красный ангел", line: "Extra Strong", tags: ["berry", "citrus"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
  { name: "Малина садовая", line: "Extra Strong", tags: ["berry"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
  { name: "Ночной лес", line: "Extra Strong", tags: ["herbal", "berry"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
  { name: "Розовый закат", line: "Extra Strong", tags: ["berry", "fruity"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
  { name: "Холодная гренада", line: "Extra Strong", tags: ["berry", "cold"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
  { name: "Цитрусовый манго", line: "Extra Strong", tags: ["mango", "citrus"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
  { name: "Цитрусовый фреш", line: "Extra Strong", tags: ["citrus", "cold"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
  { name: "Черника-малина", line: "Extra Strong", tags: ["berry"], sources: ["https://tabac.ru/catalog/muassel"], strengthHint: 4 },
] as const

export const MUASSEL_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "muassel",
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
