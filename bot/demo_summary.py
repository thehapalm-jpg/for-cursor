"""Офлайн-проверка анкеты без Telegram (демо-ответы)."""

from bot.questions import QUESTIONS, format_human_summary, format_share_card


def main() -> None:
    demo = {
        "who": ["me"],
        "carry": ["sometimes"],
        "size": ["medium"],
        "battery": ["halfday"],
        "tasks": ["browse", "movies", "docs", "kids_games"],
        "kids_share": ["sometimes"],
        "budget": ["mid"],
        "priorities": ["fast", "cheap"],
        "os_feel": ["windows"],
        "deadline": ["month"],
    }
    assert set(demo) == {q.id for q in QUESTIONS}
    print(format_share_card(demo, "Настя (демо)"))
    print("\n" + "=" * 40 + "\n")
    print(format_human_summary(demo, "Настя (демо)"))


if __name__ == "__main__":
    main()
