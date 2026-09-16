export function findFreePosition(
  occupied: { x: number; y: number }[],
): { x: number; y: number } {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const x = 0.18 + Math.random() * 0.64
    const y = 0.22 + Math.random() * 0.5
    const crowded = occupied.some(
      (point) => Math.hypot(point.x - x, point.y - y) < 0.16,
    )
    if (!crowded) return { x, y }
  }
  return { x: 0.5, y: 0.42 }
}

export function hashSeed(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return hash
}
