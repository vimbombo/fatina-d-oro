import Phaser from "phaser";
import { FAIRY_FRAME_COUNT } from "./config";

/**
 * Crea uno spritesheet a frame fissi da un'immagine già caricata con `load.image`.
 * frameWidth = floor(larghezza / FAIRY_FRAME_COUNT), frameHeight = altezza foglio.
 * Se la larghezza non è multipla esatta di 4, i pixel in più a destra restano fuori dal reticolo (console in dev).
 */
export function buildFairySpriteSheetFromLoadedImage(
  scene: Phaser.Scene,
  loadedImageKey: string,
  outputKey: string,
): { frameWidth: number; frameHeight: number } | null {
  if (!scene.textures.exists(loadedImageKey)) {
    return null;
  }

  const img = scene.textures.get(loadedImageKey).getSourceImage() as HTMLImageElement;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  if (iw < FAIRY_FRAME_COUNT || ih < 1) {
    console.warn(`[fairy] PNG troppo piccolo: ${iw}×${ih}`);
    return null;
  }

  const frameWidth = Math.floor(iw / FAIRY_FRAME_COUNT);
  const frameHeight = ih;

  if (scene.textures.exists(outputKey)) {
    scene.textures.remove(outputKey);
  }

  const texture = scene.textures.addSpriteSheet(outputKey, img, {
    frameWidth,
    frameHeight,
  });

  if (!texture) {
    return null;
  }

  if (import.meta.env.DEV) {
    const rem = iw % FAIRY_FRAME_COUNT;
    if (rem !== 0) {
      console.info(
        `[fairy] PNG ${iw}×${ih} px → frame ${frameWidth}×${frameHeight} (${FAIRY_FRAME_COUNT} colonne); ${rem}px a destra non nel reticolo (esporta larghezza multipla di ${FAIRY_FRAME_COUNT} per taglio perfetto).`,
      );
    }
  }

  return { frameWidth, frameHeight };
}
