import Phaser from "phaser";
import {
  FAIRY_HITBOX_RADIUS_MAX,
  FAIRY_HITBOX_RADIUS_MIN,
  FAIRY_HITBOX_RADIUS_RATIO,
  GAME_HEIGHT,
  GAME_WIDTH,
  GAMEPLAY,
  MUSIC_VOLUME,
} from "../config";
import { InputController } from "../input/InputController";
import { resumeWebAudioFromUserGesture } from "../resumeWebAudio";
import { DifficultySystem } from "../systems/Difficulty";
import { Spawner } from "../systems/Spawner";
import { ParallaxBackgroundLayers } from "../background/ParallaxBackgroundLayers";

export class GameScene extends Phaser.Scene {
  private fairy!: Phaser.Physics.Arcade.Sprite;
  private topPipes!: Phaser.Physics.Arcade.Group;
  private bottomPipes!: Phaser.Physics.Arcade.Group;
  private scoreText!: Phaser.GameObjects.Text;
  private inputController!: InputController;
  private spawner!: Spawner;
  private difficulty = new DifficultySystem();
  private spawnTimer = 0;
  private score = 0;
  private gameStartedAt = 0;
  private isDead = false;
  private music?: Phaser.Sound.BaseSound;
  private parallax?: ParallaxBackgroundLayers;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.physics.resume();
    this.isDead = false;
    this.score = 0;
    this.spawnTimer = 0;
    this.music?.stop();

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "background").setDepth(-6);
    this.parallax = new ParallaxBackgroundLayers(this, [
      "backgroundParallax2",
      "backgroundParallax3",
      "backgroundParallax4",
      "backgroundParallax5",
    ]);
    this.add.text(16, 16, "Fatina d'Oro", { fontSize: "24px", color: "#ffffff" }).setDepth(20);

    this.topPipes = this.physics.add.group();
    this.bottomPipes = this.physics.add.group();

    this.fairy = this.physics.add.sprite(130, GAME_HEIGHT / 2, "fairy");
    this.fairy.setOrigin(0.5, 0.5);
    this.applyFairyHitbox();
    this.fairy.setCollideWorldBounds(false);
    this.fairy.play("fairy-flap");
    this.fairy.setDepth(15);

    this.spawner = new Spawner(this, this.topPipes, this.bottomPipes);
    this.inputController = new InputController(this);
    this.inputController.bind();

    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 32, "0", {
        fontSize: "52px",
        color: "#fff7cc",
        stroke: "#7a5000",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0)
      .setDepth(25);

    this.physics.add.overlap(
      this.fairy,
      this.topPipes,
      () => this.triggerGameOver(),
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.fairy,
      this.bottomPipes,
      () => this.triggerGameOver(),
      undefined,
      this,
    );

    void resumeWebAudioFromUserGesture(this).then(() => {
      this.tryStartMusic();
    });
    this.gameStartedAt = this.time.now;

    this.events.once("shutdown", () => {
      this.spawner.clear();
      this.inputController.destroy();
      this.parallax?.destroy();
      this.parallax = undefined;
    });
  }

  update(_time: number, delta: number): void {
    if (this.isDead) {
      return;
    }

    if (this.inputController.consumePress()) {
      this.fairy.setVelocityY(GAMEPLAY.flapVelocity);
      this.fairy.setAngle(-15);
      try {
        if (this.cache.audio.exists("flap")) {
          this.sound.play("flap", { volume: 0.5 });
        }
      } catch {
        // Ignore optional audio errors when assets are missing.
      }
    } else {
      this.fairy.setAngle(Math.min(this.fairy.angle + 1.4, 70));
    }

    this.spawnTimer += delta;
    const elapsed = this.time.now - this.gameStartedAt;
    const speed = GAMEPLAY.basePipeSpeed + this.difficulty.getSpeedBonus(elapsed);
    const gap = this.difficulty.getPipeGap(elapsed);

    this.parallax?.tick(speed, delta);

    if (this.spawnTimer >= GAMEPLAY.pipeSpawnMs) {
      this.spawnTimer = 0;
      this.spawner.spawn(gap, speed);
    }

    const newPoints = this.spawner.update(speed, this.fairy.x);
    if (newPoints > 0) {
      this.score += newPoints;
      this.scoreText.setText(String(this.score));
      try {
        if (this.cache.audio.exists("point")) {
          this.sound.play("point", { volume: 0.45 });
        }
      } catch {
        // Ignore optional audio errors when assets are missing.
      }
      this.tweens.add({
        targets: this.scoreText,
        scale: 1.2,
        duration: 100,
        yoyo: true,
      });
    }

    if (this.fairy.y < -30 || this.fairy.y > GAME_HEIGHT + 20) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver(): void {
    if (this.isDead) {
      return;
    }
    this.isDead = true;
    this.fairy.setVelocity(0, 0);
    this.physics.pause();
    try {
      if (this.cache.audio.exists("hit")) {
        this.sound.play("hit", { volume: 0.6 });
      }
    } catch {
      // Ignore optional audio errors when assets are missing.
    }
    this.music?.stop();
    this.cameras.main.shake(180, 0.01);
    this.time.delayedCall(450, () => {
      this.scene.start("GameOverScene", { score: this.score });
    });
  }

  private applyFairyHitbox(): void {
    const { width, height, displayOriginX, displayOriginY } = this.fairy;
    const r = Phaser.Math.Clamp(
      Math.round(Math.min(width, height) * FAIRY_HITBOX_RADIUS_RATIO),
      FAIRY_HITBOX_RADIUS_MIN,
      FAIRY_HITBOX_RADIUS_MAX,
    );
    const offsetX = displayOriginX - r;
    const offsetY = displayOriginY - r;
    this.fairy.setCircle(r, offsetX, offsetY);
  }

  private tryStartMusic(): void {
    if (!this.cache.audio.exists("music")) {
      if (import.meta.env.DEV) {
        console.warn("[audio] 'music' non in cache (file non caricato o load error).");
      }
      return;
    }

    try {
      this.music = this.sound.add("music", { loop: true, volume: MUSIC_VOLUME });
      this.music.play();
    } catch (e) {
      this.music = undefined;
      if (import.meta.env.DEV) {
        console.warn("[audio] musica non avviata:", e);
      }
    }
  }
}
