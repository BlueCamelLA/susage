import { state, persist, getTodayLog, today } from './state.js';

const BADGE_DEFS = [
  // Stat milestones
  { id: 'str5', icon: '&#9876;', name: 'STR 5', check: () => state.stats.STR.level >= 5 },
  { id: 'str10', icon: '&#9876;', name: 'STR 10', check: () => state.stats.STR.level >= 10 },
  { id: 'int5', icon: '&#9733;', name: 'INT 5', check: () => state.stats.INT.level >= 5 },
  { id: 'int10', icon: '&#9733;', name: 'INT 10', check: () => state.stats.INT.level >= 10 },
  { id: 'cre5', icon: '&#9827;', name: 'CRE 5', check: () => state.stats.CRE.level >= 5 },
  { id: 'cre10', icon: '&#9827;', name: 'CRE 10', check: () => state.stats.CRE.level >= 10 },
  { id: 'vit5', icon: '&#9829;', name: 'VIT 5', check: () => state.stats.VIT.level >= 5 },
  { id: 'wil5', icon: '&#9672;', name: 'WIL 5', check: () => state.stats.WIL.level >= 5 },

  // Streak milestones
  { id: 'streak7', icon: '&#128293;', name: '7 Day Streak', check: () => state.streaks.longestStreak >= 7 },
  { id: 'streak30', icon: '&#128293;', name: '30 Day Streak', check: () => state.streaks.longestStreak >= 30 },
  { id: 'streak100', icon: '&#11088;', name: '100 Day Streak', check: () => state.streaks.longestStreak >= 100 },

  // Special
  { id: 'first', icon: '&#127942;', name: 'First Quest', check: () => {
    return Object.values(state.dailyLog).some(d => d.completed.length > 0);
  }},
  { id: 'allclear', icon: '&#9989;', name: 'All Clear', check: () => {
    const log = getTodayLog();
    return state.habits.length > 0 && log.completed.length >= state.habits.length;
  }},

  // Adventure milestones
  { id: 'adv1', icon: '&#9876;', name: 'First Adventure', check: () => (state.adventureCount || 0) >= 1 },
  { id: 'adv10', icon: '&#128737;', name: 'Dungeon Crawler', check: () => (state.adventureCount || 0) >= 10 },
  { id: 'adv_perfect', icon: '&#11088;', name: 'Flawless Victory', check: () => {
    return state.adventure && state.adventure.perfectRun === true;
  }},

  // Master milestones
  { id: 'master1', icon: '&#128220;', name: 'Awakened', check: () => (state.master?.unlockedTeachings?.length || 0) >= 1 },
  { id: 'master5', icon: '&#128220;', name: 'Enlightened', check: () => (state.master?.unlockedTeachings?.length || 0) >= 5 },
  { id: 'master15', icon: '&#128220;', name: 'Transcendent', check: () => (state.master?.unlockedTeachings?.length || 0) >= 15 },
];

export function checkAchievements() {
  const newBadges = [];

  for (const badge of BADGE_DEFS) {
    if (state.achievements.includes(badge.id)) continue;
    if (badge.check()) {
      state.achievements.push(badge.id);
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    persist();
    for (const b of newBadges) {
      showAchievementPopup(b);
    }
  }
}

function showAchievementPopup(badge) {
  const popup = document.createElement('div');
  popup.className = 'achievement-popup';
  popup.innerHTML = `Badge Earned: ${badge.name}!`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

export function renderBadges() {
  const container = document.getElementById('badges');
  container.innerHTML = '';

  for (const badge of BADGE_DEFS) {
    const earned = state.achievements.includes(badge.id);
    const el = document.createElement('div');
    el.className = 'badge' + (earned ? ' earned' : '');
    el.innerHTML = `
      <span>${earned ? badge.icon : '?'}</span>
      <div class="badge-tooltip">${badge.name}</div>
    `;
    if (!earned) el.style.opacity = '0.3';
    container.appendChild(el);
  }
}

// Boss battle
export function renderBoss() {
  const section = document.getElementById('boss-section');
  const boss = state.boss;

  if (!boss || boss.month !== today().slice(0, 7)) {
    section.classList.add('hidden');
    document.getElementById('boss-set-btn').textContent = 'Set Goal';
    section.classList.remove('hidden');
    document.getElementById('boss-name').textContent = 'No boss this month';
    document.getElementById('boss-bar-fill').style.width = '0%';
    document.getElementById('boss-progress-text').textContent = 'Set a monthly goal!';
    return;
  }

  section.classList.remove('hidden');
  document.getElementById('boss-name').textContent = boss.name;

  // Count completions this month
  const monthPrefix = boss.month;
  let count = 0;
  for (const [date, log] of Object.entries(state.dailyLog)) {
    if (date.startsWith(monthPrefix)) {
      count += log.completed.length;
    }
  }

  const pct = Math.min(100, Math.round((count / boss.target) * 100));
  document.getElementById('boss-bar-fill').style.width = `${pct}%`;
  document.getElementById('boss-progress-text').textContent = `${count} / ${boss.target}`;

  if (count >= boss.target) {
    document.getElementById('boss-bar-fill').style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
    document.getElementById('boss-name').textContent = `${boss.name} DEFEATED!`;
  }
}

export function initBossModal() {
  const overlay = document.getElementById('boss-modal-overlay');

  document.getElementById('boss-set-btn').addEventListener('click', () => {
    overlay.classList.remove('hidden');
    if (state.boss) {
      document.getElementById('boss-name-input').value = state.boss.name || '';
      document.getElementById('boss-target-input').value = state.boss.target || 20;
    }
  });

  document.getElementById('boss-modal-cancel').addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  document.getElementById('boss-modal-save').addEventListener('click', () => {
    const name = document.getElementById('boss-name-input').value.trim() || 'Monthly Boss';
    const target = parseInt(document.getElementById('boss-target-input').value) || 20;

    state.boss = {
      name,
      target,
      month: today().slice(0, 7),
    };

    persist();
    overlay.classList.add('hidden');
    renderBoss();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
}
