import {
  BOMB,
  BOSS_PHASES,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  ITEM_DROP,
  MAX_POWER_LEVEL,
  MIDBOSS_MAX_HP,
  PLAYER_BULLET_SPEED,
  PLAYER_INVINCIBLE_SECONDS,
  PLAYER_MAX_HP,
  PLAYER_SHOT_COOLDOWN,
  PLAYER_SPEED,
  PLAYER_START_BOMBS,
  POWER_THRESHOLDS,
  SCORE,
  SCREEN_SHAKE,
  STAGE_SEGMENTS,
  TILE_SIZE,
} from './config.js?v=20260421m';
import {
  spawnAimedBurst,
  spawnRadialRing,
} from './patterns.js?v=20260421m';
import {
  insertLeaderboardEntry,
  loadLeaderboard,
  qualifiesForLeaderboard,
} from './leaderboard.js?v=20260421m';
import { loadSpriteBank } from './sprites.js?v=20260421m';

const STATE = {
  TITLE: 'title',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  RESULTS: 'results',
};

const MAX_DT = 1 / 30;
const HUD_HEIGHT = 0;
const ARENA_TOP = 4;
const UI_FONT_FAMILY = '"Press Start 2P", monospace';
const UI_FONT_5 = `5px ${UI_FONT_FAMILY}`;
const JP_FONT_FAMILY = '"DotGothic16", sans-serif';
const UI_FONT_6 = `6px ${UI_FONT_FAMILY}`;
const UI_FONT_7 = `7px ${UI_FONT_FAMILY}`;
const UI_FONT_9 = `9px ${UI_FONT_FAMILY}`;
const UI_FONT_10 = `10px ${UI_FONT_FAMILY}`;
const TOP_BANNER_FONT = `12px ${JP_FONT_FAMILY}`;
const BOSS_ALERT_FONT = `22px ${JP_FONT_FAMILY}`;
const COIN_DRAW_SIZE = 16;
const TEXT = {
  en: {
    hud: {
      life: 'LIFE',
      bomb: 'BOMB (E)',
      power: 'POW',
      score: 'SCORE',
      boss: ({ phase }) => `BOSS ${phase}`,
    },
    overlay: {
      pausedTitle: 'PAUSED',
      pausedSubtitle: 'ESC / P to Resume',
      gameOverTitle: 'GAME OVER',
      gameOverLines: ['ENTER: Results', 'R: Retry   T: Title'],
    },
    title: {
      name: 'TAXHUND',
      subtitle: '16-BIT TAX BARRAGE',
      move: 'WASD: Move',
      shoot: 'SPACE: Shoot',
      bomb: 'E: Bomb',
      pause: 'ESC/P: Pause',
      collect: 'Collect Tax Coins for Power',
      items: 'Seolleongtang +1 HP  |  AED Full HP',
      enemy: 'Enemy: Crawfish',
      boss: 'Boss: Omnipotent Fish',
      loading: 'Loading sprites...',
      fallback: 'Sprite load fallback mode',
      pressStart: 'Press SPACE or ENTER',
      topEntry: ({ name, score }) => `TOP ${name.padEnd(3, ' ')} ${score}`,
    },
    results: {
      title: 'RESULTS',
      clear: 'STAGE CLEAR',
      gameOver: 'GAME OVER',
      finalScore: ({ score }) => `FINAL SCORE ${score}`,
      time: ({ seconds }) => `TIME ${seconds} sec`,
      newHighScore: 'NEW HIGH SCORE! ENTER NAME',
      confirmName: 'ENTER to confirm / BACKSPACE to edit',
      retryTitle: 'R: Retry   T or ENTER: Title',
      leaderboard: 'TOP 10 LEADERBOARD',
    },
    items: {
      taxChar: '税',
    },
    banners: {
      launch: 'Taxhund Sortie!',
      bomb: 'Bomb Deployed!',
      powerUp: ({ level }) => `Firepower Up: Lv${level}`,
      soup: 'Seolleongtang: HP +1',
      aed: 'AED: Full HP',
      playerHit: 'Hit! Brief Invincibility',
      playerDown: 'Taxhund Down',
      midbossDown: 'Midboss Down!',
      midbossAdvance: 'Midboss Down! Adds Incoming',
      bossApproach: 'Warning: Boss Near',
      bossPhase: ({ phase }) => `Boss Phase ${phase}`,
      bossDown: 'Omnipotent Fish Down!',
    },
    stage: {
      intro: 'Opening: Contact',
      waves: 'Midgame: Waves',
      midboss: 'Midboss: Crawfish',
      pressure: 'Endgame: Assault',
      boss: 'Final Boss: Fish',
    },
    alerts: {
      midboss: 'Midboss Incoming',
      boss: 'Boss Incoming',
    },
  },
  ja: {
    hud: {
      life: 'HP',
      bomb: 'ボム (E)',
      power: '火力',
      score: '得点',
      boss: ({ phase }) => `ボス ${phase}`,
    },
    overlay: {
      pausedTitle: '一時停止',
      pausedSubtitle: 'ESC / P で再開',
      gameOverTitle: 'ゲームオーバー',
      gameOverLines: ['ENTER: 結果', 'R: Retry   T: タイトル'],
    },
    title: {
      name: 'TAXHUND',
      subtitle: '16ビット税弾幕',
      move: 'WASD: 移動',
      shoot: 'SPACE: ショット',
      bomb: 'E: ボム',
      pause: 'ESC/P: ポーズ',
      collect: '税コインで火力アップ',
      items: 'ソルロンタン +1HP | AED 全回復',
      enemy: '敵: ザリガニ',
      boss: 'ボス: 全知全能の魚',
      loading: 'スプライト読込中...',
      fallback: '簡易表示モード',
      pressStart: 'Press SPACE or ENTER',
      topEntry: ({ name, score }) => `最高 ${name.padEnd(3, ' ')} ${score}`,
    },
    results: {
      title: '結果',
      clear: 'ステージクリア',
      gameOver: 'ゲームオーバー',
      finalScore: ({ score }) => `最終得点 ${score}`,
      time: ({ seconds }) => `${seconds} 秒`,
      newHighScore: 'ハイスコア! 名前入力',
      confirmName: 'ENTER 決定 / BS 修正',
      retryTitle: 'R: Retry   T/ENTER: タイトル',
      leaderboard: 'トップ10 スコア',
    },
    items: {
      taxChar: '税',
    },
    banners: {
      launch: 'タックスフント出撃!',
      bomb: 'ボム発動!',
      powerUp: ({ level }) => `火力上昇: Lv${level}`,
      soup: 'ソルロンタン: HP+1',
      aed: 'AED: HP全回復',
      playerHit: '被弾! 短時間無敵',
      playerDown: 'タックスフント撃墜',
      midbossDown: '中ボス撃破!',
      midbossAdvance: '中ボス撃破! 増援接近',
      bossApproach: '警戒: ボス接近',
      bossPhase: ({ phase }) => `ボス第${phase}形態`,
      bossDown: '全知全能の魚撃破!',
    },
    stage: {
      intro: '序盤: 警戒開始',
      waves: '中盤: 敵波来襲',
      midboss: '中ボス: ザリガニ',
      pressure: '終盤: 猛攻開始',
      boss: '最終ボス: 全知全能の魚',
    },
    alerts: {
      midboss: '巨大ザリガニ襲来',
      boss: '全知全能の魚襲来',
    },
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distSq(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function scoreText(value) {
  return Math.max(0, Math.floor(value)).toString().padStart(8, '0');
}

function resolveText(path, locale) {
  return path.split('.').reduce((value, key) => value?.[key], locale);
}

function resizeSpriteNearestNeighbor(source, width, height) {
  if (!source) {
    return null;
  }

  if (source.width === width && source.height === height) {
    return source;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);

  return canvas;
}

function segmentForTime(stageTime) {
  if (stageTime < STAGE_SEGMENTS.intro) {
    return 'intro';
  }
  if (stageTime < STAGE_SEGMENTS.intro + STAGE_SEGMENTS.waves) {
    return 'waves';
  }
  if (stageTime < STAGE_SEGMENTS.intro + STAGE_SEGMENTS.waves + STAGE_SEGMENTS.midboss) {
    return 'midboss';
  }
  if (
    stageTime <
    STAGE_SEGMENTS.intro +
      STAGE_SEGMENTS.waves +
      STAGE_SEGMENTS.midboss +
      STAGE_SEGMENTS.pressure
  ) {
    return 'pressure';
  }
  return 'boss';
}

export class Game {
  constructor(canvas, input, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;

    this.input = input;
    this.audio = audio;
    this.locale = 'en';

    this.state = STATE.TITLE;
    this.lastTimestamp = 0;

    this.bgTiles = this.createBackgroundTiles();
    this.skyStars = this.createStarfield();
    this.backgroundScroll = 0;

    this.sprites = {};
    this.spritesReady = false;
    this.spritesFailed = false;
    this.scaledSpriteCache = new Map();

    this.hurtOverlay = 0;
    this.shakeTime = 0;
    this.shakeStrength = 0;

    this.banner = null;
    this.bossAlert = null;
    this.gameOverElapsed = 0;

    this.leaderboard = loadLeaderboard();
    this.awaitingName = false;
    this.nameBuffer = 'DOG';
    this.lastResultCleared = false;
    this.lastResultScore = 0;
    this.lastResultTime = 0;
    this.savedEntry = null;

    this.resetRunState();
    this.loadSprites();

    this.loop = this.loop.bind(this);
  }

  resetRunState() {
    this.player = {
      x: GAME_WIDTH * 0.5,
      y: GAME_HEIGHT - 34,
      radius: 2,
      hp: PLAYER_MAX_HP,
      maxHp: PLAYER_MAX_HP,
      bombs: PLAYER_START_BOMBS,
      invincible: 0,
      shootTimer: 0,
      coins: 0,
      powerLevel: 0,
      blink: 0,
      moveX: 0,
      walkCycle: 0,
    };

    this.score = 0;
    this.stageTime = 0;
    this.currentSegment = 'intro';

    this.spawnTimers = {
      intro: 0.7,
      waves: 0.8,
      pressure: 0.55,
      breatherShown: false,
      midbossClearAdvanced: false,
      midbossIntroDone: false,
      midbossSpawnDelay: 0,
      bossIntroDone: false,
      bossSpawnDelay: 0,
    };

    this.wavePatternIndex = 0;

    this.playerBullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.items = [];
    this.effects = [];

    this.midbossSpawned = false;
    this.midbossDefeated = false;

    this.bossSpawned = false;
    this.boss = null;

    this.clearCountdown = 0;
    this.runCleared = false;
  }

  async loadSprites() {
    try {
      this.sprites = await loadSpriteBank();
      this.spritesReady = true;
    } catch (_err) {
      this.sprites = {};
      this.spritesReady = true;
      this.spritesFailed = true;
    }
  }

  createBackgroundTiles() {
    const rows = Math.ceil(GAME_HEIGHT / TILE_SIZE) + 16;
    const cols = Math.ceil(GAME_WIDTH / TILE_SIZE);
    const tiles = [];

    for (let row = 0; row < rows; row += 1) {
      const line = [];
      for (let col = 0; col < cols; col += 1) {
        const noise = (row * 13 + col * 17 + row * col * 7) % 9;
        line.push(noise < 2 ? 2 : noise < 5 ? 1 : 0);
      }
      tiles.push(line);
    }

    return tiles;
  }

  createStarfield() {
    const stars = [];
    for (let i = 0; i < 48; i += 1) {
      const x = (i * 43) % GAME_WIDTH;
      const y = (i * 57 + i * i * 11) % GAME_HEIGHT;
      stars.push({
        x,
        y,
        speed: 0.3 + (i % 5) * 0.17,
        color: i % 3 === 0 ? '#aee8ff' : i % 3 === 1 ? '#d5f3ff' : '#8dc4ff',
      });
    }
    return stars;
  }

  getSprite(key) {
    return this.sprites?.[key] ?? null;
  }

  getState() {
    return this.state;
  }

  getHudSnapshot() {
    const visible = this.state !== STATE.TITLE && this.state !== STATE.RESULTS;
    const bossVisible = Boolean(this.boss && !this.boss.defeated);

    return {
      visible,
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      bombs: this.player.bombs,
      powerLevel: this.player.powerLevel,
      score: scoreText(this.score),
      labels: {
        life: this.text('hud.life'),
        bomb: this.text('hud.bomb'),
        power: this.text('hud.power'),
        score: this.text('hud.score'),
      },
      boss: {
        visible: bossVisible,
        label: this.text('hud.boss', { phase: (this.boss?.phase ?? 0) + 1 }),
        ratio: bossVisible ? clamp(this.boss.phaseHp / this.boss.phaseMaxHp, 0, 1) : 0,
      },
    };
  }

  returnToTitle() {
    this.state = STATE.TITLE;
    this.audio.stopBgm();
    this.banner = null;
    this.bossAlert = null;
    this.gameOverElapsed = 0;
  }

  setLanguage(language) {
    this.locale = language === 'ja' ? 'ja' : 'en';
  }

  text(path, params = {}) {
    const value =
      resolveText(path, TEXT[this.locale]) ??
      resolveText(path, TEXT.en);

    if (typeof value === 'function') {
      return value(params);
    }

    return value ?? '';
  }

  uiFont(size) {
    if (this.locale === 'ja') {
      return `${size + 2}px ${JP_FONT_FAMILY}`;
    }
    switch (size) {
      case 5:
        return UI_FONT_5;
      case 6:
        return UI_FONT_6;
      case 7:
        return UI_FONT_7;
      case 9:
        return UI_FONT_9;
      case 10:
        return UI_FONT_10;
      default:
        return `${size}px ${UI_FONT_FAMILY}`;
    }
  }

  bannerFont() {
    return this.locale === 'ja' ? TOP_BANNER_FONT : UI_FONT_6;
  }

  alertFont() {
    return this.locale === 'ja' ? BOSS_ALERT_FONT : UI_FONT_10;
  }

  getScaledSprite(key, width, height) {
    const sprite = this.getSprite(key);
    if (!sprite) {
      return null;
    }

    const cacheKey = `${key}:${width}x${height}`;
    const cached = this.scaledSpriteCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const scaled = resizeSpriteNearestNeighbor(sprite, width, height);
    this.scaledSpriteCache.set(cacheKey, scaled);
    return scaled;
  }

  drawSpriteCentered(key, x, y, w, h, options = {}) {
    const width = Math.max(1, Math.round(w));
    const height = Math.max(1, Math.round(h));
    const sprite = this.getScaledSprite(key, width, height);
    if (!sprite) {
      return false;
    }

    const { alpha = 1, rotation = 0, flipX = false } = options;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }
    if (flipX) {
      ctx.scale(-1, 1);
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, Math.round(-width * 0.5), Math.round(-height * 0.5));
    ctx.restore();
    return true;
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  startNewRun() {
    this.resetRunState();
    this.state = STATE.PLAYING;
    this.backgroundScroll = 0;
    this.hurtOverlay = 0;
    this.gameOverElapsed = 0;
    this.audio.stopBgm();
    this.audio.playBgm();
    this.showBannerLocalized('banners.launch', 1.6);
  }

  loop(timestamp) {
    const dt = this.lastTimestamp ? Math.min((timestamp - this.lastTimestamp) / 1000, MAX_DT) : 1 / 60;
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.render();

    this.input.endFrame();
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.hurtOverlay = Math.max(0, this.hurtOverlay - dt);
    this.shakeTime = Math.max(0, this.shakeTime - dt);
    if (this.shakeTime <= 0) {
      this.shakeStrength = 0;
    }
    if (this.banner) {
      this.banner.time -= dt;
      if (this.banner.time <= 0) {
        this.banner = null;
      }
    }
    if (this.bossAlert) {
      this.bossAlert.time -= dt;
      if (this.bossAlert.time <= 0) {
        this.bossAlert = null;
      }
    }

    if (this.state === STATE.TITLE) {
      this.backgroundScroll += dt * 10;
      if (this.input.consumePress('Space') || this.input.consumePress('Enter')) {
        this.startNewRun();
      }
      return;
    }

    if (this.state === STATE.PAUSED) {
      if (this.input.consumePress('Escape') || this.input.consumePress('KeyP')) {
        this.state = STATE.PLAYING;
        this.audio.playBgm();
      }
      return;
    }

    if (this.state === STATE.GAME_OVER) {
      this.gameOverElapsed += dt;
      if (this.input.consumePress('KeyR')) {
        this.startNewRun();
      } else if (this.input.consumePress('Enter')) {
        this.prepareResults(false);
      } else if (this.input.consumePress('KeyT')) {
        this.state = STATE.TITLE;
        this.audio.stopBgm();
      }
      return;
    }

    if (this.state === STATE.RESULTS) {
      this.updateResultsInput();
      return;
    }

    if (this.state !== STATE.PLAYING) {
      return;
    }

    if (this.input.consumePress('Escape') || this.input.consumePress('KeyP')) {
      this.state = STATE.PAUSED;
      this.audio.pauseBgm();
      return;
    }

    this.backgroundScroll += dt * 20;
    this.stageTime += dt;

    this.updatePlayer(dt);
    this.updateStage(dt);
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateBullets(dt);
    this.updateItems(dt);
    this.updateEffects(dt);

    this.handleCollisions();
    this.cleanupEntities();

    if (this.clearCountdown > 0) {
      this.clearCountdown -= dt;
      if (this.clearCountdown <= 0) {
        this.prepareResults(true);
      }
    }
  }

  updateResultsInput() {
    if (this.awaitingName) {
      const tokens = this.input.consumeText();
      for (const token of tokens) {
        if (token === '{backspace}') {
          this.nameBuffer = this.nameBuffer.slice(0, -1);
          continue;
        }
        if (token === '{enter}') {
          if (this.nameBuffer.trim().length > 0) {
            this.commitLeaderboardName();
          }
          continue;
        }

        if (/^[a-zA-Z0-9 ]$/.test(token) && this.nameBuffer.length < 8) {
          this.nameBuffer += token.toUpperCase();
        }
      }
      return;
    }

    if (this.input.consumePress('KeyR') || this.input.consumePress('Space')) {
      this.startNewRun();
    } else if (this.input.consumePress('KeyT') || this.input.consumePress('Enter')) {
      this.state = STATE.TITLE;
      this.audio.stopBgm();
    }
  }

  commitLeaderboardName() {
    const finalName = this.nameBuffer.trim().length ? this.nameBuffer.trim().toUpperCase() : 'DOG';
    this.leaderboard = insertLeaderboardEntry(this.leaderboard, finalName, this.lastResultScore);
    this.savedEntry = { name: finalName, score: this.lastResultScore };
    this.awaitingName = false;
  }

  prepareResults(cleared) {
    this.audio.pauseBgm();
    this.lastResultCleared = cleared;
    this.lastResultScore = this.score;
    this.lastResultTime = this.stageTime;

    this.leaderboard = loadLeaderboard();
    this.awaitingName = qualifiesForLeaderboard(this.lastResultScore, this.leaderboard);
    this.nameBuffer = 'DOG';

    if (!this.awaitingName) {
      this.savedEntry = null;
    }

    this.state = STATE.RESULTS;
  }

  showBanner(text, duration = 1.5, color = COLORS.hudAccent) {
    this.banner = { text, time: duration, max: duration, color };
  }

  showBannerLocalized(path, duration = 1.5, color = COLORS.hudAccent, params = {}) {
    this.banner = { textPath: path, params, time: duration, max: duration, color };
  }

  showBossAlert(text, duration = 1.8, color = '#9edbff') {
    this.bossAlert = { text, time: duration, max: duration, color };
  }

  showBossAlertLocalized(path, duration = 1.8, color = '#9edbff', params = {}) {
    this.bossAlert = { textPath: path, params, time: duration, max: duration, color };
  }

  pickDispersedLanes(count, minX = 34, maxX = GAME_WIDTH - 34, minGap = 34) {
    const lanes = [];
    const left = Math.max(14, minX);
    const right = Math.min(GAME_WIDTH - 14, maxX);

    let attempts = 0;
    while (lanes.length < count && attempts < 240) {
      attempts += 1;

      // Average of two randoms gives a gentle center bias (fewer edge-only columns).
      const t = (Math.random() + Math.random()) * 0.5;
      const x = left + t * (right - left);

      if (lanes.every((lx) => Math.abs(lx - x) >= minGap)) {
        lanes.push(x);
      }
    }

    while (lanes.length < count) {
      lanes.push(rand(left, right));
    }

    return lanes.sort((a, b) => a - b);
  }

  triggerShake(strength, duration = 0.2) {
    this.shakeStrength = Math.max(this.shakeStrength, strength);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  updatePlayer(dt) {
    const player = this.player;

    let dx = 0;
    let dy = 0;

    if (this.input.isDown('KeyA') || this.input.isDown('ArrowLeft')) {
      dx -= 1;
    }
    if (this.input.isDown('KeyD') || this.input.isDown('ArrowRight')) {
      dx += 1;
    }
    if (this.input.isDown('KeyW') || this.input.isDown('ArrowUp')) {
      dy -= 1;
    }
    if (this.input.isDown('KeyS') || this.input.isDown('ArrowDown')) {
      dy += 1;
    }

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;
      player.x += dx * PLAYER_SPEED * dt;
      player.y += dy * PLAYER_SPEED * dt;
      player.walkCycle += dt * 12;
    }

    player.moveX = dx;

    player.x = clamp(player.x, 10, GAME_WIDTH - 10);
    player.y = clamp(player.y, ARENA_TOP + 10, GAME_HEIGHT - 8);

    player.invincible = Math.max(0, player.invincible - dt);
    player.blink += dt * 16;

    player.shootTimer -= dt;
    if (this.input.isDown('Space') && player.shootTimer <= 0) {
      this.spawnPlayerShot();
      player.shootTimer = PLAYER_SHOT_COOLDOWN;
    }

    if (this.input.consumePress('KeyE')) {
      this.useBomb();
    }
  }

  spawnPlayerShot() {
    const player = this.player;
    const patterns = [
      [{ offsetX: 0, vx: 0, damage: 16 }],
      [
        { offsetX: -3, vx: -10, damage: 14 },
        { offsetX: 3, vx: 10, damage: 14 },
      ],
      [
        { offsetX: 0, vx: 0, damage: 14 },
        { offsetX: -6, vx: -18, damage: 11 },
        { offsetX: 6, vx: 18, damage: 11 },
      ],
      [
        { offsetX: -4, vx: -8, damage: 14 },
        { offsetX: 4, vx: 8, damage: 14 },
        { offsetX: -10, vx: -28, damage: 10 },
        { offsetX: 10, vx: 28, damage: 10 },
      ],
      [
        { offsetX: 0, vx: 0, damage: 15 },
        { offsetX: -5, vx: -10, damage: 12 },
        { offsetX: 5, vx: 10, damage: 12 },
        { offsetX: -11, vx: -32, damage: 9 },
        { offsetX: 11, vx: 32, damage: 9 },
      ],
    ];

    const pattern = patterns[player.powerLevel] || patterns[0];

    for (const lane of pattern) {
      this.playerBullets.push({
        x: player.x + lane.offsetX,
        y: player.y - 6,
        vx: lane.vx,
        vy: -PLAYER_BULLET_SPEED,
        radius: 2,
        damage: lane.damage,
      });
    }
  }

  useBomb() {
    if (this.player.bombs <= 0) {
      return;
    }

    this.player.bombs -= 1;
    const px = this.player.x;
    const py = this.player.y;

    this.effects.push({
      type: 'bomb',
      x: px,
      y: py,
      time: 0.48,
      max: 0.48,
      radius: BOMB.radius,
    });

    this.triggerShake(SCREEN_SHAKE.bomb, 0.3);
    this.showBannerLocalized('banners.bomb', 0.7);

    this.enemyBullets = this.enemyBullets.filter((bullet) => {
      const inside = distSq(bullet.x, bullet.y, px, py) <= BOMB.radius * BOMB.radius;
      return !inside;
    });

    for (const enemy of this.enemies) {
      if (!enemy.dead && distSq(enemy.x, enemy.y, px, py) <= (BOMB.radius + enemy.radius) ** 2) {
        this.damageEnemy(enemy, BOMB.damage);
      }
    }

    if (this.boss && this.boss.invuln <= 0) {
      const inBossRange = distSq(this.boss.x, this.boss.y, px, py) <= (BOMB.radius + 16) ** 2;
      if (inBossRange) {
        this.damageBoss(BOMB.damage * 0.8);
      }
    }
  }

  updateStage(dt) {
    const nextSegment = segmentForTime(this.stageTime);
    if (nextSegment !== this.currentSegment) {
      this.currentSegment = nextSegment;
      this.showBannerLocalized(`stage.${nextSegment}`, 1.8);
    }

    if (nextSegment !== 'midboss') {
      const midboss = this.enemies.find((enemy) => enemy.kind === 'midboss' && !enemy.dead);
      if (midboss && !this.midbossDefeated && nextSegment === 'pressure') {
        midboss.retreat = true;
      }
      if (midboss && nextSegment === 'boss') {
        midboss.dead = true;
      }
    }

    if (nextSegment === 'intro') {
      this.updateIntroSegment(dt);
      return;
    }

    if (nextSegment === 'waves') {
      this.updateWaveSegment(dt);
      return;
    }

    if (nextSegment === 'midboss') {
      this.updateMidbossSegment(dt);
      return;
    }

    if (nextSegment === 'pressure') {
      this.updatePressureSegment(dt);
      return;
    }

    if (!this.bossSpawned) {
      if (!this.spawnTimers.bossIntroDone) {
        this.spawnTimers.bossIntroDone = true;
        this.spawnTimers.bossSpawnDelay = 1.5;
        this.showBossAlertLocalized('alerts.boss', 1.85, '#9be6ff');
        return;
      }
      if (this.spawnTimers.bossSpawnDelay > 0) {
        this.spawnTimers.bossSpawnDelay -= dt;
        return;
      }
      this.spawnBoss();
      this.bossSpawned = true;
    }
  }

  updateIntroSegment(dt) {
    this.spawnTimers.intro -= dt;
    if (this.spawnTimers.intro <= 0) {
      const introProgress = clamp(this.stageTime / STAGE_SEGMENTS.intro, 0, 1);
      const waveLevel = Math.floor(introProgress * 3);

      if (waveLevel === 0) {
        this.spawnTimers.intro = 1.45;
        this.spawnCrawfish('drifter', rand(24, GAME_WIDTH - 24), -10, {
          hpScale: 1.15,
        });
      } else if (waveLevel === 1) {
        this.spawnTimers.intro = 1.2;
        this.spawnCrawfish('drifter', rand(22, GAME_WIDTH - 22), -10, {
          hpScale: 1.2,
          fireRateScale: 0.95,
        });
        if (Math.random() < 0.55) {
          this.spawnCrawfish('zigzag', rand(30, GAME_WIDTH - 30), -22, {
            hpScale: 1.1,
            speedScale: 1.05,
          });
        }
      } else {
        this.spawnTimers.intro = 1.05;

        const xA = rand(34, GAME_WIDTH - 34);
        let xB = rand(34, GAME_WIDTH - 34);
        if (Math.abs(xA - xB) < 34) {
          xB = clamp(xB + (xB < GAME_WIDTH * 0.5 ? -32 : 32), 28, GAME_WIDTH - 28);
        }

        this.spawnCrawfish('drifter', xA, -10, {
          hpScale: 1.25,
          fireRateScale: 0.88,
        });

        if (Math.random() < 0.55) {
          this.spawnCrawfish('drifter', xB, -24, {
            hpScale: 1.25,
            fireRateScale: 0.88,
          });
        }

        if (Math.random() < 0.65) {
          this.spawnCrawfish('zigzag', rand(28, GAME_WIDTH - 28), -34, {
            hpScale: 1.18,
            speedScale: 1.08,
          });
        }
      }
    }
  }

  updateWaveSegment(dt) {
    this.spawnTimers.waves -= dt;
    if (this.spawnTimers.waves <= 0) {
      this.spawnTimers.waves = 1.08;
      this.spawnWavePattern(this.wavePatternIndex);
      this.wavePatternIndex += 1;
    }
  }

  updateMidbossSegment(dt) {
    if (!this.midbossSpawned && !this.midbossDefeated) {
      if (!this.spawnTimers.midbossIntroDone) {
        this.spawnTimers.midbossIntroDone = true;
        this.spawnTimers.midbossSpawnDelay = 1.2;
        this.showBossAlertLocalized('alerts.midboss', 1.5, '#ffba9d');
        return;
      }
      if (this.spawnTimers.midbossSpawnDelay > 0) {
        this.spawnTimers.midbossSpawnDelay -= dt;
        return;
      }
      this.spawnMidboss();
      this.midbossSpawned = true;
      return;
    }

    if (this.midbossDefeated && !this.spawnTimers.midbossClearAdvanced) {
      const pressureStart = STAGE_SEGMENTS.intro + STAGE_SEGMENTS.waves + STAGE_SEGMENTS.midboss;
      this.stageTime = Math.max(this.stageTime, pressureStart + 0.05);
      this.spawnTimers.midbossClearAdvanced = true;
      this.spawnTimers.pressure = 0.2;
      this.showBannerLocalized('banners.midbossAdvance', 1.4, '#ffd89f');
    }
  }

  updatePressureSegment(dt) {
    const pressureStart = STAGE_SEGMENTS.intro + STAGE_SEGMENTS.waves + STAGE_SEGMENTS.midboss;
    const elapsed = this.stageTime - pressureStart;

    if (elapsed > STAGE_SEGMENTS.pressure - 8) {
      if (!this.spawnTimers.breatherShown) {
        this.showBannerLocalized('banners.bossApproach', 1.6, '#f7de8f');
        this.spawnTimers.breatherShown = true;
      }
      return;
    }

    this.spawnTimers.pressure -= dt;
    if (this.spawnTimers.pressure <= 0) {
      this.spawnTimers.pressure = 0.92;
      const pattern = this.wavePatternIndex + 2;
      this.spawnWavePattern(pattern, true);
      this.wavePatternIndex += 1;
    }
  }

  spawnWavePattern(index, isPressure = false) {
    const pressureStats = isPressure
      ? { hpScale: 1.72, speedScale: 1.08, fireRateScale: 0.78, firePower: 1.28, powered: true }
      : { hpScale: 1.0, speedScale: 1.0, fireRateScale: 1.0, firePower: 1.0 };

    switch (index % 5) {
      case 0: {
        const count = isPressure ? 3 : 4;
        const lanes = this.pickDispersedLanes(
          count,
          isPressure ? 44 : 34,
          isPressure ? GAME_WIDTH - 44 : GAME_WIDTH - 34,
          isPressure ? 40 : 34,
        );
        for (let i = 0; i < lanes.length; i += 1) {
          this.spawnCrawfish('drifter', lanes[i], -14 - i * 14, pressureStats);
        }
        break;
      }
      case 1: {
        // Side divers are alternated to avoid impossible simultaneous left/right columns.
        const spawnLeft = index % 2 === 0;
        if (spawnLeft || isPressure) {
          this.spawnCrawfish('diver', -10, 56, {
            vx: isPressure ? 58 : 44,
            ...pressureStats,
          });
        }
        if (!spawnLeft || (isPressure && Math.random() < 0.42)) {
          this.spawnCrawfish('diver', GAME_WIDTH + 10, 66, {
            vx: isPressure ? -58 : -44,
            ...pressureStats,
          });
        }
        this.spawnCrawfish('zigzag', rand(38, GAME_WIDTH - 38), -14, pressureStats);
        break;
      }
      case 2: {
        const lanes = this.pickDispersedLanes(2, 40, GAME_WIDTH - 40, 54);
        this.spawnCrawfish('zigzag', lanes[0], -10, { seed: 0.2 + rand(-0.25, 0.25), ...pressureStats });
        this.spawnCrawfish('zigzag', lanes[1], -24, { seed: 2.8 + rand(-0.25, 0.25), ...pressureStats });
        this.spawnCrawfish('drifter', rand(46, GAME_WIDTH - 46), -36, pressureStats);
        break;
      }
      case 3: {
        if (isPressure) {
          const lanes = this.pickDispersedLanes(2, 44, GAME_WIDTH - 44, 56);
          this.spawnCrawfish('turret', lanes[0], -8, {
            stopY: 66,
            ...pressureStats,
          });
          this.spawnCrawfish('turret', lanes[1], -56, {
            stopY: 74,
            ...pressureStats,
          });
        } else {
          const lane = this.pickDispersedLanes(1, 42, GAME_WIDTH - 42, 40)[0];
          this.spawnCrawfish('turret', lane, -8, {
            stopY: 76,
            ...pressureStats,
          });
          this.spawnCrawfish('zigzag', rand(40, GAME_WIDTH - 40), -24, pressureStats);
        }
        break;
      }
      default: {
        this.spawnCrawfish('elite', GAME_WIDTH * 0.5, -12, pressureStats);
        this.spawnCrawfish('diver', -10, 72, {
          vx: isPressure ? 62 : 50,
          vy: isPressure ? 42 : 38,
          ...pressureStats,
        });
        this.spawnCrawfish('diver', GAME_WIDTH + 10, 52, {
          vx: isPressure ? -62 : -50,
          vy: isPressure ? 42 : 38,
          ...pressureStats,
        });
        break;
      }
    }
  }

  spawnCrawfish(kind, x, y, options = {}) {
    const presets = {
      drifter: {
        hp: 50,
        radius: 6,
        score: SCORE.enemySmall,
        vy: 28,
        fireRate: 1.9,
      },
      zigzag: {
        hp: 48,
        radius: 6,
        score: SCORE.enemyFast,
        vy: 33,
        fireRate: 1.7,
      },
      diver: {
        hp: 42,
        radius: 6,
        score: SCORE.enemyFast,
        vy: 44,
        fireRate: 9,
      },
      turret: {
        hp: 86,
        radius: 7,
        score: SCORE.enemyTurret,
        vy: 26,
        fireRate: 2.2,
      },
      elite: {
        hp: 160,
        radius: 8,
        score: SCORE.enemyElite,
        vy: 20,
        fireRate: 1.1,
      },
    };

    const preset = presets[kind];
    if (!preset) {
      return;
    }

    const hpScale =
      options.hpScale ?? (this.currentSegment === 'pressure' ? 1.35 : this.currentSegment === 'waves' ? 1.08 : 1);
    const speedScale = options.speedScale ?? (this.currentSegment === 'pressure' ? 1.12 : 1);
    const fireRateScale =
      options.fireRateScale ?? (this.currentSegment === 'pressure' ? 0.78 : this.currentSegment === 'waves' ? 0.95 : 1);
    const firePower = options.firePower ?? (this.currentSegment === 'pressure' ? 1.15 : 1);
    const baseHp = Math.floor(preset.hp * hpScale);
    const fireRate = Math.max(0.28, preset.fireRate * fireRateScale);
    const powered = options.powered ?? hpScale >= 1.35;

    this.enemies.push({
      kind,
      x,
      y,
      vx: options.vx ?? 0,
      vy: (options.vy ?? preset.vy) * speedScale,
      hp: baseHp,
      maxHp: baseHp,
      radius: preset.radius,
      score: preset.score,
      seed: options.seed ?? rand(0, Math.PI * 2),
      stopY: options.stopY ?? rand(64, 94),
      fireTimer: rand(0.2, fireRate),
      fireRate,
      firePower,
      powered,
      age: 0,
      fired: false,
      flash: 0,
      dead: false,
    });
  }

  spawnMidboss() {
    this.enemies.push({
      kind: 'midboss',
      x: GAME_WIDTH * 0.5,
      y: -22,
      vx: 0,
      vy: 20,
      hp: MIDBOSS_MAX_HP,
      maxHp: MIDBOSS_MAX_HP,
      radius: 12,
      score: SCORE.midboss,
      fireTimerA: 1.2,
      fireTimerB: 0.6,
      fireTimerC: 2.5,
      rotation: 0,
      age: 0,
      dead: false,
      flash: 0,
      isMidboss: true,
      retreat: false,
    });
  }

  spawnBoss() {
    this.boss = {
      x: GAME_WIDTH * 0.5,
      y: -34,
      targetY: 56,
      age: 0,
      radius: 15,
      phase: 0,
      phaseHp: BOSS_PHASES[0],
      phaseMaxHp: BOSS_PHASES[0],
      invuln: 1.4,
      timers: { a: 0.8, b: 2.4, c: 1.2 },
      rotation: 0,
      flash: 0,
      defeated: false,
    };
  }

  updateEnemies(dt) {
    for (const enemy of this.enemies) {
      if (enemy.dead) {
        continue;
      }

      enemy.age += dt;
      enemy.flash = Math.max(0, enemy.flash - dt);

      if (enemy.kind === 'midboss') {
        this.updateMidboss(enemy, dt);
      } else {
        this.updateCrawfish(enemy, dt);
      }

      if (enemy.hp <= 0 && !enemy.dead) {
        this.killEnemy(enemy);
      }

      if (enemy.x < -32 || enemy.x > GAME_WIDTH + 32 || enemy.y > GAME_HEIGHT + 28 || enemy.y < -40) {
        enemy.dead = true;
      }
    }
  }

  updateCrawfish(enemy, dt) {
    const fp = enemy.firePower ?? 1;
    const spawnForward = this.spawnCrawfishBullet.bind(this);

    if (enemy.kind === 'drifter') {
      enemy.y += enemy.vy * dt;
      enemy.fireTimer -= dt;
      if (enemy.fireTimer <= 0 && enemy.y > ARENA_TOP + 14) {
        spawnAimedBurst({
          spawnBullet: spawnForward,
          fromX: enemy.x,
          fromY: enemy.y,
          targetX: this.player.x,
          targetY: this.player.y,
          count: fp > 1.1 ? 3 : 2,
          spread: 0.14,
          speed: 62 * fp,
          color: 'bulletB',
          shape: 'needle',
        });
        enemy.fireTimer = enemy.fireRate;
      }
      return;
    }

    if (enemy.kind === 'zigzag') {
      enemy.y += enemy.vy * dt;
      enemy.x += Math.sin(enemy.age * 4.1 + enemy.seed) * 42 * dt;
      enemy.fireTimer -= dt;
      if (enemy.fireTimer <= 0 && enemy.y > ARENA_TOP + 10) {
        spawnAimedBurst({
          spawnBullet: spawnForward,
          fromX: enemy.x,
          fromY: enemy.y,
          targetX: this.player.x,
          targetY: this.player.y,
          count: fp > 1.1 ? 4 : 3,
          spread: 0.24,
          speed: 66 * fp,
          color: 'bulletC',
          shape: 'round',
        });
        enemy.fireTimer = enemy.fireRate;
      }
      return;
    }

    if (enemy.kind === 'diver') {
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      enemy.fireTimer -= dt;
      if (!enemy.fired && enemy.y > ARENA_TOP + 18) {
        spawnAimedBurst({
          spawnBullet: spawnForward,
          fromX: enemy.x,
          fromY: enemy.y,
          targetX: this.player.x,
          targetY: this.player.y,
          count: fp > 1.1 ? 4 : 3,
          spread: 0.3,
          speed: 74 * fp,
          color: 'bulletB',
          shape: 'needle',
        });
        enemy.fired = true;
      }
      return;
    }

    if (enemy.kind === 'turret') {
      if (enemy.y < enemy.stopY) {
        enemy.y += enemy.vy * dt;
      }

      enemy.fireTimer -= dt;
      if (enemy.fireTimer <= 0) {
        spawnRadialRing({
          spawnBullet: spawnForward,
          x: enemy.x,
          y: enemy.y,
          bulletCount: fp > 1.1 ? 12 : 10,
          speed: 50 * fp,
          startAngle: enemy.age,
          gapEvery: 5,
          color: 'bulletC',
        });

        spawnAimedBurst({
          spawnBullet: spawnForward,
          fromX: enemy.x,
          fromY: enemy.y,
          targetX: this.player.x,
          targetY: this.player.y,
          count: fp > 1.1 ? 3 : 2,
          spread: 0.1,
          speed: 64 * fp,
          color: 'bulletB',
          shape: 'needle',
        });

        enemy.fireTimer = enemy.fireRate;
      }
      return;
    }

    if (enemy.kind === 'elite') {
      enemy.y += enemy.vy * dt;
      enemy.x += Math.sin(enemy.age * 1.8 + enemy.seed) * 15 * dt;
      enemy.fireTimer -= dt;
      if (enemy.fireTimer <= 0 && enemy.y > ARENA_TOP + 12) {
        spawnAimedBurst({
          spawnBullet: spawnForward,
          fromX: enemy.x,
          fromY: enemy.y,
          targetX: this.player.x,
          targetY: this.player.y,
          count: fp > 1.05 ? 6 : 5,
          spread: 0.46,
          speed: 72 * fp,
          color: 'bulletB',
          shape: 'needle',
        });
        spawnRadialRing({
          spawnBullet: spawnForward,
          x: enemy.x,
          y: enemy.y,
          bulletCount: fp > 1.1 ? 14 : 12,
          speed: 46 * fp,
          startAngle: enemy.age,
          gapEvery: 6,
          color: 'bulletC',
        });
        enemy.fireTimer = enemy.fireRate;
      }
    }
  }

  spawnDiagonalCurtain({
    y,
    speed,
    tilt,
    spacing = 10,
    offset = 0,
    gapCenter = GAME_WIDTH * 0.5,
    gapWidth = 28,
    radius = 2,
    color = 'bulletC',
    shape = 'round',
  }) {
    const shift = ((offset % spacing) + spacing) % spacing;
    for (let x = -24 + shift; x <= GAME_WIDTH + 24; x += spacing) {
      if (Math.abs(x - gapCenter) <= gapWidth * 0.5) {
        continue;
      }
      this.spawnEnemyBullet(x, y, tilt * speed, speed, radius, color, shape);
    }
  }

  spawnRadialWave({
    x,
    y,
    bullets = 20,
    speed = 52,
    speed2 = 0,
    startAngle = 0,
    gapEvery = 0,
    color = 'bulletA',
    color2 = 'bulletC',
    forwardOnly = false,
  }) {
    const spawnBullet = forwardOnly
      ? this.spawnCrawfishBullet.bind(this)
      : this.spawnEnemyBullet.bind(this);

    spawnRadialRing({
      spawnBullet,
      x,
      y,
      bulletCount: bullets,
      speed,
      startAngle,
      gapEvery,
      color,
    });

    if (speed2 > 0) {
      spawnRadialRing({
        spawnBullet,
        x,
        y,
        bulletCount: Math.max(8, bullets - 6),
        speed: speed2,
        startAngle: -startAngle * 1.3,
        gapEvery: gapEvery > 0 ? Math.max(3, gapEvery - 2) : 0,
        color: color2,
      });
    }
  }

  updateMidboss(enemy, dt) {
    if (enemy.retreat) {
      enemy.y -= 36 * dt;
      return;
    }

    if (enemy.y < 62) {
      enemy.y += enemy.vy * dt;
      return;
    }

    enemy.x = GAME_WIDTH * 0.5 + Math.sin(enemy.age * 1.2) * 54;

    enemy.fireTimerA -= dt;
    if (enemy.fireTimerA <= 0) {
      const gapCenter = GAME_WIDTH * 0.5 + Math.sin(enemy.age * 1.55) * 62;
      const tilt = Math.sin(enemy.age * 2.8) >= 0 ? 0.38 : -0.38;
      this.spawnDiagonalCurtain({
        y: enemy.y + 10,
        speed: 52,
        tilt,
        spacing: 10,
        offset: enemy.age * 34,
        gapCenter,
        gapWidth: 30,
        color: 'bulletC',
        radius: 2,
      });
      enemy.fireTimerA = 0.8;
    }

    enemy.fireTimerB -= dt;
    if (enemy.fireTimerB <= 0) {
      this.spawnRadialWave({
        x: enemy.x,
        y: enemy.y,
        bullets: 22,
        speed: 48,
        speed2: 62,
        startAngle: enemy.age * 0.8,
        gapEvery: 8,
        color: 'bulletA',
        color2: 'bulletB',
        forwardOnly: true,
      });
      enemy.fireTimerB = 1.25;
    }

    enemy.fireTimerC -= dt;
    if (enemy.fireTimerC <= 0) {
      this.spawnDiagonalCurtain({
        y: enemy.y + 8,
        speed: 58,
        tilt: 0.52,
        spacing: 12,
        offset: enemy.age * 20,
        gapCenter: GAME_WIDTH * 0.5 + Math.sin(enemy.age * 1.1 + 1.1) * 56,
        gapWidth: 34,
        color: 'bulletB',
        radius: 2,
      });
      this.spawnDiagonalCurtain({
        y: enemy.y + 8,
        speed: 58,
        tilt: -0.52,
        spacing: 12,
        offset: enemy.age * 20 + 6,
        gapCenter: GAME_WIDTH * 0.5 + Math.sin(enemy.age * 1.1 + 1.1) * 56,
        gapWidth: 34,
        color: 'bulletB',
        radius: 2,
      });
      enemy.fireTimerC = 2.0;
    }
  }

  updateBoss(dt) {
    if (!this.boss || this.boss.defeated) {
      return;
    }

    const boss = this.boss;

    boss.age += dt;
    boss.flash = Math.max(0, boss.flash - dt);
    boss.invuln = Math.max(0, boss.invuln - dt);

    if (boss.y < boss.targetY) {
      boss.y += 20 * dt;
      return;
    }

    boss.x = GAME_WIDTH * 0.5 + Math.sin(boss.age * 0.58) * 56;

    if (boss.invuln > 0) {
      return;
    }

    if (boss.phase === 0) {
      boss.timers.a -= dt;
      boss.timers.b -= dt;
      if (boss.timers.a <= 0) {
        const gapCenter = GAME_WIDTH * 0.5 + Math.sin(boss.age * 1.2) * 68;
        const tilt = Math.sin(boss.age * 2.0) >= 0 ? 0.34 : -0.34;
        this.spawnDiagonalCurtain({
          y: boss.y + 12,
          speed: 50,
          tilt,
          spacing: 9,
          offset: boss.age * 30,
          gapCenter,
          gapWidth: 32,
          color: 'bulletC',
          radius: 2,
        });
        boss.timers.a = 0.74;
      }

      if (boss.timers.b <= 0) {
        this.spawnRadialWave({
          x: boss.x,
          y: boss.y,
          bullets: 24,
          speed: 50,
          speed2: 0,
          startAngle: boss.age * 0.7,
          gapEvery: 7,
          color: 'bulletA',
        });
        boss.timers.b = 1.7;
      }
      return;
    }

    if (boss.phase === 1) {
      boss.timers.a -= dt;
      boss.timers.b -= dt;
      if (boss.timers.a <= 0) {
        const gapCenter = GAME_WIDTH * 0.5 + Math.sin(boss.age * 1.5 + 0.9) * 70;
        this.spawnDiagonalCurtain({
          y: boss.y + 10,
          speed: 54,
          tilt: 0.45,
          spacing: 10,
          offset: boss.age * 34,
          gapCenter,
          gapWidth: 30,
          color: 'bulletB',
          radius: 2,
        });
        this.spawnDiagonalCurtain({
          y: boss.y + 10,
          speed: 54,
          tilt: -0.45,
          spacing: 10,
          offset: boss.age * 34 + 5,
          gapCenter,
          gapWidth: 30,
          color: 'bulletC',
          radius: 2,
        });
        boss.timers.a = 0.7;
      }

      if (boss.timers.b <= 0) {
        this.spawnRadialWave({
          x: boss.x,
          y: boss.y,
          bullets: 28,
          speed: 54,
          speed2: 66,
          startAngle: boss.age * 1.1,
          gapEvery: 9,
          color: 'bulletA',
          color2: 'bulletC',
        });
        boss.timers.b = 1.18;
      }
      return;
    }

    if (boss.phase === 2) {
      boss.timers.a -= dt;
      boss.timers.b -= dt;
      if (boss.timers.a <= 0) {
        const gapCenter = GAME_WIDTH * 0.5 + Math.sin(boss.age * 1.35) * 72;
        this.spawnDiagonalCurtain({
          y: boss.y + 10,
          speed: 58,
          tilt: 0.55,
          spacing: 9,
          offset: boss.age * 38,
          gapCenter,
          gapWidth: 28,
          color: 'bulletC',
          radius: 2,
        });
        this.spawnDiagonalCurtain({
          y: boss.y + 10,
          speed: 58,
          tilt: -0.55,
          spacing: 9,
          offset: boss.age * 38 + 4,
          gapCenter,
          gapWidth: 28,
          color: 'bulletB',
          radius: 2,
        });
        boss.timers.a = 0.72;
      }

      if (boss.timers.b <= 0) {
        this.spawnRadialWave({
          x: boss.x,
          y: boss.y,
          bullets: 30,
          speed: 52,
          speed2: 70,
          startAngle: boss.age * 0.9,
          gapEvery: 10,
          color: 'bulletA',
          color2: 'bulletC',
        });
        boss.timers.b = 1.36;
      }
      return;
    }

    boss.timers.a -= dt;
    boss.timers.b -= dt;
    boss.timers.c -= dt;

    if (boss.timers.a <= 0) {
      const gapCenter = GAME_WIDTH * 0.5 + Math.sin(boss.age * 1.7) * 76;
      const tilt = Math.sin(boss.age * 2.8) >= 0 ? 0.62 : -0.62;
      this.spawnDiagonalCurtain({
        y: boss.y + 12,
        speed: 64,
        tilt,
        spacing: 8,
        offset: boss.age * 44,
        gapCenter,
        gapWidth: 26,
        color: 'bulletC',
        radius: 2,
      });
      boss.timers.a = 0.52;
    }

    if (boss.timers.b <= 0) {
      this.spawnRadialWave({
        x: boss.x,
        y: boss.y,
        bullets: 34,
        speed: 58,
        speed2: 74,
        startAngle: boss.age * 1.35,
        gapEvery: 11,
        color: 'bulletA',
        color2: 'bulletB',
      });
      boss.timers.b = 0.94;
    }

    if (boss.timers.c <= 0) {
      this.spawnRadialWave({
        x: boss.x,
        y: boss.y,
        bullets: 16,
        speed: 84,
        speed2: 0,
        startAngle: boss.age * 2.2,
        gapEvery: 4,
        color: 'bulletC',
      });
      this.triggerShake(SCREEN_SHAKE.phase, 0.22);
      boss.timers.c = 1.65;
    }
  }

  spawnEnemyBullet(x, y, vx, vy, radius = 2, color = 'bulletB', shape = 'round') {
    this.enemyBullets.push({
      x,
      y,
      vx,
      vy,
      radius,
      color,
      shape,
      life: 0,
      twinkle: Math.random() * Math.PI * 2,
    });
  }

  // Crawfish shots are forward-only: they cannot fire upward (behind themselves).
  spawnCrawfishBullet(x, y, vx, vy, radius = 2, color = 'bulletB', shape = 'round') {
    if (vy <= 0) {
      return;
    }
    this.spawnEnemyBullet(x, y, vx, vy, radius, color, shape);
  }

  updateBullets(dt) {
    for (const bullet of this.playerBullets) {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
    }

    for (const bullet of this.enemyBullets) {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life += dt;
    }
  }

  updateItems(dt) {
    for (const item of this.items) {
      item.age += dt;
      item.y += item.vy * dt;
      item.vy = Math.min(58, item.vy + 12 * dt);

      const d2 = distSq(item.x, item.y, this.player.x, this.player.y);
      if (item.age > 0.45 && d2 < 34 * 34) {
        const d = Math.max(1, Math.sqrt(d2));
        const accel = 56;
        item.x += ((this.player.x - item.x) / d) * accel * dt;
        item.y += ((this.player.y - item.y) / d) * accel * dt;
      }
    }
  }

  updateEffects(dt) {
    for (const effect of this.effects) {
      effect.time -= dt;
    }
  }

  handleCollisions() {
    const player = this.player;

    for (let i = this.playerBullets.length - 1; i >= 0; i -= 1) {
      const bullet = this.playerBullets[i];
      let hit = false;

      for (const enemy of this.enemies) {
        if (enemy.dead) {
          continue;
        }
        const rr = (bullet.radius + enemy.radius) ** 2;
        if (distSq(bullet.x, bullet.y, enemy.x, enemy.y) <= rr) {
          this.damageEnemy(enemy, bullet.damage);
          hit = true;
          break;
        }
      }

      if (!hit && this.boss && !this.boss.defeated) {
        const rr = (bullet.radius + this.boss.radius) ** 2;
        if (distSq(bullet.x, bullet.y, this.boss.x, this.boss.y) <= rr) {
          this.damageBoss(bullet.damage);
          hit = true;
        }
      }

      if (hit) {
        this.playerBullets.splice(i, 1);
      }
    }

    if (player.invincible <= 0) {
      for (let i = this.enemyBullets.length - 1; i >= 0; i -= 1) {
        const bullet = this.enemyBullets[i];
        const rr = (bullet.radius + player.radius) ** 2;
        if (distSq(bullet.x, bullet.y, player.x, player.y) <= rr) {
          this.enemyBullets.splice(i, 1);
          this.onPlayerHit();
          break;
        }
      }

      for (const enemy of this.enemies) {
        if (enemy.dead) {
          continue;
        }
        const rr = (player.radius + enemy.radius) ** 2;
        if (distSq(enemy.x, enemy.y, player.x, player.y) <= rr) {
          this.onPlayerHit();
          break;
        }
      }

      if (this.boss && !this.boss.defeated) {
        const rr = (player.radius + this.boss.radius) ** 2;
        if (distSq(this.boss.x, this.boss.y, player.x, player.y) <= rr) {
          this.onPlayerHit();
        }
      }
    }

    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const item = this.items[i];
      const rr = (item.radius + player.radius + 1) ** 2;
      if (distSq(item.x, item.y, player.x, player.y) <= rr) {
        this.collectItem(item);
        this.items.splice(i, 1);
      }
    }
  }

  collectItem(item) {
    if (item.type === 'coin') {
      this.score += SCORE.coinPickup;
      this.player.coins += 1;
      const prev = this.player.powerLevel;
      this.player.powerLevel = this.computePowerLevel(this.player.coins);
      if (this.player.powerLevel > prev) {
        this.showBannerLocalized('banners.powerUp', 0.9, '#ffd67a', {
          level: this.player.powerLevel,
        });
      }
    } else if (item.type === 'soup') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
      this.showBannerLocalized('banners.soup', 1.1, '#f4f4d6');
    } else if (item.type === 'aed') {
      this.player.hp = this.player.maxHp;
      this.showBannerLocalized('banners.aed', 1.2, '#fef8e5');
    }

    this.effects.push({
      type: 'pickup',
      x: item.x,
      y: item.y,
      time: 0.35,
      max: 0.35,
    });
  }

  computePowerLevel(coins) {
    let level = 0;
    for (let i = 1; i < POWER_THRESHOLDS.length; i += 1) {
      if (coins >= POWER_THRESHOLDS[i]) {
        level = i;
      }
    }
    return clamp(level, 0, MAX_POWER_LEVEL);
  }

  onPlayerHit() {
    this.player.hp -= 1;
    this.player.invincible = PLAYER_INVINCIBLE_SECONDS;
    this.hurtOverlay = 0.2;

    this.enemyBullets = this.enemyBullets.filter(
      (bullet) => distSq(bullet.x, bullet.y, this.player.x, this.player.y) > 36 * 36,
    );

    this.triggerShake(SCREEN_SHAKE.hit, 0.18);
    this.showBannerLocalized('banners.playerHit', 0.9, '#ffb5ae');

    if (this.player.hp <= 0) {
      this.enterGameOver();
    }
  }

  enterGameOver() {
    this.state = STATE.GAME_OVER;
    this.audio.pauseBgm();
    this.gameOverElapsed = 0;
    this.showBannerLocalized('banners.playerDown', 2.2, '#ff9f8f');
  }

  damageEnemy(enemy, amount) {
    if (enemy.dead) {
      return;
    }

    enemy.hp -= amount;
    enemy.flash = 0.08;

    this.effects.push({
      type: 'hit',
      x: enemy.x,
      y: enemy.y,
      time: 0.14,
      max: 0.14,
    });

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  killEnemy(enemy) {
    if (enemy.dead) {
      return;
    }

    enemy.dead = true;
    this.score += enemy.score;

    this.effects.push({
      type: 'pop',
      x: enemy.x,
      y: enemy.y,
      time: 0.32,
      max: 0.32,
    });

    if (enemy.kind === 'midboss') {
      this.midbossDefeated = true;
      this.showBannerLocalized('banners.midbossDown', 1.4, '#ffd57f');
      this.triggerShake(SCREEN_SHAKE.phase, 0.24);
      for (let i = 0; i < 9; i += 1) {
        this.spawnItem('coin', enemy.x + rand(-14, 14), enemy.y + rand(-8, 8), rand(20, 36));
      }
      if (Math.random() < 0.45) {
        this.spawnItem('soup', enemy.x, enemy.y, 28);
      }
      if (Math.random() < 0.12) {
        this.spawnItem('aed', enemy.x + 8, enemy.y, 22);
      }
      return;
    }

    const coinCount = enemy.kind === 'elite' ? 3 : enemy.kind === 'turret' ? 2 : 1;
    for (let i = 0; i < coinCount; i += 1) {
      this.spawnItem('coin', enemy.x + rand(-5, 5), enemy.y + rand(-3, 3), rand(24, 42));
    }

    if (Math.random() < ITEM_DROP.soupChance) {
      this.spawnItem('soup', enemy.x, enemy.y, 30);
    } else if (Math.random() < ITEM_DROP.aedChance) {
      this.spawnItem('aed', enemy.x, enemy.y, 24);
    }
  }

  damageBoss(amount) {
    if (!this.boss || this.boss.defeated || this.boss.invuln > 0) {
      return;
    }

    this.boss.phaseHp -= amount;
    this.boss.flash = 0.08;

    this.effects.push({
      type: 'hit',
      x: this.boss.x,
      y: this.boss.y,
      time: 0.12,
      max: 0.12,
    });

    if (this.boss.phaseHp > 0) {
      return;
    }

    this.score += SCORE.bossPhase;

    if (this.boss.phase < BOSS_PHASES.length - 1) {
      this.boss.phase += 1;
      this.boss.phaseHp = BOSS_PHASES[this.boss.phase];
      this.boss.phaseMaxHp = BOSS_PHASES[this.boss.phase];
      this.boss.invuln = 1.25;
      this.boss.timers = { a: 0.6, b: 1.6, c: 1.2 };
      this.boss.rotation = 0;

      this.enemyBullets = this.enemyBullets.filter((_bullet, idx) => idx % 3 === 0);
      this.triggerShake(SCREEN_SHAKE.phase, 0.26);
      this.showBannerLocalized('banners.bossPhase', 1.3, '#ffd27b', {
        phase: this.boss.phase + 1,
      });
      return;
    }

    this.boss.defeated = true;
    this.score += SCORE.bossPhase * 2;
    this.enemyBullets.length = 0;
    this.showBannerLocalized('banners.bossDown', 2.2, '#ffeb9c');
    this.triggerShake(SCREEN_SHAKE.bomb, 0.5);

    this.effects.push({
      type: 'pop',
      x: this.boss.x,
      y: this.boss.y,
      time: 1,
      max: 1,
      big: true,
    });

    this.clearCountdown = 2.2;
    this.runCleared = true;
  }

  spawnItem(type, x, y, vy) {
    this.items.push({
      type,
      x,
      y,
      vy,
      radius: type === 'coin' ? 5 : 5,
      age: 0,
    });
  }

  cleanupEntities() {
    this.playerBullets = this.playerBullets.filter(
      (bullet) =>
        bullet.x >= -12 &&
        bullet.x <= GAME_WIDTH + 12 &&
        bullet.y >= ARENA_TOP - 24 &&
        bullet.y <= GAME_HEIGHT + 10,
    );

    this.enemyBullets = this.enemyBullets.filter(
      (bullet) =>
        bullet.x >= -16 &&
        bullet.x <= GAME_WIDTH + 16 &&
        bullet.y >= ARENA_TOP - 20 &&
        bullet.y <= GAME_HEIGHT + 20,
    );

    this.enemies = this.enemies.filter((enemy) => !enemy.dead);
    this.items = this.items.filter((item) => item.y <= GAME_HEIGHT + 14 && item.x >= -8 && item.x <= GAME_WIDTH + 8);
    this.effects = this.effects.filter((effect) => effect.time > 0);
  }

  render() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (this.state === STATE.TITLE) {
      this.drawBackground();
      this.drawTitle();
      return;
    }

    if (this.state === STATE.RESULTS) {
      this.drawBackground();
      this.drawResults();
      return;
    }

    this.drawWorld();
    this.drawHud();

    if (this.state === STATE.PAUSED) {
      this.drawOverlay(this.text('overlay.pausedTitle'), this.text('overlay.pausedSubtitle'));
    }

    if (this.state === STATE.GAME_OVER) {
      this.drawOverlay(this.text('overlay.gameOverTitle'), this.text('overlay.gameOverLines'));
    }
  }

  drawWorld() {
    const ctx = this.ctx;

    ctx.save();
    if (this.shakeTime > 0) {
      const strength = this.shakeStrength;
      const x = (Math.random() * 2 - 1) * strength;
      const y = (Math.random() * 2 - 1) * strength;
      ctx.translate(Math.round(x), Math.round(y));
    }

    this.drawBackground();

    for (const item of this.items) {
      this.drawItem(item);
    }

    for (const bullet of this.playerBullets) {
      this.drawPlayerBullet(bullet);
    }

    for (const bullet of this.enemyBullets) {
      this.drawEnemyBullet(bullet);
    }

    for (const enemy of this.enemies) {
      this.drawEnemy(enemy);
    }

    if (this.boss && !this.boss.defeated) {
      this.drawBoss(this.boss);
    }

    this.drawPlayer();

    for (const effect of this.effects) {
      this.drawEffect(effect);
    }

    ctx.restore();

    if (this.hurtOverlay > 0) {
      ctx.fillStyle = `rgba(255,96,96,${this.hurtOverlay * 0.65})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    if (this.banner) {
      const bannerY = HUD_HEIGHT + 4;
      const bannerH = 16;
      ctx.fillStyle = 'rgba(13,20,38,0.8)';
      ctx.fillRect(12, bannerY, GAME_WIDTH - 24, bannerH);
      ctx.strokeStyle = this.banner.color;
      ctx.strokeRect(12.5, bannerY + 0.5, GAME_WIDTH - 25, bannerH - 1);
      ctx.fillStyle = this.banner.color;
      ctx.font = this.bannerFont();
      ctx.textAlign = 'center';
      const bannerText = this.banner.textPath
        ? this.text(this.banner.textPath, this.banner.params)
        : this.banner.text;
      ctx.fillText(bannerText, GAME_WIDTH * 0.5, bannerY + 12);
      ctx.textAlign = 'left';
    }

    if (this.bossAlert) {
      const t = this.bossAlert.time / this.bossAlert.max;
      const alpha = 0.45 + (1 - Math.abs(t * 2 - 1)) * 0.45;
      ctx.fillStyle = `rgba(3,6,16,${alpha})`;
      ctx.fillRect(0, GAME_HEIGHT * 0.36, GAME_WIDTH, 46);
      ctx.strokeStyle = this.bossAlert.color;
      ctx.strokeRect(0.5, GAME_HEIGHT * 0.36 + 0.5, GAME_WIDTH - 1, 45);
      ctx.fillStyle = this.bossAlert.color;
      ctx.textAlign = 'center';
      ctx.font = this.alertFont();
      const alertText = this.bossAlert.textPath
        ? this.text(this.bossAlert.textPath, this.bossAlert.params)
        : this.bossAlert.text;
      ctx.fillText(alertText, GAME_WIDTH * 0.5, GAME_HEIGHT * 0.36 + 29);
      ctx.textAlign = 'left';
    }
  }

  drawBackground() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const scroll = this.backgroundScroll;

    // Sparse stars keep motion cues while preserving a black playfield.
    for (const star of this.skyStars) {
      const sy = (star.y + scroll * star.speed) % GAME_HEIGHT;
      ctx.fillStyle = star.color;
      ctx.fillRect(Math.round(star.x), Math.round(sy), 1, 1);
    }

    // Very subtle dark scanline/grid accents for depth without brightening the background.
    ctx.fillStyle = '#06080f';
    for (let y = ARENA_TOP + ((Math.floor(scroll) % 8) - 8); y < GAME_HEIGHT; y += 8) {
      ctx.fillRect(0, y, GAME_WIDTH, 1);
    }
    ctx.fillStyle = '#070a12';
    for (let x = 0; x < GAME_WIDTH; x += 16) {
      ctx.fillRect(x, ARENA_TOP, 1, GAME_HEIGHT - ARENA_TOP);
    }
  }

  drawPlayer() {
    const player = this.player;
    if (player.invincible > 0 && Math.floor(player.blink) % 2 === 0) {
      return;
    }

    const ctx = this.ctx;
    const x = Math.round(player.x);
    const y = Math.round(player.y);
    const bob = Math.sin(player.walkCycle) * 0.8;
    const drawn = this.drawSpriteCentered('taxhund', x + player.moveX * 1.5, y - 1 + bob, 16, 36, {
      flipX: player.moveX < -0.2,
    });

    if (!drawn) {
      ctx.fillStyle = COLORS.playerOutline;
      ctx.fillRect(x - 6, y - 5, 12, 10);

      ctx.fillStyle = COLORS.playerBody;
      ctx.fillRect(x - 5, y - 4, 10, 8);

      ctx.fillStyle = COLORS.playerNose;
      ctx.fillRect(x + 4, y - 1, 2, 2);

      ctx.fillStyle = '#24160f';
      ctx.fillRect(x - 3, y - 2, 1, 1);
      ctx.fillRect(x + 1, y - 2, 1, 1);

      ctx.fillStyle = '#fff2cc';
      ctx.fillRect(x - 1, y + 4, 2, 1);
    }

    // Keep a clear focus/hit marker for bullet readability fairness.
    const hr = player.radius;
    const ringColor = player.invincible > 0 ? '#c6f7ff' : '#66d5ff';
    ctx.strokeStyle = ringColor;
    ctx.strokeRect(x - hr - 1 + 0.5, y - hr - 1 + 0.5, hr * 2 + 2, hr * 2 + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 1, y - 1, 3, 3);
    ctx.fillStyle = '#66d5ff';
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x - 3, y, 2, 1);
    ctx.fillRect(x + 2, y, 2, 1);
    ctx.fillRect(x, y - 3, 1, 2);
    ctx.fillRect(x, y + 2, 1, 2);
  }

  drawEnemy(enemy) {
    const ctx = this.ctx;
    const x = Math.round(enemy.x);
    const y = Math.round(enemy.y);

    const scaleByKind = {
      drifter: { w: 22, h: 40 },
      zigzag: { w: 22, h: 40 },
      diver: { w: 20, h: 36 },
      turret: { w: 24, h: 44 },
      elite: { w: 30, h: 56 },
      midboss: { w: 48, h: 90 },
    };
    const dims = scaleByKind[enemy.kind] || { w: 22, h: 40 };
    const crawfishSprite = enemy.powered ? 'crawfishBlue' : 'crawfish';

    const drawn = this.drawSpriteCentered(crawfishSprite, x, y, dims.w, dims.h, {
      alpha: enemy.kind === 'midboss' ? 0.98 : 0.95,
      flipX: enemy.vx < -2,
    });

    if (drawn) {
      if (enemy.flash > 0) {
        ctx.fillStyle = `rgba(255,244,186,${enemy.flash * 2.8})`;
        ctx.fillRect(x - dims.w * 0.5, y - dims.h * 0.45, dims.w, dims.h * 0.9);
      }

      if (enemy.kind === 'elite') {
        ctx.fillStyle = 'rgba(131,225,255,0.18)';
        ctx.fillRect(x - dims.w * 0.45, y - dims.h * 0.4, dims.w * 0.9, dims.h * 0.8);
      }

      if (enemy.powered) {
        ctx.strokeStyle = 'rgba(120,205,255,0.92)';
        ctx.strokeRect(x - dims.w * 0.5 - 1, y - dims.h * 0.46 - 1, dims.w + 2, dims.h * 0.92 + 2);
        ctx.fillStyle = 'rgba(74,170,255,0.18)';
        ctx.fillRect(x - dims.w * 0.42, y - dims.h * 0.36, dims.w * 0.84, dims.h * 0.72);
      }

      if (enemy.kind === 'midboss') {
        ctx.strokeStyle = 'rgba(255,162,116,0.7)';
        ctx.strokeRect(x - dims.w * 0.5 - 2, y - dims.h * 0.46 - 1, dims.w + 4, dims.h * 0.92 + 2);
      }

      return;
    }

    if (enemy.kind === 'midboss') {
      ctx.fillStyle = enemy.flash > 0 ? COLORS.flash : COLORS.enemyOutline;
      ctx.fillRect(x - 14, y - 8, 28, 16);
      ctx.fillStyle = enemy.flash > 0 ? COLORS.flash : COLORS.midboss;
      ctx.fillRect(x - 12, y - 6, 24, 12);
      ctx.fillStyle = '#fff0d0';
      ctx.fillRect(x - 8, y - 2, 3, 2);
      ctx.fillRect(x + 5, y - 2, 3, 2);
      ctx.fillStyle = '#a73f37';
      ctx.fillRect(x - 17, y - 3, 3, 3);
      ctx.fillRect(x + 14, y - 3, 3, 3);
      return;
    }

    const bodyColor = enemy.powered
      ? '#56a8ff'
      : enemy.kind === 'elite'
        ? COLORS.enemyAlt
        : COLORS.enemyBody;

    ctx.fillStyle = enemy.flash > 0 ? COLORS.flash : COLORS.enemyOutline;
    ctx.fillRect(x - 7, y - 5, 14, 10);

    ctx.fillStyle = enemy.flash > 0 ? COLORS.flash : bodyColor;
    ctx.fillRect(x - 6, y - 4, 12, 8);

    ctx.fillStyle = '#f6e4bf';
    ctx.fillRect(x - 3, y - 2, 2, 2);
    ctx.fillRect(x + 2, y - 2, 2, 2);

    ctx.fillStyle = COLORS.enemyOutline;
    ctx.fillRect(x - 9, y - 1, 2, 2);
    ctx.fillRect(x + 7, y - 1, 2, 2);
  }

  drawBoss(boss) {
    const ctx = this.ctx;
    const x = Math.round(boss.x);
    const y = Math.round(boss.y);
    const bob = Math.sin(boss.age * 2.7) * 1.3;

    const drawn = this.drawSpriteCentered('omnipotentFish', x, y + bob, 84, 86, {
      alpha: boss.invuln > 0 ? 0.75 : 0.98,
    });

    if (drawn) {
      if (boss.flash > 0) {
        ctx.fillStyle = `rgba(255,255,216,${boss.flash * 2.7})`;
        ctx.fillRect(x - 38, y - 34, 76, 68);
      }

      // Subtle aura per phase to sell 16-bit boss phase escalation.
      const aura = ['#64ddff', '#9fceff', '#ffc37a', '#ff8e67'][boss.phase] || '#64ddff';
      ctx.strokeStyle = aura;
      ctx.strokeRect(x - 43, y - 39, 86, 78);
      return;
    }

    ctx.fillStyle = boss.flash > 0 ? COLORS.flash : COLORS.bossOutline;
    ctx.fillRect(x - 20, y - 12, 40, 24);

    ctx.fillStyle = boss.flash > 0 ? COLORS.flash : COLORS.bossBody;
    ctx.fillRect(x - 18, y - 10, 36, 20);
  }

  drawPlayerBullet(bullet) {
    const ctx = this.ctx;
    const x = Math.round(bullet.x);
    const y = Math.round(bullet.y);

    ctx.fillStyle = '#d9f5ff';
    ctx.fillRect(x - 1, y - 4, 2, 7);
    ctx.fillStyle = '#89d8ff';
    ctx.fillRect(x, y - 3, 1, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y - 4, 1, 1);
  }

  getEnemyBulletPalette(colorKey) {
    switch (colorKey) {
      case 'bulletA':
        return {
          glow: 'rgba(255,225,110,0.92)',
          trail: 'rgba(255,208,85,0.52)',
          outer: '#ffbf36',
          core: '#fff2a6',
          highlight: '#ffffff',
        };
      case 'bulletC':
        return {
          glow: 'rgba(86,170,255,0.9)',
          trail: 'rgba(77,157,255,0.48)',
          outer: '#3c68ff',
          core: '#e6f0ff',
          highlight: '#ffffff',
        };
      case 'bulletB':
        return {
          glow: 'rgba(255,86,132,0.96)',
          trail: 'rgba(255,88,118,0.58)',
          outer: '#ff3c5c',
          core: '#ffd4de',
          highlight: '#ffffff',
        };
      default:
        return {
          glow: 'rgba(255,122,168,0.9)',
          trail: 'rgba(255,111,153,0.5)',
          outer: '#ff5a86',
          core: '#ffd2e2',
          highlight: '#ffffff',
        };
    }
  }

  drawEnemyBullet(bullet) {
    const ctx = this.ctx;
    const x = bullet.x;
    const y = bullet.y;

    const palette = this.getEnemyBulletPalette(bullet.color);
    const mag = Math.max(1, Math.hypot(bullet.vx, bullet.vy));
    const nx = bullet.vx / mag;
    const ny = bullet.vy / mag;
    const pulse = 0.78 + 0.22 * Math.sin((bullet.life || 0) * 14 + (bullet.twinkle || 0));
    const isRuby = bullet.color === 'bulletB';

    if (bullet.shape === 'needle') {
      const length = 6;

      ctx.save();
      ctx.globalAlpha = (isRuby ? 0.36 : 0.24) * pulse;
      ctx.strokeStyle = palette.glow;
      ctx.lineWidth = isRuby ? 6 : 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - nx * (length + 2), y - ny * (length + 2));
      ctx.lineTo(x + nx * (length + 3), y + ny * (length + 3));
      ctx.stroke();

      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = palette.outer;
      ctx.lineWidth = isRuby ? 2.6 : 2.2;
      ctx.beginPath();
      ctx.moveTo(x - nx * length, y - ny * length);
      ctx.lineTo(x + nx * (length + 2), y + ny * (length + 2));
      ctx.stroke();

      ctx.fillStyle = palette.core;
      ctx.beginPath();
      ctx.arc(x + nx * (length + 1), y + ny * (length + 1), isRuby ? 2.2 : 1.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = palette.highlight;
      ctx.beginPath();
      ctx.arc(x + nx * length - ny * 0.8, y + ny * length + nx * 0.8, 0.9, 0, Math.PI * 2);
      ctx.fill();

      if (isRuby) {
        ctx.globalAlpha = 0.5 * pulse;
        ctx.fillStyle = 'rgba(255,72,104,0.95)';
        ctx.beginPath();
        ctx.arc(x - nx * 0.9, y - ny * 0.9, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    const r = Math.max(2.2, bullet.radius + 1.1);
    const trailLen = 1.2 + Math.min(5.5, mag * 0.03);

    ctx.save();
    ctx.globalAlpha = 0.26 * pulse;
    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(x, y, r + 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.44;
    ctx.fillStyle = palette.trail;
    ctx.beginPath();
    ctx.arc(x - nx * trailLen, y - ny * trailLen, r + 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.outer;
    ctx.beginPath();
    ctx.arc(x, y, r + 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.core;
    ctx.beginPath();
    ctx.arc(x, y, r - 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.highlight;
    ctx.beginPath();
    ctx.arc(x - r * 0.38, y - r * 0.44, Math.max(0.7, r * 0.42), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawItem(item) {
    const ctx = this.ctx;
    const x = Math.round(item.x);
    const y = Math.round(item.y);
    const bob = Math.sin(item.age * 6.5) * 1.4;

    if (item.type === 'coin') {
      const drewCoin = this.drawSpriteCentered('taxcoin', x, y + bob, COIN_DRAW_SIZE, COIN_DRAW_SIZE);
      if (drewCoin) {
        return;
      }
      ctx.fillStyle = COLORS.itemCoin;
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.fillStyle = '#5b3e00';
      ctx.font = this.uiFont(6);
      ctx.fillText(this.text('items.taxChar'), x - 3, y + 2);
      return;
    }

    if (item.type === 'soup') {
      if (this.drawSpriteCentered('seolleongtang', x, y + bob, 14, 14)) {
        return;
      }
      ctx.fillStyle = COLORS.itemSoup;
      ctx.fillRect(x - 5, y - 3, 10, 6);
      ctx.fillStyle = '#8f8b79';
      ctx.fillRect(x - 3, y - 1, 6, 1);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(x - 2, y + 2, 4, 1);
      return;
    }

    if (this.drawSpriteCentered('aed', x, y + bob, 14, 14)) {
      return;
    }

    ctx.fillStyle = COLORS.itemAed;
    ctx.fillRect(x - 5, y - 5, 10, 10);
    ctx.fillStyle = '#d94f52';
    ctx.fillRect(x - 1, y - 3, 2, 6);
    ctx.fillRect(x - 3, y - 1, 6, 2);
  }

  drawEffect(effect) {
    const ctx = this.ctx;
    const x = Math.round(effect.x);
    const y = Math.round(effect.y);
    const p = effect.time / effect.max;

    if (effect.type === 'hit') {
      ctx.fillStyle = `rgba(255,235,188,${p})`;
      ctx.fillRect(x - 1, y - 1, 3, 3);
      return;
    }

    if (effect.type === 'pickup') {
      ctx.strokeStyle = `rgba(130,224,255,${p})`;
      const size = (1 - p) * 8;
      ctx.strokeRect(x - size * 0.5, y - size * 0.5, size, size);
      return;
    }

    if (effect.type === 'bomb') {
      const radius = (1 - p) * effect.radius;
      ctx.strokeStyle = `rgba(255,245,190,${p})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    if (effect.type === 'pop') {
      const size = effect.big ? 14 : 7;
      const r = (1 - p) * size;
      ctx.fillStyle = `rgba(255,215,136,${p})`;
      ctx.fillRect(x - r, y - 1, r * 2, 2);
      ctx.fillRect(x - 1, y - r, 2, r * 2);
    }
  }

  drawHud() {
    return;
  }

  drawOverlay(title, subtitle) {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(7,10,20,0.72)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = 'rgba(30,44,76,0.92)';
    ctx.fillRect(24, 118, GAME_WIDTH - 48, 82);
    ctx.strokeStyle = '#9bc1ff';
    ctx.strokeRect(24.5, 118.5, GAME_WIDTH - 49, 81);

    ctx.fillStyle = '#ffe290';
    ctx.font = this.uiFont(10);
    ctx.textAlign = 'center';
    ctx.fillText(title, GAME_WIDTH * 0.5, 148);

    ctx.fillStyle = '#f3f6ff';
    ctx.font = this.uiFont(6);
    ctx.fillText(`${this.text('hud.score')} ${scoreText(this.score)}`, GAME_WIDTH * 0.5, 165);

    const lines = Array.isArray(subtitle) ? subtitle : [subtitle];
    ctx.font = this.uiFont(lines.length > 1 ? 5 : 6);
    const startY = lines.length > 1 ? 176 : 178;
    for (let i = 0; i < lines.length; i += 1) {
      ctx.fillText(lines[i], GAME_WIDTH * 0.5, startY + i * 8);
    }
    ctx.textAlign = 'left';
  }

  drawTitle() {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(10,15,30,0.76)';
    ctx.fillRect(10, 14, GAME_WIDTH - 20, GAME_HEIGHT - 28);
    ctx.strokeStyle = '#89b5ff';
    ctx.strokeRect(10.5, 14.5, GAME_WIDTH - 21, GAME_HEIGHT - 29);

    this.drawSpriteCentered('taxhund', 44, 82, 34, 78);
    this.drawSpriteCentered('crawfish', GAME_WIDTH - 44, 80, 32, 64);
    this.drawSpriteCentered('omnipotentFish', GAME_WIDTH * 0.5, 238, 54, 56, { alpha: 0.85 });

    const isJapanese = this.locale === 'ja';
    const statStartY = isJapanese ? 100 : 96;
    const statGap = isJapanese ? 14 : 12;
    const infoStartY = isJapanese ? 160 : 154;
    const infoGap = isJapanese ? 14 : 12;

    ctx.fillStyle = '#ffe79d';
    ctx.font = this.uiFont(9);
    ctx.textAlign = 'center';
    ctx.fillText(this.text('title.name'), GAME_WIDTH * 0.5, 44);
    ctx.fillText(this.text('title.subtitle'), GAME_WIDTH * 0.5, isJapanese ? 62 : 60);

    ctx.fillStyle = '#dce8ff';
    ctx.font = this.uiFont(6);
    ctx.fillText(this.text('title.move'), GAME_WIDTH * 0.5, statStartY);
    ctx.fillText(this.text('title.shoot'), GAME_WIDTH * 0.5, statStartY + statGap);
    ctx.fillText(this.text('title.bomb'), GAME_WIDTH * 0.5, statStartY + statGap * 2);
    ctx.fillText(this.text('title.pause'), GAME_WIDTH * 0.5, statStartY + statGap * 3);

    ctx.fillStyle = '#f5f8ff';
    ctx.fillText(this.text('title.collect'), GAME_WIDTH * 0.5, infoStartY);
    ctx.fillText(this.text('title.items'), GAME_WIDTH * 0.5, infoStartY + infoGap);
    ctx.fillText(this.text('title.enemy'), GAME_WIDTH * 0.5, infoStartY + infoGap * 2);
    ctx.fillText(this.text('title.boss'), GAME_WIDTH * 0.5, infoStartY + infoGap * 3);

    if (!this.spritesReady) {
      ctx.fillStyle = '#9ed3ff';
      ctx.fillText(this.text('title.loading'), GAME_WIDTH * 0.5, isJapanese ? 220 : 206);
    } else if (this.spritesFailed) {
      ctx.fillStyle = '#ffb4b4';
      ctx.fillText(this.text('title.fallback'), GAME_WIDTH * 0.5, isJapanese ? 220 : 206);
    }

    ctx.fillStyle = '#ffe7a0';
    ctx.fillText(this.text('title.pressStart'), GAME_WIDTH * 0.5, isJapanese ? 274 : 268);

    if (this.leaderboard.length > 0) {
      const top = this.leaderboard[0];
      ctx.fillStyle = '#d6dbe8';
      ctx.fillText(
        this.text('title.topEntry', { name: top.name, score: scoreText(top.score) }),
        GAME_WIDTH * 0.5,
        isJapanese ? 290 : 282,
      );
    }

    ctx.textAlign = 'left';
  }

  drawResults() {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(8,12,24,0.75)';
    ctx.fillRect(10, 14, GAME_WIDTH - 20, GAME_HEIGHT - 28);
    ctx.strokeStyle = '#8cb9ff';
    ctx.strokeRect(10.5, 14.5, GAME_WIDTH - 21, GAME_HEIGHT - 29);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe5a1';
    ctx.font = this.uiFont(9);
    ctx.fillText(this.text('results.title'), GAME_WIDTH * 0.5, 32);

    ctx.fillStyle = this.lastResultCleared ? '#ffe2a7' : '#ffb3ad';
    ctx.font = this.uiFont(6);
    ctx.fillText(
      this.lastResultCleared ? this.text('results.clear') : this.text('results.gameOver'),
      GAME_WIDTH * 0.5,
      46,
    );

    this.drawSpriteCentered('taxcoin', GAME_WIDTH * 0.5 - 56, 59, COIN_DRAW_SIZE, COIN_DRAW_SIZE);
    ctx.fillStyle = '#f3f6ff';
    ctx.fillText(
      this.text('results.finalScore', { score: scoreText(this.lastResultScore) }),
      GAME_WIDTH * 0.5,
      60,
    );
    ctx.fillText(
      this.text('results.time', { seconds: Math.floor(this.lastResultTime) }),
      GAME_WIDTH * 0.5,
      72,
    );

    if (this.awaitingName) {
      ctx.fillStyle = '#ffe79f';
      ctx.fillText(this.text('results.newHighScore'), GAME_WIDTH * 0.5, 88);
      ctx.fillStyle = '#fff3c8';
      ctx.fillText(`[${this.nameBuffer || ' '} ]`, GAME_WIDTH * 0.5, 98);
      ctx.fillText(this.text('results.confirmName'), GAME_WIDTH * 0.5, 108);
    } else {
      ctx.fillStyle = '#d4dce8';
      ctx.fillText(this.text('results.retryTitle'), GAME_WIDTH * 0.5, 94);
    }

    ctx.fillStyle = '#f0efd9';
    ctx.fillText(this.text('results.leaderboard'), GAME_WIDTH * 0.5, 124);

    ctx.textAlign = 'left';
    ctx.font = this.uiFont(6);

    for (let i = 0; i < 10; i += 1) {
      const y = 138 + i * 14;
      const row = this.leaderboard[i];
      const rank = `${(i + 1).toString().padStart(2, '0')}.`;

      if (!row) {
        ctx.fillStyle = '#8f97ab';
        ctx.fillText(`${rank} --- --------`, 24, y);
        continue;
      }

      const isSaved =
        this.savedEntry && row.name === this.savedEntry.name && row.score === this.savedEntry.score;

      ctx.fillStyle = isSaved ? '#ffe79f' : '#dfe4f0';
      ctx.fillText(`${rank} ${row.name.padEnd(8, ' ')} ${scoreText(row.score)}`, 24, y);
    }

    ctx.textAlign = 'left';
  }
}
