const p = (x, y) => ({ x, y });

const arc = (cx, cy, r, a0, a1, steps = 20) => {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = a0 + ((a1 - a0) * i) / steps;
    pts.push(p(cx + Math.cos(t) * r, cy + Math.sin(t) * r));
  }
  return pts;
};

const v = (x, y1, y2) => [p(x, y1), p(x, y2)];
const h = (x1, x2, y) => [p(x1, y), p(x2, y)];

const arcCl = (cx, cy, r, a0, a1, steps = 64) => {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = a0 + ((a1 - a0) * i) / steps;
    pts.push({
      x: cx + Math.cos(t) * r,
      y: cy + Math.sin(t) * r,
    });
  }
  return pts;
};



export const LOWERCASE = {
  a: [
    [...arc(115, 70, 20, Math.PI * -2.9, Math.PI * -2), ...v(135, 65, 170),],

    [...arc(100, 130, 35, Math.PI * -0.2, Math.PI * -1.9)],
  ],
  b: [v(60, 40, 200), [...arc(65, 160, 40, Math.PI * -0.5, Math.PI * 0.5)],],
  //   b: [
  //   v(60, 40, 200),
  //   [...arc(65, 80, 40, Math.PI * -0.5, Math.PI * 0.5)],
  //   [...arc(65, 160, 40, Math.PI * -0.5, Math.PI * 0.5)],
  // ],
  c: [[...arcCl(100, 130, 40, Math.PI * -0.2, Math.PI * -1.8)]],
  d: [v(140, 50, 187), [...arc(107, 160, 35, Math.PI * -2.2, Math.PI * -3.9)]],
  // v(60, 50, 187),
  e: [h(68, 130, 120), [...arcCl(100, 130, 35, Math.PI * -0.1, Math.PI * -1.8)]],
  f: [
    [...arc(120, 60, 22, Math.PI * -2, Math.PI * -2.6), ...v(110, 40, 170)],

    h(80, 140, 105),
  ],
  g: [
    [...arc(102, 145, 32, Math.PI * -0.2, Math.PI * -1.8)],
    [
      // top curve


      // combine vertical down + bottom curve as one path
      ...v(130, 110, 200),
      ...arc(110, 200, 20, Math.PI * 1.9, Math.PI * 2.8).map(({ x, y }) => ({
        x: x + (y - 200) * -0.15, // tilt right: more y → more right
        y,
      })),
    ],
  ],

  h: [
    // main vertical stem
    v(69, 0, 180),

    // curved top hump (true curve, same style as m)
    [
      ...arc(95, 110, -25, 0, Math.PI),
      ...v(120, 110, 180),

    ],

    // down stroke
  ],

  i: [v(100, 110, 180), [p(100, 90), p(100, 90.1)]],
  j: [
    // main down stroke

    // curved bottom hook (true arc)
    [
      ...v(120, 110, 180),
      ...arc(105, 180, 15, 0, Math.PI),
    ],

    // dot
    [p(120, 90), p(120, 90.1)],
  ],

  k: [
    v(60, 50, 180),
    [p(60, 140), p(105, 112)],   // moved slightly down
    [p(60, 140), p(115, 180)]   // moved slightly down
  ],


  l: [v(80, 50, 180)],
  m: [
    // left vertical stem (separate)
    v(50, 90, 180),

    // first hump + its downward vertical (single continuous stroke)
    [
      // first hump + its downward vertical, tilted right a bit
      ...arc(80, 110, -30, 0, Math.PI).map(({ x, y }) => ({ x: x + (y - 110) * 0.10, y })),
      ...v(110, 110, 180).map(({ x, y }) => ({ x: x + (y - 110) * 0.02, y })),
    ],


    // second hump + its downward vertical (single continuous stroke)
    [
      // second hump + its downward vertical, tilted right a bit
      ...arc(140, 110, -30, 0, Math.PI).map(({ x, y }) => ({ x: x + (y - 110) * 0.10, y })),
      ...v(170, 110, 180).map(({ x, y }) => ({ x: x + (y - 110) * 0.02, y })),
    ],

  ],




  n: [
    // left vertical stem
    v(40, 50, 180),

    // top hump (true arc)
    [
      ...arc(100, 110, -60, 0, Math.PI),
      ...v(160, 110, 180),

    ],

    // right vertical stem
  ],

  o: [[...arcCl(100, 130, 40, 0, Math.PI * 2)]],
  p: [v(60, 110, 210), [...arcCl(75, 140, 35, Math.PI * 1.4, Math.PI * 2.7)]],
  q: [v(140, 90, 200), [...arcCl(100, 130, 40, 0, Math.PI * -1.8)]],
  r: [
    // vertical stem

    v(60, 90, 180),
    // top shoulder (same arc style as m, but smaller)
    [

      ...arc(85, 110, -25, 0, Math.PI),
    ],
  ],

  s: [
    // top arc
    // [],

    // bottom arc — adjust center so junction matches
    [...arc(110, 100, 20, Math.PI * -0.4, Math.PI * -1.5),
    ...arc(110, 140, 20, Math.PI * 1.5, Math.PI * 2.7)],
  ],

  t: [[...v(100, 50, 180), ...arc(110, 175, 10, Math.PI * 2.9, Math.PI * 2)], h(75, 125, 90)],
  u: [
    // main stroke: left vertical → bottom curve → right vertical
    [
      p(60, 110),  // left vertical top
      p(60, 150),  // left vertical bottom

      // bottom curve
      ...arc(90, 150, 30, Math.PI, 0),

      // right vertical
      p(120, 150),
      p(120, 110),
    ],

    // separate tip at the bottom
    [
      p(120, 110),  // start from bottom of right vertical
      p(122, 175),  // extend downward as tip
    ],
  ],




  v: [[p(60, 110), p(100, 180), p(140, 110)]],
  w: [[p(50, 110), p(80, 180), p(110, 110), p(140, 180), p(170, 110)]],
  x: [
    [p(60, 110), p(140, 180)],
    [p(140, 110), p(60, 180)],
  ],
  y: [
    [
      // left arm → join → right arm going down
      p(60, 80),
      p(90, 150),   // join point

    ],
    [
      // tail continues from join, tilted to the left
      p(113, 80),
      p(100, 120),   // join point stays
      p(80, 180),    // bottom moves left → left inclination
    ],

  ],

  z: [
    [p(60, 110), p(140, 110)],
    [p(140, 110), p(60, 180)],
    [p(60, 180), p(140, 180)],
  ],
};
