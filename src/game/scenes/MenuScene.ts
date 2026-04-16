import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { resumeWebAudioFromUserGesture } from "../resumeWebAudio";
import { ScoreStore } from "../state/ScoreStore";

export class MenuScene extends Phaser.Scene {
  private hasNavigated = false;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.hasNavigated = false;

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background");

    this.add.text(GAME_WIDTH / 2, 200, "Fatina d'Oro", {
      fontSize: "58px",
      fontStyle: "bold",
      color: "#ffe28a",
      stroke: "#8a5b00",
      strokeThickness: 8,
      align: "center",
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 330, "Tocca o premi SPAZIO per volare", {
      fontSize: "26px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 390, `Miglior punteggio: ${ScoreStore.getBestScore()}`, {
      fontSize: "28px",
      color: "#fef4be",
    }).setOrigin(0.5);

    const start = this.add.text(GAME_WIDTH / 2, 500, "INIZIA", {
      fontSize: "44px",
      fontStyle: "bold",
      color: "#ffffff",
      backgroundColor: "#e38a2d",
      padding: { x: 22, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: start,
      y: 492,
      yoyo: true,
      repeat: -1,
      duration: 850,
      ease: "Sine.inOut",
    });

    const goToGame = () => {
      if (this.hasNavigated) {
        return;
      }
      this.hasNavigated = true;
      void resumeWebAudioFromUserGesture(this).then(() => {
        this.scene.start("GameScene");
      });
    };
    start.on("pointerdown", goToGame);
    this.input.keyboard?.once("keydown-SPACE", goToGame);
  }
}
