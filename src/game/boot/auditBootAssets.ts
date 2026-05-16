import Phaser from "phaser";
import {
  AUDIO_ASSETS,
  type AudioAssetKey,
  IMAGE_ASSETS,
  type ImageAssetKey,
} from "../assets";
import { FAIRY_SHEET_IMAGE_KEY } from "./constants";

export type BootAssetAudit = {
  ok: boolean;
  missing: {
    images: ImageAssetKey[];
    audio: AudioAssetKey[];
  };
};

function isImageMissing(
  scene: Phaser.Scene,
  key: ImageAssetKey,
  failedLoaderKeys: ReadonlySet<string>,
): boolean {
  if (key === "fairy") {
    if (failedLoaderKeys.has(FAIRY_SHEET_IMAGE_KEY)) {
      return true;
    }
    return !scene.textures.exists("fairy");
  }

  if (failedLoaderKeys.has(key)) {
    return true;
  }
  return !scene.textures.exists(key);
}

function isAudioMissing(
  scene: Phaser.Scene,
  key: AudioAssetKey,
  failedLoaderKeys: ReadonlySet<string>,
): boolean {
  if (failedLoaderKeys.has(key)) {
    return true;
  }
  return !scene.cache.audio.exists(key);
}

export function auditBootAssets(
  scene: Phaser.Scene,
  failedLoaderKeys: ReadonlySet<string>,
): BootAssetAudit {
  const missingImages = (Object.keys(IMAGE_ASSETS) as ImageAssetKey[]).filter((key) =>
    isImageMissing(scene, key, failedLoaderKeys),
  );
  const missingAudio = (Object.keys(AUDIO_ASSETS) as AudioAssetKey[]).filter((key) =>
    isAudioMissing(scene, key, failedLoaderKeys),
  );

  return {
    ok: missingImages.length === 0 && missingAudio.length === 0,
    missing: { images: missingImages, audio: missingAudio },
  };
}

export function formatBootAssetErrors(audit: BootAssetAudit): string {
  const lines: string[] = ["Asset mancanti:"];

  audit.missing.images.forEach((key) => {
    lines.push(`  [img] ${key}: ${IMAGE_ASSETS[key]}`);
  });
  audit.missing.audio.forEach((key) => {
    lines.push(`  [audio] ${key}: ${AUDIO_ASSETS[key]}`);
  });

  return lines.join("\n");
}
