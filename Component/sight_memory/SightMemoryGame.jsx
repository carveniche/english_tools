import React, { useEffect, useMemo, useRef, useState } from "react";

// ==============================
// Sight Memory — Full Working File
// ==============================

// ---- Helper utilities ----
const shuffle = (array) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Pastel palette; twins get different colors
const CARD_PALETTE = [
  "#97C1C8", // teal blue
  "#E9B872", // warm amber
  "#E6C9A8", // sand
  "#D8A7B1", // rose
  "#B8D8BA", // mint
  "#C3B1E1", // lilac
  "#F5A9A9", // blush
  "#9AD0C2", // seafoam
  "#F7D488", // sunshine
  "#A7BED3", // powder blue
  "#FFDAC1", // peach
];
const CARD_BACK = "#2D3A5F";

// ---- Word sets by level (exact list) ----
const LEVEL_WORDS = {
  1: ["the", "and", "for", "are", "you"],
  2: ["now", "who", "was", "all", "any"],
  3: ["one", "out", "put", "saw", "two"],
  4: ["who", "her", "has", "how", "why"],
  5: ["come", "give", "have", "said", "from"],
  6: ["some", "your", "what", "when", "with"],
  7: ["with", "they", "were", "into", "does"],
  8: ["gone", "once", "know", "over", "very"],
  9: ["there", "could", "would", "again", "other"],
  10: ["where", "right", "their", "about", "every"],
  11: ["after", "think", "three", "under", "never"],
  12: ["small", "great", "first", "house", "place"],
};
const MAX_LEVEL = 12;

const buildCardsForLevel = (level) => {
  const words = LEVEL_WORDS[level] || LEVEL_WORDS[1];
  const cards = words.flatMap((word, idx) => {
    const colors = shuffle(CARD_PALETTE);
    const colorA = colors[0];
    const colorB = colors.find((c) => c !== colorA) || CARD_PALETTE[1];
    return [
      { id: `${idx}-a`, word, matched: false, color: colorA },
      { id: `${idx}-b`, word, matched: false, color: colorB },
    ];
  });
  return shuffle(cards);
};

// ---- Voice helpers ----
const speak = (text) => {
  try {
    if (window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.pitch = 1.2;
      utter.rate = 1.0;
      // Prefer a female voice if available
      const choose = () =>
        window.speechSynthesis.getVoices().find((v) => /(female|woman)/i.test(v.name)) ||
        window.speechSynthesis.getVoices().find((v) => /Google UK English Female/i.test(v.name));
      const voice = choose();
      if (voice) utter.voice = voice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  } catch (e) {}
};

export default function SightMemory() {
  // Screens
  const [screen, setScreen] = useState("title"); // 'title' | 'game' | 'won'
  // Game state
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [first, setFirst] = useState(null); // {id, index}
  const [second, setSecond] = useState(null);
  const [revealed, setRevealed] = useState({}); // id -> true
  const [cross, setCross] = useState({}); // id -> true
  const [lock, setLock] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const autoFlipTimers = useRef({});
  const introMusicRef = useRef(null);
  const replayLevelRef = useRef(null);

  // Start title music
  useEffect(() => {
    if (screen === "title" && introMusicRef.current) {
      const a = introMusicRef.current;
      a.currentTime = 0;
      a.loop = false;
      a.volume = 0.8;
      a.play().catch(() => {});
    }
  }, [screen]);

  const clearTimers = () => {
    clearInterval(timerRef.current);
    Object.values(autoFlipTimers.current).forEach((t) => clearTimeout(t));
    autoFlipTimers.current = {};
  };

  const startLevel = () => {
    clearTimers();
    setCards(buildCardsForLevel(level));
    setFirst(null);
    setSecond(null);
    setRevealed({});
    setCross({});
    setLock(false);
    startTimeRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 200);
  };

  // Clean up on unmount
  useEffect(() => () => clearTimers(), []);

  // Entering game screen -> start level (handle replay request)
  useEffect(() => {
    if (screen === "game") {
      if (replayLevelRef.current != null) {
        setLevel(replayLevelRef.current);
        replayLevelRef.current = null;
        // Defer start until level state applies
        setTimeout(startLevel, 0);
      } else {
        startLevel();
      }
    }
  }, [screen]);

  // All matched?
  const allMatched = useMemo(() => cards.length > 0 && cards.every((c) => c.matched), [cards]);
  useEffect(() => {
    if (allMatched && screen === "game") {
      clearTimers();
      setScreen("won");
    }
  }, [allMatched, screen]);

  const revealWithAutoHide = (cardId) => {
    setRevealed((r) => ({ ...r, [cardId]: true }));
    if (autoFlipTimers.current[cardId]) clearTimeout(autoFlipTimers.current[cardId]);
    autoFlipTimers.current[cardId] = setTimeout(() => {
      setRevealed((r) => {
        const copy = { ...r };
        if (!cards.find((c) => c.id === cardId)?.matched) delete copy[cardId];
        return copy;
      });
    }, 5000);
  };

  const onCardClick = (index) => {
    if (lock) return;
    const card = cards[index];
    if (card.matched || revealed[card.id]) return;

    revealWithAutoHide(card.id);

    if (!first) { setFirst({ id: card.id, index }); return; }
    if (first.id === card.id) return; // same card guard

    setSecond({ id: card.id, index });
    setLock(true);

    const firstCard = cards[first.index];
    const secondCard = card;

    try {
      clearTimeout(autoFlipTimers.current[firstCard.id]);
      clearTimeout(autoFlipTimers.current[secondCard.id]);
    } catch {}

    if (firstCard.word === secondCard.word) {
      setTimeout(() => {
        speak("Yay, you got that right!");
        setCards((prev) => prev.map((c) => (c.id === firstCard.id || c.id === secondCard.id ? { ...c, matched: true } : c)));
        setLock(false);
        setFirst(null);
        setSecond(null);
      }, 250);
    } else {
      speak("Try again!");
      setCross((x) => ({ ...x, [firstCard.id]: true, [secondCard.id]: true }));
      setTimeout(() => {
        setCross((x) => { const copy = { ...x }; delete copy[firstCard.id]; delete copy[secondCard.id]; return copy; });
        setRevealed((r) => { const copy = { ...r }; delete copy[firstCard.id]; delete copy[secondCard.id]; return copy; });
        setLock(false);
        setFirst(null);
        setSecond(null);
      }, 900);
    }
  };

  // Shared full-screen background style
  const fullScreenStyle = {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    backgroundImage: 'url(/831.jpg)',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflow: "auto",
  };

  // ---- UI ----
  if (screen === "title") {
    return (
      <div className="flex items-center justify-center p-6" style={fullScreenStyle}>
        <audio ref={introMusicRef} src="/intro.mp3" />
        <div className="max-w-4xl w-full bg-white/95 rounded-2xl shadow-2xl p-6 md:p-8 grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-600 via-rose-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">Sight Memory</h1>
            <button
              className="mt-1 px-8 py-4 rounded-2xl text-white text-xl font-extrabold shadow-lg hover:scale-[1.03] transition bg-gradient-to-r from-pink-500 via-amber-400 to-lime-500"
              onClick={() => { try { introMusicRef.current && introMusicRef.current.pause(); } catch {} setScreen("game"); }}
            >
              START
            </button>
          </div>
          <div className="flex items-center justify-center">
            <img src="/kids.png" alt="Kids reading" className="w-full max-h-80 h-auto rounded-xl shadow-md object-contain bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (screen === "won") {
    return (
      <div className="flex items-center justify-center" style={fullScreenStyle}>
        <div className="bg-white/95 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-emerald-700">Level {level} Complete!</h2>
          <p className="mt-3 text-slate-700">Time taken: <span className="font-semibold">{elapsed}s</span></p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              className="px-5 py-3 rounded-xl text-white font-semibold shadow bg-gradient-to-r from-emerald-500 to-teal-400"
              onClick={() => {
                // Clear current cards/state before moving ahead
                setCards([]); setRevealed({}); setCross({}); setLock(false);
                if (level < MAX_LEVEL) { setLevel(level + 1); setScreen("game"); }
                else { setLevel(1); setScreen("title"); }
              }}
            >
              {level < MAX_LEVEL ? "Next Level" : "Finish"}
            </button>
            <button
              className="px-5 py-3 rounded-xl bg-slate-200 text-slate-800 font-semibold shadow"
              onClick={() => { setCards([]); setRevealed({}); setCross({}); setLock(false); replayLevelRef.current = level; setScreen("game"); }}
            >
              Replay Level
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="p-4 md:p-8" style={fullScreenStyle}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 rounded-lg bg-white shadow text-slate-700" onClick={() => setScreen("title")}>◀ Title</button>
            {/* Large level badge only */}
            <div className="px-4 py-2 md:px-6 md:py-3 rounded-2xl bg-amber-200 text-amber-900 shadow text-xl md:text-2xl font-extrabold">Level {level}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-lg bg-white shadow text-slate-700">Time: <b>{elapsed}s</b></div>
            <button className="px-3 py-2 rounded-lg bg-white shadow text-slate-700" onClick={() => startLevel()}>↻ Reset</button>
          </div>
        </div>

        {/* Two rows × five; each 330x230 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {cards.map((c, idx) => {
            const isUp = revealed[c.id] || c.matched;
            const style = {
              width: 330,
              height: 230,
              backgroundColor: isUp ? c.color : CARD_BACK,
              borderColor: isUp ? c.color : "#1f2a44",
            };
            return (
              <button
                key={c.id}
                onClick={() => onCardClick(idx)}
                disabled={lock || c.matched}
                style={style}
                className={`relative rounded-[24px] shadow-md border-2 transition-transform ${lock ? "cursor-not-allowed" : "cursor-pointer"} ${c.matched ? "ring-2 ring-emerald-400" : ""}`}
              >
                {!isUp && (
                  <div className="absolute inset-0 rounded-[24px] overflow-hidden grid place-items-center">
                    <div className="opacity-40 text-white text-4xl">★</div>
                  </div>
                )}
                {isUp && (
                  <div className="absolute inset-0 rounded-[24px] flex items-center justify-center p-3">
                    <span className={`text-3xl font-extrabold ${c.matched ? "text-emerald-900" : "text-slate-900"}`}>{c.word}</span>
                  </div>
                )}
                {cross[c.id] && (
                  <div className="absolute inset-0 grid place-items-center bg-red-500/10 rounded-[24px]">
                    <span className="text-6xl font-extrabold text-red-600">×</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
