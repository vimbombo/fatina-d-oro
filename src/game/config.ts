import Phaser from "phaser";

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "app",
  backgroundColor: "#8fd8ff",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 1400 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export const GAMEPLAY = {
  flapVelocity: -440,
  basePipeSpeed: 190,
  basePipeGap: 235,
  minPipeGap: 170,
  pipeSpawnMs: 1500,
  discEveryPipesBase: 8,
  discEveryPipesJitter: 2,
  discVerticalMarginPx: 26,
  difficultyIntervalMs: 11000,
  maxSpeedBonus: 115,
  revealPointsPerChar: 10,
};

export const BACKGROUND_REVEAL_VISUALS = {
  /** Per-line fill for the lit (“neon on”) overlay. */
  lineColors: ["#ff8fab", "#ffd670", "#86b6ff"] as const,
  baseYRatio: 0.14,
  lineGapPx: 92,
  fontSizePx: 68,
  fontStyle: "bold",
  /** Depth for the dim full-line layer (between parallax2 and parallax3: -4 … -3). */
  depth: -3.5,
  /** Dim “neon off” full phrase (bottom layer). */
  offFillColor: "#5a6578",
  offStrokeColor: "#2a323d",
  offStrokeThickness: 1,
  offAlpha: 0.42,
  /** Bright “neon on” overlay (top layer; unlit slots are spaces so off shows through). */
  onStrokeColor: "#fff8e7",
  onStrokeThickness: 4,
  onAlpha: 0.92,
  onDepthBias: 0.01,
} as const;

/** Fattori di velocità per gli strati di parallax (dal più lontano al più vicino). */
export const PARALLAX_SPEED_RATIOS = [0.12*2, 0.2*2, 0.32*2] as const;

/**
 * Larghezza hitbox dei tubi (px), centrata sullo sprite.
 * Phaser usa di default il rettangolo dell’intera texture: se il PNG ha molta trasparenza ai lati,
 * le collisioni restano “larghe” finché non abbassi questo valore (es. larghezza visibile del cappello).
 * `0` = nessun override (hitbox = larghezza texture).
 */
export const PIPE_COLLIDER_WIDTH = 20;

/** Volume solo per l’asset `music` (0 = muto, 1 = massimo). Gli SFX sono impostati in `GameScene`. */
export const MUSIC_VOLUME = 0.65;
/** Volume per l’asset `startmusic` nelle scene Menu e GameOver (0 = muto, 1 = massimo). */
export const START_SCENE_MUSIC_VOLUME = 0.2;

export const FAIRY_FRAME_COUNT = 4;
export const FAIRY_FLAP_FPS = 12;
/** Solo per la texture di fallback (PNG assente) in BootScene, non per il vero spritesheet. */
export const FAIRY_FRAME_WIDTH = 100;
export const FAIRY_FRAME_HEIGHT = 64;

/**
 * Raggio hitbox circolare fatina = `min(larghezzaFrame, altezzaFrame) * ratio`.
 * Offset derivato da `displayOrigin` così il cerchio è centrato sullo sprite (origine di default 0.5, 0.5).
 */
export const FAIRY_HITBOX_RADIUS_RATIO = 0.38;
export const FAIRY_HITBOX_RADIUS_MIN = 18;
export const FAIRY_HITBOX_RADIUS_MAX = 56;
