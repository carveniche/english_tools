import React, { useEffect, useMemo, useState, useRef } from "react";
import HomeBack from "../HomeBack";

const UPPER = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const LOWER = Array.from("abcdefghijklmnopqrstuvwxyz");
// const GRAD = [
//   "from-pink-500 to-rose-400",
//   "from-amber-400 to-orange-500",
//   "from-emerald-400 to-teal-500",
//   "from-sky-400 to-blue-500",
//   "from-fuchsia-500 to-purple-500",
//   "from-lime-400 to-green-500",
//   "from-cyan-400 to-sky-500",
//   "from-indigo-500 to-blue-500",
// ];
const TRICK_LETTERS = [
  "b", "d", "p", "q", "r", "t", "f", "g", "m", "n", "v", "j", "y"
];

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

// const Tile = ({ children, selected, gradIdx = 0, ring = null, onClick }) => (
//   <div
//     onClick={onClick}
//     className={`relative p-[1rem] justify-center items-center select-none rounded-3xl shadow-lg grid place-items-center transition-all duration-300 transform hover:scale-105 cursor-pointer bg-gradient-to-br ${
//       selected ? "from-green-400 to-green-600" : 'bg-[#9aaecd]'
//     }`}
//   >
//     {/* GRAD[gradIdx % GRAD.length] */}
//     <div className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
//       {children}
//     </div>
//     {ring && <div className={`absolute inset-0 rounded-3xl ring-4 ${ring}`} />}
//   </div>
// );
const Tile = ({ children, selected, status, onClick }) => {
  let bg = "bg-[#9aaecd]";

  if (selected) bg = "bg-green-500";

  if (status === "wrong") bg = "bg-red-500";
  if (status === "missed") bg = "bg-yellow-400";

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-3xl grid place-items-center
        text-white font-extrabold text-4xl cursor-pointer
        transition-all duration-300 ${bg}`}
    >
      {children}
    </div>
  );
};

function LevelFour({onGoHome,timeSpent,comp}) {
  const { say } = useVoice();
  const [score, setScore] = useState(0);
  const [letters, setLetters] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState({});
  const [showError, setShowError] = useState(false);
  const [bgColor, setBgColor] = useState("white");
 const [finished, setFinished] = useState(false);
 const [resultMap, setResultMap] = useState({});

  useEffect(() => {
    setLetters(shuffle(TRICK_LETTERS).slice(0, 10));
  }, []);

  const base = letters[idx];

  useEffect(() => {
    if (base) say(`Choose all the ${base.toUpperCase()}s`);
    setSelected({});
     setResultMap({});
    setShowError(false);
    setBgColor("");
  }, [idx, base]);

  const grid = useMemo(() => {
    if (!base) return [];
    const targets = Array.from({ length: 15 }, () =>
      Math.random() < 0.5 ? base.toUpperCase() : base
    );
    const pool = shuffle(UPPER.concat(LOWER).filter((x) => x.toLowerCase() !== base));
    const distract = pool.slice(0, 20 - targets.length);
    return shuffle(targets.concat(distract));
  }, [base, idx]);

  const isTarget = (ch) => ch.toLowerCase() === base?.toLowerCase();

  const check = () => {
    let ok = true;
    const newResultMap = {};
    for (let i = 0; i < grid.length; i++) {
      const want = isTarget(grid[i]);
      const did = !!selected[i];
         if (want && did) {
      newResultMap[i] = "correct";
    } else if (!want && did) {
      newResultMap[i] = "wrong"; // ❌ wrongly selected
      ok = false;
    } else if (want && !did) {
      newResultMap[i] = "missed"; // ⚠️ missed correct letter
      ok = false;
    }
    }
 setResultMap(newResultMap);
    if (ok) {
      setScore((s) => s + 1);
      setBgColor("#EB6666");
      say("Perfect!");
      setTimeout(() => setIdx((k) => k + 1), 2500);
    } else {
      setShowError(true);
      setBgColor("#EB6666");
      say("Oops! Try next one!");
      setTimeout(() => {
        setShowError(false);
        setIdx((k) => k + 1);
        setBgColor("from-purple-300 via-pink-200 to-orange-200");
      }, 2500);
    }
  };
const labelRef = useRef(comp);
const timeSpentRef = useRef(timeSpent);

useEffect(() => {
  labelRef.current = comp;
}, [comp]);

useEffect(() => {
  timeSpentRef.current = timeSpent;
}, [timeSpent]);


useEffect(() => {
  const btn = document.getElementById("closing-btn-phonics");

  const onClick = () => {
    if (typeof window.sendingTimespentPhonics === "function") {
      const formdata = new FormData();
      formdata.append("level_name", labelRef.current);
      formdata.append("timespent", timeSpentRef.current);

      window.sendingTimespentPhonics(formdata);
    } else {
      console.log("not found sendingTimespentPhonics function");
    }
  };

  if (btn) btn.addEventListener("click", onClick);

  return () => {
    if (btn) btn.removeEventListener("click", onClick);
  };
}, []); 

  const playAgain = () => {
  setScore(0);
  setIdx(0);
  setSelected({});
  setShowError(false);
  setFinished(false);
  setLetters(shuffle(TRICK_LETTERS).slice(0, 3)); // Restart with fresh letters
};

if (base === undefined)
  return (
    <HomeBack
      playAgain={playAgain}
      onGoHome={onGoHome}
      timeSpent={timeSpent}
      component={comp}
    />
  );




// bg-gradient-to-r ${bgColor}
  return (
    <div className={`h-[calc(100vh-56px)] px-4 pb-6 bg-gradient-to-r ${bgColor} bg-[#C57332] transition-all duration-500 rounded-lg`}>
      {/* HEADER */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 mb-4   rounded-xl ">
        <div className="text-lg font-bold text-white">Score: {score}</div>
        <div className="text-lg font-bold text-white">
          Letter {idx + 1}/{letters.length}
        </div>
      </div>

      {showError && (
        <div className="hidden lg:block absolute top-10 left-[40%] -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-lg font-bold text-xl animate-bounce z-[5]">
          <span className="hidden lg:block">Oops! That’s not correct!</span>
        </div>
      )}

      <div className="mx-auto grid max-w-[1100px] grid-cols-5 gap-4 sm:grid-cols-6 md:grid-cols-8">
        {grid.map((ch, i) => (
          <Tile
            key={i}
            gradIdx={i}
            onClick={() => setSelected((s) => ({ ...s, [i]: !s[i] }))}
            selected={!!selected[i]}
            status={resultMap[i]}
          >
            {ch}
          </Tile>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={check}
          className="px-6 py-3 font-bold text-white rounded-2xl shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transform transition-all duration-300"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default LevelFour;
