import { state, persist, getTodayLog, uid } from './state.js';
import { awardXP, effectiveMultiplier, updateStreak } from './progression.js';
import { checkTeachingUnlock } from './master.js';

let onUpdate = () => {};

export function setOnUpdate(fn) {
  onUpdate = fn;
}

function showXPPopup(el, xp, stat) {
  const rect = el.getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className = 'xp-popup';
  popup.textContent = `+${xp} ${stat}`;
  popup.style.left = `${rect.right + 8}px`;
  popup.style.top = `${rect.top}px`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}

export function renderChecklist() {
  const list = document.getElementById('habit-list');
  const log = getTodayLog();
  list.innerHTML = '';

  for (const habit of state.habits) {
    const done = log.completed.includes(habit.id);
    const li = document.createElement('li');
    li.className = 'habit-item' + (done ? ' completed' : '');
    li.dataset.id = habit.id;

    const mult = effectiveMultiplier();
    const rawXP = habit.xpReward * mult;
    const displayXP = rawXP % 1 === 0 ? rawXP : rawXP.toFixed(1);

    const targetTag = habit.target ? `<span class="habit-target">${habit.target}</span>` : '';
    li.innerHTML = `
      <div class="habit-check">${done ? '&#10003;' : ''}</div>
      <span class="habit-name">${habit.name} ${targetTag}</span>
      <span class="habit-xp">+${displayXP} ${habit.stat}</span>
      <button class="habit-edit-btn" title="Edit habit">&#9998;</button>
    `;

    // Edit button
    const editBtn = li.querySelector('.habit-edit-btn');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(habit);
    });

    // Click anywhere on the row to toggle the habit
    li.addEventListener('click', (e) => {
      if (log.restDay) return;
      toggleHabit(habit, li);
    });

    // Long press to edit
    let pressTimer;
    li.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => openEditModal(habit), 600);
    });
    li.addEventListener('mouseup', () => clearTimeout(pressTimer));
    li.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    li.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => openEditModal(habit), 600);
    });
    li.addEventListener('touchend', () => clearTimeout(pressTimer));

    list.appendChild(li);
  }
}

function toggleHabit(habit, li) {
  const log = getTodayLog();
  const idx = log.completed.indexOf(habit.id);

  if (idx === -1) {
    // Complete
    log.completed.push(habit.id);
    const { xpGained, levelUps } = awardXP(habit.stat, habit.xpReward);
    updateStreak();
    showXPPopup(li, xpGained, habit.stat);

    for (const lu of levelUps) {
      showLevelUp(lu.stat, lu.level);
    }
  } else {
    // Uncomplete - remove XP (simplified: just remove base, no undo leveling)
    log.completed.splice(idx, 1);
    const s = state.stats[habit.stat];
    s.xp = Math.max(0, s.xp - habit.xpReward);
  }

  persist();
  onUpdate();
}

function showLevelUp(stat, level) {
  const overlay = document.getElementById('level-up-overlay');
  overlay.querySelector('span').textContent = `${stat} LVL ${level}!`;
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('hidden'), 2000);

  // Achievement popup
  const popup = document.createElement('div');
  popup.className = 'achievement-popup';
  popup.textContent = `${stat} reached Level ${level}!`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);

  // Check for Master teaching unlock
  checkTeachingUnlock(stat, level);
}

// Habit CRUD
export function openAddModal() {
  document.getElementById('modal-title').textContent = 'Add New Habit';
  document.getElementById('habit-name-input').value = '';
  document.getElementById('habit-target-input').value = '';
  document.getElementById('habit-stat-input').value = 'STR';
  document.getElementById('habit-xp-input').value = '1.5';
  document.getElementById('modal-delete').classList.add('hidden');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-overlay').dataset.editId = '';
  document.getElementById('habit-name-input').focus();
}

function openEditModal(habit) {
  document.getElementById('modal-title').textContent = 'Edit Habit';
  document.getElementById('habit-name-input').value = habit.name;
  document.getElementById('habit-target-input').value = habit.target || '';
  document.getElementById('habit-stat-input').value = habit.stat;
  document.getElementById('habit-xp-input').value = habit.xpReward.toString();
  document.getElementById('modal-delete').classList.remove('hidden');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-overlay').dataset.editId = habit.id;
}

export function initModalHandlers() {
  const overlay = document.getElementById('modal-overlay');

  document.getElementById('modal-cancel').addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  document.getElementById('modal-save').addEventListener('click', () => {
    const name = document.getElementById('habit-name-input').value.trim();
    if (!name) return;

    const target = document.getElementById('habit-target-input').value.trim();
    const stat = document.getElementById('habit-stat-input').value;
    const xpReward = parseFloat(document.getElementById('habit-xp-input').value);
    const editId = overlay.dataset.editId;

    if (editId) {
      const habit = state.habits.find(h => h.id === editId);
      if (habit) {
        habit.name = name;
        habit.target = target;
        habit.stat = stat;
        habit.xpReward = xpReward;
      }
    } else {
      state.habits.push({ id: uid(), name, target, stat, xpReward });
    }

    persist();
    overlay.classList.add('hidden');
    onUpdate();
  });

  document.getElementById('modal-delete').addEventListener('click', () => {
    const editId = overlay.dataset.editId;
    if (editId) {
      state.habits = state.habits.filter(h => h.id !== editId);
      // Remove from all daily logs
      for (const log of Object.values(state.dailyLog)) {
        log.completed = log.completed.filter(id => id !== editId);
      }
      persist();
    }
    overlay.classList.add('hidden');
    onUpdate();
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
}
