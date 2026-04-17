import Phaser from "phaser";
import "./style.css";
import { GAME_CONFIG } from "./game/config";
import { BootScene } from "./game/scenes/BootScene";
import { MenuScene } from "./game/scenes/MenuScene";
import { GameScene } from "./game/scenes/GameScene";
import { GameOverScene } from "./game/scenes/GameOverScene";

const game = new Phaser.Game({
  ...GAME_CONFIG,
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
});

window.addEventListener("resize", () => game.scale.refresh());
