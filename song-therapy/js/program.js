/**
 * 14-дневная программа: подготовка нервной системы + письмо песен.
 * Тезисы — короткие, для экрана, не для памяти.
 */

export const SAFETY_ANCHOR = [
  "Сейчас не тетрадь.",
  "Сейчас не мама.",
  "Никто не кричит.",
  "Пауза — не провал.",
  "Можно остановиться.",
];

export const WRITE_REMINDERS = [
  "Пауза — норма.",
  "Криво — норма.",
  "Не дописать — норма.",
  "Это песня, не оценка.",
  "Ты уже в безопасном месте.",
];

export const QUICK_MODE = {
  title: "Быстрый вход",
  goal: "Без подготовки — только якорь и песня.",
  phases: [
    {
      id: "anchor",
      name: "Якорь",
      duration: 90,
      theses: SAFETY_ANCHOR.slice(0, 3),
      hint: "Прочитай вслух или про себя. Не анализируй.",
      fields: [],
    },
    {
      id: "write",
      name: "Песня",
      duration: 900,
      theses: WRITE_REMINDERS,
      hint: "Пиши что угодно. Таймер можно остановить раньше.",
      fields: [
        { id: "mood", label: "Одно слово — настроение", placeholder: "тревога / туман / свет…", multiline: false },
        { id: "song", label: "Текст песни (или куски)", placeholder: "Строки, обрывки, рифмы…", multiline: true },
      ],
    },
  ],
};

export const DAYS = [
  {
    day: 1,
    title: "Карта барьера",
    goal: "Видеть связь «песня сейчас» и «сочинение тогда» — без лечения, только карта.",
    phases: [
      {
        id: "anchor",
        name: "Якорь",
        duration: 120,
        theses: SAFETY_ANCHOR,
        hint: "2 минуты. Просто читай строки на экране.",
        fields: [],
      },
      {
        id: "map",
        name: "Карта",
        duration: 300,
        theses: ["Не анализируй глубоко.", "Пиши как есть.", "Коротко — достаточно."],
        hint: "5 минут. Ответь в поля — можно тезисами.",
        fields: [
          {
            id: "barrier",
            label: "Когда сажусь писать песню — что чувствую в теле и в голове?",
            placeholder: "Ров, тревога, «сначала надо…», хочу уйти…",
            multiline: true,
          },
          {
            id: "school",
            label: "Школа: одна сцена, которую помню (кратко)",
            placeholder: "Ночь, сочинение, мама, слёзы, тетрадь…",
            multiline: true,
          },
          {
            id: "link",
            label: "Что в этих двух ситуациях похоже? (1–3 слова)",
            placeholder: "застрял, страх, принуждение…",
            multiline: false,
          },
        ],
      },
      {
        id: "touch",
        name: "Касание",
        duration: 300,
        theses: ["Одна строка — уже победа.", "Можно остановиться."],
        hint: "5 минут. Минимум — одно слово настроения.",
        fields: [
          { id: "mood", label: "Одно слово — настроение", placeholder: "…", multiline: false },
          { id: "song", label: "Если идёт — строки песни", placeholder: "Не обязательно.", multiline: true },
        ],
      },
    ],
  },
  {
    day: 2,
    title: "Чувства тогда",
    goal: "Вытащить застрявшие чувства из школьной сцены — на бумагу, не в голову.",
    phases: [
      {
        id: "anchor",
        name: "Якорь",
        duration: 90,
        theses: SAFETY_ANCHOR.slice(0, 4),
        hint: "90 секунд.",
        fields: [],
      },
      {
        id: "feelings",
        name: "Чувства",
        duration: 420,
        theses: ["Страх", "Злость", "Стыд", "Беспомощность", "Отвержение"],
        hint: "7 минут. Отметь что было + допиши своими словами.",
        fields: [
          {
            id: "felt_check",
            label: "Что было в той ночи? (отметь)",
            type: "checkboxes",
            options: ["Страх", "Злость", "Стыд", "Беспомощность", "Желание уйти", "Оцепенение", "Слёзы", "Страх что любят меньше"],
          },
          {
            id: "felt_free",
            label: "Что ещё было — своими словами",
            placeholder: "…",
            multiline: true,
          },
        ],
      },
      {
        id: "now",
        name: "Сейчас",
        duration: 300,
        theses: ["Тревога сейчас ≠ наказание сейчас."],
        hint: "5 минут. Мета-текст: что тревожит перед песней.",
        fields: [
          {
            id: "anxiety",
            label: "Что именно тревожит, когда открываю текст песни?",
            placeholder: "Не идёт, будут смеяться, я тупой…",
            multiline: true,
          },
          { id: "mood", label: "Одно слово — настроение", placeholder: "…", multiline: false },
        ],
      },
    ],
  },
  {
    day: 3,
    title: "Что не сказал",
    goal: "Символически выдать то, что застряло — не к маме в реале, в поле здесь.",
    phases: [
      {
        id: "anchor",
        name: "Якорь",
        duration: 90,
        theses: ["Это упражнение — не разговор с мамой.", "Это поле в интерфейсе."],
        hint: "90 секунд.",
        fields: [],
      },
      {
        id: "unsaid",
        name: "Невысказанное",
        duration: 420,
        theses: ["Хотел сказать", "Хотел сделать", "Не смог"],
        hint: "7 минут. Пиши в воспоминании, как если бы мог.",
        fields: [
          {
            id: "wanted_say",
            label: "Что хотел сказать маме в той ночи?",
            placeholder: "Мне страшно. Я не могу. Отпусти. Мне нужна пауза…",
            multiline: true,
          },
          {
            id: "wanted_do",
            label: "Что хотел сделать?",
            placeholder: "Уйти, закрыть тетрадь, попросить помочь по-другому…",
            multiline: true,
          },
        ],
      },
      {
        id: "secret",
        name: "Тетрадь",
        duration: 420,
        theses: ["Никто не читает.", "Не для песни."],
        hint: "7 минут. Письмо в тетрадь, которую никто не видит.",
        fields: [
          {
            id: "secret_letter",
            label: "Письмо «в тетрадь» — всё что выходит",
            placeholder: "Можно бессмысленно, можно злость…",
            multiline: true,
          },
        ],
      },
    ],
  },
  {
    day: 4,
    title: "Перезапись",
    goal: "Новый образ: ты не в оцепенении, есть защита или другой исход.",
    phases: [
      {
        id: "anchor",
        name: "Якорь",
        duration: 90,
        theses: SAFETY_ANCHOR,
        hint: "90 секунд.",
        fields: [],
      },
      {
        id: "rescript",
        name: "Рескриптинг",
        duration: 600,
        theses: ["Ты активный.", "Не жертва.", "Можно выйти.", "Можно быть защищённым."],
        hint: "10 минут. Опиши ту ночь так, как тебе нужно было.",
        fields: [
          {
            id: "rescript_scene",
            label: "Новая версия сцены (как в кино — с твоим исходом)",
            placeholder: "Кто-то остановил. Я сказал. Мама остановилась. Я вышел…",
            multiline: true,
          },
          {
            id: "rescript_body",
            label: "Что чувствует тело в этой новой версии?",
            placeholder: "Тепло, выдох, спокойнее…",
            multiline: true,
          },
        ],
      },
      {
        id: "touch",
        name: "Касание",
        duration: 300,
        theses: WRITE_REMINDERS.slice(0, 3),
        hint: "5 минут. Любой текст — после перезаписи.",
        fields: [
          { id: "mood", label: "Одно слово", placeholder: "…", multiline: false },
          { id: "song", label: "Строки", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 5,
    title: "Песня ≠ сочинение",
    goal: "Явный ритуал разделения контекстов — для нервной системы.",
    phases: [
      {
        id: "ritual",
        name: "Ритуал",
        duration: 180,
        theses: ["Не оценка.", "Не тетрадь.", "Не ночь.", "Не принуждение."],
        hint: "3 минуты. Прочитай и отметь галочки.",
        fields: [
          {
            id: "ritual_check",
            label: "Сегодня это:",
            type: "checkboxes",
            options: [
              "Песня — не школьное сочинение",
              "Пауза — не «я плохой»",
              "Могу остановиться без наказания",
              "Никто не стоит над душой",
            ],
          },
        ],
      },
      {
        id: "write",
        name: "Песня",
        duration: 600,
        theses: WRITE_REMINDERS,
        hint: "10 минут. Только песня.",
        fields: [
          { id: "mood", label: "Настроение — одно слово", placeholder: "…", multiline: false },
          { id: "song", label: "Текст песни", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 6,
    title: "Правила из травмы",
    goal: "Увидеть бессознательные «должен» и снять один на сегодня.",
    phases: [
      {
        id: "rules",
        name: "Правила",
        duration: 360,
        theses: ["Должен идеально", "Должен сразу", "Не могу остановиться"],
        hint: "6 минут. Отметь что звучит внутри + выбери одно разрешение.",
        fields: [
          {
            id: "rules_check",
            label: "Какие «должен» включаются при песне?",
            type: "checkboxes",
            options: [
              "Текст должен прийти сразу",
              "Не могу остановиться пока не допишу",
              "Пауза = я плохой",
              "Сначала всё идеально в голове",
              "Если криво — я никчёмный",
            ],
          },
          {
            id: "permission",
            label: "Одно разрешение на сегодня (выбери и перепиши)",
            placeholder: "Сегодня могу писать криво и 10 минут.",
            multiline: false,
          },
        ],
      },
      {
        id: "write",
        name: "Песня",
        duration: 600,
        theses: ["Помни разрешение на экране.", "Криво — по плану."],
        hint: "10 минут.",
        fields: [
          { id: "song", label: "Текст песни", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 7,
    title: "Мягкий день",
    goal: "Минимум подготовки — проверить, что можно просто писать.",
    phases: [
      {
        id: "anchor",
        name: "Якорь",
        duration: 60,
        theses: ["Уже безопасно.", "Можно мало."],
        hint: "1 минута.",
        fields: [],
      },
      {
        id: "write",
        name: "Песня",
        duration: 900,
        theses: WRITE_REMINDERS,
        hint: "15 минут. Главный блок сегодня.",
        fields: [
          { id: "mood", label: "Настроение", placeholder: "…", multiline: false },
          { id: "song", label: "Текст песни", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 8,
    title: "Ров — назвать",
    goal: "Когда «сначала надо решить проблему» — записать, что это, и не решать.",
    phases: [
      {
        id: "moat",
        name: "Ров",
        duration: 300,
        theses: ["Назвать ров.", "Не чинить ров.", "Писать песню."],
        hint: "5 минут. Список «сначала надо…» — и сознательно не делать.",
        fields: [
          {
            id: "moat_list",
            label: "«Сначала надо…» (всё что всплывает)",
            placeholder: "Настроение, идея, убрать тревогу, поесть…",
            multiline: true,
          },
          {
            id: "moat_skip",
            label: "Сегодня сознательно НЕ делаю (1 строка)",
            placeholder: "Не жду идею — сажусь с тревогой.",
            multiline: false,
          },
        ],
      },
      {
        id: "write",
        name: "Песня",
        duration: 720,
        theses: ["Ров не чиним.", "Песню — да."],
        hint: "12 минут.",
        fields: [
          { id: "song", label: "Текст песни", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 9,
    title: "Тревога в процессе",
    goal: "Когда застрял — не бороться, метить и продолжать или выйти.",
    phases: [
      {
        id: "anchor",
        name: "Якорь",
        duration: 60,
        theses: ["Застрял ≠ тогда.", "Пауза ≠ наказание."],
        hint: "1 минута.",
        fields: [],
      },
      {
        id: "write",
        name: "Песня + метки",
        duration: 720,
        theses: ["Застрял — напиши [пауза]", "Не дописать — ок"],
        hint: "12 минут. В тексте можно вставлять [пауза] [тревога] [не знаю].",
        fields: [
          { id: "song", label: "Текст с метками", placeholder: "[тревога] не знаю что дальше…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 10,
    title: "Одна строка",
    goal: "Снизить вход: достаточно одной честной строки.",
    phases: [
      {
        id: "one",
        name: "Одна строка",
        duration: 300,
        theses: ["Одна строка = сессия состоялась."],
        hint: "5 минут. Одна строка песни. Можно больше — не обязательно.",
        fields: [
          { id: "one_line", label: "Одна строка", placeholder: "…", multiline: false },
          { id: "song", label: "Если идёт — ещё", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 11,
    title: "Злость и текст",
    goal: "Разрешить злость в тексте — не только «красивую» песню.",
    phases: [
      {
        id: "anger",
        name: "Злость",
        duration: 300,
        theses: ["Злость — материал.", "Не оценка."],
        hint: "5 минут. Строки злости — не обязательно в песню.",
        fields: [
          {
            id: "anger_lines",
            label: "Строки злости (можно грубо)",
            placeholder: "…",
            multiline: true,
          },
        ],
      },
      {
        id: "write",
        name: "Песня",
        duration: 720,
        theses: WRITE_REMINDERS,
        hint: "12 минут.",
        fields: [
          { id: "song", label: "Текст песни", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 12,
    title: "Поток 15",
    goal: "Удлинить безопасное сидение с текстом.",
    phases: [
      {
        id: "anchor",
        name: "Якорь",
        duration: 60,
        theses: SAFETY_ANCHOR.slice(0, 3),
        hint: "1 минута.",
        fields: [],
      },
      {
        id: "write",
        name: "Песня",
        duration: 900,
        theses: WRITE_REMINDERS,
        hint: "15 минут.",
        fields: [
          { id: "mood", label: "Настроение", placeholder: "…", multiline: false },
          { id: "song", label: "Текст песни", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 13,
    title: "Поток 20",
    goal: "20 минут — тело учится: долго сидеть без катастрофы.",
    phases: [
      {
        id: "write",
        name: "Песня",
        duration: 1200,
        theses: WRITE_REMINDERS,
        hint: "20 минут. Можно остановить таймер раньше.",
        fields: [
          { id: "song", label: "Текст песни", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
  {
    day: 14,
    title: "Твоя система",
    goal: "Закрепить: интерфейс = безопасное место. Выбрать режим на будущее.",
    phases: [
      {
        id: "review",
        name: "Огляд",
        duration: 420,
        theses: ["Что изменилось", "Что ещё ров", "Какой режим брать"],
        hint: "7 минут. Коротко.",
        fields: [
          {
            id: "changed",
            label: "Что хоть чуть-чуть изменилось за 14 дней?",
            placeholder: "…",
            multiline: true,
          },
          {
            id: "still_moat",
            label: "Что ещё «ров»?",
            placeholder: "…",
            multiline: true,
          },
          {
            id: "future_mode",
            label: "После программы: чаще «Быстрый вход» или полный день?",
            placeholder: "…",
            multiline: false,
          },
        ],
      },
      {
        id: "write",
        name: "Песня",
        duration: 900,
        theses: ["Ты знаешь систему.", "Система на экране.", "Ты — в песне."],
        hint: "15 минут. Финальная сессия программы.",
        fields: [
          { id: "song", label: "Текст песни", placeholder: "…", multiline: true },
        ],
      },
    ],
  },
];
