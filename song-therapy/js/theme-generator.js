/**
 * Генератор тем для песен — случайные осмысленные словосочетания.
 */
import {
  ADJ_M, ADJ_F, ADJ_N,
  NOUN_M, NOUN_F, NOUN_N,
  NOUN_GEN, VERB, ADV,
} from './theme-words.js';

const HISTORY_MAX = 80;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const TEMPLATES = [
  {
    id: 'adj_noun_m',
    label: 'прилагательное + существительное',
    gen() {
      const adj = pick(ADJ_M);
      const noun = pick(NOUN_M);
      return `${cap(adj)} ${noun}`;
    },
  },
  {
    id: 'adj_noun_f',
    label: 'прилагательное + существительное',
    gen() {
      const adj = pick(ADJ_F);
      const noun = pick(NOUN_F);
      return `${cap(adj)} ${noun}`;
    },
  },
  {
    id: 'adj_noun_n',
    label: 'прилагательное + существительное',
    gen() {
      const adj = pick(ADJ_N);
      const noun = pick(NOUN_N);
      return `${cap(adj)} ${noun}`;
    },
  },
  {
    id: 'noun_gen',
    label: 'без / после',
    gen() {
      const noun = pick(NOUN_GEN);
      const templates = [
        `Без ${noun}`,
        `После ${noun}`,
        `До ${noun}`,
        `Ради ${noun}`,
        `Вопреки ${noun}`,
      ];
      return pick(templates);
    },
  },
  {
    id: 'verb_adv',
    label: 'глагол + наречие',
    gen() {
      const verb = pick(VERB);
      const adv = pick(ADV);
      return `${cap(verb)} ${adv}`;
    },
  },
  {
    id: 'when_verb',
    label: 'когда…',
    gen() {
      const verb = pick(VERB);
      const adv = pick(ADV);
      const variants = [
        `Когда ${verb} ${adv}`,
        `Когда всё ${verb}`,
        `Когда ты ${verb}`,
        `Когда я ${verb}`,
      ];
      return pick(variants);
    },
  },
  {
    id: 'two_nouns',
    label: 'два образа',
    gen() {
      const all = [...NOUN_M, ...NOUN_F, ...NOUN_N];
      let a = pick(all);
      let b = pick(all);
      let tries = 0;
      while (b === a && tries < 10) {
        b = pick(all);
        tries++;
      }
      const connectors = [' и ', ' против ', ' под ', ' над ', ' между ', ' без '];
      return `${cap(a)}${pick(connectors)}${b}`;
    },
  },
  {
    id: 'adj_feeling',
    label: 'состояние',
    gen() {
      const adj = pick([...ADJ_M, ...ADJ_F, ...ADJ_N]);
      const noun = pick([...NOUN_M, ...NOUN_F, ...NOUN_N]);
      const frames = [
        `Чувство: ${adj} ${noun}`,
        `Остаться ${adj}`,
        `Слишком ${adj}`,
        `${cap(adj)} — и всё`,
      ];
      return pick(frames);
    },
  },
  {
    id: 'question',
    label: 'вопрос',
    gen() {
      const noun = pick([...NOUN_M, ...NOUN_F]);
      const adj = pick([...ADJ_F, ...ADJ_M]);
      const questions = [
        `Где ${noun}?`,
        `Кто ${adj}?`,
        `Зачем ${noun}?`,
        `Что за ${noun}?`,
        `Почему ${adj}?`,
      ];
      return pick(questions);
    },
  },
  {
    id: 'line_seed',
    label: 'зачин строки',
    gen() {
      const noun = pick([...NOUN_M, ...NOUN_F, ...NOUN_N]);
      const verb = pick(VERB);
      const adv = pick(ADV);
      const seeds = [
        `Я ${verb} ${adv}`,
        `Ты ${verb} ${adv}`,
        `Мы ${verb} ${adv}`,
        `Здесь ${noun}`,
        `Там, где ${noun}`,
        `Пока ${verb}`,
        `Если ${verb}`,
        `${cap(noun)} — ${verb}`,
      ];
      return pick(seeds);
    },
  },
];

function cap(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateTheme(recent = []) {
  const recentSet = new Set(recent);
  const order = [...TEMPLATES].sort(() => Math.random() - 0.5);

  for (const tpl of order) {
    for (let i = 0; i < 8; i++) {
      const phrase = tpl.gen();
      if (!recentSet.has(phrase)) {
        return { phrase, template: tpl.label };
      }
    }
  }

  const tpl = pick(TEMPLATES);
  return { phrase: tpl.gen(), template: tpl.label };
}

export function initThemeGenerator(container) {
  if (!container) return;

  const history = [];

  container.innerHTML = `
    <div class="theme-panel-inner">
      <button type="button" class="panel-close" id="theme-panel-close" aria-label="Закрыть">← Назад</button>
      <h2 class="theme-panel-title">Тема для строки</h2>
      <p class="theme-panel-hint">Случайное словосочетание — зацепка для куплета или одной строчки. Не обязательно брать дословно.</p>
      <div class="theme-output" id="theme-output" aria-live="polite">
        <span class="theme-placeholder">Нажми кнопку — получишь образ или формулировку</span>
      </div>
      <p class="theme-template" id="theme-template" hidden></p>
      <button type="button" class="btn-primary theme-btn" id="theme-generate-btn">Получить тему</button>
      <button type="button" class="btn-secondary theme-copy-btn" id="theme-copy-btn" hidden>Скопировать</button>
    </div>
  `;

  const outputEl = container.querySelector('#theme-output');
  const templateEl = container.querySelector('#theme-template');
  const copyBtn = container.querySelector('#theme-copy-btn');

  function renderTheme(phrase, template) {
    outputEl.innerHTML = `<span class="theme-phrase">${escapeHtml(phrase)}</span>`;
    if (template) {
      templateEl.textContent = `Формат: ${template}`;
      templateEl.hidden = false;
    }
    copyBtn.hidden = false;
  }

  container.querySelector('#theme-panel-close')?.addEventListener('click', () => {
    container.classList.remove('theme-panel-open');
    document.getElementById('mobile-btn-themes')?.classList.remove('active');
    document.body.classList.remove('mobile-panel-open');
  });

  container.querySelector('#theme-generate-btn').addEventListener('click', () => {
    const { phrase, template } = generateTheme(history);
    history.unshift(phrase);
    if (history.length > HISTORY_MAX) history.pop();
    renderTheme(phrase, template);
  });

  copyBtn.addEventListener('click', async () => {
    const text = outputEl.querySelector('.theme-phrase')?.textContent;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Скопировано';
      setTimeout(() => { copyBtn.textContent = 'Скопировать'; }, 1500);
    } catch {
      copyBtn.textContent = 'Не удалось';
    }
  });
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
