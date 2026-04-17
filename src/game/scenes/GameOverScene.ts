import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, START_SCENE_MUSIC_VOLUME } from "../config";
import { resumeWebAudioFromUserGesture } from "../resumeWebAudio";
import { AudioSettingsStore } from "../state/AudioSettingsStore";
import { ScoreStore } from "../state/ScoreStore";

type Data = {
  score?: number;
};

export class GameOverScene extends Phaser.Scene {
  private hasNavigated = false;
  private music?: Phaser.Sound.BaseSound;

  constructor() {
    super("GameOverScene");
  }

  create(data: Data): void {
    this.hasNavigated = false;
    this.music?.stop();
    this.music = undefined;

    const score = data.score ?? 0;
    const best = ScoreStore.saveBestScore(score);

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.25).setOrigin(0, 0).setDepth(10);

    void resumeWebAudioFromUserGesture(this).then(() => {
      this.tryStartMusic();
    });

    this.add
      .text(GAME_WIDTH / 2, 220, "Game Over", {
        fontSize: "64px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(GAME_WIDTH / 2, 340, `Punteggio: ${score}`, {
        fontSize: "36px",
        color: "#ffeeb8",
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(GAME_WIDTH / 2, 390, `Migliore: ${best}`, {
        fontSize: "30px",
        color: "#fff2ce",
      })
      .setOrigin(0.5)
      .setDepth(20);

    const retry = this.add
      .text(GAME_WIDTH / 2, 510, "RIPROVA", {
        fontSize: "40px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#d36434",
        padding: { x: 20, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });

    const menu = this.add
      .text(GAME_WIDTH / 2, 585, "MENU", {
        fontSize: "30px",
        color: "#ffffff",
        backgroundColor: "#475066",
        padding: { x: 16, y: 7 },
      })
      .setOrigin(0.5)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });

    retry.on("pointerdown", () => {
      if (this.hasNavigated) {
        return;
      }
      this.hasNavigated = true;
      this.music?.stop();
      this.music = undefined;
      this.scene.stop("GameOverScene");
      this.scene.stop("GameScene");
      this.scene.start("GameScene");
    });
    menu.on("pointerdown", () => {
      if (this.hasNavigated) {
        return;
      }
      this.hasNavigated = true;
      this.music?.stop();
      this.music = undefined;
      this.scene.stop("GameOverScene");
      this.scene.stop("GameScene");
      this.scene.start("MenuScene");
    });

    this.input.keyboard?.once("keydown-SPACE", () => {
      if (this.hasNavigated) {
        return;
      }
      this.hasNavigated = true;
      this.music?.stop();
      this.music = undefined;
      this.scene.stop("GameOverScene");
      this.scene.stop("GameScene");
      this.scene.start("GameScene");
    });

    this.events.once("shutdown", () => {
      this.music?.stop();
      this.music = undefined;
    });
  }

  private tryStartMusic(): void {
    if (AudioSettingsStore.isMusicMuted()) {
      return;
    }
    if (!this.cache.audio.exists("startmusic")) {
      return;
    }

    try {
      this.music = this.sound.add("startmusic", { loop: true, volume: START_SCENE_MUSIC_VOLUME });
      this.music.play();
    } catch {
      this.music = undefined;
    }
  }
}
