"""
Анкета для Насти: выбираем ноутбук без гигабайтов и прочей магии.
Язык — обывательский, тон — как у продавца, который рад помочь.
Достаточно вопросов, чтобы понять реальную потребность — не «для галочки».
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal


AnswerMode = Literal["single", "multi"]


@dataclass(frozen=True)
class Option:
    id: str
    text: str
    # Внутренние теги для последующей рекомендации (Насте не показываем)
    tags: tuple[str, ...] = ()


@dataclass(frozen=True)
class Question:
    id: str
    title: str
    prompt: str
    mode: AnswerMode
    options: tuple[Option, ...]
    multi_hint: str | None = None
    # Для multi: лимит выбранных вариантов (None = без лимита)
    max_choices: int | None = None


QUESTIONS: tuple[Question, ...] = (
    Question(
        id="who",
        title="Герой дня",
        prompt=(
            "Итак, Настя, добро пожаловать в «Ноутбучную». "
            "Скажи честно: этот зверь в основном для кого?"
        ),
        mode="single",
        options=(
            Option("me", "Для меня лично — я главная", tags=("personal",)),
            Option("family", "Для всей семьи, общий", tags=("shared",)),
            Option("kids", "В основном детям / школьникам", tags=("kids_primary",)),
            Option("work", "Для работы / учёбы, серьёзное лицо", tags=("work",)),
            Option(
                "couple",
                "На двоих с мужем/партнёром — по очереди",
                tags=("shared", "adults"),
            ),
        ),
    ),
    Question(
        id="experience",
        title="Уровень дружбы с компьютером",
        prompt=(
            "Как ты обычно себя чувствуешь рядом с компьютером? "
            "(Чтобы не подсунуть «зверя», с которым придётся воевать.)"
        ),
        mode="single",
        options=(
            Option(
                "beginner",
                "Новичок: лишь бы кнопки были понятные",
                tags=("beginner", "simple_ui", "need_explain"),
            ),
            Option(
                "normal",
                "Обычный пользователь: сайт, Word, Zoom — ок",
                tags=("user_normal",),
            ),
            Option(
                "confident",
                "Уверенно: сама разберусь, если что",
                tags=("user_confident",),
            ),
            Option(
                "helper",
                "Рядом есть «свой айтишник» (Сергей и компания)",
                tags=("has_helper",),
            ),
        ),
    ),
    Question(
        id="carry",
        title="Путешествия ноутбука",
        prompt=(
            "Как часто ноутбук будет покидать дом? "
            "(От этого зависит, нужен ли он лёгкий или можно взять «кирпич с экраном».)"
        ),
        mode="single",
        options=(
            Option(
                "daily",
                "Каждый день в сумке — как паспорт",
                tags=("portable", "light", "compact"),
            ),
            Option(
                "sometimes",
                "Иногда в гости / кофейню / к родителям",
                tags=("portable_mid",),
            ),
            Option(
                "home",
                "Живёт дома. Выезжает только на дачу раз в год",
                tags=("desktop_like", "big_ok"),
            ),
            Option(
                "travel",
                "Частые поездки / перелёты / работа из разных мест",
                tags=("portable", "light", "battery_great", "compact"),
            ),
            Option(
                "unsure",
                "Пока не знаю, пусть будет универсальный",
                tags=("portable_mid", "balanced"),
            ),
        ),
    ),
    Question(
        id="size",
        title="Размер как у пиццы",
        prompt=(
            "Экран — это как пицца. Какую заказываем?\n"
            "(Меньше — легче таскать. Больше — приятнее фильмы и таблицы.)"
        ),
        mode="single",
        options=(
            Option(
                "small",
                "Маленькая (удобно в рюкзак, как планшет с клавиатурой)",
                tags=("size_13_14", "compact"),
            ),
            Option(
                "medium",
                "Средняя (золотая середина — и в сумку, и на стол)",
                tags=("size_15_16", "balanced"),
            ),
            Option(
                "large",
                "Большая (как мини-телевизор на столе)",
                tags=("size_16_17", "big_ok"),
            ),
            Option(
                "any",
                "Мне всё равно, главное чтобы нормально работал",
                tags=("size_15_16", "balanced"),
            ),
        ),
    ),
    Question(
        id="weight",
        title="Вес в рюкзаке",
        prompt=(
            "Представь, что несёшь его весь день. "
            "Какой вес готов простить ноутбуку?"
        ),
        mode="single",
        options=(
            Option(
                "feather",
                "Как лёгкий журнал — почти не чувствуется",
                tags=("light", "ultrabook"),
            ),
            Option(
                "normal",
                "Обычный ноутбук — не пушинка, но терпимо",
                tags=("weight_ok",),
            ),
            Option(
                "heavy_ok",
                "Можно и потяжелее, если зато мощный / большой экран",
                tags=("heavy_ok", "perf"),
            ),
            Option(
                "home_only",
                "Почти не ношу — вес не важен",
                tags=("desktop_like", "heavy_ok"),
            ),
        ),
    ),
    Question(
        id="battery",
        title="Жизнь без розетки",
        prompt=(
            "Представь: розетка далеко, зарядка в другой сумке. "
            "Сколько примерно нужно продержаться на одном заряде?"
        ),
        mode="single",
        options=(
            Option(
                "short",
                "Часа 2–3 — потом всё равно к розетке",
                tags=("battery_ok",),
            ),
            Option(
                "halfday",
                "Полдня (утро → обед без паники)",
                tags=("battery_good",),
            ),
            Option(
                "fullday",
                "Весь день, как телефон у нормального человека",
                tags=("battery_great", "portable"),
            ),
            Option(
                "plugged",
                "Почти всегда у розетки — батарея не критична",
                tags=("battery_low_ok", "desktop_like"),
            ),
        ),
    ),
    Question(
        id="tasks",
        title="Чем будем заниматься",
        prompt=(
            "Выбери всё, что реально будете делать "
            "(можно несколько — это самый важный вопрос!)."
        ),
        mode="multi",
        multi_hint="Жми варианты, в конце — «Готово».",
        options=(
            Option(
                "browse",
                "Интернет, почта, соцсети, YouTube",
                tags=("light_use", "office"),
            ),
            Option(
                "movies",
                "Фильмы и сериалы на диване / в кровати",
                tags=("media", "screen_nice"),
            ),
            Option(
                "docs",
                "Документы, таблицы, презентации",
                tags=("office", "keyboard"),
            ),
            Option(
                "study",
                "Учёба / онлайн-курсы / Zoom и созвоны",
                tags=("office", "camera", "battery_good"),
            ),
            Option(
                "photo",
                "Фото: обрезать, подправить, красиво сохранить",
                tags=("creative_mid", "ram_mid"),
            ),
            Option(
                "video",
                "Видео: монтаж роликов, рилсы, семейные фильмы",
                tags=("creative_high", "gpu_mid", "ram_high"),
            ),
            Option(
                "draw",
                "Рисование / дизайн «для себя» (не студия)",
                tags=("creative_mid", "screen_nice"),
            ),
            Option(
                "kids_games",
                "Детские игры / простые игры «поиграть вечером»",
                tags=("kids_games", "gpu_low"),
            ),
            Option(
                "hard_games",
                "Серьёзные игры как на приставке (тяжёлые новинки)",
                tags=("gaming", "gpu_high", "cooling"),
            ),
            Option(
                "code",
                "Программирование / «что-то техническое»",
                tags=("dev", "ram_mid", "keyboard"),
            ),
        ),
    ),
    Question(
        id="intensity",
        title="Сколько всего открыто сразу",
        prompt=(
            "Честно: как обычно выглядит экран в конце дня? "
            "(От этого зависит, нужен ли «с запасом» или хватит скромного.)"
        ),
        mode="single",
        options=(
            Option(
                "few",
                "Пара вкладок и одно окошко — минимализм",
                tags=("light_use",),
            ),
            Option(
                "medium",
                "Десять вкладок + почта + мессенджер — нормально",
                tags=("ram_mid",),
            ),
            Option(
                "chaos",
                "Хаос: куча вкладок, Zoom, таблица и ещё «где мой файл»",
                tags=("ram_high", "perf"),
            ),
            Option(
                "kids_chaos",
                "Дети открывают всё подряд, пока мама не видит",
                tags=("ram_mid", "durable", "kids_heavy"),
            ),
        ),
    ),
    Question(
        id="kids_share",
        title="Детский фактор",
        prompt="Будут ли дети активно пользоваться этим ноутбуком?",
        mode="single",
        options=(
            Option("no", "Нет, дети мимо", tags=("adults_only",)),
            Option(
                "sometimes",
                "Иногда мультик / домашка",
                tags=("kids_light", "durable_nice"),
            ),
            Option(
                "often",
                "Да, часто — игры, уроки, «мама можно ещё пять минут»",
                tags=("kids_heavy", "durable", "kids_games"),
            ),
            Option(
                "school",
                "Школа: дневник, презентации, онлайн-уроки",
                tags=("kids_school", "office", "camera", "durable_nice"),
            ),
        ),
    ),
    Question(
        id="storage_feel",
        title="Куда складываем жизнь",
        prompt=(
            "Фото, фильмы, учебники, скачанное «на всякий случай» — "
            "где всё это будет жить?"
        ),
        mode="single",
        options=(
            Option(
                "cloud",
                "В основном в облаке / на телефоне — на ноуте мало",
                tags=("storage_small",),
            ),
            Option(
                "normal",
                "Обычный набор: документы + немного фото/видео",
                tags=("storage_mid",),
            ),
            Option(
                "lots",
                "Много своего: семейный архив, курсы, фильмы офлайн",
                tags=("storage_large",),
            ),
            Option(
                "huge",
                "Гора всего, и ещё будет расти",
                tags=("storage_large", "expandable_nice"),
            ),
        ),
    ),
    Question(
        id="calls",
        title="Лицо в кадре",
        prompt="Как часто будут созвоны (работа, учёба, родственники)?",
        mode="single",
        options=(
            Option(
                "rare",
                "Редко / почти никогда",
                tags=("camera_low",),
            ),
            Option(
                "sometimes",
                "Иногда — раз в неделю нормально",
                tags=("camera",),
            ),
            Option(
                "often",
                "Часто — хочется нормальную камеру и микрофон",
                tags=("camera", "mic_good", "battery_good"),
            ),
            Option(
                "critical",
                "Это важная часть жизни — созвоны почти каждый день",
                tags=("camera", "mic_good", "quiet", "battery_great"),
            ),
        ),
    ),
    Question(
        id="typing",
        title="Клавиатура и пальцы",
        prompt="Будешь ли много печатать (работа, учёба, длинные тексты)?",
        mode="single",
        options=(
            Option(
                "little",
                "Мало — в основном тыкаю и смотрю",
                tags=("keyboard_low",),
            ),
            Option(
                "medium",
                "Средне — письма, чаты, иногда документы",
                tags=("keyboard",),
            ),
            Option(
                "lots",
                "Много — удобная клавиатура очень важна",
                tags=("keyboard", "keyboard_good"),
            ),
            Option(
                "numpad",
                "Ещё и циферки справа хочется (как на большом компе)",
                tags=("keyboard", "numpad", "size_15_16"),
            ),
        ),
    ),
    Question(
        id="screen_place",
        title="Где смотрим на экран",
        prompt="В каких условиях чаще всего будешь смотреть на экран?",
        mode="single",
        options=(
            Option(
                "room",
                "Обычная комната, свет нормальный",
                tags=("screen_ok",),
            ),
            Option(
                "bright",
                "У окна / на балконе / днём ярко",
                tags=("screen_bright", "screen_nice"),
            ),
            Option(
                "evening",
                "Чаще вечером, в полумраке, фильмы",
                tags=("screen_nice", "media"),
            ),
            Option(
                "cafe",
                "Кафе, поезд, разные места — свет разный",
                tags=("screen_bright", "portable", "battery_good"),
            ),
        ),
    ),
    Question(
        id="touch_flip",
        title="Сенсор и «перевёртыш»",
        prompt=(
            "Нужен ли экран, по которому можно водить пальцем, "
            "или ноут-«трансформер» (как большой планшет)?"
        ),
        mode="single",
        options=(
            Option(
                "no",
                "Нет, обычный ноутбук с мышкой/тачпадом",
                tags=("classic_clamshell",),
            ),
            Option(
                "touch_nice",
                "Сенсор был бы приятным бонусом",
                tags=("touch_nice",),
            ),
            Option(
                "touch_need",
                "Да, хочу тыкать пальцем / рисовать",
                tags=("touch", "creative_mid"),
            ),
            Option(
                "flip",
                "Хочу переворачивать экран как планшет (мультики детям)",
                tags=("convertible", "touch", "kids_light"),
            ),
        ),
    ),
    Question(
        id="ports_stuff",
        title="Провода и флешки",
        prompt=(
            "Что из этого реально понадобится часто? "
            "(Можно несколько.)"
        ),
        mode="multi",
        multi_hint="Выбери всё нужное, потом «Готово».",
        options=(
            Option(
                "usb",
                "Флешки, мышка, внешний диск — втыкать легко",
                tags=("ports_usb",),
            ),
            Option(
                "hdmi",
                "Подключать к телевизору / проектору",
                tags=("ports_hdmi", "media"),
            ),
            Option(
                "headphone",
                "Обычный разъём для наушников",
                tags=("ports_audio",),
            ),
            Option(
                "one_cable",
                "Одна зарядка на телефон и ноут — мечта",
                tags=("usbc_charge", "modern"),
            ),
            Option(
                "minimal",
                "Почти ничего — Wi‑Fi и всё",
                tags=("ports_minimal",),
            ),
        ),
    ),
    Question(
        id="lifespan",
        title="На сколько лет берём",
        prompt="На какой срок жизни ноутбука рассчитываете?",
        mode="single",
        options=(
            Option(
                "short",
                "На 2–3 года — потом обновим",
                tags=("lifespan_short", "value"),
            ),
            Option(
                "mid",
                "На 4–5 лет — нормальный цикл",
                tags=("lifespan_mid", "ram_mid"),
            ),
            Option(
                "long",
                "Как можно дольше — берём с запасом",
                tags=("lifespan_long", "perf", "ram_high", "budget_upper"),
            ),
            Option(
                "unsure",
                "Не думала об этом — посоветуйте",
                tags=("lifespan_mid", "need_explain"),
            ),
        ),
    ),
    Question(
        id="brand",
        title="Имена на крышке",
        prompt="Есть ли предпочтения по «марке»? (Без фанатизма.)",
        mode="single",
        options=(
            Option(
                "any",
                "Без разницы — лишь бы хороший отзыв и сервис",
                tags=("brand_any",),
            ),
            Option(
                "apple",
                "Хочется яблоко (если впишется в бюджет)",
                tags=("macos", "brand_apple"),
            ),
            Option(
                "known",
                "Известные имена: Lenovo, ASUS, Acer, HP, Huawei…",
                tags=("brand_pc_known", "windows"),
            ),
            Option(
                "avoid_no_name",
                "Главное — не «ноунейм с Авито без гарантии»",
                tags=("brand_warranty", "retail"),
            ),
        ),
    ),
    Question(
        id="budget",
        title="Кошелёк говорит",
        prompt=(
            "Сергей сказал спросить у меня — я спрошу у кошелька. "
            "Какой потолок комфортный? (примерно, в рублях)"
        ),
        mode="single",
        options=(
            Option(
                "budget",
                "До ~50 тысяч — аккуратно и по делу",
                tags=("budget_low",),
            ),
            Option(
                "mid",
                "50–80 тысяч — нормальный рабочий вариант",
                tags=("budget_mid",),
            ),
            Option(
                "upper",
                "80–120 тысяч — хочется взять с запасом",
                tags=("budget_upper",),
            ),
            Option(
                "premium",
                "От 120 тысяч — если очень понравится, можно",
                tags=("budget_high",),
            ),
            Option(
                "flexible",
                "Пока не решили — покажи варианты разных цен",
                tags=("budget_flexible",),
            ),
        ),
    ),
    Question(
        id="priorities",
        title="Что важнее всего",
        prompt=(
            "Выбери до трёх «хотелок», без которых будет обидно. "
            "(Если всё важно — оставь самое-самое.)"
        ),
        mode="multi",
        multi_hint="До трёх пунктов, потом «Готово».",
        max_choices=3,
        options=(
            Option(
                "light",
                "Лёгкий, чтобы не ныла спина",
                tags=("light", "portable"),
            ),
            Option(
                "quiet",
                "Тихий — без рёва вентилятора как у пылесоса",
                tags=("quiet",),
            ),
            Option(
                "screen",
                "Красивая картинка (яркий экран, приятные цвета)",
                tags=("screen_nice",),
            ),
            Option(
                "fast",
                "Чтобы не тормозил и не бесил",
                tags=("perf", "ram_mid"),
            ),
            Option(
                "cheap",
                "Не переплачивать — цена важнее «вау»",
                tags=("value",),
            ),
            Option(
                "looks",
                "Чтобы выглядел стильно (цвет, тонкий корпус)",
                tags=("design",),
            ),
            Option(
                "durable",
                "Чтобы переживал детей / поездки / жизнь",
                tags=("durable",),
            ),
            Option(
                "service",
                "Чтобы легко сдать в гарантию в большом магазине",
                tags=("retail", "brand_warranty"),
            ),
        ),
    ),
    Question(
        id="os_feel",
        title="Привычки",
        prompt="С чем уже дружите / что привычнее?",
        mode="single",
        options=(
            Option(
                "windows",
                "Обычный компьютерный мир (как у большинства)",
                tags=("windows",),
            ),
            Option(
                "apple",
                "Мир яблока — если уже есть iPhone/iPad, хочется «своё»",
                tags=("macos",),
            ),
            Option(
                "any",
                "Без разницы, лишь бы удобно и просто",
                tags=("windows", "any_os"),
            ),
            Option(
                "unsure",
                "Не знаю, объясните потом на пальцах",
                tags=("windows", "need_explain"),
            ),
        ),
    ),
    Question(
        id="where_buy",
        title="Где удобнее забирать",
        prompt="Как удобнее покупать? (Чтобы я искал там, где вам ок.)",
        mode="single",
        options=(
            Option(
                "dns_mvideo",
                "Крупные сети: DNS, М.Видео, Эльдорадо — забрать самому",
                tags=("retail", "dns", "mvideo"),
            ),
            Option(
                "ozon_wb",
                "Озон / Wildberries — доставка к двери",
                tags=("ozon", "wb", "delivery"),
            ),
            Option(
                "any_shop",
                "Везде ок — главное цена и наличие",
                tags=("retail", "ozon", "flexible_shop"),
            ),
            Option(
                "see_first",
                "Хочется сначала потрогать в магазине",
                tags=("retail", "touch_in_store"),
            ),
        ),
    ),
    Question(
        id="deadline",
        title="Срочность",
        prompt="Когда ноутбук нужен «уже вчера»?",
        mode="single",
        options=(
            Option(
                "asap",
                "На этой неделе — срочно",
                tags=("buy_soon", "stock_matters"),
            ),
            Option(
                "month",
                "В ближайший месяц, можно спокойно выбрать",
                tags=("buy_month",),
            ),
            Option(
                "research",
                "Пока присматриваемся, без спешки",
                tags=("buy_later",),
            ),
        ),
    ),
)


@dataclass
class QuizState:
    index: int = 0
    answers: dict[str, list[str]] = field(default_factory=dict)
    multi_buffer: set[str] = field(default_factory=set)


def collect_tags(answers: dict[str, list[str]]) -> set[str]:
    tags: set[str] = set()
    by_id = {q.id: q for q in QUESTIONS}
    for qid, option_ids in answers.items():
        question = by_id.get(qid)
        if not question:
            continue
        for opt in question.options:
            if opt.id in option_ids:
                tags.update(opt.tags)
    return tags


def format_human_summary(answers: dict[str, list[str]], user_name: str) -> str:
    lines = [
        "🧾 Анкета заполнена!",
        f"Кто отвечал: {user_name}",
        f"Вопросов отвечено: {sum(1 for q in QUESTIONS if answers.get(q.id))}"
        f" из {len(QUESTIONS)}",
        "",
        "Перешли это сообщение тому умному человеку, "
        "который обещал подобрать 3 ноутбука 👇",
        "",
    ]
    for q in QUESTIONS:
        chosen = answers.get(q.id, [])
        if not chosen:
            continue
        labels = []
        for opt in q.options:
            if opt.id in chosen:
                labels.append(opt.text)
        joined = "; ".join(labels)
        lines.append(f"• {q.title}: {joined}")

    lines.extend(
        [
            "",
            "— — —",
            "Служебные метки (для подбора, можно не читать):",
            ", ".join(sorted(collect_tags(answers))) or "нет",
        ]
    )
    return "\n".join(lines)


def format_share_card(answers: dict[str, list[str]], user_name: str) -> str:
    """Короткая карточка без служебных тегов — удобно переслать."""
    lines = [
        f"📋 Ответы Насти (или {user_name}) для подбора ноутбука:",
        "",
    ]
    for q in QUESTIONS:
        chosen = answers.get(q.id, [])
        if not chosen:
            continue
        labels = [opt.text for opt in q.options if opt.id in chosen]
        lines.append(f"{q.title}: {'; '.join(labels)}")
    return "\n".join(lines)
