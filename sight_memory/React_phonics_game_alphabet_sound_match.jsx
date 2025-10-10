import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LETTER MATCH – full-screen phonics game (pure JS/JSX)
 * -----------------------------------------------------
 * This version removes all TypeScript syntax to avoid build errors.
 * - Title song: /public/audio/title.mp3 (autoplay with gesture fallback). Stops on Start.
 * - Celebration audio plays fully before next round.
 * - No "Try again" after 3rd wrong try (only 😞 + reveal pulse).
 * - Buttons: Play (voice current), New (pick & voice new letter).
 * - Score increments without limit; 3 tries per letter.
 */

const LETTERS = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

const CARD_GRADIENTS = [
  "from-pink-500 to-rose-400",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-lime-400 to-green-500",
  "from-cyan-400 to-sky-500",
  "from-red-500 to-orange-500",
  "from-indigo-500 to-blue-500",
  "from-teal-500 to-emerald-500",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Playroom background (soft)
function PlayroomBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10"
      style={{
        background:
          "radial-gradient(600px 280px at -10% -20%, rgba(255, 214, 165, 0.45), transparent 60%)," +
          "radial-gradient(500px 260px at 120% 10%, rgba(173, 216, 230, 0.45), transparent 60%)," +
          "linear-gradient(180deg, #fffdf8 0%, #f5f9ff 100%)",
      }}
    >
      <svg className="absolute inset-0 h-full w-full opacity-[0.09]">
        <defs>
          <pattern id="toys-mini" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="5" fill="#8b5cf6" />
            <rect x="40" y="10" width="14" height="14" rx="3" fill="#10b981" />
            <polygon points="16,56 24,40 32,56" fill="#ef4444" />
            <circle cx="60" cy="60" r="6" fill="#f59e0b" />
            <rect x="8" y="40" width="14" height="8" rx="2" fill="#3b82f6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#toys-mini)" />
      </svg>
    </div>
  );
}

// Female-voice TTS with async control (pure JS)
function useFemaleVoice() {
  const voiceRef = useRef(null);

  const choose = () => {
    const voices = (window.speechSynthesis && window.speechSynthesis.getVoices && window.speechSynthesis.getVoices()) || [];
    const order = [
      /female/i,
      /woman/i,
      /Google UK English Female/i,
      /Google US English/i,
      /Samantha|Karen|Tessa|Zira|Emily|Victoria|Emma|Martha|Raveena|Aditi|Susan|Allison|Joanna|Amy/i,
    ];
    for (const pat of order) {
      const v = voices.find((x) => pat.test(x.name));
      if (v) return v;
    }
    return voices[0] || null;
  };

  useEffect(() => {
    const ensure = () => {
      if (!voiceRef.current) voiceRef.current = choose();
    };
    ensure();
    window.speechSynthesis && window.speechSynthesis.addEventListener && window.speechSynthesis.addEventListener("voiceschanged", ensure);
    return () => {
      window.speechSynthesis && window.speechSynthesis.removeEventListener && window.speechSynthesis.removeEventListener("voiceschanged", ensure);
    };
  }, []);

  const speakAsync = (text, opts) =>
    new Promise((resolve) => {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95;
        u.pitch = 1.05;
        u.volume = 1;
        if (voiceRef.current) u.voice = voiceRef.current;
        if (!opts || opts.cancelBefore !== false) {
          window.speechSynthesis.cancel();
        }
        u.onend = () => resolve();
        window.speechSynthesis.speak(u);
      } catch {
        resolve();
      }
    });

  return { speakAsync };
}

function LetterCard({ letter, onClick, disabled, highlight, idx }) {
  const g = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(letter)}
      disabled={disabled}
      className={`relative w-full aspect-square rounded-2xl p-0 text-center font-extrabold text-white shadow transition focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-70`}
      style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
      aria-label={`Letter ${letter}`}
      title={letter}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${g}`} />
      <div className="relative z-10 flex h-full w-full items-center justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl drop-shadow">
        {letter}
      </div>
      <AnimatePresence>
        {highlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 rounded-2xl ${
              highlight === "correct"
                ? "ring-4 ring-emerald-300/80"
                : highlight === "wrong"
                ? "ring-4 ring-rose-400/80"
                : "ring-4 ring-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]"
            }`}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {highlight === "reveal" && (
          <motion.div
            className="absolute inset-0 rounded-2xl ring-4 ring-yellow-300/80"
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function LetterMatchTiny() {
  // Title-song audio
  const titleSongRef = useRef(null);
  const [needsTapForMusic, setNeedsTapForMusic] = useState(false);
  const [songError, setSongError] = useState(null);

  const { speakAsync } = useFemaleVoice();

  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(pickRandom(LETTERS));
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [disabled, setDisabled] = useState(false);
  const [lastChoice, setLastChoice] = useState(null); // { letter, state: 'correct'|'wrong' }
  const [star, setStar] = useState(null);
  const [showSad, setShowSad] = useState(false);
  const [revealCorrect, setRevealCorrect] = useState(false);

  // Setup title music and robust autoplay unlock
  useEffect(() => {
    titleSongRef.current = new Audio("/audio/title.mp3");
    const el = titleSongRef.current;
    el.loop = true;
    el.volume = 0.5;

    const onErr = () => setSongError("Can't load /audio/title.mp3");
    el.addEventListener("error", onErr);

    // Try play on mount
    el.play().catch(() => {
      // Autoplay blocked – require a gesture
      setNeedsTapForMusic(true);
      const unlock = () => {
        el.play().then(() => setNeedsTapForMusic(false)).catch(() => {});
        document.removeEventListener("pointerdown", unlock);
        document.removeEventListener("keydown", unlock);
        document.removeEventListener("touchstart", unlock);
      };
      document.addEventListener("pointerdown", unlock, { once: true });
      document.addEventListener("keydown", unlock, { once: true });
      document.addEventListener("touchstart", unlock, { once: true });
    });

    return () => {
      el.pause();
      el.currentTime = 0;
      el.removeEventListener("error", onErr);
    };
  }, []);

  const stopTitleSong = () => {
    const el = titleSongRef.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {}
  };

  const startGame = async () => {
    stopTitleSong();
    setStarted(true);
  };

  const sayLetter = async () => {
    if (disabled) return;
    await speakAsync(target, { cancelBefore: true });
  };

  const setNewTargetAndSpeak = async (ensureDifferent = true) => {
    if (disabled) return;
    const next = ensureDifferent ? pickRandom(LETTERS.filter((L) => L !== target)) : pickRandom(LETTERS);
    setTarget(next);
    setAttemptsLeft(3);
    setLastChoice(null);
    setRevealCorrect(false);
    setShowSad(false);
    await speakAsync(next, { cancelBefore: true });
  };

  const nextRound = async (delay = 300) => {
    setDisabled(true);
    await new Promise((r) => setTimeout(r, delay));
    await setNewTargetAndSpeak();
    setDisabled(false);
  };

  const onPick = async (letter) => {
    if (disabled) return;
    if (letter === target) {
      setScore((s) => s + 1);
      setLastChoice({ letter, state: "correct" });
      setDisabled(true); // prevent interruptions
      const k = Date.now();
      setStar(k);
      await speakAsync("Yay! You got that right", { cancelBefore: false });
      setStar(null);
      await nextRound(0);
    } else {
      setLastChoice({ letter, state: "wrong" });
      setAttemptsLeft((prev) => {
        const left = prev - 1;
        if (left > 0) {
          // Encourage only while tries remain
          speakAsync("Try again!", { cancelBefore: true });
        } else {
          // Out of tries: reveal correct, sad face, no "Try again"
          setRevealCorrect(true);
          setShowSad(true);
          setDisabled(true);
          setTimeout(async () => {
            setShowSad(false);
            setRevealCorrect(false);
            setDisabled(false);
            await nextRound(0);
          }, 950);
        }
        return left;
      });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <PlayroomBackdrop />

      {/* Title page */}
      <AnimatePresence>
        {!started && (
          <motion.div
            className="absolute inset-0 z-20 grid place-items-center bg-white/80 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl font-black tracking-wide text-slate-900">LETTER MATCH</div>
              {needsTapForMusic && !songError && (
                <button
                  onClick={() => titleSongRef.current && titleSongRef.current.play().then(() => setNeedsTapForMusic(false)).catch(() => {})}
                  className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow"
                >
                  🔊 Tap for music
                </button>
              )}
              {songError && (
                <div className="text-xs font-medium text-rose-600">{songError}</div>
              )}
              <button
                onClick={startGame}
                className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-8 py-3 text-xl font-black text-white shadow hover:shadow-md focus:outline-none focus:ring-4 focus:ring-violet-300"
              >
                START
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      <div className="absolute top-4 left-4 z-10 rounded-lg bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow">Attempts: {attemptsLeft}</div>
      <div className="absolute top-4 right-4 z-10 rounded-lg bg-white/80 px-3 py-2 text-sm font-black text-slate-900 shadow">Score: {score}</div>

      {/* Buttons bottom center */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transform">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={sayLetter}
            disabled={disabled}
            className="min-w-32 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-6 py-3 text-lg font-black uppercase tracking-wide text-white shadow hover:shadow-md focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-60"
            title="Play the target letter"
          >
            Play
          </button>
          <button
            onClick={() => setNewTargetAndSpeak()}
            disabled={disabled}
            className="min-w-32 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 px-6 py-3 text-lg font-black uppercase tracking-wide text-white shadow hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:opacity-60"
            title="Change to a new letter"
          >
            New
          </button>
        </div>
      </div>

      {/* Letters grid responsive */}
      <div className="absolute inset-x-4 top-20 bottom-28 z-0">
        <div
          className="mx-auto h-full w-full max-w-[1200px]"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(64px, 1fr))",
            gap: "12px",
          }}
        >
          {LETTERS.map((L, idx) => {
            const reveal = revealCorrect && L === target ? "reveal" : null;
            const chosen = lastChoice && lastChoice.letter === L ? lastChoice.state : null;
            const highlight = reveal || chosen;
            return (
              <LetterCard
                key={L}
                letter={L}
                idx={idx}
                onClick={(ch) => onPick(ch)}
                disabled={disabled}
                highlight={highlight}
              />
            );
          })}
        </div>
      </div>

      {/* Star celebration (bigger, brief, does NOT cut audio) */}
      <AnimatePresence>
        {star && (
          <motion.div
            key={star}
            className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="text-7xl md:text-8xl">🌟</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sad face on out-of-tries */}
      <AnimatePresence>
        {showSad && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-6xl md:text-7xl">😞</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SR-only live region */}
      <div aria-live="polite" className="sr-only">
        {started ? `Find letter ${target}. Attempts ${attemptsLeft}. Score ${score}.` : "Title screen"}
      </div>
    </div>
  );
}
