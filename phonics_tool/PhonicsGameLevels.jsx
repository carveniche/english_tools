import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// --- Helpers ---
const UPPER = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const LOWER = Array.from("abcdefghijklmnopqrstuvwxyz");
const TRICK_LETTERS = [
  "b",
  "d",
  "p",
  "q",
  "r",
  "t",
  "f",
  "g",
  "m",
  "n",
  "v",
  "j",
  "y",
];
// For Level 5, exclude confusing symmetric pairs like b/d and p/q
const FLIP_SENSITIVE = ["s", "r", "f", "g", "m", "n", "e", "k", "c", "u", "y"];
const GRAD = [
  "from-pink-500 to-rose-400",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-lime-400 to-green-500",
  "from-cyan-400 to-sky-500",
  "from-indigo-500 to-blue-500",
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

function useVoice() {
  const vRef = useRef(null);
  useEffect(() => {
    const choose = () => {
      const vs = window.speechSynthesis?.getVoices?.() || [];
      vRef.current =
        vs.find((x) =>
          /female|Google US|UK|Samantha|Aditi|Raveena/i.test(x.name)
        ) ||
        vs[0] ||
        null;
    };
    choose();
    window.speechSynthesis?.addEventListener?.("voiceschanged", choose);
    return () =>
      window.speechSynthesis?.removeEventListener?.("voiceschanged", choose);
  }, []);
  const say = (t) =>
    new Promise((r) => {
      try {
        const u = new SpeechSynthesisUtterance(t);
        if (vRef.current) u.voice = vRef.current;
        u.onend = () => r();
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {
        r();
      }
    });
  return { say };
}

const Tile = ({
  children,
  gradIdx = 0,
  onClick,
  selected = false,
  ring = null,
  big = false,
  draggable = false,
  onDragStart,
}) => (
  <div
    role={onClick ? "button" : "img"}
    onClick={onClick}
    className={`relative ${
      big ? "aspect-[4/3]" : "aspect-square"
    } select-none rounded-2xl shadow grid place-items-center bg-gradient-to-br ${
      GRAD[gradIdx % GRAD.length]
    } ${onClick ? "cursor-pointer active:scale-[0.98]" : ""} ${
      selected ? "ring-4 ring-sky-400" : ""
    }`}
    draggable={draggable}
    onDragStart={onDragStart}
  >
    <div
      className={`${
        big ? "text-8xl md:text-9xl" : "text-4xl"
      } font-black text-white drop-shadow`}
    >
      {children}
    </div>
    {ring && <div className={`absolute inset-0 rounded-2xl ring-4 ${ring}`} />}
  </div>
);

const Star = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        key={show}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1.4, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="pointer-events-none fixed inset-0 z-30 grid place-items-center"
      >
        <div className="text-7xl">🌟</div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Shell = ({ children, level, setLevel }) => (
  <div className="h-screen w-screen overflow-hidden bg-slate-50">
    <div className="flex items-center justify-center gap-2 py-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => setLevel(n)}
          className={`rounded-xl px-3 py-1 text-sm font-bold shadow ${
            level === n ? "bg-sky-600 text-white" : "bg-white text-slate-800"
          }`}
        >
          Level {n}
        </button>
      ))}
    </div>
    {children}
  </div>
);

// --- Level 1 & 2: Click to match (upper/lower) with Play + New buttons ---
function ClickLevel({ letters, label }) {
  const { say } = useVoice();
  const [target, setTarget] = useState(pick(letters));
  const [attempts, setAttempts] = useState(2);
  const [score, setScore] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [star, setStar] = useState(null);

  useEffect(() => {
    say(target);
  }, []);
  const play = () => say(target);
  const next = () => {
    const n = pick(letters.filter((x) => x !== target));
    setTarget(n);
    setAttempts(2);
    setReveal(false);
    say(n);
  };
  const choose = (ch) => {
    if (reveal) return;
    if (ch === target) {
      setScore((s) => s + 1);
      setStar(Date.now());
      say("Great!");
      setTimeout(() => {
        setStar(null);
        next();
      }, 300);
    } else {
      setAttempts((a) => {
        const l = a - 1;
        if (l <= 0) {
          setReveal(true);
          setTimeout(() => next(), 800);
        } else say("Try again!");
        return l;
      });
    }
  };

  return (
    <div className="h-[calc(100vh-56px)] px-4 pb-6">
      <div className="flex items-center justify-center gap-3 py-2">
        <button
          onClick={play}
          className="rounded-xl bg-amber-400 px-4 py-2 text-white font-bold shadow"
        >
          Play Letter
        </button>
        <button
          onClick={next}
          className="rounded-xl bg-sky-400 px-4 py-2 text-white font-bold shadow"
        >
          New
        </button>
        <div className="text-slate-700 font-semibold">{label}</div>
      </div>
      <div className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-3">
        {letters.map((L, i) => (
          <Tile
            key={L}
            gradIdx={i}
            onClick={() => choose(L)}
            ring={reveal && L === target ? "ring-yellow-300/90" : null}
          >
            {L}
          </Tile>
        ))}
      </div>
      <Star show={star} />
    </div>
  );
}

// --- Level 3: Merge ---
function Level3() {
  const { say } = useVoice();
  const [score, setScore] = useState(0);
  const [star, setStar] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [idx, setIdx] = useState(0);
  const [matched, setMatched] = useState({});
  useEffect(() => {
    const build = () => {
      const n = Math.floor(Math.random() * 3) + 4;
      const ups = shuffle(UPPER).slice(0, n);
      return { uppers: ups, lowers: ups.map((u) => u.toLowerCase()) };
    };
    setRounds(Array.from({ length: 5 }, build));
  }, []);
  const cur = rounds[idx];
  const lowers = useMemo(
    () => (cur ? shuffle(cur.lowers) : []),
    [idx, rounds.length]
  );
  useEffect(() => {
    setMatched({});
  }, [idx]);
  const onDrop = (lower, upper) => {
    if (lower.toUpperCase() === upper) {
      setMatched((m) => ({ ...m, [upper]: true }));
      setScore((s) => s + 1);
      setStar(Date.now());
      say("Match!");
    }
  };
  useEffect(() => {
    if (cur && Object.keys(matched).length === cur.uppers.length) {
      setTimeout(() => setIdx((k) => k + 1), 400);
    }
  }, [matched, cur]);
  if (!cur)
    return (
      <div className="h-[calc(100vh-56px)] grid place-items-center text-xl">
        All done! 🎉
      </div>
    );
  return (
    <div className="h-[calc(100vh-56px)] px-4 pb-6">
      <div className="grid h-full w-full grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 text-center font-bold">Uppercase</div>
          <div className="grid grid-cols-3 gap-3">
            {cur.uppers.map((U, i) => (
              <div
                key={U}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e.dataTransfer.getData("text/plain"), U)}
                className={`relative grid aspect-square place-items-center rounded-2xl bg-gradient-to-br ${
                  GRAD[i % GRAD.length]
                } text-4xl font-extrabold text-white`}
              >
                {U}
                {matched[U] && (
                  <div className="absolute inset-0 rounded-2xl ring-4 ring-emerald-300/90" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-center font-bold">Lowercase (drag)</div>
          <div className="grid grid-cols-3 gap-3">
            {lowers.map((l, i) => (
              <div
                key={l}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", l)}
                className={`grid aspect-square place-items-center rounded-2xl bg-gradient-to-br ${
                  GRAD[(i + 3) % GRAD.length]
                } text-4xl font-extrabold text-white cursor-grab`}
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Star show={star} />
    </div>
  );
}

// --- Level 4: Trick Letters ---
function Level4() {
  const { say } = useVoice();
  const [score, setScore] = useState(0);
  const [star, setStar] = useState(null);
  const [letters, setLetters] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState({});
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    setLetters(shuffle(TRICK_LETTERS).slice(0, 12));
  }, []);
  const base = letters[idx];
  useEffect(() => {
    if (base) say(`Choose all the ${base.toUpperCase()}s`);
    setSelected({});
    setReveal(false);
  }, [idx, base]);
  const grid = useMemo(() => {
    if (!base) return [];
    const targets = Array.from({ length: 15 }, () =>
      Math.random() < 0.5 ? base.toUpperCase() : base
    );
    const pool = shuffle(
      UPPER.concat(LOWER).filter((x) => x.toLowerCase() !== base)
    );
    const distract = pool.slice(0, 20 - targets.length);
    return shuffle(targets.concat(distract));
  }, [base, idx]);
  const isTarget = (ch) => ch.toLowerCase() === base?.toLowerCase();
  const check = () => {
    let ok = true;
    for (let i = 0; i < grid.length; i++) {
      const want = isTarget(grid[i]);
      const did = !!selected[i];
      if (want !== did) {
        ok = false;
        break;
      }
    }
    if (ok) {
      setScore((s) => s + 1);
      setStar(Date.now());
      say("Perfect!");
      setTimeout(() => setIdx((k) => k + 1), 400);
    } else {
      setReveal(true);
      setTimeout(() => setIdx((k) => k + 1), 800);
    }
  };
  if (base === undefined)
    return (
      <div className="h-[calc(100vh-56px)] grid place-items-center text-xl">
        All done! 🎉
      </div>
    );
  return (
    <div className="h-[calc(100vh-56px)] px-4 pb-6">
      <div className="py-1 text-center text-2xl font-black">
        Choose all the {base.toUpperCase()}s
      </div>
      <div className="mx-auto grid max-w-[1100px] grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {grid.map((ch, i) => (
          <Tile
            key={i}
            gradIdx={i}
            onClick={() => setSelected((s) => ({ ...s, [i]: !s[i] }))}
            selected={!!selected[i]}
            ring={reveal ? (isTarget(ch) ? "ring-emerald-400" : "") : null}
          >
            {ch}
          </Tile>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={check}
          className="rounded-2xl bg-violet-600 px-6 py-3 text-white font-black shadow"
        >
          Done
        </button>
      </div>
      <Star show={star} />
    </div>
  );
}

// --- Level 5: Correct Letter --- (exclude b/d and p/q)
function Level5() {
  const { say } = useVoice();
  const [score, setScore] = useState(0);
  const [star, setStar] = useState(null);
  const questions = useMemo(() => {
    const n = Math.floor(Math.random() * 2) + 5;
    return shuffle(FLIP_SENSITIVE)
      .slice(0, n)
      .map((l) => ({ base: l, side: Math.random() < 0.5 ? "left" : "right" }));
  }, []);
  const [q, setQ] = useState(0);
  const cur = questions[q];
  if (!cur)
    return (
      <div className="h-[calc(100vh-56px)] grid place-items-center text-xl">
        All done! 🎉
      </div>
    );
  const letter = cur.base;
  const correctSide = cur.side;
  const Card = ({ flip }) => (
    <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-white/80 shadow">
      <div
        className="text-8xl font-black text-slate-900"
        style={{ transform: flip ? "scaleX(-1)" : "none" }}
      >
        {letter}
      </div>
    </div>
  );
  const click = (side) => {
    if (side === correctSide) {
      setScore((s) => s + 1);
      setStar(Date.now());
      say("Nice!");
      setTimeout(() => setQ((i) => i + 1), 450);
    } else {
      setTimeout(() => setQ((i) => i + 1), 550);
    }
  };
  return (
    <div className="h-[calc(100vh-56px)] px-4 pb-6">
      <div className="py-1 text-center text-2xl font-black">
        Which is written correctly?
      </div>
      <div className="mx-auto grid h-[70vh] max-w-[1100px] grid-cols-1 gap-6 md:grid-cols-2">
        <div onClick={() => click("left")} className="cursor-pointer">
          <Card flip={correctSide !== "left"} />
        </div>
        <div onClick={() => click("right")} className="cursor-pointer">
          <Card flip={correctSide !== "right"} />
        </div>
      </div>
      <Star show={star} />
    </div>
  );
}

// --- Launcher ---
export default function PhonicsGameLevels() {
  const [level, setLevel] = useState(1);
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50">
      {level === 1 && (
        <Shell level={level} setLevel={setLevel}>
          <ClickLevel
            letters={UPPER}
            label="(Uppercase) – Click the letter you hear"
          />
        </Shell>
      )}
      {level === 2 && (
        <Shell level={level} setLevel={setLevel}>
          <ClickLevel
            letters={LOWER}
            label="(Lowercase) – Click the letter you hear"
          />
        </Shell>
      )}
      {level === 3 && (
        <Shell level={level} setLevel={setLevel}>
          <Level3 />
        </Shell>
      )}
      {level === 4 && (
        <Shell level={level} setLevel={setLevel}>
          <Level4 />
        </Shell>
      )}
      {level === 5 && (
        <Shell level={level} setLevel={setLevel}>
          <Level5 />
        </Shell>
      )}
    </div>
  );
}
