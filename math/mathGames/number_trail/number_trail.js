
let index = 0;

const promptTemplates = [
  "Find all ways that add up to"
];

const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// directions: R, L, D, U
const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

export function generateQuestion() {
  const prompt =
    promptTemplates[Math.floor(Math.random() * promptTemplates.length)];

  const SIZE = 5;
  const grid = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => 0)
  );

  /* ---------------- 1️⃣ CREATE CONTINUOUS PATH ---------------- */

  const pathLength = rand(3, 5); // must slide ≥ 3 cells

  let r = rand(0, SIZE - 1);
  let c = rand(0, SIZE - 1);

  const path = [[r, c]];
  const used = new Set([`${r}-${c}`]);

  while (path.length < pathLength) {
    const shuffledDirs = [...DIRS].sort(() => Math.random() - 0.5);

    let moved = false;
    for (const [dr, dc] of shuffledDirs) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr}-${nc}`;

      if (
        nr >= 0 &&
        nr < SIZE &&
        nc >= 0 &&
        nc < SIZE &&
        !used.has(key)
      ) {
        r = nr;
        c = nc;
        used.add(key);
        path.push([r, c]);
        moved = true;
        break;
      }
    }

    // fallback safety (should rarely happen)
    if (!moved) break;
  }

  /* ---------------- 2️⃣ PLACE NUMBERS ON PATH ---------------- */

  let target = 0;
  path.forEach(([pr, pc]) => {
    const val = rand(2, 7);
    grid[pr][pc] = val;
    target += val;
  });

  /* ---------------- 3️⃣ FILL REMAINING CELLS ---------------- */

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (grid[i][j] === 0) {
        grid[i][j] = rand(1, 8);
      }
    }
  }

  /* ---------------- 4️⃣ RETURN QUESTION ---------------- */

  const question = {
    id: `q${++index}`,
    prompt: `${prompt} ${target}`,
    target,
    grid,
  };

  return question;
}