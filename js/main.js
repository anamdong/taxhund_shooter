import { GAME_HEIGHT, GAME_WIDTH } from './config.js?v=20260421m';
import { AudioController } from './audio.js?v=20260421m';
import { Game } from './game.js?v=20260421m';
import { InputManager } from './input.js?v=20260421m';

const LANGUAGE_KEY = 'taxhund-language';
const LANGUAGE_COPY = {
  en: {
    documentTitle: 'Taxhund: 8-Bit Tax Barrage',
    langLabel: 'Language',
    hint: 'WASD Move · SPACE Shoot · E Bomb · ESC Pause',
    canvasLabel: 'Taxhund bullet hell game',
    titleButton: 'Return to Title',
  },
  ja: {
    documentTitle: 'Taxhund: 8ビット税務弾幕',
    langLabel: '言語',
    hint: 'WASD 移動 · SPACE ショット · E ボム · ESC ポーズ',
    canvasLabel: 'タックスフント 弾幕ゲーム',
    titleButton: 'タイトルへ戻る',
  },
};

const canvas = document.getElementById('game');
const sideHud = document.getElementById('side-hud');
const hudHearts = document.getElementById('hud-hearts');
const hudLifeLabel = document.getElementById('hud-life-label');
const hudBombLabel = document.getElementById('hud-bomb-label');
const hudBombValue = document.getElementById('hud-bomb-value');
const hudPowerLabel = document.getElementById('hud-power-label');
const hudPowerValue = document.getElementById('hud-power-value');
const hudScoreLabel = document.getElementById('hud-score-label');
const hudScoreValue = document.getElementById('hud-score-value');
const hudBossCard = document.getElementById('hud-boss-card');
const hudBossLabel = document.getElementById('hud-boss-label');
const hudBossFill = document.getElementById('hud-boss-fill');
const hint = document.querySelector('.hint');
const langLabel = document.getElementById('lang-label');
const langButtons = Array.from(document.querySelectorAll('.lang-button'));
const titleButton = document.getElementById('title-button');

function setMixedHudText(element, text) {
  element.textContent = '';
  const segments = text.match(/[ -~]+|[^ -~]+/g) ?? [text];
  for (const segment of segments) {
    const span = document.createElement('span');
    if (/^[ -~]+$/.test(segment)) {
      span.className = 'latin-text';
    }
    span.textContent = segment;
    element.appendChild(span);
  }
}
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

const input = new InputManager(window);
const audio = new AudioController();
const game = new Game(canvas, input, audio);

function readSavedLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY);
  } catch (_error) {
    return null;
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch (_error) {
    // Ignore storage failures in embedded browser contexts.
  }
}

function normalizeLanguage(language) {
  return language === 'ja' ? 'ja' : 'en';
}

function readQueryLanguage() {
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeLanguage(params.get('lang'));
  } catch (_error) {
    return null;
  }
}

function setLanguage(language) {
  const next = normalizeLanguage(language);
  const copy = LANGUAGE_COPY[next];

  document.documentElement.lang = next;
  document.title = copy.documentTitle;
  canvas.setAttribute('aria-label', copy.canvasLabel);
  langLabel.textContent = copy.langLabel;
  hint.textContent = copy.hint;
  titleButton.textContent = copy.titleButton;

  for (const button of langButtons) {
    const active = button.dataset.lang === next;
    if (active) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  }

  saveLanguage(next);
  game.setLanguage(next);
}

function handleLanguageChange(event) {
  const language = event.currentTarget.dataset.lang;
  saveLanguage(language);
}

for (const button of langButtons) {
  button.addEventListener('click', handleLanguageChange);
}

titleButton.addEventListener('click', () => {
  game.returnToTitle();
  syncOverlayUi();
});

function syncOverlayUi() {
  const paused = game.getState() === 'paused';
  titleButton.classList.toggle('hidden', !paused);
}

function syncHudUi() {
  const hud = game.getHudSnapshot();
  sideHud.classList.toggle('hidden', !hud.visible);
  if (!hud.visible) {
    return;
  }

  setMixedHudText(hudLifeLabel, hud.labels.life);
  setMixedHudText(hudBombLabel, hud.labels.bomb);
  setMixedHudText(hudPowerLabel, hud.labels.power);
  setMixedHudText(hudScoreLabel, hud.labels.score);
  hudBombValue.textContent = `${hud.bombs}`;
  hudPowerValue.textContent = `${hud.powerLevel}`;
  hudScoreValue.textContent = hud.score;

  hudHearts.textContent = '';
  for (let i = 0; i < hud.maxHp; i += 1) {
    const heart = document.createElement('span');
    heart.className = `hud-heart${i < hud.hp ? ' is-filled' : ''}`;
    for (let p = 0; p < 19; p += 1) {
      const pixel = document.createElement('span');
      pixel.className = `hud-heart-pixel p${p + 1}`;
      heart.appendChild(pixel);
    }
    hudHearts.appendChild(heart);
  }

  hudBossCard.classList.toggle('hidden', !hud.boss.visible);
  if (hud.boss.visible) {
    setMixedHudText(hudBossLabel, hud.boss.label);
    hudBossFill.style.width = `${Math.round(hud.boss.ratio * 100)}%`;
  }
}

function applyPixelPerfectScale() {
  const hudBaseWidth = 80;
  const hudGap = 10;
  const marginX = 20;
  const marginY = 132;
  const layoutWidth = GAME_WIDTH + hudBaseWidth + hudGap;
  const availableW = Math.max(layoutWidth, window.innerWidth - marginX);
  const availableH = Math.max(GAME_HEIGHT, window.innerHeight - marginY);
  const scale = Math.max(1, Math.floor(Math.min(availableW / layoutWidth, availableH / GAME_HEIGHT)));

  canvas.style.width = `${GAME_WIDTH * scale}px`;
  canvas.style.height = `${GAME_HEIGHT * scale}px`;
  document.documentElement.style.setProperty('--game-scale', String(scale));
}

applyPixelPerfectScale();
window.addEventListener('resize', applyPixelPerfectScale);

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audio.pauseBgm();
  }
});

setLanguage(readQueryLanguage() || readSavedLanguage() || 'en');
function startUiSyncLoop() {
  syncOverlayUi();
  syncHudUi();
  requestAnimationFrame(startUiSyncLoop);
}

startUiSyncLoop();
game.start();
