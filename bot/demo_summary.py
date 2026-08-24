"""Офлайн-проверка анкеты без Telegram (демо-ответы)."""

from bot.questions import QUESTIONS, format_human_summary, format_share_card


def main() -> None:
    demo = {
        "who": ["me"],
        "experience": ["normal"],
        "carry": ["sometimes"],
        "size": ["medium"],
        "weight": ["normal"],
        "battery": ["halfday"],
        "tasks": ["browse", "movies", "docs", "kids_games"],
        "intensity": ["medium"],
        "kids_share": ["sometimes"],
        "storage_feel": ["normal"],
        "calls": ["sometimes"],
        "typing": ["medium"],
        "screen_place": ["room"],
        "touch_flip": ["no"],
        "ports_stuff": ["usb", "headphone"],
        "lifespan": ["mid"],
        "brand": ["known"],
        "budget": ["mid"],
        "priorities": ["fast", "cheap", "quiet"],
        "os_feel": ["windows"],
        "where_buy": ["any_shop"],
        "deadline": ["month"],
    }
    assert set(demo) == {q.id for q in QUESTIONS}, (
        f"demo keys mismatch: {set(demo) ^ {q.id for q in QUESTIONS}}"
    )
    print(f"Вопросов в анкете: {len(QUESTIONS)}")
    print(format_share_card(demo, "Настя (демо)"))
    print("\n" + "=" * 40 + "\n")
    print(format_human_summary(demo, "Настя (демо)"))


if __name__ == "__main__":
    main()
