export const THEMES = {
  glass: {
    label: 'Rainbow Glass',
    floor: '#203946',
    map: '#9be7ff'
  },
  water: {
    label: 'Pool Atrium',
    floor: '#063b52',
    map: '#1aa8d2'
  },
  geo: {
    label: 'Geometric Wonderland',
    floor: '#241a3d',
    map: '#7affbf'
  }
};

const DIRECTIONS = [
  { key: 'n', opposite: 's', dx: 0, dz: -1 },
  { key: 'e', opposite: 'w', dx: 1, dz: 0 },
  { key: 's', opposite: 'n', dx: 0, dz: 1 },
  { key: 'w', opposite: 'e', dx: -1, dz: 0 }
];

export function makeRng(seedText = 'opal-rain') {
  let seed = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i += 1) {
    seed = Math.imul(seed ^ seedText.charCodeAt(i), 3432918353);
    seed = (seed << 13) | (seed >>> 19);
  }

  return function rng() {
    seed = Math.imul(seed ^ (seed >>> 16), 2246822507);
    seed = Math.imul(seed ^ (seed >>> 13), 3266489909);
    return ((seed ^= seed >>> 16) >>> 0) / 4294967296;
  };
}

export function cellIndex(size, x, z) {
  return z * size + x;
}

export function getCell(maze, x, z) {
  if (!maze || x < 0 || z < 0 || x >= maze.size || z >= maze.size) return null;
  return maze.cells[cellIndex(maze.size, x, z)];
}

export function directionBetween(a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  return DIRECTIONS.find((direction) => direction.dx === dx && direction.dz === dz) || null;
}

export function removeWall(a, b) {
  const direction = directionBetween(a, b);
  if (!direction) return;
  a.walls[direction.key] = false;
  b.walls[direction.opposite] = false;
}

export function generateMaze({ complexity = 6, gemGoal = 8, seed = 'opal-rain' } = {}) {
  const rng = makeRng(seed);
  const size = Math.max(7, Math.min(29, 7 + Math.round(complexity) * 2));
  const cells = Array.from({ length: size * size }, (_, index) => {
    const x = index % size;
    const z = Math.floor(index / size);
    return {
      x,
      z,
      walls: { n: true, e: true, s: true, w: true },
      theme: 'glass',
      solid: false,
      visited: false
    };
  });

  const start = cells[0];
  start.visited = true;
  const stack = [start];

  while (stack.length) {
    const current = stack[stack.length - 1];
    const neighbors = DIRECTIONS.map((direction) => {
      const next = getCell({ size, cells }, current.x + direction.dx, current.z + direction.dz);
      return next && !next.visited ? next : null;
    }).filter(Boolean);

    if (!neighbors.length) {
      stack.pop();
      continue;
    }

    const next = neighbors[Math.floor(rng() * neighbors.length)];
    removeWall(current, next);
    next.visited = true;
    stack.push(next);
  }

  const braidCount = Math.floor(size * size * (0.03 + complexity * 0.018));
  for (let i = 0; i < braidCount; i += 1) {
    const cell = cells[Math.floor(rng() * cells.length)];
    const direction = DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)];
    const neighbor = getCell({ size, cells }, cell.x + direction.dx, cell.z + direction.dz);
    if (neighbor) removeWall(cell, neighbor);
  }

  for (const cell of cells) {
    const nx = cell.x / Math.max(1, size - 1);
    const nz = cell.z / Math.max(1, size - 1);
    const waterLake =
      Math.pow((nx - 0.52) / 0.22, 2) + Math.pow((nz - 0.54) / 0.26, 2) < 1;

    if (waterLake || (nx > 0.42 && nx < 0.7 && rng() > 0.82)) {
      cell.theme = 'water';
    } else if (nx > 0.62 || (nx > 0.48 && nz < 0.34 && rng() > 0.58)) {
      cell.theme = 'geo';
    } else {
      cell.theme = 'glass';
    }
  }

  start.theme = 'glass';
  const candidates = cells
    .filter((cell) => cell !== start && cell.x + cell.z > Math.floor(size * 0.35))
    .sort(() => rng() - 0.5);
  const gems = candidates.slice(0, Math.min(gemGoal, candidates.length)).map((cell, id) => ({
    id,
    x: cell.x,
    z: cell.z,
    collected: false
  }));

  for (const cell of cells) cell.visited = false;

  return {
    size,
    complexity,
    gemGoal: gems.length,
    seed,
    cells,
    gems,
    start: { x: 0, z: 0 }
  };
}

export function hasWall(cell, key) {
  return Boolean(cell?.walls?.[key]);
}

export function getThemeLabel(theme) {
  return THEMES[theme]?.label || 'Unknown';
}

export function countRemainingGems(maze) {
  return maze.gems.filter((gem) => !gem.collected).length;
}

export function nearestGemDistance(maze, fromCell) {
  let nearest = Infinity;
  for (const gem of maze.gems) {
    if (gem.collected) continue;
    const distance = Math.abs(gem.x - fromCell.x) + Math.abs(gem.z - fromCell.z);
    nearest = Math.min(nearest, distance);
  }
  return Number.isFinite(nearest) ? nearest : 0;
}
