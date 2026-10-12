#!/usr/bin/env python3
"""Build a Russian VO SRT from <dir>/ru_lines.json and the English SRT timings.

Usage: python3 translations/build_ru_srt.py translations/<video-dir> <Name>

Reads  <dir>/<Name>_EN.srt and <dir>/ru_lines.json (one string per EN cue).
Writes <dir>/<Name>_RU.srt (UTF-8), <dir>/<Name>_RU_utf16.srt,
       <dir>/EN_RU_side_by_side.txt and prints stretches where RU is much longer than EN.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

WINDOW = 5
MAX_RU_EN_RATIO = 1.35


def parse_srt(text: str) -> list[tuple[int, str, str]]:
    text = text.replace("\x00", "").replace("\r", "").lstrip("\ufeff")
    cues: list[tuple[int, str, str]] = []
    for block in re.split(r"\n\s*\n", text.strip()):
        lines = [ln for ln in block.splitlines() if ln.strip()]
        if len(lines) < 2:
            continue
        timing_i = next(i for i, ln in enumerate(lines) if "-->" in ln)
        idx = int(lines[timing_i - 1]) if timing_i > 0 and lines[timing_i - 1].isdigit() else len(cues) + 1
        cues.append((idx, lines[timing_i], " ".join(lines[timing_i + 1 :])))
    return cues


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    root, name = Path(sys.argv[1]), sys.argv[2]
    en_cues = parse_srt((root / f"{name}_EN.srt").read_text(encoding="utf-8-sig"))
    ru_lines: list[str] = json.loads((root / "ru_lines.json").read_text(encoding="utf-8"))
    if len(en_cues) != len(ru_lines):
        raise SystemExit(f"Cue count mismatch: EN={len(en_cues)} RU={len(ru_lines)}")

    srt = "\n".join(f"{idx}\n{timing}\n{ru}\n" for (idx, timing, _), ru in zip(en_cues, ru_lines)) + "\n"
    (root / f"{name}_RU.srt").write_text(srt, encoding="utf-8")
    (root / f"{name}_RU_utf16.srt").write_text(srt, encoding="utf-16")

    side = [f"{idx}  {timing}\nEN: {en}\nRU: {ru}\n" for (idx, timing, en), ru in zip(en_cues, ru_lines)]
    (root / "EN_RU_side_by_side.txt").write_text("\n".join(side), encoding="utf-8")

    en_total = sum(len(en) for _, _, en in en_cues)
    ru_total = sum(len(ru) for ru in ru_lines)
    print(f"Wrote {name}_RU.srt ({len(ru_lines)} cues), RU/EN length {ru_total / en_total:.2f}")

    # Fast speakers routinely exceed any absolute chars/sec limit, so compare against EN.
    long_windows = []
    for i in range(len(ru_lines) - WINDOW + 1):
        en_len = sum(len(en) for _, _, en in en_cues[i : i + WINDOW])
        ru_len = sum(len(ru) for ru in ru_lines[i : i + WINDOW])
        if ru_len > en_len * MAX_RU_EN_RATIO:
            long_windows.append(f"  cues {en_cues[i][0]}-{en_cues[i + WINDOW - 1][0]}: RU/EN {ru_len / en_len:.2f}")
    if long_windows:
        print(f"Windows of {WINDOW} cues where RU is >{MAX_RU_EN_RATIO:.2f}x EN (shorten for VO):")
        print("\n".join(long_windows))


if __name__ == "__main__":
    main()
