import React, { useEffect, useMemo, useRef, useState } from "react";

const LETTERS = Array.from("abcdefghijklmnopqrstuvwxyz");

const WORD_BANK = {
  a: { word: "apple", type: "apple" },
  b: { word: "ball", type: "ball" },
  c: { word: "cat", type: "cat" },
  d: { word: "dog", type: "dog" },
  e: { word: "egg", type: "egg" },
  f: { word: "fish", type: "fish" },
  g: { word: "gift", type: "gift" },
  h: { word: "hat", type: "hat" },
  i: { word: "igloo", type: "igloo" },
  j: { word: "jam", type: "jam" },
  k: { word: "kite", type: "kite" },
  l: { word: "leaf", type: "leaf" },
  m: { word: "moon", type: "moon" },
  n: { word: "nest", type: "nest" },
  o: { word: "octopus", type: "octopus" },
  p: { word: "pen", type: "pen" },
  q: { word: "queen", type: "queen" },
  r: { word: "ring", type: "ring" },
  s: { word: "sun", type: "sun" },
  t: { word: "tree", type: "tree" },
  u: { word: "umbrella", type: "umbrella" },
  v: { word: "van", type: "van" },
  w: { word: "watch", type: "watch" },
  x: { word: "xylophone", type: "xylophone" },
  y: { word: "yarn", type: "yarn" },
  z: { word: "zebra", type: "zebra" },
};

const getWordForLetter = (l) => WORD_BANK[l]?.word ?? l.toUpperCase();

const D_LEVELS = {
  beginTargets: ["dad", "dot", "duck", "dig", "down", "doll", "dog", "dice", "dip", "day"],
  beginDistractors: ["pot", "bat", "pat", "pan", "nap"],
  endTargets: ["bad", "bed", "dad", "rod", "red", "sad", "pod", "rid", "mad", "bud"],
  endDistractors: ["lab", "tap", "cap", "nap", "nab"],
};

function soundLabel(letter) {
  return letter ? `/${letter}/` : "";
}

function speak(text) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.pitch = 1.0;

  const voices = synth.getVoices?.() ?? [];
  const preferred = voices.find((v) => /female|woman|zira|susan|samantha|tessa/i.test(v.name));
  if (preferred) u.voice = preferred;

  synth.cancel();
  synth.speak(u);
}

function playChime(kind) {
  if (typeof window === "undefined") return;
  const ACtx = window.AudioContext || window.webkitAudioContext;
  if (!ACtx) return;

  const ctx = new ACtx();
  const now = ctx.currentTime;

  const makeOsc = (
    freq,
    t0,
    dur,
    type = "sine",
    gain = 0.08
  ) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, now + t0);
    g.gain.setValueAtTime(0.0001, now + t0);
    g.gain.exponentialRampToValueAtTime(gain, now + t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t0 + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(now + t0);
    o.stop(now + t0 + dur + 0.02);
  };

  if (kind === "happy") {
    makeOsc(880, 0.0, 0.12, "sine", 0.09);
    makeOsc(1175, 0.12, 0.12, "sine", 0.08);
    makeOsc(1568, 0.24, 0.14, "sine", 0.07);
  } else if (kind === "oops") {
    makeOsc(220, 0.0, 0.16, "triangle", 0.09);
    makeOsc(180, 0.12, 0.18, "triangle", 0.08);
  } else {
    makeOsc(520, 0.0, 0.08, "sawtooth", 0.05);
    makeOsc(320, 0.06, 0.10, "sawtooth", 0.04);
  }

  setTimeout(() => ctx.close?.(), 450);
}

function SvgPicture({ kind }) {
  return (
    <svg viewBox="0 0 96 96" className="w-24 h-24 drop-shadow">
      <rect width="96" height="96" fill="none" />
      {kind === "apple" && (
        <g>
          <circle cx="48" cy="52" r="16" fill="#ef233c" />
          <rect x="46" y="36" width="4" height="8" fill="#2d6a4f" />
          <ellipse cx="60" cy="40" rx="7" ry="3.5" fill="#52b788" />
        </g>
      )}
      {kind === "ball" && <circle cx="48" cy="48" r="30" fill="#ffbe0b" />}
      {kind === "cat" && <circle cx="48" cy="54" r="18" fill="#ff99c8" />}
      {kind === "dog" && <rect x="22" y="46" width="52" height="22" rx="10" fill="#56cfe1" />}
      {kind === "sun" && <circle cx="48" cy="48" r="16" fill="#ffd166" />}
      {kind === "hat" && (
        <g>
          <ellipse cx="48" cy="60" rx="24" ry="6" fill="#6d6875" />
          <rect x="36" y="40" width="24" height="20" rx="6" fill="#b56576" />
        </g>
      )}
      {kind === "fish" && (
        <g>
          <ellipse cx="44" cy="50" rx="18" ry="10" fill="#00b4d8" />
          <polygon points="60,50 70,44 70,56" fill="#0096c7" />
        </g>
      )}
      {!(["apple", "ball", "cat", "dog", "sun", "hat", "fish"]).includes(kind) && (
        <circle cx="48" cy="48" r="18" fill="#a78bfa" opacity="0.9" />
      )}
    </svg>
  );
}

function BalloonSVG() {
  return (
    <svg viewBox="0 0 120 160" className="w-20 h-28">
      <defs>
        <linearGradient id="balloonGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff4d6d" />
          <stop offset="1" stopColor="#ff2e63" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="60" rx="44" ry="56" fill="url(#balloonGrad)" />
      <path d="M22 64 C40 20, 80 20, 98 64" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="5" />
      <rect x="50" y="110" width="20" height="16" rx="4" fill="#c77dff" />
      <line x1="45" y1="96" x2="50" y2="110" stroke="#6d6875" strokeWidth={3} />
      <line x1="75" y1="96" x2="70" y2="110" stroke="#6d6875" strokeWidth={3} />
      <circle cx="60" cy="60" r="10" fill="#ffd166" opacity="0.32" />
      <circle cx="70" cy="48" r="4" fill="#ffffff" opacity="0.25" />
    </svg>
  );
}

function Bird({ x, y, sad }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x - 30, top: y - 22 }}>
      <svg viewBox="0 0 120 80" className="w-16 h-12 drop-shadow">
        <path d="M20 44 C30 20, 52 18, 60 36 C46 34, 34 38, 20 44 Z" fill="#60a5fa" opacity="0.95" />
        <path d="M60 36 C68 18, 90 20, 100 44 C86 38, 74 34, 60 36 Z" fill="#93c5fd" opacity="0.95" />
        <ellipse cx="60" cy="46" rx="18" ry="14" fill="#2563eb" />
        <circle cx="54" cy="44" r="3" fill="#0f172a" />
        <polygon points="78,46 92,52 78,58" fill="#f59e0b" />
        {!sad ? (
          <path d="M50 54 Q60 62 70 54" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path d="M50 62 Q60 52 70 62" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        )}
        {sad && <path d="M50 48 C48 52, 48 56, 50 58 C52 56, 52 52, 50 48 Z" fill="rgba(59,130,246,0.55)" />}
      </svg>
    </div>
  );
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randRange(a, b) {
  return a + Math.random() * (b - a);
}
function gameWidth() {
  return typeof window === "undefined" ? 1024 : window.innerWidth;
}
function gameHeight() {
  return typeof window === "undefined" ? 768 : window.innerHeight;
}

function getLevelData(letter, level) {
  const l = letter.toLowerCase();
  if (l === "d") {
    if (level === "begin") return { targets: D_LEVELS.beginTargets, distractors: D_LEVELS.beginDistractors, title: "Find words that START with" };
    if (level === "end") return { targets: D_LEVELS.endTargets, distractors: D_LEVELS.endDistractors, title: "Find words that END with" };
  }

  // fallback for other letters
  if (level === "begin") {
    const base = getWordForLetter(l);
    const targets = Array.from({ length: 10 }).map((_, i) => (i === 0 ? base : base));
    const distractors = ["map", "tap", "lip", "sun", "pen"].slice(0, 5);
    return { targets, distractors, title: "Find words that START with" };
  }
  if (level === "end") {
    const targets = Array.from({ length: 10 }).map(() => `...${l}`);
    const distractors = ["lab", "tap", "cap", "nap", "nab"].slice(0, 5);
    return { targets, distractors, title: "Find words that END with" };
  }
  // letter level
  return { targets: Array.from({ length: 10 }).map(() => l), distractors: Array.from({ length: 5 }).map(() => randomFrom(LETTERS.filter((x) => x !== l))), title: "Find the letter sound" };
}

function buildCloudLayout(opts) {
  const { targets, distractors, lanes, width } = opts;

  const safeLanes = lanes.length ? lanes : [170, 320, 470, 620];
  const total = targets.length + distractors.length;

  const gapX = 240;
  const startX = width + 260;

  const plan = [];
  targets.forEach((t, i) => plan.push({ isTarget: true, lane: i % safeLanes.length, text: t }));
  distractors.forEach((d, i) => plan.push({ isTarget: false, lane: (i + 1) % safeLanes.length, text: d }));

  // shuffle
  for (let i = plan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = plan[i];
    plan[i] = plan[j];
    plan[j] = tmp;
  }
  // avoid 3-in-row same lane
  for (let i = 2; i < plan.length; i++) {
    if (plan[i].lane === plan[i - 1].lane && plan[i].lane === plan[i - 2].lane) {
      plan[i].lane = (plan[i].lane + 1) % safeLanes.length;
    }
  }

  let id = opts.nextId;
  const entities = [];

  for (let i = 0; i < total; i++) {
    const p = plan[i];
    const y = safeLanes[p.lane] + randRange(-26, 26);
    const x = startX + i * gapX;
    const speed = randRange(58, 86);

    entities.push({
      id: id++,
      x,
      y,
      vx: -speed,
      vy: 0,
      r: 56,
      kind: "cloud",
      text: p.text,
      isTarget: p.isTarget,
    });
  }

  return { entities, nextId: id };
}

function makeSessionLetters(n) {
  const pool = [...LETTERS];
  const chosen = ["d"];
  while (chosen.length < n && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    const l = pool.splice(idx, 1)[0];
    if (!chosen.includes(l)) chosen.push(l);
  }
  return chosen.slice(0, n);
}

function Cloud({ x, y, text, glow, squish }) {
  const isWord = text.length > 1;
  const fontSize = !isWord ? 34 : text.length <= 3 ? 30 : text.length <= 4 ? 28 : 24;

  return (
    <div
      className={"absolute pointer-events-none " + (squish || glow ? "cloud-pop" : "cloud-idle")}
      style={{ left: x - 62, top: y - 40 }}
    >
      <svg viewBox="0 0 160 96" className="w-44 h-24">
        <defs>
          <linearGradient id="cloudFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#EAF6FF" />
          </linearGradient>
          <filter id="cloudShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.12" />
          </filter>
        </defs>

        <g filter="url(#cloudShadow)">
          <path
            d="M44 72
               C26 72, 16 62, 16 50
               C16 38, 26 28, 38 30
               C42 18, 54 10, 68 14
               C76 6, 90 6, 98 14
               C114 12, 126 22, 128 36
               C144 38, 154 50, 150 64
               C146 76, 132 82, 120 78
               C112 86, 98 90, 86 86
               C78 92, 62 92, 54 84
               C50 72, 44 72, 44 72 Z"
            fill="url(#cloudFill)"
            stroke="#D0E5FF"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d="M44 72
               C26 72, 16 62, 16 50
               C16 38, 26 28, 38 30
               C42 18, 54 10, 68 14
               C76 6, 90 6, 98 14
               C114 12, 126 22, 128 36
               C144 38, 154 50, 150 64
               C146 76, 132 82, 120 78
               C112 86, 98 90, 86 86
               C78 92, 62 92, 54 84
               C50 72, 44 72, 44 72 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            opacity="0.95"
            strokeLinejoin="round"
          />
        </g>

        <text
          x="82"
          y="56"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight="900"
          fill="#0c4a6e"
        >
          {text}
        </text>

        {glow && (
          <g opacity="0.95">
            <path d="M24 26 L26 34 L34 36 L26 38 L24 46 L22 38 L14 36 L22 34 Z" fill="rgba(255,215,0,0.85)" />
            <path d="M140 30 L142 36 L148 38 L142 40 L140 46 L138 40 L132 38 L138 36 Z" fill="rgba(255,215,0,0.75)" />
          </g>
        )}
      </svg>

      <style>{`
        @keyframes cloudIdle {
          0% { transform: scale(1); }
          100% { transform: scale(1.02); }
        }
        @keyframes cloudPop {
          0% { transform: scale(1); }
          50% { transform: scale(0.92); }
          100% { transform: scale(1.06); }
        }
        .cloud-idle { animation: cloudIdle 1.8s ease-in-out infinite alternate; }
        .cloud-pop { animation: cloudPop 240ms ease-out 1; }
      `}</style>
    </div>
  );
}

function DriftClouds() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="absolute opacity-45 pointer-events-none" style={{ left: (i * 320) % gameWidth(), top: 70 + (i % 3) * 160 }}>
          <svg viewBox="0 0 200 100" className="w-52 h-24">
            <g>
              <circle cx="60" cy="60" r="28" fill="#ffffff" stroke="#cfe8ff" strokeWidth={2} />
              <circle cx="100" cy="48" r="32" fill="#ffffff" stroke="#cfe8ff" strokeWidth={2} />
              <circle cx="140" cy="60" r="28" fill="#ffffff" stroke="#cfe8ff" strokeWidth={2} />
            </g>
          </svg>
        </div>
      ))}
    </>
  );
}

function Twinkles() {
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none opacity-65"
          style={{
            left: (i * 150 + 60) % gameWidth(),
            top: 90 + ((i * 97) % Math.max(260, gameHeight() - 320)),
            animation: `twinkle ${2.4 + (i % 5) * 0.4}s ease-in-out ${i * 0.12}s infinite alternate`,
          }}
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3">
            <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="rgba(255,255,255,0.95)" />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes twinkle {
          from { transform: translateY(0px) scale(0.9); opacity: 0.5; }
          to   { transform: translateY(-10px) scale(1.15); opacity: 0.95; }
        }
      `}</style>
    </>
  );
}

function CuteSkyBackground() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-cyan-100" />

      <div className="absolute left-4 top-5 opacity-80 pointer-events-none">
        <svg viewBox="0 0 260 140" className="w-44 h-28 drop-shadow">
          <path d="M20 120 C60 30, 200 30, 240 120" fill="none" stroke="rgba(255,0,110,0.7)" strokeWidth="14" strokeLinecap="round" />
          <path d="M32 120 C70 44, 190 44, 228 120" fill="none" stroke="rgba(255,190,11,0.7)" strokeWidth="14" strokeLinecap="round" />
          <path d="M44 120 C80 58, 180 58, 216 120" fill="none" stroke="rgba(0,180,216,0.65)" strokeWidth="14" strokeLinecap="round" />
          <path d="M56 120 C90 72, 170 72, 204 120" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="14" strokeLinecap="round" />
        </svg>
      </div>

      <div className="absolute right-10 top-8 pointer-events-none">
        <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow">
          <circle cx="60" cy="60" r="22" fill="#ffd34e" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 12;
            return (
              <line
                key={i}
                x1={60 + Math.cos(a) * 30}
                y1={60 + Math.sin(a) * 30}
                x2={60 + Math.cos(a) * 44}
                y2={60 + Math.sin(a) * 44}
                stroke="#ffb703"
                strokeWidth={5}
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="52" cy="58" r="3" fill="#7c2d12" />
          <circle cx="68" cy="58" r="3" fill="#7c2d12" />
          <path d="M50 70 Q60 78 70 70" fill="none" stroke="#7c2d12" strokeWidth="4" strokeLinecap="round" />
          <circle cx="44" cy="66" r="4" fill="rgba(239,68,68,0.35)" />
          <circle cx="76" cy="66" r="4" fill="rgba(239,68,68,0.35)" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none">
        <svg viewBox="0 0 1200 260" className="w-full h-full">
          <path d="M0 220 C160 140, 280 260, 420 210 C560 160, 700 250, 840 200 C980 150, 1080 220, 1200 180 L1200 260 L0 260 Z" fill="rgba(34,197,94,0.35)" />
          <path d="M0 240 C160 190, 320 260, 480 230 C640 200, 760 260, 920 220 C1080 180, 1140 240, 1200 210 L1200 260 L0 260 Z" fill="rgba(16,185,129,0.45)" />
          {Array.from({ length: 18 }).map((_, i) => (
            <circle key={i} cx={40 + i * 65} cy={230 + (i % 3) * 8} r="3" fill={i % 2 ? "rgba(255,0,110,0.35)" : "rgba(99,102,241,0.30)"} />
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function HotAirBalloonPhonics() {
  const [phase, setPhase] = useState("play");
  const [sessionLetters, setSessionLetters] = useState(() => makeSessionLetters(10));
  const [letterIndex, setLetterIndex] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [stars, setStars] = useState(3);
  const [totalScore, setTotalScore] = useState(0);

  const goalHits = 10;
  const distractorCount = 5;
  const [hits, setHits] = useState(0);

  const [wobble, setWobble] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [lastCorrectId, setLastCorrectId] = useState(null);
  const [lastHitId, setLastHitId] = useState(null);
  const [scoreBump, setScoreBump] = useState(false);
  const [scoreShine, setScoreShine] = useState(false);
  const [frame, setFrame] = useState(0);

  const gameRef = useRef(null);
  const entitiesRef = useRef([]);
  const nextId = useRef(1);

  const lastTRef = useRef(null);
  const birdAccumRef = useRef(0);

  const balloonRef = useRef({ x: 180, y: 300, r: 30 });
  const balloonPrevRef = useRef({ x: 180, y: 300 });
  const balloonMovingRef = useRef(false);
  const draggingRef = useRef(false);

  const letter = (sessionLetters[letterIndex] ?? "d").toLowerCase();
  const level = levelIndex === 0 ? "letter" : levelIndex === 1 ? "begin" : "end";

  const { targets, distractors, title } = useMemo(() => getLevelData(letter, level), [letter, level]);

  const progressPct = Math.round((hits / Math.max(1, goalHits)) * 100);

  const lanes = useMemo(() => {
    const top = 150;
    const gap = 155;
    return [top, top + gap, top + gap * 2, top + gap * 3].filter((y) => y < gameHeight() - 180);
  }, [frame]);

  // reset per level
  useEffect(() => {
    if (phase !== "play") return;
    setTimeLeft(30);
    setHits(0);
    setLastCorrectId(null);
    setLastHitId(null);

    balloonRef.current = { x: 180, y: Math.min(320, gameHeight() - 220), r: 30 };
    balloonPrevRef.current = { x: balloonRef.current.x, y: balloonRef.current.y };

    const built = buildCloudLayout({
      targets,
      distractors,
      lanes,
      nextId: nextId.current,
      width: gameWidth(),
    });
    entitiesRef.current = built.entities;
    nextId.current = built.nextId;

    lastTRef.current = null;
    birdAccumRef.current = 0;
  }, [phase, letterIndex, levelIndex]);

  // timer
  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          advanceLevel();
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, letterIndex, levelIndex]);

  // game loop
  useEffect(() => {
    if (phase !== "play") return;
    let raf = 0;

    const step = (t) => {
      if (lastTRef.current == null) lastTRef.current = t;
      const dt = Math.min(0.05, (t - lastTRef.current) / 1000);
      lastTRef.current = t;

      // birds occasionally
      birdAccumRef.current += dt;
      if (birdAccumRef.current >= 1.9) {
        birdAccumRef.current = 0;
        if (Math.random() < 0.6) spawnBird(lanes);
      }

      // move entities
      const arr = entitiesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const e = arr[i];
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.y += Math.sin((t / 700 + e.id) * 1.1) * 0.14;

        if (e.kind === "bird" && e.sadUntil && t > e.sadUntil) e.sadUntil = undefined;
        if (e.x < -220) arr.splice(i, 1);
      }

      // decisive movement check
      const bp = balloonPrevRef.current;
      const b = balloonRef.current;
      const dx = b.x - bp.x;
      const dy = b.y - bp.y;
      const speed = Math.hypot(dx, dy) / Math.max(dt, 0.016);
      balloonMovingRef.current = draggingRef.current && speed > 22;
      balloonPrevRef.current = { x: b.x, y: b.y };

      handleCollisions(t);

      setFrame((f) => f + 1);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, letterIndex, levelIndex, lanes, targets, distractors]);

  // auto-advance if all 10 targets collected
  useEffect(() => {
    if (phase !== "play") return;
    if (hits >= goalHits) {
      setTimeout(() => advanceLevel(), 450);
    }
  }, [hits, phase]);

  function advanceLevel() {
    setLevelIndex((li) => {
      const next = li + 1;
      if (next <= 2) {
        if (next !== 0) return next;
      }
      return li;
    });

    setLevelIndex((li) => {
      if (li < 2) return li + 1;

      // move to next letter
      setLetterIndex((idx) => {
        const nextIdx = idx + 1;
        if (nextIdx >= sessionLetters.length) {
          setPhase("summary");
          return idx;
        }
        return nextIdx;
      });

      return 0;
    });
  }

  function spawnBird(lanesArr) {
    const laneY = randomFrom(lanesArr.length ? lanesArr : [180, 320, 460]);
    const y = laneY - 40 + randRange(-40, 40);
    const speed = randRange(130, 185);
    const vy = randRange(-10, 10);

    entitiesRef.current.push({
      id: nextId.current++,
      x: gameWidth() + 140,
      y,
      vx: -speed,
      vy,
      r: 32,
      kind: "bird",
    });
  }

  function handleCollisions(nowMs) {
    if (!balloonMovingRef.current) return;

    const b = balloonRef.current;
    const arr = entitiesRef.current;

    for (let i = arr.length - 1; i >= 0; i--) {
      const e = arr[i];
      const dx = e.x - b.x;
      const dy = e.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < e.r + b.r) {
        if (e.kind === "bird") {
          e.sadUntil = nowMs + 700;
          playChime("whoosh");
          e.x -= 60;
          continue;
        }

        // cloud
        setLastHitId(e.id);
        setTimeout(() => setLastHitId(null), 240);

        if (e.isTarget) {
          setLastCorrectId(e.id);
          setPulse(true);
          setTimeout(() => setPulse(false), 220);

          playChime("happy");
          // letter level speaks sound, begin/end speaks word then sound
          if (level === "letter") {
            speak(soundLabel(letter));
          } else {
            speak(`${e.text}. ${soundLabel(letter)}.`);
          }

          setHits((h) => Math.min(goalHits, h + 1));
          setTotalScore((s) => s + 1);

          setScoreBump(true);
          setScoreShine(true);
          setTimeout(() => setScoreBump(false), 220);
          setTimeout(() => setScoreShine(false), 520);
        } else {
          setWobble(true);
          setTimeout(() => setWobble(false), 280);

          playChime("oops");
          setStars((s) => Math.max(0, s - 1));
          speak(`Try again! ${title} ${soundLabel(letter)}.`);
        }

        arr.splice(i, 1);
      }
    }
  }

  // controls: no left movement
  function onPointerDown(e) {
    draggingRef.current = true;
    e.target.setPointerCapture?.(e.pointerId);
  }
  function onPointerUp(e) {
    draggingRef.current = false;
    e.target.releasePointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!draggingRef.current || !gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const b = balloonRef.current;
    const bx = clamp(x, b.x, gameWidth() - 90);
    const by = clamp(y, 110, gameHeight() - 120);

    b.x += (bx - b.x) * 0.35;
    b.y += (by - b.y) * 0.35;
  }

  if (phase === "summary") {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-cyan-100">
        <div className="max-w-lg w-full p-6 bg-white rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-sky-800">Session Complete! 🎉</h2>
          <p className="mt-2 text-sky-700">
            Total correct: <span className="font-extrabold">{totalScore}</span>
          </p>
          <p className="mt-1 text-sky-700">Stars left: {stars}</p>
          <button
            className="mt-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold"
            onClick={() => {
              setSessionLetters(makeSessionLetters(10));
              setLetterIndex(0);
              setLevelIndex(0);
              setStars(3);
              setTotalScore(0);
              setPhase("play");
            }}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const countdownPulse = timeLeft <= 8;

  // Hanging card prompt
  const hangingTitle = level === "letter" ? "Find the letter sound" : title;
  const hangingBig = level === "letter" ? soundLabel(letter) : soundLabel(letter);
  const hangingSub =
    level === "letter" ? `Catch "${letter}" clouds` : level === "begin" ? "(starts with)" : "(ends with)";

  return (
    <div
      ref={gameRef}
      className="relative w-full h-screen overflow-hidden select-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    >
      <CuteSkyBackground />

      <style>{`
        @keyframes balloonFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .balloon-float { animation: balloonFloat 2.6s ease-in-out infinite; }

        @keyframes scoreShine {
          0% { transform: translateX(-120%) rotate(18deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateX(140%) rotate(18deg); opacity: 0; }
        }
        .shine::after {
          content: "";
          position: absolute;
          inset: -20px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.15) 45%, rgba(255,215,0,0.35) 50%, rgba(255,215,0,0.15) 55%, transparent 100%);
          transform: translateX(-120%) rotate(18deg);
          pointer-events: none;
        }
        .shine.run::after { animation: scoreShine 520ms ease-out 1; }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .timerPulse { animation: pulse 700ms ease-in-out infinite; }

        @keyframes wind {
          0% { opacity: 0; transform: translateX(0px); }
          25% { opacity: 0.35; }
          100% { opacity: 0; transform: translateX(-40px); }
        }
        .windLine { animation: wind 900ms ease-out infinite; }
      `}</style>

      {/* Mission panel (no "Collected") */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-white/95 backdrop-blur rounded-[28px] shadow-[0_6px_14px_rgba(0,0,0,0.12)] border border-sky-100 px-5 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center shadow-sm">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-sky-700">Target sound</div>
              <div className="text-2xl font-extrabold text-sky-900 leading-none">{soundLabel(letter)}</div>
            </div>
          </div>

          <div
            className={
              "flex items-center gap-3 px-3 py-2 rounded-[22px] bg-[#FFF3C4] shadow-sm border border-amber-200 " +
              (countdownPulse ? "timerPulse" : "")
            }
          >
            <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center">
              <span className="text-lg">⏱️</span>
            </div>
            <div className="text-sky-900 font-extrabold text-xl">{timeLeft}s</div>
          </div>

          <div className="hidden sm:block w-44">
            <div className="h-2.5 w-full bg-sky-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Score badge: correct out of 10 */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40">
        <div
          className={
            "relative bg-white rounded-[28px] px-[26px] py-[18px] shadow-[0_6px_14px_rgba(0,0,0,0.15)] border border-sky-100 text-center transition-transform duration-200 shine " +
            (scoreBump ? "scale-[1.06]" : "scale-100") +
            (scoreShine ? " run" : "")
          }
        >
          <div className="text-sm font-extrabold tracking-widest text-sky-600">CORRECT</div>
          <div className="text-[48px] font-extrabold leading-none mt-2 text-[#0076FF]">
            {hits}/{goalHits}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 font-semibold">
            <span>⭐</span>
            <span>{stars}</span>
          </div>
        </div>
      </div>

      {/* Balloon */}
      <div
        className={
          "absolute z-30 transition-transform duration-200 balloon-float " +
          (wobble ? "-rotate-6" : "rotate-0") +
          (pulse ? " scale-[1.04]" : "")
        }
        style={{ left: balloonRef.current.x - 40, top: balloonRef.current.y - 56 }}
      >
        <div className="absolute -left-10 top-10 opacity-40">
          <svg viewBox="0 0 120 60" className="w-16 h-10">
            <path className="windLine" d="M110 16 C80 16, 76 26, 60 26" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="4" strokeLinecap="round" />
            <path className="windLine" style={{ animationDelay: "200ms" }} d="M110 34 C86 34, 80 44, 62 44" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <BalloonSVG />

        {/* Hanging signboard */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[112px] pointer-events-none">
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 140 44" className="w-28 h-9 opacity-80">
              <line x1="50" y1="0" x2="34" y2="44" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              <line x1="90" y1="0" x2="106" y2="44" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div className="-mt-2 bg-white/95 backdrop-blur rounded-[28px] shadow-[0_6px_14px_rgba(0,0,0,0.12)] px-5 py-4 flex items-center gap-4 border border-sky-100">
              <div className="rounded-[22px] bg-cyan-50 p-2">
                <div className="scale-[1.2]">
                  <SvgPicture kind={WORD_BANK[letter]?.type ?? "ball"} />
                </div>
              </div>
              <div className="leading-tight">
                <div className="text-xs text-sky-700 font-semibold">{hangingTitle}</div>
                <div className="text-3xl font-extrabold text-sky-900">{hangingBig}</div>
                <div className="text-xs font-semibold text-sky-600 mt-1">{hangingSub}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entities */}
      {entitiesRef.current.map((e) =>
        e.kind === "cloud" ? (
          <Cloud
            key={e.id}
            x={e.x}
            y={e.y}
            text={e.text}
            glow={e.id === lastCorrectId}
            squish={e.id === lastHitId}
          />
        ) : (
          <Bird key={e.id} x={e.x} y={e.y} sad={!!e.sadUntil} />
        )
      )}

      <DriftClouds />
      <Twinkles />
    </div>
  );
}