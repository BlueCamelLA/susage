const STORAGE_KEYS = {
  stats: 'lq_stats',
  habits: 'lq_habits',
  dailyLog: 'lq_daily_log',
  streaks: 'lq_streaks',
  achievements: 'lq_achievements',
  boss: 'lq_boss',
  onboarded: 'lq_onboarded',
  adventure: 'lq_adventure',
  adventureCount: 'lq_adventure_count',
  master: 'lq_master',
};

function defaultStats() {
  return {
    STR: { xp: 0, level: 1 },
    INT: { xp: 0, level: 1 },
    CRE: { xp: 0, level: 1 },
    VIT: { xp: 0, level: 1 },
    WIL: { xp: 0, level: 1 },
  };
}

function defaultHabits() {
  return [
    { id: 'h1', name: 'Morning workout', stat: 'STR', xpReward: 1.5, target: '30 min' },
    { id: 'h2', name: 'Read', stat: 'INT', xpReward: 1, target: '15 pages' },
    { id: 'h3', name: 'Sketch practice', stat: 'CRE', xpReward: 1, target: '20 min' },
    { id: 'h4', name: 'Drink water', stat: 'VIT', xpReward: 1, target: '2L' },
    { id: 'h5', name: 'Journal', stat: 'WIL', xpReward: 1, target: '1 page' },
  ];
}

function defaultStreaks() {
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
}

function defaultAchievements() {
  return [];
}

function defaultBoss() {
  return null;
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback();
  } catch {
    return fallback();
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function uid() {
  return 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const state = {
  stats: load(STORAGE_KEYS.stats, defaultStats),
  habits: load(STORAGE_KEYS.habits, defaultHabits),
  dailyLog: load(STORAGE_KEYS.dailyLog, () => ({})),
  streaks: load(STORAGE_KEYS.streaks, defaultStreaks),
  achievements: load(STORAGE_KEYS.achievements, defaultAchievements),
  boss: load(STORAGE_KEYS.boss, defaultBoss),
  onboarded: localStorage.getItem(STORAGE_KEYS.onboarded) === 'true',
  adventure: load(STORAGE_KEYS.adventure, () => null),
  adventureCount: load(STORAGE_KEYS.adventureCount, () => 0),
  master: load(STORAGE_KEYS.master, () => ({ seenQuotes: [], lastDate: null, currentQuote: null, unlockedTeachings: [] })),
};

export function persist() {
  save(STORAGE_KEYS.stats, state.stats);
  save(STORAGE_KEYS.habits, state.habits);
  save(STORAGE_KEYS.dailyLog, state.dailyLog);
  save(STORAGE_KEYS.streaks, state.streaks);
  save(STORAGE_KEYS.achievements, state.achievements);
  save(STORAGE_KEYS.boss, state.boss);
  localStorage.setItem(STORAGE_KEYS.onboarded, state.onboarded);
  save(STORAGE_KEYS.adventure, state.adventure);
  save(STORAGE_KEYS.adventureCount, state.adventureCount);
  save(STORAGE_KEYS.master, state.master);
}

export function getTodayLog() {
  const d = today();
  if (!state.dailyLog[d]) {
    state.dailyLog[d] = { completed: [], restDay: false };
  }
  return state.dailyLog[d];
}

export function exportState() {
  return JSON.stringify(state, null, 2);
}

export function importState(json) {
  const data = JSON.parse(json);
  Object.assign(state, data);
  persist();
}
