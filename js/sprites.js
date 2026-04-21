const SPRITE_PATHS = {
  taxhund: 'assets/sprites/taxhund.png',
  crawfish: 'assets/sprites/crawfish.png',
  omnipotentFish: 'assets/sprites/omnipotent_fish.png',
  taxcoin: 'assets/sprites/taxcoin.png',
  seolleongtang: 'assets/sprites/seolleongtang.png',
  aed: 'assets/sprites/aed.png',
  heart: 'assets/sprites/heart.png',
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
    image.src = src;
  });
}

function stripPureBlackBackground(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = data.data;

  // Remove only near-pure black pixels to protect dark in-sprite outlines.
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i + 0];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a >= 245 && r <= 3 && g <= 3 && b <= 3) {
      pixels[i + 3] = 0;
    }
  }

  ctx.putImageData(data, 0, 0);
  return canvas;
}

function createBlueVariant(sourceCanvas) {
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sourceCanvas, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = data.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3];
    if (a === 0) {
      continue;
    }

    const r = pixels[i + 0];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const luma = (r * 0.22 + g * 0.5 + b * 0.28);

    // Preserve contrast while shifting crawfish palette to blue/cyan.
    pixels[i + 0] = Math.min(255, Math.floor(luma * 0.42));
    pixels[i + 1] = Math.min(255, Math.floor(luma * 0.85 + 20));
    pixels[i + 2] = Math.min(255, Math.floor(luma * 1.22 + 36));
  }

  ctx.putImageData(data, 0, 0);
  return canvas;
}

export async function loadSpriteBank() {
  const entries = await Promise.all(
    Object.entries(SPRITE_PATHS).map(async ([key, src]) => {
      const image = await loadImage(src);
      return [key, stripPureBlackBackground(image)];
    }),
  );
  const bank = Object.fromEntries(entries);
  bank.crawfishBlue = createBlueVariant(bank.crawfish);
  return bank;
}
