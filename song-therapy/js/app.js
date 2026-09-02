import { DAYS, QUICK_MODE, WRITE_REMINDERS } from "./program.js";
import {
  loadState,
  saveState,
  getFieldValue,
  setFieldValue,
  getCheckboxValues,
  setCheckboxValues,
  exportAll,
  defaultState,
} from "./storage.js";

const $ = (sel, root = document) => root.querySelector(sel);

let state = loadState();
let timerInterval = null;
let timerRemaining = 0;
let reminderInterval = null;
let reminderIndex = 0;

const els = {
  app: $("#app"),
  dayBadge: $("#day-badge"),
  dayTitle: $("#day-title"),
  dayGoal: $("#day-goal"),
  phaseNav: $("#phase-nav"),
  phaseName: $("#phase-name"),
  phaseHint: $("#phase-hint"),
  theses: $("#theses"),
  timerDisplay: $("#timer-display"),
  timerBar: $("#timer-bar"),
  btnTimerStart: $("#btn-timer-start"),
  btnTimerPause: $("#btn-timer-pause"),
  btnTimerSkip: $("#btn-timer-skip"),
  fields: $("#fields"),
  stickyReminders: $("#sticky-reminders"),
  stickyText: $("#sticky-text"),
  btnPrevPhase: $("#btn-prev-phase"),
  btnNextPhase: $("#btn-next-phase"),
  btnCompleteDay: $("#btn-complete-day"),
  dayPicker: $("#day-picker"),
  btnQuick: $("#btn-quick"),
  btnExport: $("#btn-export"),
  btnReset: $("#btn-reset"),
  progressText: $("#progress-text"),
};

function getActiveProgram() {
  return state.mode === "quick" ? QUICK_MODE : DAYS.find((d) => d.day === state.currentDay);
}

function getPhases() {
  const program = getActiveProgram();
  return program?.phases ?? [];
}

function getCurrentPhase() {
  return getPhases()[state.phaseIndex];
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function persist() {
  saveState(state);
}

function renderDayPicker() {
  els.dayPicker.innerHTML = "";
  DAYS.forEach((d) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day-pill";
    if (d.day === state.currentDay && state.mode === "program") btn.classList.add("active");
    if (state.completedDays.includes(d.day)) btn.classList.add("done");
    btn.textContent = d.day;
    btn.title = d.title;
    btn.addEventListener("click", () => {
      state.mode = "program";
      state.currentDay = d.day;
      state.phaseIndex = 0;
      stopTimer();
      persist();
      render();
    });
    els.dayPicker.appendChild(btn);
  });
}

function renderPhaseNav() {
  const phases = getPhases();
  els.phaseNav.innerHTML = "";
  phases.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "phase-pill";
    if (i === state.phaseIndex) btn.classList.add("active");
    if (i < state.phaseIndex) btn.classList.add("done");
    btn.textContent = `${i + 1}. ${p.name}`;
    btn.addEventListener("click", () => {
      state.phaseIndex = i;
      stopTimer();
      persist();
      render();
    });
    els.phaseNav.appendChild(btn);
  });
}

function renderTheses(theses) {
  els.theses.innerHTML = "";
  theses.forEach((t) => {
    const span = document.createElement("span");
    span.className = "thesis";
    span.textContent = t;
    els.theses.appendChild(span);
  });
}

function renderFields(phase) {
  els.fields.innerHTML = "";
  const dayKey = state.mode === "quick" ? 0 : state.currentDay;

  phase.fields.forEach((field) => {
    const wrap = document.createElement("div");
    wrap.className = "field";

    const label = document.createElement("label");
    label.textContent = field.label;
    wrap.appendChild(label);

    if (field.type === "checkboxes") {
      const group = document.createElement("div");
      group.className = "checkbox-group";
      const selected = getCheckboxValues(state, dayKey, phase.id, field.id);

      field.options.forEach((opt) => {
        const row = document.createElement("label");
        row.className = "checkbox-row";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = selected.includes(opt);
        input.addEventListener("change", () => {
          const vals = getCheckboxValues(state, dayKey, phase.id, field.id);
          if (input.checked) vals.push(opt);
          else {
            const idx = vals.indexOf(opt);
            if (idx >= 0) vals.splice(idx, 1);
          }
          setCheckboxValues(state, dayKey, phase.id, field.id, vals);
          persist();
        });
        row.appendChild(input);
        const span = document.createElement("span");
        span.textContent = opt;
        row.appendChild(span);
        group.appendChild(row);
      });
      wrap.appendChild(group);
    } else if (field.multiline) {
      const ta = document.createElement("textarea");
      ta.rows = 5;
      ta.placeholder = field.placeholder || "";
      ta.value = getFieldValue(state, dayKey, phase.id, field.id);
      ta.addEventListener("input", () => {
        setFieldValue(state, dayKey, phase.id, field.id, ta.value);
        persist();
      });
      wrap.appendChild(ta);
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = field.placeholder || "";
      input.value = getFieldValue(state, dayKey, phase.id, field.id);
      input.addEventListener("input", () => {
        setFieldValue(state, dayKey, phase.id, field.id, input.value);
        persist();
      });
      wrap.appendChild(input);
    }

    els.fields.appendChild(wrap);
  });
}

function isWritePhase(phase) {
  return phase.id === "write" || phase.id === "touch" || phase.id === "one" || phase.id === "secret";
}

function startStickyReminders(phase) {
  stopStickyReminders();
  const list = phase.theses?.length ? phase.theses : WRITE_REMINDERS;
  reminderIndex = 0;
  els.stickyText.textContent = list[0];
  els.stickyReminders.hidden = false;

  reminderInterval = setInterval(() => {
    reminderIndex = (reminderIndex + 1) % list.length;
    els.stickyText.textContent = list[reminderIndex];
    els.stickyReminders.classList.remove("flash");
    requestAnimationFrame(() => els.stickyReminders.classList.add("flash"));
  }, 4000);
}

function stopStickyReminders() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
  els.stickyReminders.hidden = true;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerUI(phase) {
  const total = phase.duration;
  const pct = total > 0 ? ((total - timerRemaining) / total) * 100 : 0;
  els.timerDisplay.textContent = formatTime(timerRemaining);
  els.timerBar.style.width = `${pct}%`;
}

function startTimer(phase) {
  stopTimer();
  timerRemaining = phase.duration;
  updateTimerUI(phase);
  timerInterval = setInterval(() => {
    timerRemaining -= 1;
    if (timerRemaining <= 0) {
      stopTimer();
      timerRemaining = 0;
      updateTimerUI(phase);
      els.timerDisplay.classList.add("done");
      setTimeout(() => els.timerDisplay.classList.remove("done"), 800);
      return;
    }
    updateTimerUI(phase);
  }, 1000);
}

function render() {
  const program = getActiveProgram();
  if (!program) return;

  const phases = getPhases();
  const phase = phases[state.phaseIndex];

  if (state.mode === "quick") {
    els.dayBadge.textContent = "Быстрый вход";
    els.progressText.textContent = "Без полного дня — якорь и песня";
  } else {
    els.dayBadge.textContent = `День ${program.day} / 14`;
    const done = state.completedDays.length;
    els.progressText.textContent = `Завершено дней: ${done}. Сегодня: ${program.title}`;
    if (!state.programStart) {
      state.programStart = new Date().toISOString();
      persist();
    }
  }

  els.dayTitle.textContent = program.title;
  els.dayGoal.textContent = program.goal;

  renderDayPicker();
  renderPhaseNav();

  els.phaseName.textContent = phase.name;
  els.phaseHint.textContent = phase.hint;
  renderTheses(phase.theses || []);
  renderFields(phase);

  timerRemaining = phase.duration;
  updateTimerUI(phase);

  if (isWritePhase(phase)) {
    startStickyReminders(phase);
  } else {
    stopStickyReminders();
  }

  els.btnPrevPhase.disabled = state.phaseIndex === 0;
  const isLast = state.phaseIndex >= phases.length - 1;
  els.btnNextPhase.hidden = isLast;
  els.btnCompleteDay.hidden = !isLast || state.mode === "quick";

  els.btnQuick.classList.toggle("active", state.mode === "quick");
}

function goNextPhase() {
  const phases = getPhases();
  if (state.phaseIndex < phases.length - 1) {
    state.phaseIndex += 1;
    stopTimer();
    persist();
    render();
  }
}

function goPrevPhase() {
  if (state.phaseIndex > 0) {
    state.phaseIndex -= 1;
    stopTimer();
    persist();
    render();
  }
}

function completeDay() {
  if (state.mode !== "quick" && !state.completedDays.includes(state.currentDay)) {
    state.completedDays.push(state.currentDay);
    state.completedDays.sort((a, b) => a - b);
  }
  if (state.mode === "program" && state.currentDay < 14) {
    state.currentDay += 1;
    state.phaseIndex = 0;
  }
  stopTimer();
  persist();
  render();
}

els.btnTimerStart.addEventListener("click", () => {
  const phase = getCurrentPhase();
  if (phase) startTimer(phase);
});

els.btnTimerPause.addEventListener("click", () => stopTimer());

els.btnTimerSkip.addEventListener("click", () => {
  stopTimer();
  const phase = getCurrentPhase();
  if (phase) {
    timerRemaining = 0;
    updateTimerUI(phase);
  }
});

els.btnNextPhase.addEventListener("click", goNextPhase);
els.btnPrevPhase.addEventListener("click", goPrevPhase);
els.btnCompleteDay.addEventListener("click", completeDay);

els.btnQuick.addEventListener("click", () => {
  state.mode = state.mode === "quick" ? "program" : "quick";
  state.phaseIndex = 0;
  stopTimer();
  persist();
  render();
});

els.btnExport.addEventListener("click", () => {
  const text = exportAll(state);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `song-therapy-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
});

els.btnReset.addEventListener("click", () => {
  if (!confirm("Сбросить прогресс и все поля? Тексты не восстановятся.")) return;
  state = defaultState();
  persist();
  stopTimer();
  stopStickyReminders();
  render();
});

render();
