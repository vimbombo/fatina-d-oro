import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { ScoreStore } from "../state/ScoreStore";

type Data = {
  score?: number;
};

export class GameOverScene extends Phaser.Scene {
  private hasNavigated = false;

  constructor() {
    super("GameOverScene");
  }

  create(data: Data): void {
    this.hasNavigated = false;

    const score = data.score ?? 0;
    const best = ScoreStore.saveBestScore(score);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background").setTint(0x999999);

    this.add.text(GAME_WIDTH / 2, 220, "Game Over", {
      fontSize: "64px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 340, `Punteggio: ${score}`, {
      fontSize: "36px",
      color: "#ffeeb8",
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 390, `Migliore: ${best}`, {
      fontSize: "30px",
      color: "#fff2ce",
    }).setOrigin(0.5);

    const retry = this.add.text(GAME_WIDTH / 2, 510, "RIPROVA", {
      fontSize: "40px",
      fontStyle: "bold",
      color: "#ffffff",
      backgroundColor: "#d36434",
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const menu = this.add.text(GAME_WIDTH / 2, 585, "MENU", {
      fontSize: "30px",
      color: "#ffffff",
      backgroundColor: "#475066",
      padding: { x: 16, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retry.on("pointerdown", () => {
      if (this.hasNavigated) {
        return;
      }
      this.hasNavigated = true;
      this.scene.start("GameScene");
    });
    menu.on("pointerdown", () => {
      if (this.hasNavigated) {
        return;
      }
      this.hasNavigated = true;
      this.scene.start("MenuScene");
    });

    this.input.keyboard?.once("keydown-SPACE", () => {
      if (this.hasNavigated) {
        return;
      }
      this.hasNavigated = true;
      this.scene.start("GameScene");
    });
  }
}
