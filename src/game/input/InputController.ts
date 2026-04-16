import Phaser from "phaser";

export class InputController {
  private justPressed = false;

  constructor(private scene: Phaser.Scene) {}

  bind(): void {
    this.scene.input.keyboard?.on("keydown-SPACE", this.onPress, this);
    this.scene.input.on("pointerdown", this.onPress, this);
  }

  destroy(): void {
    this.scene.input.keyboard?.off("keydown-SPACE", this.onPress, this);
    this.scene.input.off("pointerdown", this.onPress, this);
  }

  consumePress(): boolean {
    if (!this.justPressed) {
      return false;
    }

    this.justPressed = false;

    return true;
  }

  private onPress(): void {
    this.justPressed = true;
  }
}
