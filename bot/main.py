"""
Telegram-бот: игровой опросник «Подберём ноутбук Насте».

Запуск:
  1) Создай бота у @BotFather, получи токен
  2) Скопируй .env.example → .env и вставь BOT_TOKEN=...
  3) python -m bot.main
"""

from __future__ import annotations

import asyncio
import logging
import os
from pathlib import Path

from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)
from dotenv import load_dotenv

from bot.questions import (
    QUESTIONS,
    QuizState,
    format_human_summary,
    format_share_card,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nastya-laptop-bot")

# user_id -> состояние опроса
sessions: dict[int, QuizState] = {}

DONE_CB = "multi:done"
MAX_PRIORITIES = 2


def _load_env() -> None:
    root = Path(__file__).resolve().parent.parent
    load_dotenv(root / ".env")


def keyboard_for(state: QuizState) -> InlineKeyboardMarkup:
    q = QUESTIONS[state.index]
    rows: list[list[InlineKeyboardButton]] = []

    for opt in q.options:
        if q.mode == "multi":
            mark = "✅ " if opt.id in state.multi_buffer else ""
            # Для «приоритетов» ограничиваем выбор двумя
            label = f"{mark}{opt.text}"
            rows.append(
                [
                    InlineKeyboardButton(
                        text=label[:64],
                        callback_data=f"ans:{q.id}:{opt.id}",
                    )
                ]
            )
        else:
            rows.append(
                [
                    InlineKeyboardButton(
                        text=opt.text[:64],
                        callback_data=f"ans:{q.id}:{opt.id}",
                    )
                ]
            )

    if q.mode == "multi":
        rows.append(
            [
                InlineKeyboardButton(
                    text="✔️ Готово — дальше",
                    callback_data=DONE_CB,
                )
            ]
        )

    return InlineKeyboardMarkup(inline_keyboard=rows)


def question_text(state: QuizState) -> str:
    q = QUESTIONS[state.index]
    n = state.index + 1
    total = len(QUESTIONS)
    header = f"🛒 Вопрос {n} из {total} — «{q.title}»\n\n"
    body = q.prompt
    if q.mode == "multi" and q.multi_hint:
        body += f"\n\n💬 {q.multi_hint}"
    if q.id == "priorities":
        body += f"\n\nСейчас выбрано: {len(state.multi_buffer)}/{MAX_PRIORITIES}"
    return header + body


async def send_question(message: Message, state: QuizState) -> None:
    await message.answer(question_text(state), reply_markup=keyboard_for(state))


async def finish_quiz(message: Message, user_id: int, full_name: str) -> None:
    state = sessions.get(user_id)
    if not state:
        await message.answer("Опрос не найден. Нажми /start")
        return

    summary = format_human_summary(state.answers, full_name)
    card = format_share_card(state.answers, full_name)

    await message.answer(
        "🎉 Готово! Я как продавец всё записал.\n\n"
        "Ниже — карточка для пересылки тому, кто подберёт ноутбуки "
        "(минимум 3 варианта с DNS / М.Видео / Wildberries / Ozon)."
    )
    await message.answer(card)
    await message.answer(summary)
    await message.answer(
        "Чтобы пройти ещё раз (вдруг передумала) — /start\n"
        "Текстовая копия вопросов без бота — в файле docs/ANKETA.md"
    )
    sessions.pop(user_id, None)


def register_handlers(dp: Dispatcher) -> None:
    @dp.message(CommandStart())
    async def cmd_start(message: Message) -> None:
        uid = message.from_user.id if message.from_user else 0
        sessions[uid] = QuizState()
        await message.answer(
            "👋 Привет! Я виртуальный продавец из «Ноутбучной».\n\n"
            "Настя (или кто ты там), не надо знать про гигабайты, "
            "терабайты и прочие страшные слова.\n"
            "Ответь на пару простых вопросов — как в игре — "
            "и мы поймём, какой ноутбук тебе реально нужен.\n\n"
            "Поехали? 🚀"
        )
        await send_question(message, sessions[uid])

    @dp.message(Command("help"))
    async def cmd_help(message: Message) -> None:
        await message.answer(
            "Команды:\n"
            "/start — начать / пройти опрос заново\n"
            "/help — эта подсказка\n\n"
            "Это не магазин и не реклама — просто умный опросник, "
            "чтобы друг мог подобрать 3 реальных варианта в РФ."
        )

    @dp.callback_query(F.data == DONE_CB)
    async def on_multi_done(callback: CallbackQuery) -> None:
        if not callback.from_user or not callback.message:
            await callback.answer()
            return
        uid = callback.from_user.id
        state = sessions.get(uid)
        if not state:
            await callback.answer("Начни с /start", show_alert=True)
            return

        q = QUESTIONS[state.index]
        if q.mode != "multi":
            await callback.answer()
            return

        if not state.multi_buffer:
            await callback.answer("Выбери хотя бы один вариант 🙂", show_alert=True)
            return

        if q.id == "priorities" and len(state.multi_buffer) > MAX_PRIORITIES:
            await callback.answer(
                f"Оставь не больше {MAX_PRIORITIES} приоритетов",
                show_alert=True,
            )
            return

        state.answers[q.id] = sorted(state.multi_buffer)
        state.multi_buffer.clear()
        state.index += 1
        await callback.answer()

        if state.index >= len(QUESTIONS):
            await finish_quiz(
                callback.message,
                uid,
                callback.from_user.full_name or "Настя",
            )
            return

        await callback.message.edit_reply_markup(reply_markup=None)
        await send_question(callback.message, state)

    @dp.callback_query(F.data.startswith("ans:"))
    async def on_answer(callback: CallbackQuery) -> None:
        if not callback.from_user or not callback.message or not callback.data:
            await callback.answer()
            return

        uid = callback.from_user.id
        state = sessions.get(uid)
        if not state:
            await callback.answer("Начни с /start", show_alert=True)
            return

        parts = callback.data.split(":", 2)
        if len(parts) != 3:
            await callback.answer()
            return
        _, qid, opt_id = parts
        q = QUESTIONS[state.index]
        if q.id != qid:
            await callback.answer("Этот вопрос уже пройден — жми /start", show_alert=True)
            return

        valid_ids = {o.id for o in q.options}
        if opt_id not in valid_ids:
            await callback.answer()
            return

        if q.mode == "multi":
            if opt_id in state.multi_buffer:
                state.multi_buffer.discard(opt_id)
            else:
                if q.id == "priorities" and len(state.multi_buffer) >= MAX_PRIORITIES:
                    await callback.answer(
                        f"Максимум {MAX_PRIORITIES}. Сними лишнее или жми «Готово».",
                        show_alert=True,
                    )
                    return
                state.multi_buffer.add(opt_id)
            await callback.answer()
            await callback.message.edit_text(
                question_text(state),
                reply_markup=keyboard_for(state),
            )
            return

        # single choice
        state.answers[q.id] = [opt_id]
        state.index += 1
        await callback.answer()
        try:
            await callback.message.edit_reply_markup(reply_markup=None)
        except Exception:
            pass

        if state.index >= len(QUESTIONS):
            await finish_quiz(
                callback.message,
                uid,
                callback.from_user.full_name or "Настя",
            )
            return

        await send_question(callback.message, state)


async def main() -> None:
    _load_env()
    token = os.getenv("BOT_TOKEN", "").strip()
    if not token or token == "PASTE_YOUR_TOKEN_HERE":
        raise SystemExit(
            "Нет BOT_TOKEN. Создай бота у @BotFather, скопируй .env.example → .env "
            "и вставь токен."
        )

    bot = Bot(token=token)
    dp = Dispatcher()
    register_handlers(dp)
    logger.info("Бот запущен. Ждём Настю…")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
