// js/modules/state.js – Central app state

const _state = {
  currentPage: 'dashboard',
  currentTab: 'url',
  theme: 'dark',
  animations: true,
  analysisResult: null,
  isAnalyzing: false,
  inputDirty: false,
  history: [],
};

const listeners = {};

export const State = {
  get(key) { return _state[key]; },

  set(key, value) {
    _state[key] = value;
    if (listeners[key]) {
      listeners[key].forEach(fn => fn(value));
    }
  },

  on(key, fn) {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(fn);
  },

  getAll() { return { ..._state }; },
};

// Persist theme + animation prefs
export function loadPersistedState() {
  const theme = localStorage.getItem('tl_theme') || 'dark';
  const animations = localStorage.getItem('tl_animations') !== 'false';
  const history = JSON.parse(localStorage.getItem('tl_history') || '[]');

  State.set('theme', theme);
  State.set('animations', animations);
  State.set('history', history);

  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.animations = animations;
}

export function saveHistory(history) {
  localStorage.setItem('tl_history', JSON.stringify(history));
}
