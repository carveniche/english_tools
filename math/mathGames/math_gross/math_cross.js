const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const OPERATORS = ["+", "-", "×", "÷"];

let idCounter = 1;
const newId = () => "I" + idCounter++;

/* ---------------- SAFE COMPUTE ---------------- */

function compute(a, op, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b >= 0 ? a - b : null;
    case "×": return a * b;
    case "÷": return b !== 0 && a % b === 0 ? a / b : null;
    default: return null;
  }
}

function validOpsFor(a, b) {
  return OPERATORS.filter(op => compute(a, op, b) !== null);
}
const MAX_RESULT = 99;

/* ---------------- EQUATION ---------------- */

function generateEquation(values, maxAttempts = 300) {
  if (values.length < 2) return null;

  for (let k = 0; k < maxAttempts; k++) {
    const op = OPERATORS[rand(0, OPERATORS.length - 1)];
    let cur = values[0];
    let ok = true;
    const ops = [];

    for (let i = 1; i < values.length; i++) {
      const res = compute(cur, op, values[i]);
      if (res === null || res > MAX_RESULT) {
        ok = false;
        break;
      }
      cur = res;
      ops.push(op);
    }

    if (ok) return { ops, result: cur };
  }

  return null;
}



/* ---------------- SHAPE MASK ---------------- */

function generateShapeMask(n) {
  const mask = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => Math.random() < 0.75)
  );

  // ensure at least one true per row
  for (let r = 0; r < n; r++) {
    if (!mask[r].some(Boolean)) {
      const c = rand(0, n - 2);
      mask[r][c] = true;
      mask[r][c + 1] = true;
    }
  }

  // ensure at least one horizontal run >= 2 per row
  for (let r = 0; r < n; r++) {
    let hasRun = false;
    for (let c = 0; c < n - 1; c++) {
      if (mask[r][c] && mask[r][c + 1]) {
        hasRun = true;
        break;
      }
    }
    if (!hasRun) {
      const c = rand(0, n - 2);
      mask[r][c] = true;
      mask[r][c + 1] = true;
    }
  }

  return mask;
}


/* ---------------- RUN EXTRACTION ---------------- */

function extractRuns(arr) {
  const runs = [];
  let run = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != null) run.push({ i, v: arr[i] });
    else if (run.length) { runs.push(run); run = []; }
  }
  if (run.length) runs.push(run);
  return runs;
}

/* ---------------- MAIN GENERATOR ---------------- */

export function generatePuzzle(sizeInput) {
  const size = Number(sizeInput);
  if (!Number.isInteger(size) || ![5, 7, 9].includes(size)) {
    throw new Error("Size must be 5, 7, or 9");
  }

  idCounter = 1;

  const valueCount = (size - 1) / 2;
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const answers = {};

  const shape = generateShapeMask(valueCount);
  const values = shape.map(row => row.map(v => (v ? rand(1, 9) : null)));

  let totalInputs = 0;
  const MAX_INPUTS = 5;

  /* -------- HORIZONTAL -------- */

  for (let r = 0; r < valueCount; r++) {
    const runs = extractRuns(values[r]);

    for (const run of runs) {
      const nums = run.map(x => x.v);
      const eq = generateEquation(nums);
      if (!eq) continue;

      const hideIndex =
        totalInputs < MAX_INPUTS ? rand(0, nums.length - 1) : -1;

      run.forEach((cell, i) => {
        const gr = r * 2;
        const gc = cell.i * 2;

        if (i === hideIndex) {
          const id = newId();
          grid[gr][gc] = { type: "input", id };
          answers[id] = cell.v;
          totalInputs++;
        } else {
          grid[gr][gc] = { type: "number", value: cell.v };
        }

        if (i < eq.ops.length) {
          grid[gr][gc + 1] = { type: "op", value: eq.ops[i] };
        }
      });

      const endCol = run[run.length - 1].i * 2;
      grid[r * 2][endCol + 1] = { type: "eq", value: "=" };
      grid[r * 2][endCol + 2] = { type: "number", value: eq.result };
    }
  }

  /* -------- VERTICAL -------- */

  for (let c = 0; c < valueCount; c++) {
    const col = values.map(row => row[c]);
    const runs = extractRuns(col);

    for (const run of runs) {
      const nums = run.map(x => x.v);
      const eq = generateEquation(nums);
      if (!eq) continue;

      const hideIndex =
        totalInputs < MAX_INPUTS ? rand(0, nums.length - 1) : -1;

      run.forEach((cell, i) => {
        const gr = cell.i * 2;
        const gc = c * 2;

        if (!grid[gr][gc]) {
          if (i === hideIndex) {
            const id = newId();
            grid[gr][gc] = { type: "input", id };
            answers[id] = cell.v;
            totalInputs++;
          } else {
            grid[gr][gc] = { type: "number", value: cell.v };
          }
        }

        if (i < eq.ops.length) {
          grid[gr + 1][gc] = { type: "op", value: eq.ops[i] };
        }
      });

      const endRow = run[run.length - 1].i * 2;
      grid[endRow + 1][c * 2] = { type: "eq", value: "=" };
      grid[endRow + 2][c * 2] = { type: "number", value: eq.result };
    }
  }

  return { grid, answers };
}