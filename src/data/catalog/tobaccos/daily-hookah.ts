import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/**
 * Daily Hookah — Element (mono) + Formula (mixes).
 * Sources: 4kalyans.ru overview + Smolland shop listings.
 */
const SOURCE_ELEMENT = "http://4kalyans.ru/tabak/daily-hookah-2.html"
const SOURCE_SHOP = "https://www.smolandshop.com/shop/daily-hookah100/"

type Item = { name: string; line: string; tags: string[]; aliases?: string[]; source?: string }

const ITEMS: Item[] = [
  // Element
  { name: "Adamiy", line: "Element", tags: ["apple"], aliases: ["Адамий"] },
  { name: "Ananas", line: "Element", tags: ["pineapple"], aliases: ["Ананас"] },
  { name: "Banan", line: "Element", tags: ["banana", "cream"], aliases: ["Банан"] },
  { name: "Dynium", line: "Element", tags: ["melon"], aliases: ["Дыниум"] },
  { name: "Grushium", line: "Element", tags: ["pear"], aliases: ["Грушиум"] },
  { name: "Klukvium", line: "Element", tags: ["cranberry"], aliases: ["Клюквиум"] },
  { name: "Limoniy", line: "Element", tags: ["lemon"], aliases: ["Лимоний"] },
  { name: "Mangus", line: "Element", tags: ["mango"], aliases: ["Мангус"] },
  { name: "Nectarin", line: "Element", tags: ["peach"], aliases: ["Нектарин"] },
  { name: "Nougatiy", line: "Element", tags: ["dessert", "chocolate"], aliases: ["Нугатий"] },
  { name: "Tangerinius", line: "Element", tags: ["tangerine"], aliases: ["Танжериниус"] },
  { name: "Tseyloniy", line: "Element", tags: ["tea"], aliases: ["Цейлоний"] },
  { name: "Malinium", line: "Element", tags: ["raspberry"], aliases: ["Малиниум"] },
  { name: "Zemlyanika", line: "Element", tags: ["strawberry"], aliases: ["Земляника"], source: SOURCE_SHOP },
  { name: "Lemongrass", line: "Element", tags: ["lemongrass", "herbal"] },
  // Formula
  { name: "Belgiyskie Vafli", line: "Formula", tags: ["dessert", "sweet"], aliases: ["Бельгийские вафли"] },
  { name: "Vinogradnoe Zhele", line: "Formula", tags: ["grape", "sweet"], aliases: ["Виноградное желе"] },
  { name: "Indiyskiy Desert", line: "Formula", tags: ["cinnamon", "mint", "dessert"], aliases: ["Индийский десерт"] },
  { name: "Klubnichnyy Milfey", line: "Formula", tags: ["strawberry", "cream", "dessert"], aliases: ["Клубничный мильфей"] },
  { name: "Limonnyy Pay", line: "Formula", tags: ["lemon", "dessert"], aliases: ["Лимонный пай"] },
  { name: "Mentolovye Ledentsy", line: "Formula", tags: ["mint", "cold", "sweet"], aliases: ["Ментоловые леденцы"] },
  { name: "Myata i Moloko", line: "Formula", tags: ["mint", "cream"], aliases: ["Мята и молоко"] },
  { name: "Myatnaya Pastilka", line: "Formula", tags: ["mint", "cold"], aliases: ["Мятная пастилка"] },
  { name: "Myatnyy Shokolad", line: "Formula", tags: ["mint", "chocolate"], aliases: ["Мятный шоколад"] },
  { name: "Oranzhina", line: "Formula", tags: ["orange", "soda"], aliases: ["Оранжина"] },
  { name: "Orchata", line: "Formula", tags: ["cream", "vanilla"], aliases: ["Орчата"] },
  { name: "Svobodnaya Kuba", line: "Formula", tags: ["cola", "lime", "cocktail"], aliases: ["Свободная Куба"] },
  { name: "Slivochnaya Kukuruza", line: "Formula", tags: ["cream", "sweet"], aliases: ["Сливочная кукуруза"] },
  { name: "Slivochnyy Krem", line: "Formula", tags: ["cream", "dessert"], aliases: ["Сливочный крем"] },
  { name: "Tropicheskiy Smitzi", line: "Formula", tags: ["tropical", "fruity"], aliases: ["Тропический смузи"] },
  { name: "Chernichnyy Krambl", line: "Formula", tags: ["blueberry", "cake", "dessert"], aliases: ["Черничный крамбл"] },
  { name: "Energeticheskiy Napitok", line: "Formula", tags: ["energy_drink"], aliases: ["Энергетический напиток"] },
  { name: "Yagodnyy Sorbet", line: "Formula", tags: ["berry", "cold", "dessert"], aliases: ["Ягодный сорбет"] },
  { name: "Pryanye Ekzoticheskie Frukty", line: "Formula", tags: ["tropical", "spice"], aliases: ["Пряные экзотические фрукты"] },
]

export const DAILY_HOOKAH_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: "daily-hookah",
    name: item.name,
    line: item.line,
    tags: item.tags,
    aliases: item.aliases,
    sourceUrl: item.source ?? SOURCE_ELEMENT,
    strengthHint: 2,
  })
)
