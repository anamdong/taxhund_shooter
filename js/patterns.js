const TAU = Math.PI * 2;

export function angleTo(fromX, fromY, toX, toY) {
  return Math.atan2(toY - fromY, toX - fromX);
}

export function spawnAimedBurst({
  spawnBullet,
  fromX,
  fromY,
  targetX,
  targetY,
  count,
  spread,
  speed,
  radius = 2,
  color = 'bulletB',
  shape = 'needle',
}) {
  const center = angleTo(fromX, fromY, targetX, targetY);
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = center + (t - 0.5) * spread;
    spawnBullet(fromX, fromY, Math.cos(angle) * speed, Math.sin(angle) * speed, radius, color, shape);
  }
}

export function spawnRadialRing({
  spawnBullet,
  x,
  y,
  bulletCount,
  speed,
  startAngle = 0,
  gapEvery = 0,
  radius = 2,
  color = 'bulletC',
  shape = 'round',
}) {
  for (let i = 0; i < bulletCount; i += 1) {
    if (gapEvery > 0 && i % gapEvery === 0) {
      continue;
    }
    const angle = startAngle + (TAU * i) / bulletCount;
    spawnBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, radius, color, shape);
  }
}

export function spawnSpiralStep({
  spawnBullet,
  x,
  y,
  arms,
  speed,
  rotation,
  radius = 2,
  color = 'bulletA',
  shape = 'round',
}) {
  for (let arm = 0; arm < arms; arm += 1) {
    const angle = rotation + (TAU * arm) / arms;
    spawnBullet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, radius, color, shape);
  }
}

export function spawnWallWithGap({
  spawnBullet,
  y,
  width,
  speed,
  gapCenter,
  gapWidth,
  spacing,
  radius = 3,
  color = 'bulletC',
}) {
  for (let x = 8; x <= width - 8; x += spacing) {
    if (Math.abs(x - gapCenter) <= gapWidth * 0.5) {
      continue;
    }
    spawnBullet(x, y, 0, speed, radius, color, 'round');
  }
}
