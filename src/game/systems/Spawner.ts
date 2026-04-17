import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, GAMEPLAY, PIPE_COLLIDER_WIDTH } from "../config";

type PipePair = {
  top: Phaser.Physics.Arcade.Image;
  bottom: Phaser.Physics.Arcade.Image;
  disc?: Phaser.Physics.Arcade.Image;
  scored: boolean;
};

export class Spawner {
  private pairs: PipePair[] = [];
  private spawnedPipesCount = 0;
  private nextDiscAtPipeCount = 0;

  constructor(
    private scene: Phaser.Scene,
    private topGroup: Phaser.Physics.Arcade.Group,
    private bottomGroup: Phaser.Physics.Arcade.Group,
    private discGroup: Phaser.Physics.Arcade.Group,
  ) {
    this.nextDiscAtPipeCount = this.randomDiscThreshold(this.spawnedPipesCount);
  }

  spawn(gap: number, speed: number): void {
    const centerY = Phaser.Math.Between(220, GAME_HEIGHT - 220);
    const topY = centerY - gap / 2;
    const bottomY = centerY + gap / 2;

    const top = this.scene.physics.add
      .image(GAME_WIDTH + 60, topY, "pipe")
      .setOrigin(0.5, 1)
      .setImmovable(true)
      .setFlipY(true);
    const bottom = this.scene.physics.add
      .image(GAME_WIDTH + 60, bottomY, "pipe")
      .setOrigin(0.5, 0)
      .setImmovable(true);
    this.topGroup.add(top);
    this.bottomGroup.add(bottom);
    top.body.setAllowGravity(false);
    bottom.body.setAllowGravity(false);

    const narrowPipeCollider = (pipe: Phaser.Physics.Arcade.Image) => {
      const body = pipe.body as Phaser.Physics.Arcade.Body | false | null;
      if (PIPE_COLLIDER_WIDTH <= 0 || !body) {
        return;
      }
      const w = Math.min(PIPE_COLLIDER_WIDTH, body.width);
      const h = body.height;
      pipe.setBodySize(w, h, true);
    };
    narrowPipeCollider(top);
    narrowPipeCollider(bottom);

    top.setVelocity(-speed, 0);
    bottom.setVelocity(-speed, 0);
    this.spawnedPipesCount += 1;
    const shouldSpawnDisc = this.spawnedPipesCount >= this.nextDiscAtPipeCount;

    let disc: Phaser.Physics.Arcade.Image | undefined;
    if (shouldSpawnDisc) {
      const yMin = topY + GAMEPLAY.discVerticalMarginPx;
      const yMax = bottomY - GAMEPLAY.discVerticalMarginPx;
      const discY = yMin < yMax ? Phaser.Math.Between(yMin, yMax) : centerY;
      disc = this.scene.physics.add
        .image(GAME_WIDTH + 60, discY, "vinyl")
        .setOrigin(0.5, 0.5)
        .setImmovable(true);
      this.discGroup.add(disc);
      const discBody = disc.body as Phaser.Physics.Arcade.Body | null;
      discBody?.setAllowGravity(false);
      disc.setVelocity(-speed, 0);
      this.nextDiscAtPipeCount = this.randomDiscThreshold(this.spawnedPipesCount);
    }

    this.pairs.push({ top, bottom, disc, scored: false });
  }

  update(speed: number, fairyX: number): number {
    let points = 0;
    this.pairs = this.pairs.filter((pair) => {
      pair.top.setVelocityX(-speed);
      pair.bottom.setVelocityX(-speed);
      pair.disc?.setVelocityX(-speed);

      if (!pair.scored && pair.top.x < fairyX) {
        pair.scored = true;
        points += 1;
      }

      const offscreen = pair.top.x < -80;
      if (offscreen) {
        pair.top.destroy();
        pair.bottom.destroy();
        pair.disc?.destroy();
      }
      return !offscreen;
    });
    return points;
  }

  clear(): void {
    this.pairs.forEach((pair) => {
      pair.top.destroy();
      pair.bottom.destroy();
      pair.disc?.destroy();
    });
    this.pairs = [];
    this.spawnedPipesCount = 0;
    this.nextDiscAtPipeCount = this.randomDiscThreshold(this.spawnedPipesCount);
  }

  private randomDiscThreshold(fromPipeCount: number): number {
    const minPipes = GAMEPLAY.discEveryPipesBase - GAMEPLAY.discEveryPipesJitter;
    const maxPipes = GAMEPLAY.discEveryPipesBase + GAMEPLAY.discEveryPipesJitter;
    return fromPipeCount + Phaser.Math.Between(minPipes, maxPipes);
  }
}
