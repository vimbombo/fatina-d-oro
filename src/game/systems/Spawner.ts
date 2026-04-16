import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, PIPE_COLLIDER_WIDTH } from "../config";

type PipePair = {
  top: Phaser.Physics.Arcade.Image;
  bottom: Phaser.Physics.Arcade.Image;
  scored: boolean;
};

export class Spawner {
  private pairs: PipePair[] = [];

  constructor(
    private scene: Phaser.Scene,
    private topGroup: Phaser.Physics.Arcade.Group,
    private bottomGroup: Phaser.Physics.Arcade.Group,
  ) {}

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
    this.pairs.push({ top, bottom, scored: false });
  }

  update(speed: number, fairyX: number): number {
    let points = 0;
    this.pairs = this.pairs.filter((pair) => {
      pair.top.setVelocityX(-speed);
      pair.bottom.setVelocityX(-speed);

      if (!pair.scored && pair.top.x < fairyX) {
        pair.scored = true;
        points += 1;
      }

      const offscreen = pair.top.x < -80;
      if (offscreen) {
        pair.top.destroy();
        pair.bottom.destroy();
      }
      return !offscreen;
    });
    return points;
  }

  clear(): void {
    this.pairs.forEach((pair) => {
      pair.top.destroy();
      pair.bottom.destroy();
    });
    this.pairs = [];
  }
}
