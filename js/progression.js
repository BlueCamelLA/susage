import { state, persist, getTodayLog, today } from './state.js';

export function xpForLevel(level) {
  return 5 * level * level;
}

export function xpProgress(stat) {
  const s = state.stats[stat];
  const needed = xpForLevel(s.level);
  return Math.min(s.xp / needed, 1);
}

export function streakMultiplier() {
  const s = state.streaks.currentStreak;
  if (s >= 30) return 2.0;
  if (s >= 8) return 1.5;
  if (s >= 2) return 1.25;
  return 1.0;
}

export function hasWellRestedBuff() {
  const log = state.dailyLog;
  const d = today();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  return log[yStr]?.restDay === true && !log[d]?.restDay;
}

export function effectiveMultiplier() {
  let m = streakMultiplier();
  if (hasWellRestedBuff()) m *= 1.5;
  return m;
}

export function awardXP(stat, baseXP) {
  const mult = effectiveMultiplier();
  const xp = parseFloat((baseXP * mult).toFixed(2));
  const s = state.stats[stat];
  s.xp += xp;

  const levelUps = [];
  while (s.xp >= xpForLevel(s.level)) {
    s.xp -= xpForLevel(s.level);
    s.level++;
    levelUps.push({ stat, level: s.level });
  }

  persist();
  return { xpGained: xp, levelUps };
}

export function overallLevel() {
  const stats = Object.values(state.stats);
  const sum = stats.reduce((a, s) => a + s.level, 0);
  return Math.floor(sum / stats.length);
}

export function characterTitle() {
  const lvl = overallLevel();
  if (lvl >= 25) return `Level ${lvl} Legend`;
  if (lvl >= 15) return `Level ${lvl} Champion`;
  if (lvl >= 10) return `Level ${lvl} Warrior`;
  if (lvl >= 5) return `Level ${lvl} Fighter`;
  return `Level ${lvl} Adventurer`;
}

export function updateStreak() {
  const d = today();
  const log = getTodayLog();
  const s = state.streaks;

  if (log.completed.length > 0 || log.restDay) {
    if (s.lastActiveDate === d) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    if (s.lastActiveDate === yStr) {
      s.currentStreak++;
    } else if (s.lastActiveDate !== d) {
      s.currentStreak = 1;
    }

    s.lastActiveDate = d;
    if (s.currentStreak > s.longestStreak) {
      s.longestStreak = s.currentStreak;
    }
    persist();
  }
}

export function daysSinceLastActive() {
  if (!state.streaks.lastActiveDate) return 999;
  const last = new Date(state.streaks.lastActiveDate);
  const now = new Date(today());
  return Math.floor((now - last) / (1000 * 60 * 60 * 24));
}
