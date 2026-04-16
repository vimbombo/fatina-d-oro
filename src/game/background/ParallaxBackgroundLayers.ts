import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, PARALLAX_SPEED_RATIOS } from "../config";

type LayerConfig = {
  key: string;
  depth: number;
};

export class ParallaxBackgroundLayers {
  private readonly layers: Phaser.GameObjects.Image[];

  constructor(private readonly scene: Phaser.Scene, textureKeys: string[]) {
    const baseDepth = -5;

    const configs: LayerConfig[] = textureKeys.map((key, index) => ({
      key,
      depth: baseDepth + index + 1,
    }));

    this.layers = configs.map(({ key, depth }) => {
      return this.scene.add
        .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, key)
        .setDepth(depth);
    });
  }

  tick(worldSpeed: number, deltaMs: number): void {
    const dt = deltaMs / 1000;

    this.layers.forEach((layer, index) => {
      const ratio = PARALLAX_SPEED_RATIOS[index] ?? PARALLAX_SPEED_RATIOS[PARALLAX_SPEED_RATIOS.length - 1];
      layer.x -= worldSpeed * ratio * dt;
    });
  }

  destroy(): void {
    this.layers.forEach((layer) => layer.destroy());
  }
}

