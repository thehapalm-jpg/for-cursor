/**
 * Сборка песен: четверостишия → куплеты → одна или несколько песен.
 */

const SONG_FIELD_RE = /_(touch_song|write_song|one_line)$/;

export function defaultSongStanzas() {
  return [];
}

export function migrateSongStanzas(state) {
  if (!state.songStanzas) state.songStanzas = [];
  return state;
}

export function groupStanzasIntoSongs(stanzas) {
  const songs = [];
  let current = null;

  stanzas.forEach((stanza, index) => {
    const isNew = index === 0 || stanza.startsNewSong;
    if (isNew || !current) {
      current = { id: `song-${songs.length + 1}`, stanzas: [] };
      songs.push(current);
    }
    current.stanzas.push(stanza);
  });

  return songs;
}

export function formatCompiledSongs(stanzas) {
  const songs = groupStanzasIntoSongs(stanzas);
  if (!songs.length) return "";

  return songs
    .map((song, i) => {
      const body = song.stanzas.map((s) => s.text.trim()).filter(Boolean).join("\n\n");
      return `── Песня ${i + 1} ──\n${body}`;
    })
    .join("\n\n");
}

function splitIntoStanzas(text) {
  if (!text?.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

/** Собрать тексты из полей программы и быстрых сессий (по порядку). */
export function collectSongTextsFromState(state) {
  const chunks = [];

  const fieldKeys = Object.keys(state.fields || {})
    .filter((k) => SONG_FIELD_RE.test(k) && state.fields[k]?.trim())
    .sort((a, b) => {
      const dayA = parseInt(a.match(/^d(\d+)/)?.[1] || "0", 10);
      const dayB = parseInt(b.match(/^d(\d+)/)?.[1] || "0", 10);
      return dayA - dayB;
    });

  const day1Keys = fieldKeys.filter((k) => /^d1_/.test(k));
  const laterKeys = fieldKeys.filter((k) => !/^d1_/.test(k));

  day1Keys.forEach((key) => chunks.push({ source: key, text: state.fields[key] }));

  [...(state.quickSessions || [])]
    .sort((a, b) => new Date(a.savedAt || 0) - new Date(b.savedAt || 0))
    .forEach((session, i) => {
      if (session.song?.trim()) {
        chunks.push({ source: `quick-${session.savedAt || i}`, text: session.song });
      }
    });

  laterKeys.forEach((key) => chunks.push({ source: key, text: state.fields[key] }));

  return chunks;
}

export function importStanzasFromState(state, mode = "replace") {
  const chunks = collectSongTextsFromState(state);
  const imported = [];

  chunks.forEach((chunk, chunkIndex) => {
    const parts = splitIntoStanzas(chunk.text);
    parts.forEach((text, partIndex) => {
      imported.push({
        id: `imp-${Date.now()}-${chunkIndex}-${partIndex}`,
        text,
        startsNewSong: imported.length === 0,
        source: chunk.source,
      });
    });
  });

  if (mode === "append") {
    if (imported.length && state.songStanzas.length) {
      imported[0].startsNewSong = true;
    }
    return [...state.songStanzas, ...imported];
  }

  return imported;
}

export function addEmptyStanza(stanzas) {
  const isFirst = stanzas.length === 0;
  return [
    ...stanzas,
    {
      id: `st-${Date.now()}`,
      text: "",
      startsNewSong: isFirst,
      source: "manual",
    },
  ];
}

export function updateStanza(stanzas, id, patch) {
  return stanzas.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

export function removeStanza(stanzas, id) {
  const next = stanzas.filter((s) => s.id !== id);
  if (next.length && !next.some((s) => s.startsNewSong)) {
    next[0].startsNewSong = true;
  }
  return next;
}

export function updateSongPreview(container, stanzas) {
  const pre = container?.querySelector("#song-preview-text");
  if (!pre) return;
  const preview = formatCompiledSongs(stanzas);
  pre.textContent = preview || "Пока пусто — добавь четверостишие или подтяни из полей.";
}

export function renderSongPanel(container, state, { onChange }) {
  if (!container) return;

  const stanzas = state.songStanzas || [];
  const preview = formatCompiledSongs(stanzas);

  container.innerHTML = `
    <div class="song-panel-inner">
      <header class="song-panel-head">
        <h2>Сборка песни</h2>
        <p class="song-panel-lead">Все куплеты в одном месте. Отметь, где начинается новая песня.</p>
      </header>

      <div class="song-preview-wrap">
        <label class="song-preview-label">Сводка</label>
        <pre class="song-preview" id="song-preview-text">${preview || "Пока пусто — добавь четверостишие или подтяни из полей."}</pre>
        <button type="button" class="btn-copy-compiled" id="btn-copy-compiled">Копировать сводку</button>
      </div>

      <div class="song-panel-actions">
        <button type="button" class="btn-song-action" id="btn-add-stanza">+ Четверостишие</button>
        <button type="button" class="btn-song-action secondary" id="btn-import-fields">Подтянуть из полей</button>
      </div>

      <div class="song-stanza-list" id="song-stanza-list"></div>
    </div>
  `;

  const listEl = container.querySelector("#song-stanza-list");

  function emit(nextStanzas, options = { fullRender: true }) {
    onChange(nextStanzas, options);
  }

  function renderList() {
    listEl.innerHTML = "";
    if (!stanzas.length) {
      listEl.innerHTML = `<p class="song-empty">Нет блоков. Напиши в программе или нажми «+ Четверостишие».</p>`;
      return;
    }

    stanzas.forEach((stanza, index) => {
      const card = document.createElement("div");
      card.className = "song-stanza-card";
      if (stanza.startsNewSong && index > 0) card.classList.add("new-song-start");

      const songNum = groupStanzasIntoSongs(stanzas).findIndex((song) =>
        song.stanzas.some((s) => s.id === stanza.id)
      );

      card.innerHTML = `
        <div class="song-stanza-meta">
          <span class="song-stanza-num">#${index + 1}</span>
          <span class="song-stanza-song-tag">Песня ${songNum + 1}</span>
        </div>
        <div class="song-stanza-scope">
          <label class="scope-option">
            <input type="radio" name="scope-${stanza.id}" value="continue" ${!stanza.startsNewSong || index === 0 ? "checked" : ""} ${index === 0 ? "disabled" : ""} />
            <span>Та же песня</span>
          </label>
          <label class="scope-option">
            <input type="radio" name="scope-${stanza.id}" value="new" ${stanza.startsNewSong && index > 0 ? "checked" : ""} ${index === 0 ? "disabled" : ""} />
            <span>Новая песня</span>
          </label>
        </div>
        <textarea class="song-stanza-text" rows="5" placeholder="Строки четверостишия…">${stanza.text}</textarea>
        <button type="button" class="btn-delete-stanza">Удалить блок</button>
      `;

      if (index === 0) {
        const scopeNote = document.createElement("p");
        scopeNote.className = "song-scope-note";
        scopeNote.textContent = "Первый блок всегда начало песни 1.";
        card.querySelector(".song-stanza-scope").after(scopeNote);
      }

      const ta = card.querySelector(".song-stanza-text");
      ta.addEventListener("input", () => {
        const next = updateStanza(stanzas, stanza.id, { text: ta.value });
        emit(next, { fullRender: false });
        updateSongPreview(container, next);
      });

      card.querySelectorAll(`input[name="scope-${stanza.id}"]`).forEach((input) => {
        input.addEventListener("change", () => {
          if (index === 0) return;
          emit(
            updateStanza(stanzas, stanza.id, {
              startsNewSong: input.value === "new",
            })
          );
        });
      });

      card.querySelector(".btn-delete-stanza").addEventListener("click", () => {
        if (!confirm("Удалить этот блок?")) return;
        emit(removeStanza(stanzas, stanza.id));
      });

      listEl.appendChild(card);
    });
  }

  renderList();

  container.querySelector("#btn-add-stanza").addEventListener("click", () => {
    emit(addEmptyStanza(stanzas));
  });

  container.querySelector("#btn-import-fields").addEventListener("click", () => {
    const hasExisting = stanzas.length > 0;
    let mode = "replace";
    if (hasExisting) {
      const append = confirm(
        "ОК — добавить в конец (первый новый блок = новая песня).\nОтмена — заменить всю сборку."
      );
      mode = append ? "append" : "replace";
    }
    const imported = importStanzasFromState(state, mode);
    if (!imported.length) {
      alert("В полях программы и быстрых сессиях пока нет текста песни.");
      return;
    }
    emit(imported);
  });

  container.querySelector("#btn-copy-compiled").addEventListener("click", async () => {
    const text = formatCompiledSongs(stanzas);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const btn = container.querySelector("#btn-copy-compiled");
      btn.textContent = "Скопировано";
      setTimeout(() => {
        btn.textContent = "Копировать сводку";
      }, 1500);
    } catch {
      alert("Не удалось скопировать — выдели текст в сводке вручную.");
    }
  });
}
