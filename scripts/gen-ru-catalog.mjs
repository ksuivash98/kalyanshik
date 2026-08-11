/**
 * Generates RU-market tobacco seed files from verified Russian sources only.
 * Run: node scripts/gen-ru-catalog.mjs
 */
import fs from "fs"
import path from "path"

const OUT = "src/data/catalog/tobaccos"
const VERIFIED = "2026-08-11"

/** @type {Array<{brandId:string, brandName:string, line:string|null, sources:string[], flavors:string[], strength?:number}>} */
const DATA = [
  {
    brandId: "darkside",
    brandName: "DARKSIDE",
    line: "Core",
    sources: [
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/darkside/",
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/darkside-tobacco/core/",
      "https://justfreid.ru/catalog/tabak/darkside/",
    ],
    strength: 4,
    flavors: [
      "Admiral Acbar Cereal","Astro Tea","Bananapapa","Barvy Citrus","Barvy Orange","Basil Blast",
      "Bassberry","Bergamonstr","Blackberry","Blackcurrant","Bloody Orange","Blueberry Blast",
      "Bounty Hunter","Breaking Red","Cherry Rocks","Cinnamoon","Code Cherry","Cookie","Cosmo Flower",
      "Cosmos","Cream Soda","Crystal Grape","Cyber Kiwi","Dark Icecream","Dark Mint","Dark Passion",
      "Cola","Supra","Deep Blue Sea","Extragon","Falling Star","Fruittallity","Fruity Dust",
      "Generis Raspberry","Glitch Ice Tea","Goal","Gonzo Cake","Grape Core","Green Beam","Guava Rebel",
      "Honey Dust","Ice Granny","Kalee Grapefruit","Kashmir Goa Java","Killer Milk","Lemonblast",
      "Mango Lassi","Mary Jane 2.0","Needls","Nordberry","Pear","Pineapple Pulse","Pomelow",
      "Raf In The Jungle","Red Alert","Red Rush","Red Tea","Red Zeppelin","Redberry","Retro Apple",
      "Salbei","Skylime","Space Jam","Space Lychee","Starlime","Strawberry Light","Supermint",
      "Supernova","Sweet Comet","Top Gum","Torpedo","Tropic Ray","Virgin Melon","Virgin Peach",
      "Virgin Peach 2.0","Waffle Shuffle","Wild Forest","Wildberry","Yagoda Malina",
    ],
  },
  {
    brandId: "darkside", brandName: "DARKSIDE", line: "Shot",
    sources: [
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/darkside/",
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/darkside-shot/",
    ],
    strength: 4,
    flavors: [
      "Азовский Шейк","Алтайский Трип","Альпийский","Амурский Панч","Байкальский краш","Балтийский Чилл",
      "Бурятский Трип","Волжский Чилл","Восточный","Вятский Вайб","Гавайский","Горный","Донской Чилл",
      "Западный","Камчатский Панч","Карельский Панч","Карибский","Каспийский Вайб","Коктейльный",
      "Кольский Краш","Конфетный","Крымский Вайб","Кубанский Чилл","Курильский Вайб","Куршский Вайб",
      "Ладожский Вайб","Ленский Трип","Лимонадный","Невский Бит","Окский Чилл","Онежский Панч",
      "Островной","Охотский Шейк","Пляжный","Полярный","Приморский Шейк","Пустынный","Саянский Бит",
      "Свободный","Северный трип","Сибирский Шейк","Столичный Бит","Таежный Трип","Тайский",
      "Таманский Шейк","Токийский","Тосканский","Тропический","Уральский Чилл","Фруктовый",
      "Центральный Бит","Чукотский Вайб","Южный Вайб","Ягодный","Якутский Бит",
    ],
  },
  {
    brandId: "darkside", brandName: "DARKSIDE", line: "Sabotage",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/darkside/"],
    strength: 4,
    flavors: [
      "Acid","Berserk","Bittersweet","Blondie","Bloodrain","Clubnikakiwi","Evil Lime","Indigo",
      "Kashmir","Kvassica","Liquidator","Piki","Pinekiller","Raiden","Root Bear","Shaolime",
      "Shishki","Voltage","Yagodza",
    ],
  },
  {
    brandId: "darkside", brandName: "DARKSIDE", line: "Xperience",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/darkside/"],
    strength: 4,
    flavors: [
      "Aloha Ale","Bana Nascar","Battle Apple","Berry VS","Cake Flip","Candy Crew","Citrus Pro",
      "Citrus Wave","Easy Freezy","Granade Arcade","Grape Furious","Lime Up","Maraschini","Mint Slide",
      "Mohito Yota","Multy Fruity","Petrol Headz","Pine Crime","Pinkmania","PVP Corner","Resident Kiwi",
      "Skittle Street","Turbo Tea","Ultimate Peach","Urban Gin","Vandal Cola",
    ],
  },
  {
    brandId: "darkside", brandName: "DARKSIDE", line: "Base",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/darkside-tobacco/base/"],
    strength: 3,
    flavors: ["Barvy Orange","Grape Core","Polar Cream","Virgin Peach"],
  },
  {
    brandId: "darkside", brandName: "DARKSIDE", line: "Rare",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/darkside-tobacco/rare/"],
    strength: 5,
    flavors: ["Grape Core","Ice Granny"],
  },
  {
    brandId: "musthave", brandName: "MustHave", line: "Classic",
    sources: [
      "https://musthave.ru/category/tabak-dlya-kalyana/",
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/must-have-tobacco/",
      "https://justfreid.ru/catalog/tabak/musthave/",
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/must-have/",
    ],
    strength: 3,
    flavors: [
      "Alova","Apple Drops","Araram","Baikal","Banana Mama","Barberry Candy","Berry Holls","Berry Mors",
      "Black Currant","Blackberry","Blue Blast","Blueberry","Black Orange","Cacao","Candy Cow",
      "Caribbean Rum","Cheesecake","Cherry-Cola","Cherry Juice","Choco Mint","Cinnamon","Cinnamon Roll",
      "Citrus Spritz","Coconut Shake","Cola","Cookie","Cranberry","Cream Soda","Cucunade","Earl Grey",
      "Elderberry","Estragon","Feijoa","Fizzy Dizzy","Forest Berries","Frosty","Garnet Grape","Gooseberry",
      "Grapefruit","Green Fizz","Greendizer","Guanapapa","Honey Holls","Ice Cream","Ice Mint","Jumango",
      "Kiwi Smoothie","Lemon-Lime","Lemon Pie","Lemon Tonic","Lemongrass","Mad Pear","Mandarin",
      "Mango Sling","Maple Pecan","Marula","Masala Tea","Melonade","Milky Rice","Morocco","Mulled Wine",
      "Nord Star","Orange Team","Paradise","Passion Plum","Pearl Pool","Peppermint","Pineapple Rings",
      "Pinkman","Pistachio","Pistachio Cake","Prosecco","Quince","Raspberry","Red Bomb","Red Rush",
      "Red Tea","Rocketman","Ruby Grape","Sea Buckthorn Tea","Sorbetto","Sour Apple","Sour Berries",
      "Sour Citrus","Sour Tropic","Space Flavour","Strawberry","Strawberry Lychee","Sweet Melon",
      "Sweet Peach","Tipsy","Tropic Juice","Unicorn Treats","Vanilla Cream","Violet","Watermelon","Yolka",
    ],
  },
  {
    brandId: "blackburn", brandName: "BlackBurn", line: "Classic",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/black-burn/"],
    strength: 4,
    flavors: [
      "After 8","Apple shock","Barberry shock","Black honey","Cane mint","Cherry shock","Chupa graper",
      "Currant shock","Famous Apple","Garnet","Green tea","Haribon","Kiwi stoner","Lemon Shock",
      "Papaya v obed","Raspberries","Red Orange","Rising Star",
    ],
  },
  {
    brandId: "duft", brandName: "Duft", line: "Classic",
    sources: [
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/duft-tobacco/",
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/duft/",
    ],
    strength: 3,
    flavors: [
      "Aiwa","Apple Candy","Baked Apples","Banana Gum","Barberry","Berry Blast","Black Currant",
      "Blueberry","Boomer","Brownie","Cactus Jack","Canada Dry","Cane Mint","Caramel Pudding",
      "Chai Latte","Cheesecake","Cherry Juice","Cinnamon Cake","Coconut","Cola Nova","Cranberry",
      "Cucumberita","Dragon Fruit","Elderberry","Feijoa","Fir Efir","Freeze","Goa Mango","Goozeberry",
      "Grape Fizz","Green Shake","Guanabana","Guava Mama","Hawaii Sour","Hazel Nut","Heavy Melon",
      "Honey Holls","Ice Lemon Mint","Inzhir","Iron Bro","Kiwi Smoothie","Kumquat","Lazer Cola",
      "Lemon Waffle","Lime Lemon","Limoncello","Lychee","Mango Lassi","Maple Syrup","Maracuja",
      "Maraschino Cherry","Oblepiha","Orange Zest","Papaya","Peach Iced Tea","Pear Jam","Pineapple",
      "Pink Grapefruit","Pomegranate","Pomelo","Punkman","Rafiki","Raspberry","Rasta Cola",
      "Red Currant","Red Energy","Root Beer","Sour Cherry","Sour Peach","Tarhun","Thai Power",
    ],
  },
  {
    brandId: "duft", brandName: "Duft", line: "All-in",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/duft-tobacco/"],
    strength: 3,
    flavors: ["Atomic bob","Berrieta","Bumblebeast","Candyllac","Mickeys mouth","Nacarat","Wonkas"],
  },
  {
    brandId: "duft", brandName: "Duft", line: "CheckMate",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/duft-tobacco/"],
    strength: 3,
    flavors: ["Брауни с Мороженным Тархун","Жасминовый чай","Коктейль Беллини"],
  },
  {
    brandId: "duft", brandName: "Duft", line: "Feromon",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/duft-tobacco/"],
    strength: 3,
    flavors: ["Adore You","Angel's poison","Black Heart","Blanc violet"],
  },
  {
    brandId: "sebero", brandName: "Sebero", line: "Limited",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/"],
    strength: 3,
    flavors: ["Western","Грейпфрут","Гранат","Кактус","Клубника","Лимончелло","Вафли"],
  },
  {
    brandId: "sebero", brandName: "Sebero", line: "Limited Mix",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/"],
    strength: 3,
    flavors: ["TOR","LEMON WAFFLE","COOKIE MONSTER","BLACK CURRANT AND WILD BERRIES","TOR 2"],
  },
  {
    brandId: "sebero", brandName: "Sebero", line: "Arctic Mix",
    sources: [
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/",
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/sebero/",
    ],
    strength: 3,
    flavors: [
      "Adrenalin","Banana Donut","Bubble Fruit","Cactus Pear","Caramel Glass","Coco Like","Corn Soda",
      "Cream Berry","Cucumber Sprite","Fresh Time","Fruit Smoothie","Fruit Tea","Fruit Yogurt",
      "Jelly Fruit","Juicy Shake","Lychee Juice","Melon Ron Do","Morozhenka","Peanut Latte","Pop Star",
      "Sour Citrus","Spice Fruit","Summer Vibe","Sunny Honey","Tarragon","Thai Land","Tropic Berry",
      "Vanilla Fruit",
    ],
  },
  {
    brandId: "sebero", brandName: "Sebero", line: "Black",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/sebero/"],
    strength: 4,
    flavors: [
      "Amarena Cherry","Apple Juice","Barberry","Bilberry","Blueberry","Bubble Gum","Cactus","Cinnabun",
      "Cola","Color of India","Cookie Monster","Corn","Del Toro","Dyusha","Feiberry","Fruit Milkshake",
      "Garnet","Grape","Grapefruit","Green Pear","Gummy Bear","Herbal Currant","Juicy Mix","Kiwi",
      "Lemon Bomb","Lemon Candy","Lemon Waffle","Limonchello","Love Is","M.A.V.","Malinovyy Rafaello",
      "Mango Yogurt","Mellow Mango","Mint","Multifruit","Nitro","Pineapple","Prunes","Raspberry",
      "Red Skittles","Root Beer","Snikers","Sourness","Strawberry","Strawberry Banana","Strawberry Guava",
      "TOP","Vanilla","Very peri","Vitamin Tea","Watermelon","Western","Wild Berries",
    ],
  },
  {
    brandId: "chabacco", brandName: "Chabacco", line: "Medium",
    sources: [
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/chabacco/",
      "https://justfreid.ru/catalog/bestabachnye-smesi/chabacco/",
    ],
    strength: 2,
    flavors: [
      "Asian Mix","Banana Daiquiri","Black Currant","Cactus Mix","Caramel Cookies","Cherry","Cherry Cola",
      "Chinese Melon","Cinnamon Roll","Cranberries in powdered sugar","Elderberry","Feijoa","Flames",
      "Grenadine Drops","Ice Cream Cigar","Ice grape","Ice Mango","Indian Mango","Jackfruit","Kiwi",
      "Lemon-Lime","Milk Oolong","Northern Berries","Passion Fruit","Pomelo","Pumpkin Pie","Rum Lady Muff",
      "Strawberry Mojito","Summer Lemonade","White Apple",
    ],
  },
  {
    brandId: "spectrum", brandName: "Spectrum", line: "Classic",
    sources: [
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/spectrum-tobacco/",
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/spectrum/",
    ],
    strength: 2,
    flavors: [
      "Adjika","Agava Cactus","American Peach","Apple Cider","Apple Strudel","Bacon","Banana Bang",
      "Barberry","Basil Strawberry","Berry Drink","Blue Berry","Brazilian Tea","Caribbean Rum",
      "Chicken Ramen","Christmas Orange","Citrus Mix","Cowberry Lemonade","Crystal","Current Crush",
      "Dezzert Cherry","Dragon Mix","Duchess","Energy Storm","Epic Mint","Feijoa","Fire Wine",
      "Forest Mix","Garden Berry","Ginger Candies","Granny Apple","Grape Soda","Green Pop","Greenwich",
      "Honeycomb","Ice Fruit Gum","Jack O'Lantern","Jasmine Tea","Jungle Mix","Lemon Hurricane",
      "Morning Mango","Oblepiha","Orange Mango","Papaya","Passion Fruit","Pineapple Boom","Punch",
      "Purple Plums","Red Berry","Russian Raspberry","Rye Bread","Shine Anise","Smallberry","Sorbet",
      "Sour Cranberry","Spicy Cheese","Strawberry Cream","Sunny Melon","Timelime",
    ],
  },
  {
    brandId: "spectrum", brandName: "Spectrum", line: "Mix",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/spectrum-tobacco/"],
    strength: 2,
    flavors: [
      "Acid Shake","Banana Cookie","Barberry Lollipop","Berry Bomb","Blue Energy","Flower Garden",
      "Grape Shake","Jungle Berry","Kiwifruit","Morning Oblepiha","Multifruit","Peach Ice Tea",
      "Spicy Tea","Tropic gum","Tropic Smoothie",
    ],
  },
  {
    brandId: "daily-hookah", brandName: "Daily Hookah", line: "Classic",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/daily-hookah-tobacco/"],
    strength: 2,
    flavors: [
      "Ананас","Банан","Бельгийские Вафли","Виноградное желе","Грушиум","Дыниум","Индийский десерт",
      "Клубничный Мильфей","Клюквиум","Лемонграсс","Лимоний","Мята молоко","Мятная пастилка",
      "Мятный шоколад","Нектарин","Оранжина","Орчата","Свободная куба","Сливочный крем",
      "Танжериниус","Цейлоний","Черничный крамбл","Экзотические Фрукты","Энергетический напиток",
      "Ягодный сорбет",
    ],
  },
  {
    brandId: "severnyy", brandName: "Северный", line: "Classic",
    sources: [
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/severnyy/",
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/severnyy/",
    ],
    strength: 3,
    flavors: [
      "CherVanGo","Абрикос на Чиле","Авторитетный Ананас","Алтайский Сбор","Ара Халва","Арабский Фрукт",
      "Банановый Санрайз","Барбарис","Белый Персик","Белый Чай","Беспечное Яблоко","Блэк Джекфрут",
      "Борзый Эвкалипт","Везучий Грейпфрут","Взлётный Лайм","Вишневая Девятка","Вишнёвый Кекс",
      "Вишневый Стиморол","Волчья Ягода","Восточные Пряности","Выпьем за Морковь","Гавайская Гуава",
      "Геройский Виноград","Гранат со Двора","Грейпфрут Тоник","Грушевый Сидр","Дайкири",
      "Дерзкий Абсент","Душевный Ром","Заводной Апельсин","Завтрак Джуманджи","Звездный Кактус",
      "Зеленая Миля","Зеленый Чай","Кайпиринья","Киви от Гиви","Клубничная Феерия","Корица по Жизни",
      "Красная Смородина","Крем Сода","Крепкий Орешек","Кровавая Мэри","Крошка Айва","Крутая Облепиха",
      "Кучерявый Персик","Леди Грей","Лесная Фантазия","Лимон Лайм","Личи в Ажуре","Малина в Законе",
      "Малиновый Руби","Манго Освобожденный","Манговый Сплит","Манящий Ликер","Маракуйя И Точка",
      "Маргарита","Минти","Модная Дыня","Мята из Чата","Нэпманская Брусника","Пан Банан","Пряное Вино",
      "Розовый Фламинго","Русская Шарлотка","Рябиновая Бормотуха","Рядовой Ревень","Садовая Малина",
      "Свежий Бабл","Север","Семигуавщина","Сибирская Пихта","Синьор Лимон","Сладкий Бабл",
      "Супер Кислый","Супер Крепкий","Супер Мягкий","Тайлав","Тропиканка","Тропический Лимонад",
      "Фейхоа на Гоа","Фрустайл","Фрутомания","Хвойный Микс","Царь Клюква","Чао Какао",
      "Черная Смородина","Черничный Четверг","Черный Арбуз","Зеленый Скитлз",
      "Дикая Туса","Лютая Туса","Свежая Туса","Летняя Туса","Сочная Туса",
    ],
  },
  {
    brandId: "element", brandName: "Element", line: "Воздух",
    sources: [
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/element/",
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/element-tobacco/",
      "https://element-tobacco.ru/tobacco",
    ],
    strength: 2,
    flavors: [
      "Amazing Green","Berrytale","Berry Chups","Berrymore","Blueberry Yogurt","Buzina","Cheese Tea",
      "Cherry Juice","Chinese Rose","Ekzo","Fruit Ice","Fruitberry","Grape Mint","Lollipop","Mangello",
      "Marula","Maui","Melon Holls","Milky Mouse","Pearfect Melon","Pina Colada","Pineapple Holls",
      "Raspberry Jam","Red Sorbet","Skittlez Ice","Strawberry Soda","Tropicana","Winter Dream","Baikal","Bananerro",
    ],
  },
  {
    brandId: "element", brandName: "Element", line: "Вода",
    sources: [
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/element/",
      "https://smokemaster.ru/shop/tabak-dlya-kalyana/element-tobacco/",
    ],
    strength: 3,
    flavors: [
      "Chak Chak","Cherry Holls","Cola","Cookie Monster","Ekzo","Feijoa Lemonade","Fir","Fruit Pulp",
      "Grape Drink","Grape Mint","Grapefruit Pomelo","Green Skittlez","Gummy Berry","Kiwi","Maui",
      "Mellow Blueberry","Melony","Moroz","Pear","Pineapple","Raspberry","Rich Peach","Rush","Siberry",
      "Tropicana","Watermelon Holls","Wild Jam","Wildberry Mors","Yangmei","Kalamansi",
    ],
  },
  {
    brandId: "element", brandName: "Element", line: "Земля",
    sources: [
      "https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/element/",
      "https://element-tobacco.ru/tobacco",
    ],
    strength: 4,
    flavors: [
      "Chak Chak","Cherry Holls","Cola","Cookie Monster","Ekzo","Elemint","Feijoa Lemonade","Fir",
      "Fruit Pulp","Gaba","Grape Drink","Grape Mint","Grapefruit Pomelo","Green Skittlez","Gummy Berry",
      "Kiwi","Maui","Mellow Blueberry","Melony","Pear","Pineapple","Raspberry","Kashmir",
    ],
  },
  {
    brandId: "smoke-angels", brandName: "Smoke Angels", line: "Classic",
    sources: ["https://smokemaster.ru/shop/tabak-dlya-kalyana/smoke-angels/"],
    strength: 3,
    flavors: ["ACID BERRY","Desert corn","Pacific route","REDEMPTION APPLE","Sinner Fruit","ZEN LATTE"],
  },
  {
    brandId: "satyr", brandName: "Satyr", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/satyr/"],
    strength: 4,
    flavors: [
      "1915","A Clockwork Orange","Acai","Aladdin","Ana-nas","Angel Tits","Anton-ovka","Apelmizo",
      "Atacama","Atomic Juice","Babushka","Bacon","Banana","Barberry","Barberry Lime","Basis Moscow",
      "Black","Black Currant","Black Ice","Black Jack","Blackberry","Blood","Blue Cheese","Blue Sirius",
      "Blueberry Nights","Bohemia Rubi","Bom Byao","Boomerang","Brownie","Burley Cognac","Burley Cointreau",
      "California Cola","Charmer","Cherry","Cherry Coca","Chika","Cider","Cock Porn","Coco Jamboo",
      "Cornhoolio","Cubana Sunset","Cubano Viso","Cubita Colombia","Cubus Rubus","Dedushka","Dragon Eye",
      "Duchess","Duebeck Jagermeister","Energy","Excalibur","Ferra","Fiji","Flesh","Frozen Raspberries",
      "Georgia Grapes","Go! Go!","Good Lemon","Granola","Green Joy","Greentea","Griffinberry",
      "Guns N' Waffles","Horizon","Humster Holiday","Ice Cherry","Ice Grape","Ice Lemon","Ice Tangerine",
      "Ice Tea","Ice Watermelon","Ipa Vol.1","Ipa Vol.2","Iroquois","Isabel","Jah Grapefruit","Java",
      "Jungle","Jy","Kaizen","Kickstart My Heart","Kiss-Kiss","Kvas","Lagidze","Lamba","Lastochka",
      "Lime","Lotus","Mad Cucu","Mangosteen","Margarita","Mastic","Melissa","Melon Marrakesh","Melon Sun",
      "Milfa","Milk Shot","Moon Peach","Mr. Grey","Nat","Neft","New York","Nicaragua Ligero",
      "North Berry","Northberry","Pablo","Pan Satyr","Peach","Pink Wine","Pistachio Hunter","Pixie",
      "Polet","Pooh","Prickly Apple","Pussy Fruit","Qirim Chacha","Queen Annes Revenge","Queen of Persia",
      "Raspberries","Red Hood","Rio","Saturn","Skazka","Spice-Cake","Squirt","Susanin","Suzdal",
      "Szechuan Pepper","Tangerine","Tochka G","Turbo","Tyanka","Watermelon","White","Witch","Worms",
      "Балалайка",
    ],
  },
  {
    brandId: "bonche", brandName: "Bonche", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/bonche/"],
    strength: 5,
    flavors: [
      "Barberry","Base","Basil","Bergamot","Black Currant","Blueberry","Caramel","Cheesecake","Cherry",
      "Clove","Coconut","Coffee","Cognac","Cookie","Dark Chocolate","Ginger","Grapefruit","Honey","Hoob",
      "Irga","Lavender","Lemon","Lemongrass","Lychee","Mango","Marzipan","Melissa","New Year",
      "New Year 2026","Olive","Orange","Passion Fruit","Peanut","Pear","Pineapple","Pomegranate","Prunes",
      "Raspberry","Red Wine","Rum","Salami","Sesame","Strawberry","Sweet Corn","Vanilla","Whiskey",
    ],
  },
  {
    brandId: "bonche", brandName: "Bonche", line: "Bartender",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/bonche/"],
    strength: 5,
    flavors: ["Clover Club","Gimlet","Mint Julep","Singapore Sling"],
  },
  {
    brandId: "starline", brandName: "Starline", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/starline/"],
    strength: 2,
    flavors: [
      "Ананас","Банан","Банановый Маршмеллоу","Бельгийские Вафли","Ваниль","Ванильная Кола",
      "Виноградная Содовая","Виноградное Желе","Вишня","Гранатовый Сок","Груша","Дыня","Зеленый Фреш",
      "Земляника","Земляника со Сливками","Какао","Киви Смузи","Кислые Мармеладки","Клубничная Конфета",
      "Клубничная Содовая","Клубничный Милфей","Клубничный Мохито","Клюква","Кокосовое Молочко",
      "Лаймовый Сорбет","Лемонграсс","Лимон 2.0","Лимонная Шипучка","Малина","Малиновые Вафли","Манго",
      "Манго Карамбола","Маракуйя","Меренговый Рулет","Мокко","Мятная Пастилка","Нектарин","Оранжина",
      "Папайя","Персик","Пина Колада","Свободная Куба","Сливочный Крем","Смородиновый Сорбет",
      "Тропический Смузи","Фейхоа","Черничный Крамбл","Черничный Чизкейк","Экзотические Фрукты",
      "Энергетик","Яблочный Сок","Ягодный Попкорн","Ягодный Сорбет",
    ],
  },
  {
    brandId: "overdose", brandName: "Overdose", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/overdose/"],
    strength: 4,
    flavors: [
      "Apple Juicy","Aroma Rum","Baileys","Bali Mango","Black Banano","Blueberry","Brumblebee","Coffee",
      "Currant Black","Currant Mead","Dear Pear","Expertmint","Fantola","Fig Lemonade","Frustyle",
      "Fruttella","Gin Cucumber","Gin Spritz","Gin Watermelon","Goa Feijoa","Grapple","Guajava",
      "Jelly Grape","Kashmir Citrus","Kashmir Peach","Kiwi","Lime — Lemon","Lost Futura","Lotus Berry",
      "Manila Malina","Maraschino Cherry","Masala Tea","Melon Berry","Orange Soda","Overcola","Peach",
      "Peach Iced Tea","Peanut Stout","Pineapple Chunks","Pink Grapefruit","Pomodoro Gosei",
      "Samarkand Melon","Sandal","Spiced Ulun","Strawberry","Strawberry Basil","Strawberry Kiwi",
      "Sweet Rose","Tarhun","Tequila Diabla","Waffles","Walnut","Watermelon","Wild Srawberry","Wintergreen",
    ],
  },
  {
    brandId: "adalya", brandName: "Adalya", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/adalya/"],
    strength: 2,
    flavors: [
      "Angel Lips","Bagdadi","Baku Nights","Berlin Nights","Berry Mix","Blue Ice","Blue Melon","Blue Moon",
      "Blueberry","Blueberry Pie","Bubble Gum","Cactus","Caramel","Champagne","Cherry","Cherry Banana Ice",
      "Cindys","Citrus Fruits","Citrus Tea","Cola Cherry","Crazy Lemon","Desperado","Double Melon",
      "Double Melon Ice","Eskimo Leon","Exagelado","Exotic Rush","Freshberry","Gipsy Kings","Grape",
      "Grapefruit","Green Apple","Hawaii","Ice","Ice Apple","Ice Bonbon","Ice Pear","Ice Raspberry",
      "Ice Watermelon","Iceberr's","Joker 777","Jungle Jungle","La Bonita","Lady Killer","Lemon Pie",
      "Love 66","Mango Orange","Mango Tango","Mango Tango Ice","Maracuja","Melon","Milk","Mixfruit",
      "Moon Sugar","Moscow Evenings","Orange","Orange Lemon","Punk Man","Raspberry","Rhapsody",
      "Sheik Money","Strawberry Banana Ice","Two Apples","Watermelon","White Grape",
    ],
  },
  {
    brandId: "serbetli", brandName: "Serbetli", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/serbetli/"],
    strength: 2,
    flavors: [
      "Big Bob","Bubble Fruit","Caribbean Mix","Dark Sweet","Ice Berry Tangerine","Ice Raspberry Acai",
      "Ice Strawberry Melon","Lemon Berry","Lemon Cake","Lemon Fresh","Lemon Marmelade","Lime Spice Peach","Rotana",
    ],
  },
  {
    brandId: "banger", brandName: "Banger", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/banger/"],
    strength: 4,
    flavors: [
      "Apricot Jam","Banger Cracker","Batumi","BBQ","Berry Pie","Black and White","Blackberry Juice",
      "Bluemist","Brazilian Tea","Cherry Juice","Cherry Macaroon","Cherry Plum","Choker","Cola Bella",
      "Cream Soda","Crumble","Currant","Evergreen","Grape Lemonade","Grapefruit","Green Day","Holostyak",
      "Iron Bru","Lambo","Lemon Tonic","Mango Rice","Mexican Pear","Mikado","Moscow Never Sleeps",
      "Orange Biscuit","Papa Ya","Passion Citrus","Peach Maracuja","Pineapple Kiwi","PineLychee",
      "Raspberry","Saint Tropez","Sexy","Strawberry","Summer Juicy",
    ],
  },
  {
    brandId: "brusko", brandName: "Brusko", line: "Medium",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/brusko/"],
    strength: 2,
    flavors: [
      "Апельсин","Бабл-гам","Банан","Барбарис","Виноград","Вишня","Гранат","Десерт с Корицей",
      "Дыня с Арбузом","Киви","Клубника","Кола","Лесные Ягоды","Лимон с Лаймом","Лимонные Вафли",
      "Личи","Малина","Манго","Маракуйя","Мята","Ореховый Капучино","Холодок","Чай с Бергамотом",
      "Черная Смородина","Яблоко","Груша с Дыней","Доктор Пеппер","Дыня с Ананасом",
      "Дыня с Кокосом и Карамелью","Зеленое Яблоко","Киви с Яблоком","Кокос со Льдом",
      "Ледяная Дыня","Ледяная Смородина",
    ],
  },
  {
    brandId: "deus", brandName: "Deus", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/deus/"],
    strength: 4,
    flavors: [
      "Black Ji","Blackberry Wine","Blueberry Yogurt","Catmint","Champagne","Cherry Jelly","Cigar I",
      "Cigar II","Cigar III","Cola","Cooler","Darkside","Elderberry","Green Apple","Guinness",
      "Jasmine Pear","Kiwi","Love Is","Marmelade","Orange Blossom","Passion Fruit","Peonies","Pine",
      "Pineapple Mango","Pomegranate Mors","Pumpkin Pie","Raspberry","Red","Rose Grapefruit","Skittles",
      "Sour Berries","Sour Pineapple","Strawberry","Tropic Soda","Vanilla Berries","Violet Zephyr",
      "Watermelon Halls",
    ],
  },
  {
    brandId: "sapphire-crown", brandName: "Sapphire Crown", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/sapphire-crown/"],
    strength: 3,
    flavors: [
      "Alpine Strawberry","Apple Strudel","Bitter Cherry","Blueberry Granola","Bombay","Bright Side",
      "Cherry Energy","Chinatown","Classy Aperol","Code Red","Cream Soda","Crispy Pear","Crownberry",
      "Dried Plum","Eden Raspberry","Ekzo","Fragrant Blackcurrant","Froostyle","Go Bananas!","Grapefruit",
      "Greender","Hazelnut Crush","Indian Stuff","Italian Tiramisu","Kiwi Fruit","Ladan Milk",
      "Lavender Tonic","Lemon Lime","Lemon Pie","Margarita","Matcha Cocos","Mejumi","Passion Fruit",
      "Peach Ice Tea","Pineapple Funta","Pineberry","Pink Tonic","Pumpkin Raf","Redberry","Riesling",
    ],
  },
  {
    brandId: "huligan", brandName: "Хулиган", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/huligan/"],
    strength: 3,
    flavors: [
      "2016","911","Ba","Ban","Bar","Bear","Begemot","Berry Ninja","Boo","Boss","Cherry Boom","Cho",
      "Chudo","Club","Daa","Dino","Fifi","Green Queen","Healthy","Jorik","Juicy","Kras","Lova Lova",
      "Love","Mex","Mystic","Og Club","Ogo","Old","Panama","Pink","Pool","Rap Rose","Sila","Sir",
      "Sonik","SUUUUU","Tanos","True","Turbo","Vampire","Vera","Vita","Young B",
    ],
  },
  {
    brandId: "sarma", brandName: "Сарма", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/sarma/"],
    strength: 3,
    flavors: [
      "Ананасовый Сок","Арбузный Мармелад","Байкал","Байкальская Клубника","Банановое Суфле",
      "Брусника Клюква","Виноградный Сок","Гранатовый Сок","Грейпфрутовый Сок","Дачная Груша",
      "Деревенская Вишня","Дыня","Елка","Зеленое Яблоко","Зеленый Крыжовник","Земляничое Печенье",
      "Зима","Ирга","Кедровый Пломбир","Княженика","Кола","Компот из Морошки","Красное Яблоко",
      "Курага","Лесная Малина","Лимонад Буратино","Лимонад Тархун","Лимонный Леденец",
      "Миндальный Батончик","Напиток Крюшон","Облепиха Апельсин","Ореховое Молочко","Розовый Персик",
      "Ромашковое варенье","Северная Черника","Смородиновый Морс","Таежный Чай","Торт Медовик",
      "Фруктовый Сорбет","Холодный чай","Чабрец Байкальский","Щавель","Это База",
    ],
  },
  {
    brandId: "jent", brandName: "Jent", line: "Classic",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/jent/"],
    strength: 3,
    flavors: [
      "Aloha Corn","Apple Hook","Bachata","Coca Choca","Coconut Pistachio","Currant WOW","Dolce Mint",
      "Grape Me","Industry Legend","Joker","Kiwi Sour","Lemon Pie","Malibu","Mamukka","Mango Swish",
      "Marco Polo","MMM","Orange Soda","Orange Tik Tak","Peach Station","Pure Love","Purple Skittlez",
      "Saint Tropez","Yellove","Your Grace",
    ],
  },
  {
    brandId: "jent", brandName: "Jent", line: "Alcohol",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/jent/"],
    strength: 3,
    flavors: [
      "40,000 Irish Cows","Amber Shade","Blue Agave","Blue Hawaii","Brisky Whiskey","Cosmopolitan",
      "Cuba Libre","Gin Air","Gluhwein","Green Witch","Havana 29°","Jagerhaus","Klyukovka","Martelini",
      "Puerto Rico","Rioja 17","Rum Riot","Summer 1919","Tripchello","White Russian",
    ],
  },
  {
    brandId: "jent", brandName: "Jent", line: "Herbal",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/jent/"],
    strength: 3,
    flavors: [
      "Bee Friend","Cookie Bush","Herbal Trick","Jamaica 4:19","Linden Blossom","Magenta","Moon Blanc",
      "Mr Damson","Needles","Old Sage","Sweet Clover",
    ],
  },
  {
    brandId: "trofimoff", brandName: "Trofimoff's", line: "Burley",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/trofimoffs/"],
    strength: 4,
    flavors: [
      "Abricot","Base","Beileys","Cashmere Guava","Cashmere Nectarine","Cocos","Coke","Cookies","Crespino",
      "Dark Plum","Double Apple","Elder Flowers","Ginger Ale","Gingerbread","Grapefruit","Green Apple",
      "Green Tea","Hurtleberry","Jasminum","Kiwi","Kriek","Lavander","Limonata","Mangifera","Mint",
      "Nobilis","Nurr","Old School Orange","Opuntia Pear","Pan Banan","Peach","Pineapple","Pop Corn",
      "Red Currant","Regan","Rhubarb","Ron","Ruby Grapes","Sri Lanka","Sujuk","Tangerine","The Rose",
      "Watermelon","Wild Strawberry","Wintergreen","Yellow Lemon",
    ],
  },
  {
    brandId: "nash", brandName: "Nаш", line: "Hard",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/nash/"],
    strength: 4,
    flavors: [
      "Ананас","Апельсин Ваниль","Арбуз","Гвоздика","Голубика","Грейпфрут","Груша Фисташка",
      "Земляника Лемонграсс","Инжир Лимон Грецкий Орех","Квас","Кислая Малина","Кокос Лемонграсс Лайм",
      "Корица","Лаванда","Леденцы Лимон Дыня","Липтон","Малина Личи Базилик","Манго Перец","Скитлс",
      "Слива Абрикос","Таежный Чай","Торфяной Виски","Урал","Черная Смородина","Черника Ромашка",
      "Чупа Чупс","Юбилейное Печенье","Яблоко Бузина",
    ],
  },
  {
    brandId: "nash", brandName: "Nаш", line: "Cigar",
    sources: ["https://sevas-market.ru/product-category/tabak-dlya-kalyana/brand/nash/"],
    strength: 5,
    flavors: [
      "Абсент","Ананас","База","Виноград","Вишня","Грецкий","Джин","Земляника","Карамель","Лайм",
      "Малина","Манго","Маракуйя","Морковный Фреш","Перу","Розмарин Чабрец","Смородина","Черный Перец",
    ],
  },
]

function esc(s) {
  return JSON.stringify(s)
}

function guessTags(name) {
  const n = name.toLowerCase()
  const tags = []
  const add = (t) => { if (!tags.includes(t)) tags.push(t) }
  if (/mint|мята|холод|frost|ice |ice$|supernova|freeze/.test(n)) add("cold")
  if (/mint|мята/.test(n)) add("mint")
  if (/lemon|лимон/.test(n)) add("lemon")
  if (/lime|лайм/.test(n)) add("lime")
  if (/orange|апельсин/.test(n)) add("orange")
  if (/grape|виноград/.test(n)) add("grape")
  if (/berry|ягод|черник|малин|клубник|ежевик|смородин/.test(n)) add("berry")
  if (/mango|манго/.test(n)) add("mango")
  if (/peach|персик/.test(n)) add("peach")
  if (/apple|яблок/.test(n)) add("apple")
  if (/watermelon|арбуз/.test(n)) add("watermelon")
  if (/melon|дын/.test(n)) add("melon")
  if (/cola|кола/.test(n)) add("cola")
  if (/tea|чай/.test(n)) add("tea")
  if (/coffee|кофе|латте/.test(n)) add("coffee")
  if (/cream|сливк|мороженое|ice cream|dessert|пирог|печенье|вафл|чизкейк/.test(n)) add("dessert")
  if (/citrus|цитрус/.test(n)) add("citrus")
  if (/tropic|тропик/.test(n)) add("tropical")
  if (/spice|кориц|прян|кашмир/.test(n)) add("spice")
  if (tags.length === 0) add("fruity")
  return tags
}

function writeBrandFile(brandId, entries) {
  const sourcesUnion = [...new Set(entries.flatMap((e) => e.sources))]
  const items = []
  for (const e of entries) {
    for (const name of e.flavors) {
      items.push({
        name,
        line: e.line ?? "Classic",
        tags: guessTags(name),
        sources: e.sources,
        strength: e.strength ?? 3,
      })
    }
  }
  // dedupe by line+name
  const seen = new Set()
  const unique = []
  for (const it of items) {
    const key = `${it.line}::${it.name.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(it)
  }

  const body = unique
    .map((it) => {
      const src = it.sources.map((s) => esc(s)).join(", ")
      return `  {\n    name: ${esc(it.name)},\n    line: ${esc(it.line)},\n    tags: ${esc(it.tags)},\n    sources: [${src}],\n    strengthHint: ${it.strength},\n  },`
    })
    .join("\n")

  const file = `import { makeTobacco } from "../make-tobacco"
import { TobaccoSeed } from "@/types/catalog"

/** Russian market sources only (${VERIFIED}). */
const ITEMS = [
${body}
] as const

export const ${brandId.replace(/-/g, "_").toUpperCase()}_TOBACCOS: TobaccoSeed[] = ITEMS.map((item) =>
  makeTobacco({
    brandId: ${esc(brandId)},
    name: item.name,
    line: item.line,
    tags: [...item.tags],
    sources: [...item.sources],
    strengthHint: item.strengthHint,
  })
)

export const ${brandId.replace(/-/g, "_").toUpperCase()}_META_SOURCES = ${esc(sourcesUnion)}
`

  fs.writeFileSync(path.join(OUT, `${brandId}.ts`), file)
  return unique.length
}

// group by brandId
const byBrand = new Map()
for (const row of DATA) {
  const list = byBrand.get(row.brandId) ?? []
  list.push(row)
  byBrand.set(row.brandId, list)
}

// clean old tobacco files
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith(".ts")) fs.unlinkSync(path.join(OUT, f))
}

let total = 0
const stats = []
for (const [brandId, entries] of byBrand) {
  const n = writeBrandFile(brandId, entries)
  total += n
  stats.push([brandId, n])
}

stats.sort((a, b) => b[1] - a[1])
console.log("Generated brands:", stats.length)
console.log("Total flavors:", total)
for (const [b, n] of stats) console.log(b, n)

fs.writeFileSync(
  "scripts/ru-catalog-stats.json",
  JSON.stringify({ total, brands: Object.fromEntries(stats), generatedAt: VERIFIED }, null, 2)
)
