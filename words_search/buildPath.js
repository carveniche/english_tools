import { useEffect, useState } from "react";

export function buildPath(a, b) {
  const path = [];
  if (!b) return path;
  if (a.r === b.r) {
    const [c1, c2] = a.c < b.c ? [a.c, b.c] : [b.c, a.c];
    for (let c = c1; c <= c2; c++) path.push({ r: a.r, c });
  } else if (a.c === b.c) {
    const [r1, r2] = a.r < b.r ? [a.r, b.r] : [b.r, a.r];
    for (let r = r1; r <= r2; r++) path.push({ r, c: a.c });
  } else if (Math.abs(a.r - b.r) === Math.abs(a.c - b.c)) {
    const steps = Math.abs(a.r - b.r);
    const dr = b.r > a.r ? 1 : -1;
    const dc = b.c > a.c ? 1 : -1;
    for (let i = 0; i <= steps; i++)
      path.push({ r: a.r + i * dr, c: a.c + i * dc });
  }
  return path;
}

export function useViewportSize() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onR = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return vp;
}

export const COLS = 12;
export const FOUND_COLORS = [
  "#FF4C4C", // vivid red
  "#FF7F50", // coral
  "#FFB347", // warm amber
  "#6AB04C", // bright olive green
  "#2980B9", // ocean blue
  "#8E44AD", // deep purple
  "#16A085", // teal
  "#F39C12", // golden yellow
];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const ROWS = 8;
export function generatePuzzleFromSet(words) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
  const placed = [];

  const chosen = shuffle(words).slice(0, 8);
  const diagCount = Math.max(1, Math.min(2, chosen.length >= 8 ? 2 : 1));
  const diagWords = chosen.slice(0, diagCount);
  const straightWords = chosen.slice(diagCount);

  for (const w of diagWords) {
    if (!placeWord(grid, w, placed, ["diagDR", "diagDL"])) {
      console.warn(
        `Could not place diagonal word: ${w}, retrying with new grid`,
      );
      return generatePuzzleFromSet(words);
    }
  }
  for (const w of straightWords) {
    if (!placeWord(grid, w, placed, ["across", "down"])) {
      console.warn(
        `Could not place straight word: ${w}, retrying with new grid`,
      );
      return generatePuzzleFromSet(words);
    }
  }

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!grid[r][c]) grid[r][c] = ALPHA[Math.floor(Math.random() * 26)];

  return { grid, words: chosen, placed };
}


function placeWord(
  grid,
  word,
  placed,
  allowedDirs = ["across", "down", "diagDR", "diagDL"],
) {
  const dirs = shuffle(allowedDirs);
  for (const dir of dirs) {
    let maxR = ROWS - 1,
      maxC = COLS - 1,
      minR = 0,
      minC = 0;
    if (dir === "down") {
      maxR = ROWS - word.length;
    }
    if (dir === "across") {
      maxC = COLS - word.length;
    }
    if (dir === "diagDR") {
      maxR = ROWS - word.length;
      maxC = COLS - word.length;
    }
    if (dir === "diagDL") {
      maxR = ROWS - word.length;
      minC = word.length - 1;
      maxC = COLS - 1;
    }

    if (word.length > Math.max(ROWS, COLS)) continue;

    for (let t = 0; t < 500; t++) {
      const r0 = Math.floor(Math.random() * (maxR - minR + 1)) + minR;
      const c0 = Math.floor(Math.random() * (maxC - minC + 1)) + minC;
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const r =
          r0 + (dir === "down" || dir === "diagDR" || dir === "diagDL" ? i : 0);
        const c =
          c0 +
          (dir === "across" || dir === "diagDR" ? i : 0) +
          (dir === "diagDL" ? -i : 0);
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) {
          ok = false;
          break;
        }
        const ch = grid[r][c];
        if (ch && ch !== word[i]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) {
        const r =
          r0 + (dir === "down" || dir === "diagDR" || dir === "diagDL" ? i : 0);
        const c =
          c0 +
          (dir === "across" || dir === "diagDR" ? i : 0) +
          (dir === "diagDL" ? -i : 0);
        grid[r][c] = word[i];
      }
      placed.push({ word, dir, r0, c0, len: word.length });
      return true;
    }
  }
  console.warn(`Failed to place word: ${word}`);
  return false;
}