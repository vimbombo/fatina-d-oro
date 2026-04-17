import { GAME_HEIGHT, GAME_WIDTH, PARALLAX_SPEED_RATIOS } from "../config";

type LayerConfig = {
  key: string;
  depth: number;
};

export class ParallaxBackgroundLayers {
  private readonly layers: Phaser.GameObjects.TileSprite[];
  private readonly debugEnabled = import.meta.env.DEV;
  private lastDebugLogAt = 0;
  private readonly lastTileX: number[] = [];

  constructor(private readonly scene: Phaser.Scene, textureKeys: string[]) {
    const baseDepth = -5;

    const configs: LayerConfig[] = textureKeys.map((key, index) => ({
      key,
      depth: baseDepth + index + 1,
    }));

    this.layers = configs.map(({ key, depth }) => {
      const layer = this.scene.add
        .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, key)
        .setOrigin(0, 0)
        .setDepth(depth)
        .setScrollFactor(0, 0);

      // Uniform scale from texture height → one tile fills game height (no vertical repeat).
      const fh = layer.frame.height;
      if (fh > 0) {
        const scale = GAME_HEIGHT / fh;
        layer.setTileScale(scale, scale);
      }

      return layer;
    });
    this.lastTileX.push(...this.layers.map((layer) => layer.tilePositionX));
  }

  tick(worldSpeed: number, deltaMs: number): void {
    const dt = deltaMs / 1000;

    this.layers.forEach((layer, index) => {
      const ratio = PARALLAX_SPEED_RATIOS[index] ?? PARALLAX_SPEED_RATIOS[PARALLAX_SPEED_RATIOS.length - 1];
      const dx = worldSpeed * ratio * dt;
      const prevX = this.lastTileX[index] ?? layer.tilePositionX;
      layer.tilePositionX += dx;

      // Let Phaser do UV wrapping internally (renderer uses modulo by frame width).
      // Manual reset around `period` can introduce visible seam jumps at wrap points.
      const period = layer.frame.width;
      if (period <= 0) {
        this.lastTileX[index] = layer.tilePositionX;
        return;
      }
      const wraps = Math.floor(layer.tilePositionX / period) - Math.floor(prevX / period);
      const expectedX = prevX + dx;
      const drift = layer.tilePositionX - expectedX;
      const now = this.scene.time.now;
      const shouldSampleLog = now - this.lastDebugLogAt >= 500 && index === this.layers.length - 1;
      const shouldJumpLog = Math.abs(drift) > 0.25 || Math.abs(deltaMs - 16.67) > 25;

      if (this.debugEnabled && (wraps !== 0 || shouldJumpLog || shouldSampleLog)) {
        if (shouldSampleLog) {
          this.lastDebugLogAt = now;
        }
        console.info("[parallax-debug]", {
          layerIndex: index + 2,
          prevX: Number(prevX.toFixed(3)),
          newX: Number(layer.tilePositionX.toFixed(3)),
          dx: Number(dx.toFixed(3)),
          wraps,
          period,
          deltaMs: Number(deltaMs.toFixed(2)),
          drift: Number(drift.toFixed(5)),
          worldSpeed: Number(worldSpeed.toFixed(2)),
          ratio,
        });
      }

      this.lastTileX[index] = layer.tilePositionX;
    });
  }

  destroy(): void {
    this.layers.forEach((layer) => layer.destroy());
  }
}
