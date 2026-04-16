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
      debug: true,
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
  difficultyIntervalMs: 11000,
  maxSpeedBonus: 115,
};

/** Fattori di velocità per gli strati di parallax (dal più lontano al più vicino). */
export const PARALLAX_SPEED_RATIOS = [0.12, 0.2, 0.32, 0.46] as const;

/**
 * Larghezza hitbox dei tubi (px), centrata sullo sprite.
 * Phaser usa di default il rettangolo dell’intera texture: se il PNG ha molta trasparenza ai lati,
 * le collisioni restano “larghe” finché non abbassi questo valore (es. larghezza visibile del cappello).
 * `0` = nessun override (hitbox = larghezza texture).
 */
export const PIPE_COLLIDER_WIDTH = 20;

/** Volume solo per l’asset `music` (0 = muto, 1 = massimo). Gli SFX sono impostati in `GameScene`. */
export const MUSIC_VOLUME = 0.65;

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
