import { state, persist, getTodayLog, today, exportState, importState } from './js/state.js';
import { xpProgress, streakMultiplier, hasWellRestedBuff, effectiveMultiplier, characterTitle, updateStreak, daysSinceLastActive, overallLevel } from './js/progression.js';
import { renderChecklist, setOnUpdate, openAddModal, initModalHandlers } from './js/checklist.js';
import { renderCharacter } from './js/character.js';
import { checkAchievements, renderBadges, renderBoss, initBossModal } from './js/achievements.js';
import { renderAdventureGate, initAdventure, setAdventureOnUpdate } from './js/adventure.js';
import { renderMasterWisdom, initMaster } from './js/master.js';

function renderStats() {
  const statNames = ['STR', 'INT', 'CRE', 'VIT', 'WIL'];
  for (const name of statNames) {
    const row = document.querySelector(`.stat-row[data-stat="${name}"]`);
    const fill = row.querySelector('.stat-fill');
    const levelEl = row.querySelector('.stat-level');
    fill.style.width = `${xpProgress(name) * 100}%`;
    levelEl.textContent = state.stats[name].level;
  }
  document.getElementById('character-title').textContent = characterTitle();
}

function renderStreak() {
  const s = state.streaks;
  const mult = streakMultiplier();
  let text = '';

  if (s.currentStreak > 0) {
    text = `Streak: ${s.currentStreak} day${s.currentStreak > 1 ? 's' : ''}`;
    if (mult > 1) text += ` (${mult}x XP)`;
  } else {
    text = 'Start your streak today!';
  }

  document.getElementById('streak-text').textContent = text;
}

function renderBuffs() {
  const bar = document.getElementById('buff-bar');
  bar.innerHTML = '';

  const mult = streakMultiplier();
  if (mult > 1) {
    const tag = document.createElement('span');
    tag.className = 'buff-tag gold';
    tag.textContent = `${mult}x Streak`;
    bar.appendChild(tag);
  }

  if (hasWellRestedBuff()) {
    const tag = document.createElement('span');
    tag.className = 'buff-tag';
    tag.textContent = '1.5x Well Rested';
    bar.appendChild(tag);
  }

  const log = getTodayLog();
  if (log.restDay) {
    const tag = document.createElement('span');
    tag.className = 'buff-tag';
    tag.textContent = 'Rest Day';
    bar.appendChild(tag);
  }
}

function renderDate() {
  const d = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('today-date').textContent = `${months[d.getMonth()]} ${d.getDate()}`;
}

function updateAll() {
  renderMasterWisdom();
  renderStats();
  renderChecklist();
  renderCharacter();
  renderStreak();
  renderBuffs();
  renderBadges();
  renderBoss();
  renderAdventureGate();
  checkAchievements();
}

function initRestDay() {
  const btn = document.getElementById('rest-day-btn');
  const log = getTodayLog();

  if (log.restDay) btn.classList.add('active');

  btn.addEventListener('click', () => {
    const log = getTodayLog();
    log.restDay = !log.restDay;

    if (log.restDay) {
      btn.classList.add('active');
      updateStreak();
    } else {
      btn.classList.remove('active');
    }

    persist();
    updateAll();
  });
}

function initExportImport() {
  document.getElementById('export-btn').addEventListener('click', () => {
    const data = exportState();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifequest-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Reset all progress? This cannot be undone!')) {
      localStorage.clear();
      location.reload();
    }
  });

  document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importState(reader.result);
        updateAll();
      } catch (err) {
        alert('Invalid save file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
}

function initOnboarding() {
  if (state.onboarded) return;

  const overlay = document.getElementById('onboarding-overlay');
  overlay.classList.remove('hidden');

  document.getElementById('onboarding-start').addEventListener('click', () => {
    state.onboarded = true;
    persist();
    overlay.classList.add('hidden');
  });
}

// Boot
function init() {
  renderDate();
  setOnUpdate(updateAll);
  setAdventureOnUpdate(updateAll);
  initModalHandlers();
  initBossModal();
  initRestDay();
  initExportImport();

  document.getElementById('add-habit-btn').addEventListener('click', openAddModal);

  updateAll();
  initMaster();
  initAdventure();
  initOnboarding();
}

document.addEventListener('DOMContentLoaded', init);
