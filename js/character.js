import { LAYERS, PALETTES } from './sprites.js';
import { state } from './state.js';
import { daysSinceLastActive } from './progression.js';

const canvas = document.getElementById('character-canvas');
const ctx = canvas.getContext('2d');
const SIZE = 16;

function drawPixel(x, y, color) {
  const px = canvas.width / SIZE;
  ctx.fillStyle = color;
  ctx.fillRect(x * px, y * px, px, px);
}

function drawLayer(grid, palette) {
  const pal = PALETTES[palette];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const v = grid[y][x];
      if (v && pal[v]) {
        drawPixel(x, y, pal[v]);
      }
    }
  }
}

function drawBaseBody() {
  const layer = LAYERS.base;
  const { grid, colorMap } = layer;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const v = grid[y][x];
      if (!v) continue;
      // Determine which body part this row belongs to
      let palette = 'skin';
      for (const [, part] of Object.entries(colorMap)) {
        if (part.rows.includes(y)) {
          palette = part.palette;
          break;
        }
      }
      drawPixel(x, y, PALETTES[palette][1]);
    }
  }
}

function getEquipmentLayers() {
  const layers = [];
  const s = state.stats;

  // STR equipment
  if (s.STR.level >= 12) layers.push('gold_armor');
  else if (s.STR.level >= 7) layers.push('iron_armor');
  else if (s.STR.level >= 3) layers.push('leather_armor');

  // INT equipment
  if (s.INT.level >= 12) layers.push('wizard_hat');
  if (s.INT.level >= 7) layers.push('staff');
  else if (s.INT.level >= 3) layers.push('book');

  // CRE equipment
  if (s.CRE.level >= 3) layers.push('cloak');

  return layers;
}

function drawGlowEffect(color1, color2, radius) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function renderCharacter() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const s = state.stats;

  // VIT glow (behind character)
  if (s.VIT.level >= 5) {
    drawGlowEffect('rgba(74,222,128,0.12)', 'rgba(74,222,128,0)', 120);
  }

  // WIL glow (behind character)
  if (s.WIL.level >= 5) {
    drawGlowEffect('rgba(56,189,248,0.10)', 'rgba(56,189,248,0)', 100);
  }

  // CRE aura (level 7+)
  if (s.CRE.level >= 7) {
    const time = Date.now() / 1000;
    const colors = ['rgba(245,200,66,0.08)', 'rgba(233,69,96,0.08)', 'rgba(74,222,128,0.08)', 'rgba(108,99,255,0.08)'];
    const idx = Math.floor(time) % colors.length;
    drawGlowEffect(colors[idx], 'transparent', 130);
  }

  // Draw body layers
  drawBaseBody();
  drawLayer(LAYERS.face.grid, LAYERS.face.palette);
  drawLayer(LAYERS.hair.grid, LAYERS.hair.palette);
  drawLayer(LAYERS.arms.grid, LAYERS.arms.palette);

  // Draw equipment
  const equipment = getEquipmentLayers();
  for (const layerName of equipment) {
    const layer = LAYERS[layerName];
    drawLayer(layer.grid, layer.palette);
  }

  // Rust overlay if inactive 3+ days
  const rustEl = document.querySelector('.rust-overlay');
  if (rustEl) rustEl.remove();

  if (daysSinceLastActive() >= 3) {
    const panel = document.getElementById('character-panel');
    const overlay = document.createElement('div');
    overlay.className = 'rust-overlay';
    panel.insertBefore(overlay, panel.querySelector('#character-info'));
  }
}
