#!/usr/bin/env python3
"""Rebuild MK5_Regulator_RU.srt from ru_lines.json + EN timings."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EN_PATH = ROOT / "MK5_Regulator_EN.srt"
RU_JSON = ROOT / "ru_lines.json"
OUT_PATH = ROOT / "MK5_Regulator_RU.srt"


def parse_srt(text: str) -> list[tuple[int, str, str]]:
    text = text.replace("\x00", "").lstrip("\ufeff")
    cues: list[tuple[int, str, str]] = []
    for block in re.split(r"\n\s*\n", text.strip()):
        lines = [ln.rstrip("\r") for ln in block.splitlines() if ln.strip()]
        if len(lines) < 2:
            continue
        timing_i = next(i for i, ln in enumerate(lines) if "-->" in ln)
        idx = int(lines[timing_i - 1]) if timing_i > 0 and lines[timing_i - 1].isdigit() else len(cues) + 1
        timing = lines[timing_i]
        body = " ".join(lines[timing_i + 1 :])
        cues.append((idx, timing, body))
    return cues


def main() -> None:
    en_cues = parse_srt(EN_PATH.read_text(encoding="utf-8"))
    ru_lines: list[str] = json.loads(RU_JSON.read_text(encoding="utf-8"))
    if len(en_cues) != len(ru_lines):
        raise SystemExit(f"Cue count mismatch: EN={len(en_cues)} RU={len(ru_lines)}")
    parts = [f"{idx}\n{timing}\n{ru}\n" for (idx, timing, _), ru in zip(en_cues, ru_lines)]
    OUT_PATH.write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({len(ru_lines)} cues)")


if __name__ == "__main__":
    main()
