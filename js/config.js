export const GAME_WIDTH = 240;
export const GAME_HEIGHT = 320;
export const TILE_SIZE = 8;

export const PLAYER_MAX_HP = 4;
export const PLAYER_START_BOMBS = 3;
export const PLAYER_INVINCIBLE_SECONDS = 1.8;

// Core player tuning knobs.
export const PLAYER_SPEED = 112;
export const PLAYER_SHOT_COOLDOWN = 0.09;
export const PLAYER_BULLET_SPEED = 210;

export const POWER_THRESHOLDS = [0, 14, 34, 62, 100];
export const MAX_POWER_LEVEL = POWER_THRESHOLDS.length - 1;

// Stage pacing values in seconds (matching the spec timeline).
export const STAGE_SEGMENTS = {
  intro: 60,
  waves: 120,
  midboss: 60,
  pressure: 60,
  bossStart: 300,
};

export const MIDBOSS_MAX_HP = 1120;
export const BOSS_PHASES = [980, 1120, 1260, 1420];

export const SCORE = {
  enemySmall: 120,
  enemyFast: 180,
  enemyTurret: 240,
  enemyElite: 360,
  midboss: 3500,
  bossPhase: 4200,
  coinPickup: 30,
};

export const ITEM_DROP = {
  soupChance: 0.08,
  aedChance: 0.015,
};

export const COLORS = {
  bgDark: '#101623',
  bgTileA: '#16223b',
  bgTileB: '#203154',
  bgLine: '#263a66',
  hudPanel: '#0a1120',
  hudText: '#f0efd9',
  hudAccent: '#ffcf5a',
  playerBody: '#d29a4a',
  playerOutline: '#1a1308',
  playerNose: '#3a1b0f',
  playerShot: '#f8e9a2',
  enemyBody: '#da5d4f',
  enemyOutline: '#2d0f11',
  enemyAlt: '#6aaec4',
  midboss: '#f07b57',
  bossBody: '#7ad3cf',
  bossOutline: '#113a44',
  bulletA: '#ffe7a0',
  bulletB: '#ff6f7c',
  bulletC: '#7fd5ff',
  itemCoin: '#ffd24b',
  itemSoup: '#f4f2d4',
  itemAed: '#fffbf7',
  flash: '#fff5d8',
};

export const SCREEN_SHAKE = {
  hit: 2,
  bomb: 6,
  phase: 4,
};

export const BOMB = {
  radius: 128,
  damage: 600,
};
