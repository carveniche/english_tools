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
const arcCl = (cx, cy, r, a0, a1, steps = 48) => {
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

export const UPPERCASE = {
  a: [
    [p(60, 180), p(100, 60), p(140, 180)],
    h(75, 125, 120),
  ],
  b: [
    v(60, 40, 200),
    [...arc(65, 80, 40, Math.PI * -0.5, Math.PI * 0.5)],
    [...arc(65, 160, 40, Math.PI * -0.5, Math.PI * 0.5)],
  ],
  c: [[...arcCl(100, 120, 60, Math.PI * -0.3, Math.PI * -1.7)]],
  d: [v(60, 50, 187), [...arcCl(60, 120, 68, -Math.PI / 2, Math.PI / 2)]],
  e: [v(70, 50, 180), h(70, 140, 50), h(70, 120, 115), h(70, 140, 180)],
  f: [v(80, 50, 180), h(80, 140, 50), h(80, 120, 115)],
  g: [[...arcCl(95, 120, 60, Math.PI * -0.3, Math.PI * -1.7), ...v(130, 170, 120)], h(130, 80, 120)],
  h: [v(60, 50, 180), v(140, 50, 180), h(60, 140, 115)],
  i: [v(100, 50, 180)],
  j: [
    // straight down


    // perfect curved bottom (same style as small j)
    [
      ...v(120, 50, 185),
      ...arc(105, 185, 15, 0, Math.PI),
    ],
  ],

  k: [v(60, 50, 180), [p(60, 110), p(140, 60)], [p(60, 110), p(140, 170)]],
  l: [v(80, 50, 180), h(80, 140, 180)],
  m: [
    v(60, 50, 180),

    [
      p(60, 50),
      p(100, 120),
      p(140, 50),
      p(140, 180), // continue down from curve end
    ],
  ],

//   n: [
//     // v(60, 50, 180),
// v(60, 40, 200),
//     [
//       p(60, 50),
//       p(140, 180),
//       p(140, 40), // continue up in same stroke
//     ],
//   ],
n: [ v(60,50,180), [p(60,50),p(140,180)], v(140,180,40) ],
  o: [[
    ...arcCl(100, 120, 60, 0, Math.PI * 2, 64),
    p(160, 120), // close path exactly
  ]],

  p: [v(60, 50, 180), [...arc(75, 90, 39, Math.PI * -2.6, Math.PI * -1.4)]],
  q: [[...arcCl(100, 120, 60, 0, Math.PI * 2)], [p(125, 145), p(155, 190)]],
  r: [v(60, 50, 180), [...arc(75, 85, 35, Math.PI * -0.6, Math.PI * 0.6)], [p(75, 120), p(110, 180)]],
  s: [
    // top arc (head)
    // [],

    // bottom arc (tail) — aligned start with top arc end
    [...arc(110, 100, 35, Math.PI * -0.3, Math.PI * -1.5),
    ...arc(110, 170, 35, Math.PI * 1.5, Math.PI * 2.7)],
  ],

  t: [h(70, 130, 50), v(100, 50, 180)],
  u: [
    [
      // left vertical
      p(60, 50),
      p(60, 140),

      // bottom curve
      ...arc(100, 139, 40, Math.PI * 3, Math.PI * 2.1),

      // right vertical
      p(138, 150),
      p(138, 50),
    ],
  ],

  v: [[p(60, 50), p(100, 180), p(140, 50)]],
  w: [[p(50, 50), p(80, 180), p(110, 50), p(140, 180), p(170, 50)]],
  x: [
    [p(60, 50), p(140, 180)],
    [p(140, 50), p(60, 180)],
  ],
  y: [[p(60, 50), p(100, 120), p(140, 50)], [p(100, 120), p(100, 180)]],
  z: [[p(60, 50), p(140, 50)], [p(140, 50), p(60, 180)], [p(60, 180), p(140, 180)]],
};
