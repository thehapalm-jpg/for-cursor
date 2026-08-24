"""
Анкета для Насти: выбираем ноутбук без гигабайтов и прочей магии.
Язык — обывательский, тон — как у продавца, который рад помочь.
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
            "(можно несколько — это важно!)."
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
                "Учёба / онлайн-курсы / Zoom",
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
                "kids_games",
                "Детские игры / простые игры «поиграть вечером»",
                tags=("kids_games", "gpu_low"),
            ),
            Option(
                "hard_games",
                "Серьёзные игры как на приставке (тяжёлые новинки)",
                tags=("gaming", "gpu_high", "cooling"),
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
            "Выбери до двух «хотелок», без которых будет обидно. "
            "(Если всё важно — выбери самое-самое.)"
        ),
        mode="multi",
        multi_hint="До двух пунктов, потом «Готово».",
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
        "",
        "Перешли это сообщение тому умному человеку, "
        "который обещал подобрать 3 ноутбука 👇",
        "",
    ]
    by_id = {q.id: q for q in QUESTIONS}
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
    by_id = {q.id: q for q in QUESTIONS}
    for q in QUESTIONS:
        chosen = answers.get(q.id, [])
        if not chosen:
            continue
        labels = [opt.text for opt in q.options if opt.id in chosen]
        lines.append(f"{q.title}: {'; '.join(labels)}")
    return "\n".join(lines)
