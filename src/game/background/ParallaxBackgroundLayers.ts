import { GAME_HEIGHT, GAME_WIDTH, PARALLAX_SPEED_RATIOS } from "../config";

type LayerConfig = {
  key: string;
  depth: number;
};

type ParallaxLayer = {
  ratio: number;
  period: number;
  offset: number;
  first: Phaser.GameObjects.Image;
  second: Phaser.GameObjects.Image;
};

export class ParallaxBackgroundLayers {
  private readonly layers: ParallaxLayer[];

  constructor(private readonly scene: Phaser.Scene, textureKeys: string[]) {
    const baseDepth = -5;

    const configs: LayerConfig[] = textureKeys.map((key, index) => ({
      key,
      depth: baseDepth + index + 1,
    }));

    this.layers = configs.map(({ key, depth }, index) => {
      const texture = this.scene.textures.get(key);
      const frame = texture.get();
      const sourceWidth = frame.width;
      const sourceHeight = frame.height;
      const scale = sourceHeight > 0 ? GAME_HEIGHT / sourceHeight : 1;
      const period = sourceWidth > 0 ? sourceWidth * scale : GAME_WIDTH;
      const ratio = PARALLAX_SPEED_RATIOS[index] ?? PARALLAX_SPEED_RATIOS[PARALLAX_SPEED_RATIOS.length - 1];

      const first = this.scene.add
        .image(0, 0, key)
        .setOrigin(0, 0)
        .setScale(scale)
        .setDepth(depth)
        .setScrollFactor(0, 0);
      const second = this.scene.add
        .image(period, 0, key)
        .setOrigin(0, 0)
        .setScale(scale)
        .setDepth(depth)
        .setScrollFactor(0, 0);

      return {
        ratio,
        period,
        offset: 0,
        first,
        second,
      };
    });
  }

  tick(worldSpeed: number, deltaMs: number): void {
    const dt = deltaMs / 1000;

    this.layers.forEach((layer) => {
      const dx = worldSpeed * layer.ratio * dt;
      if (layer.period <= 0) {
        return;
      }
      layer.offset += dx;
      while (layer.offset >= layer.period) {
        layer.offset -= layer.period;
      }
      while (layer.offset < 0) {
        layer.offset += layer.period;
      }
      layer.first.x = -layer.offset;
      layer.first.y = 0;
      layer.second.x = layer.first.x + layer.period;
      layer.second.y = 0;
    });
  }

  destroy(): void {
    this.layers.forEach((layer) => {
      layer.first.destroy();
      layer.second.destroy();
    });
  }
}
