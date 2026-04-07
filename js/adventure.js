import { state, persist, getTodayLog, today } from './state.js';
import { overallLevel, awardXP } from './progression.js';
import { ENCOUNTER_TEMPLATES, SCENE_SPRITES, SCENE_PALETTES, PENALTY_QUESTS } from './encounters.js';
import { getMasterAdvice, getMasterSuccessLine, getMasterFailureLine, getMasterPenaltyLine } from './master.js';

let onUpdate = () => {};

export function setAdventureOnUpdate(fn) {
  onUpdate = fn;
}

// ═══════════ Gate Check ═══════════

export function canStartAdventure() {
  const log = getTodayLog();
  if (state.habits.length === 0) return false;
  if (log.completed.length < state.habits.length) return false;
  if (state.adventure && state.adventure.date === today() && state.adventure.status === 'complete') return false;
  return true;
}

export function adventureCompletedToday() {
  return state.adventure && state.adventure.date === today() && state.adventure.status === 'complete';
}

function adventureInProgress() {
  return state.adventure && state.adventure.date === today() && state.adventure.status === 'active';
}

// ═══════════ Helpers ═══════════

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillTemplate(text, vars) {
  return text
    .replace(/\{monster\}/g, vars.monsterName)
    .replace(/\{location\}/g, vars.locationName)
    .replace(/\{loot\}/g, vars.lootName);
}

// ═══════════ Adventure Generation ═══════════

function generateEncounters() {
  const usedIds = new Set();
  const lvl = overallLevel();
  const allTemplates = shuffle(ENCOUNTER_TEMPLATES);

  const encounters = [];
  for (let i = 0; i < 3 && encounters.length < 3; i++) {
    const template = allTemplates.find(t => !usedIds.has(t.id));
    if (!template) break;
    usedIds.add(template.id);

    const vars = {
      monsterName: pickRandom(template.monsters),
      locationName: pickRandom(template.locations),
      lootName: pickRandom(template.loot),
    };

    encounters.push({
      templateId: template.id,
      title: template.title,
      sceneType: template.sceneType,
      baseXP: template.baseXP,
      intro: fillTemplate(template.intro, vars),
      choices: template.choices.map(c => ({
        label: c.label,
        stat: c.stat,
        threshold: c.baseThreshold + lvl,
        successText: fillTemplate(c.successText, vars),
        failureText: fillTemplate(c.failureText, vars),
      })),
      chosenIndex: null,
      chosenStat: null,
      outcome: null,
      penalty: null,
      penaltyDone: false,
      xpAwarded: 0,
    });
  }

  return encounters;
}

// ═══════════ State Machine ═══════════

export function startAdventure() {
  state.adventure = {
    date: today(),
    status: 'active',
    currentEncounter: 0,
    phase: 'intro', // intro → choose → result → penalty → next/summary
    encounters: generateEncounters(),
    totalXP: {},
    perfectRun: false,
  };
  persist();
  openOverlay();
  render();
}

function enc() {
  return state.adventure.encounters[state.adventure.currentEncounter];
}

function makeChoice(index) {
  const e = enc();
  const choice = e.choices[index];
  e.chosenIndex = index;
  e.chosenStat = choice.stat;

  const playerLevel = state.stats[choice.stat].level;
  e.outcome = playerLevel >= choice.threshold ? 'success' : 'failure';

  if (e.outcome === 'success') {
    e.xpAwarded = e.baseXP;
  } else {
    // Assign penalty quest
    const penalties = PENALTY_QUESTS[choice.stat];
    e.penalty = pickRandom(penalties);
    e.xpAwarded = 0;
  }

  // Track XP
  const adv = state.adventure;
  adv.totalXP[e.chosenStat] = (adv.totalXP[e.chosenStat] || 0) + e.xpAwarded;

  adv.phase = 'result';
  persist();
  render();
}

function completePenalty() {
  const e = enc();
  e.penaltyDone = true;
  // Award reduced XP for completing the penalty
  const penaltyXP = Math.ceil(e.baseXP * 0.75);
  e.xpAwarded = penaltyXP;
  const adv = state.adventure;
  adv.totalXP[e.chosenStat] = (adv.totalXP[e.chosenStat] || 0) + penaltyXP;
  persist();
  render();
}

function skipPenalty() {
  state.adventure.phase = 'result'; // stay on result, just allow continue
  enc().penaltyDone = false;
  persist();
  render();
}

function nextEncounterOrSummary() {
  const adv = state.adventure;

  if (adv.currentEncounter < 2) {
    adv.currentEncounter++;
    adv.phase = 'intro';
  } else {
    adv.perfectRun = adv.encounters.every(e => e.outcome === 'success');

    if (adv.perfectRun) {
      const totalEarned = Object.values(adv.totalXP).reduce((a, b) => a + b, 0);
      const bonus = Math.ceil(totalEarned * 0.5);
      const statsUsed = Object.keys(adv.totalXP);
      const perStat = Math.ceil(bonus / statsUsed.length);
      for (const s of statsUsed) {
        adv.totalXP[s] += perStat;
      }
    }

    adv.phase = 'summary';
  }

  persist();
  render();
}

function claimRewards() {
  const adv = state.adventure;
  for (const [stat, xp] of Object.entries(adv.totalXP)) {
    if (xp > 0) awardXP(stat, xp);
  }
  adv.status = 'complete';
  state.adventureCount = (state.adventureCount || 0) + 1;
  persist();
  closeOverlay();
  onUpdate();
}

// ═══════════ Scene Rendering ═══════════

function renderScene(canvasEl, sceneType) {
  const ctx = canvasEl.getContext('2d');
  const grid = SCENE_SPRITES[sceneType];
  const palette = SCENE_PALETTES[sceneType];
  const size = 16;
  const px = canvasEl.width / size;

  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.fillStyle = palette[5] || '#0a0a1a';
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = grid[y][x];
      if (v && palette[v]) {
        ctx.fillStyle = palette[v];
        ctx.fillRect(x * px, y * px, px, px);
      }
    }
  }
}

// ═══════════ UI ═══════════

function openOverlay() {
  const el = document.getElementById('adventure-overlay');
  el.classList.remove('hidden');
  el.scrollTop = 0;
}

function closeOverlay() {
  document.getElementById('adventure-overlay').classList.add('hidden');
}

const STAT_COLORS = {
  STR: '#e94560', INT: '#6c63ff', CRE: '#f5c842', VIT: '#4ade80', WIL: '#38bdf8',
};

function render() {
  const adv = state.adventure;
  if (!adv || adv.status === 'complete') return;

  const e = enc();
  const container = document.getElementById('adventure-container');

  if (adv.phase === 'summary') {
    renderSummary();
    return;
  }

  const progress = `Encounter ${adv.currentEncounter + 1} / 3`;

  if (adv.phase === 'intro') {
    container.innerHTML = `
      <span class="adv-progress">${progress}</span>
      <canvas id="adventure-canvas" width="256" height="256"></canvas>
      <h2 class="adv-title">${e.title}</h2>
      <p class="adv-narrative">${e.intro}</p>
      <p class="master-advice">${getMasterAdvice(e.sceneType)}</p>
      <p class="adv-prompt">What do you do?</p>
      <button class="adv-action-btn" id="adv-show-choices">Choose Your Path</button>
    `;
    // Re-render scene on new canvas
    renderScene(document.getElementById('adventure-canvas'), e.sceneType);

    document.getElementById('adv-show-choices').onclick = () => {
      adv.phase = 'choose';
      persist();
      render();
    };
  }

  else if (adv.phase === 'choose') {
    let choicesHTML = '';
    for (let i = 0; i < e.choices.length; i++) {
      const c = e.choices[i];
      const playerLevel = state.stats[c.stat].level;
      const canPass = playerLevel >= c.threshold;
      const statusClass = canPass ? 'choice-success' : 'choice-danger';
      const statusText = canPass ? 'You can do this!' : 'Not strong enough yet...';
      const statusIcon = canPass ? '&#10003;' : '&#10007;';

      choicesHTML += `
        <button class="choice-card ${statusClass}" data-index="${i}">
          <span class="choice-label">${c.label}</span>
          <span class="choice-req">
            <span style="color:${STAT_COLORS[c.stat]}">${c.stat} ${c.threshold}</span> required
            <span class="choice-your">Your: ${playerLevel}</span>
          </span>
          <span class="choice-status">${statusIcon} ${statusText}</span>
        </button>
      `;
    }

    container.innerHTML = `
      <span class="adv-progress">${progress}</span>
      <canvas id="adventure-canvas" width="256" height="256"></canvas>
      <h2 class="adv-title">${e.title}</h2>
      <div class="choice-container">${choicesHTML}</div>
    `;
    renderScene(document.getElementById('adventure-canvas'), e.sceneType);

    // Bind choice clicks
    container.querySelectorAll('.choice-card').forEach(card => {
      card.addEventListener('click', () => {
        makeChoice(parseInt(card.dataset.index));
      });
    });
  }

  else if (adv.phase === 'result') {
    const choice = e.choices[e.chosenIndex];
    const isSuccess = e.outcome === 'success';
    const narrativeText = isSuccess ? choice.successText : choice.failureText;
    const outcomeLabel = isSuccess ? 'SUCCESS!' : 'FAILURE';
    const outcomeColor = isSuccess ? '#4ade80' : '#e94560';

    let actionHTML = '';

    if (isSuccess) {
      actionHTML = `
        <p class="adv-xp-reward" style="color:${STAT_COLORS[e.chosenStat]}">+${e.xpAwarded} ${e.chosenStat} XP</p>
        <p class="master-commentary" style="color:var(--gold)">${getMasterSuccessLine()}</p>
        <button class="adv-action-btn" id="adv-continue">${adv.currentEncounter < 2 ? 'Next Encounter' : 'View Summary'}</button>
      `;
    } else if (!e.penaltyDone && e.penalty) {
      actionHTML = `
        <p class="master-commentary" style="color:var(--accent)">${getMasterFailureLine()}</p>
        <div class="penalty-box">
          <p class="penalty-title">Recovery Challenge</p>
          <p class="penalty-text">${e.penalty.text}</p>
          <p class="penalty-desc">${e.penalty.description}</p>
          <p class="master-commentary" style="color:var(--gold);margin-top:6px">${getMasterPenaltyLine(e.chosenStat)}</p>
          <button class="adv-action-btn penalty-done-btn" id="adv-penalty-done">Challenge Complete</button>
          <button class="adv-skip-btn" id="adv-penalty-skip">Skip (0 XP)</button>
        </div>
      `;
    } else {
      // Penalty done or skipped — show XP and continue
      const xpText = e.xpAwarded > 0
        ? `<p class="adv-xp-reward" style="color:${STAT_COLORS[e.chosenStat]}">+${e.xpAwarded} ${e.chosenStat} XP (recovery bonus)</p>`
        : `<p class="adv-xp-reward" style="color:#666">+0 XP (penalty skipped)</p>`;
      actionHTML = `
        ${xpText}
        <button class="adv-action-btn" id="adv-continue">${adv.currentEncounter < 2 ? 'Next Encounter' : 'View Summary'}</button>
      `;
    }

    container.innerHTML = `
      <span class="adv-progress">${progress}</span>
      <canvas id="adventure-canvas" width="256" height="256"></canvas>
      <h2 class="adv-title">${e.title}</h2>
      <p class="adv-stat-badge" style="border-color:${STAT_COLORS[e.chosenStat]};color:${STAT_COLORS[e.chosenStat]}">${e.chosenStat} ${state.stats[e.chosenStat].level} vs ${choice.threshold}</p>
      <p class="adv-outcome" style="color:${outcomeColor}">${outcomeLabel}</p>
      <p class="adv-narrative">${narrativeText}</p>
      ${actionHTML}
    `;
    renderScene(document.getElementById('adventure-canvas'), e.sceneType);

    // Flash effect
    const overlay = document.getElementById('adventure-overlay');
    const flashClass = isSuccess ? 'flash-success' : 'flash-failure';
    // Only flash on first render of result (not on penalty done re-render)
    if (!e.penaltyDone || isSuccess) {
      overlay.classList.add(flashClass);
      setTimeout(() => overlay.className = overlay.className.replace(/flash-\S+/g, '').trim(), 600);
    }

    // Bind buttons
    const continueBtn = document.getElementById('adv-continue');
    if (continueBtn) continueBtn.onclick = nextEncounterOrSummary;

    const penaltyDoneBtn = document.getElementById('adv-penalty-done');
    if (penaltyDoneBtn) penaltyDoneBtn.onclick = completePenalty;

    const penaltySkipBtn = document.getElementById('adv-penalty-skip');
    if (penaltySkipBtn) penaltySkipBtn.onclick = () => {
      enc().penaltyDone = false;
      // Keep xpAwarded at 0, just re-render with continue button
      state.adventure.phase = 'result';
      // Mark as "dealt with" by setting penalty to null so re-render shows continue
      enc().penalty = null;
      persist();
      render();
    };
  }
}

function renderSummary() {
  const adv = state.adventure;
  const container = document.getElementById('adventure-container');

  let rowsHTML = '';
  for (const e of adv.encounters) {
    const icon = e.outcome === 'success' ? '&#9989;' : (e.penaltyDone ? '&#9876;' : '&#10060;');
    const statColor = STAT_COLORS[e.chosenStat] || '#888';
    const label = e.outcome === 'success' ? 'Passed' : (e.penaltyDone ? 'Recovered' : 'Failed');
    rowsHTML += `
      <div class="adv-summary-row">
        <span class="adv-summary-icon">${icon}</span>
        <span class="adv-summary-name">${e.title}</span>
        <span class="adv-summary-stat" style="color:${statColor}">${e.chosenStat}</span>
        <span class="adv-summary-label">${label}</span>
        <span class="adv-summary-xp" style="color:${statColor}">+${e.xpAwarded}</span>
      </div>
    `;
  }

  let totalHTML = 'Total: ';
  for (const [stat, xp] of Object.entries(adv.totalXP)) {
    totalHTML += `<span style="color:${STAT_COLORS[stat]}">+${xp} ${stat}</span> `;
  }

  const titleText = adv.perfectRun ? 'Flawless Victory!' : 'Adventure Complete';
  const titleColor = adv.perfectRun ? '#f5c842' : '#4ade80';
  const summaryText = adv.perfectRun
    ? 'Every challenge conquered. Your preparation paid off. Today, you are legendary.'
    : 'Another adventure in the books. Every step forward matters.';

  container.innerHTML = `
    <span class="adv-progress">Adventure Complete</span>
    <h2 class="adv-title" style="color:${titleColor}">${titleText}</h2>
    <p class="adv-narrative">${summaryText}</p>
    <div class="adv-summary-list">
      ${rowsHTML}
      <div class="adv-summary-total">
        ${adv.perfectRun ? '<div class="perfect-run-badge">PERFECT RUN! +50% BONUS</div>' : ''}
        ${totalHTML}
      </div>
    </div>
    <p class="master-advice">${adv.perfectRun ? 'The Master bows deeply. Your discipline has become your identity. Every habit, every choice, every recovery led to this moment.' : 'The Master places a hand on your shoulder. Growth is not measured by victories alone, but by the courage to face each challenge and rise from each fall.'}</p>
    <button class="adv-action-btn" id="adv-claim">Claim Rewards</button>
  `;

  document.getElementById('adv-claim').onclick = claimRewards;
}

// ═══════════ Gate Rendering ═══════════

export function renderAdventureGate() {
  const gate = document.getElementById('adventure-gate');
  if (!gate) return;

  if (adventureCompletedToday()) {
    gate.classList.remove('hidden');
    gate.innerHTML = '<div class="adv-complete-badge">&#9876; Adventure Complete Today &#9876;</div>';
  } else if (canStartAdventure()) {
    gate.classList.remove('hidden');
    gate.innerHTML = '<button id="begin-adventure-btn">&#9876; Begin Adventure &#9876;</button>';
    document.getElementById('begin-adventure-btn').addEventListener('click', startAdventure);
  } else {
    gate.classList.add('hidden');
  }
}

// ═══════════ Init ═══════════

export function initAdventure() {
  if (adventureInProgress()) {
    openOverlay();
    render();
  }
}
