export const FIELD_PRESET_ORDER = ['Attacking', 'Balanced', 'Defensive'];

export const FIELD_PRESET_SPOTS = {
  Attacking: [
    { label: 'WK', x: 50, y: 82 },
    { label: 'SL', x: 41, y: 69 },
    { label: 'LS', x: 59, y: 69 },
    { label: 'PT', x: 23, y: 47 },
    { label: 'CV', x: 32, y: 32 },
    { label: 'MO', x: 44, y: 21 },
    { label: 'MI', x: 56, y: 21 },
    { label: 'MW', x: 75, y: 41 },
    { label: 'SQ', x: 79, y: 56 },
    { label: 'FL', x: 69, y: 73 },
    { label: 'SC', x: 25, y: 34 },
  ],
  Balanced: [
    { label: 'WK', x: 50, y: 82 },
    { label: 'SL', x: 41, y: 69 },
    { label: 'PT', x: 23, y: 47 },
    { label: 'CV', x: 32, y: 32 },
    { label: 'MO', x: 44, y: 21 },
    { label: 'MI', x: 56, y: 21 },
    { label: 'MW', x: 75, y: 41 },
    { label: 'SQ', x: 79, y: 56 },
    { label: 'FL', x: 69, y: 73 },
    { label: 'DC', x: 12, y: 30 },
    { label: 'LO', x: 89, y: 45 },
  ],
  Defensive: [
    { label: 'WK', x: 50, y: 82 },
    { label: 'PT', x: 23, y: 47 },
    { label: 'CV', x: 32, y: 32 },
    { label: 'MO', x: 44, y: 21 },
    { label: 'MI', x: 56, y: 21 },
    { label: 'MW', x: 74, y: 42 },
    { label: 'SQ', x: 80, y: 57 },
    { label: 'FL', x: 88, y: 77 },
    { label: 'DC', x: 11, y: 30 },
    { label: 'LF', x: 10, y: 56 },
    { label: 'LO', x: 90, y: 48 },
  ],
};

export function nextFieldPreset(current) {
  const index = FIELD_PRESET_ORDER.indexOf(current);
  return FIELD_PRESET_ORDER[(index + 1 + FIELD_PRESET_ORDER.length) % FIELD_PRESET_ORDER.length];
}

export function fieldingInterception(preset, target, fielders) {
  const dx = target.x - 50;
  const dy = (target.y - 50) * (220 / 300);
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return null;

  const spots = FIELD_PRESET_SPOTS[preset] || FIELD_PRESET_SPOTS.Balanced;
  const candidates = [];
  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index];
    const spotX = spot.x - 50;
    const spotY = (spot.y - 50) * (220 / 300);
    const progress = (spotX * dx + spotY * dy) / lengthSquared;
    if (progress < 0.12 || progress > 0.98) continue;
    const miss = Math.hypot(dx * progress - spotX, dy * progress - spotY);
    const skill = Math.max(8, Math.min(100, fielders[index]?.field ?? 50));
    const reach = 2.2 + skill / 28 + (preset === 'Defensive' ? 8 : 0);
    if (miss <= reach) candidates.push({ index, spot, progress, miss });
  }

  candidates.sort((a, b) => a.progress - b.progress || a.miss - b.miss);
  return candidates[0] || null;
}
