import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ==========================
// Phonics with Stories – Single-file React App (fixed)
// Fixes:
// 1) Breakdown slides reveal the FULL word (first letter shows immediately).
// 2) Quiz limited to 6–7 UNIQUE questions (no repeated words across types).
// 3) Audio stops on page flip / navigation / restart.
// ==========================

// --------- CONFIG: plug your stories here ---------
const STORY_DATA = [
  {
    id: "short-a-demo",
    title: "Sam and the Cap",
    themeColor: "#00c4b3",
    image :"https://picsum.photos/seed/cover/1200/900",
    pages: [
      {
        image: "https://picsum.photos/seed/cap/1200/1200",
        line: "Sam has a red cap",
        targetWord: "cap",
        phonemes: ["/k/", "/æ/", "/p/"],
      },
      {
        image: "https://picsum.photos/seed/mat/1200/1200",
        line: "The cat sits on the mat",
        targetWord: "mat",
        phonemes: ["/m/", "/æ/", "/t/"],
      },
    ],
    quizWords: [
      { word: "cat", image: "https://picsum.photos/seed/cat2/1200/1200" },
      { word: "cap", image: "https://picsum.photos/seed/cap2/1200/1200" },
      { word: "mat", image: "https://picsum.photos/seed/mat2/1200/1200" },
      { word: "bag", image: "https://picsum.photos/seed/bag2/1200/1200" },
      { word: "ham", image: "https://picsum.photos/seed/ham2/1200/1200" },
      { word: "pat", image: "https://picsum.photos/seed/pat2/1200/1200" },
      { word: "fan", image: "https://picsum.photos/seed/fan2/1200/1200" },
    ],
  },
];

    //   },
// --------- Voice helpers ---------
function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    "Samantha",
    "Zira",
    "Victoria",
    "Tessa",
    "Karen",
    "Moira",
    "Google UK English Female",
    "Google US English Female",
  ];
  for (const name of preferred) {
    const v = voices.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return voices[0] || null;
}

function speak(text, voice, onend) {
  if (!text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.rate = 1.0;
  u.pitch = 1.1;
  u.onend = () => onend && onend();
  window.speechSynthesis.speak(u);
}

// --------- Utils ---------
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const splitLastWord = (line) => {
  const parts = line.trim().split(" ").filter(Boolean);
  const last = parts.pop();
  return { first: parts.join(" "), last };
};

function buildFlow(pages) {
  const flow = [];
  pages.forEach((p, idx) => {
    flow.push({ type: "page", index: idx, page: p });
    if (p.targetWord && p.phonemes && p.phonemes.length) {
      flow.push({
        type: "breakdown",
        forIndex: idx,
        word: (p.targetWord || "").trim(),
        phonemes: p.phonemes,
      });
    }
  });
  return flow;
}

// --------- Quiz builder (unique words, 6–7 Qs) ---------
function makeQuiz(story) {
  const maxQs = Math.min(7, story.quizWords.length);
  const chosen = shuffle(story.quizWords).slice(0, Math.max(6, maxQs));
  return chosen.map(({ word, image }) => {
    const letters = word.split("");
    const last = letters[letters.length - 1];
    const distractPool = ["t", "d", "l", "n", "m", "g", "p", "b", "f", "s"];
    const opts = shuffle([
      last,
      ...shuffle(distractPool.filter((x) => x !== last)).slice(0, 2),
    ]);
    const jumbled = shuffle(letters);
    const other =
      shuffle(story.quizWords.filter((w) => w.word !== word))[0]?.word || "pet";

    const candidates = shuffle([
      {
        type: "missing-letter",
        word,
        image,
        questionTTS: `Which letter completes ${word}?`,
        display: letters
          .map((ch, i) => (i === letters.length - 1 ? "_" : ch))
          .join(" "),
        options: opts,
        answer: last,
      },
      {
        type: "reorder",
        word,
        questionTTS: `Form the word ${word}.`,
        tiles: jumbled,
        answer: word,
      },
      {
        type: "pick-word",
        word,
        questionTTS: `Choose the word ${word}.`,
        options: shuffle([word, other]),
        answer: word,
      },
    ]);
    return candidates[0]; // one type per word
  });
}

// ==========================
// MAIN APP
// ==========================
export default function PhonicsWithStoriesApp() {
  const [voice, setVoice] = useState(null);
  const [stage, setStage] = useState("cover");
  const [storyIndex] = useState(0);
  const story = STORY_DATA[storyIndex];

  useEffect(() => {
    const handler = () => setVoice(pickVoice());
    handler();
    window.speechSynthesis.onvoiceschanged = handler;
    return () => (window.speechSynthesis.onvoiceschanged = null);
  }, []);

  const flow = useMemo(() => buildFlow(story.pages), [story]);
  const [flowIndex, setFlowIndex] = useState(0);
  const current = flow[flowIndex];

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const [quiz, setQuiz] = useState(() => makeQuiz(story));
  const [quizIndex, setQuizIndex] = useState(0);
  const currentQ = quiz[quizIndex];

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const restartAll = () => {
    window.speechSynthesis.cancel();
    setStage("cover");
    setFlowIndex(0);
    setQuiz(makeQuiz(story));
    setQuizIndex(0);
    setConfetti(false);
  };

  const nextFlow = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (flowIndex < flow.length - 1) setFlowIndex(flowIndex + 1);
    else setStage("quiz");
  };

  const onCoverStart = () => {
    setStage("reading");
    setFlowIndex(0);
  };
// console.log(onCoverStart(),"onCoverStart")
// useEffect(()=>{
// console.log(onCoverStart(),"onCoverStart")

// },[onCoverStart])
  const handlePlayLine = () => {
    if (!current) return;
    if (current.type === "page") {
      setIsSpeaking(true);
      speak(current.page.line, voice, () => setIsSpeaking(false));
    } else if (current.type === "breakdown") {
      setIsSpeaking(true);
      const seq = [...current.phonemes, current.word];
      let i = 0;
      const play = () => {
        if (i >= seq.length) return setIsSpeaking(false);
        speak(seq[i], voice, () => {
          i += 1;
          setTimeout(play, 180);
        });
      };
      play();
    }
  };

  const bgColors = ["#00838f", "#00e5ff", "#00695c", "#ff4081"];
  const bg =
    bgColors[(stage === "reading" ? flowIndex : quizIndex) % bgColors.length];

  const speakQ = (q) => speak(q.questionTTS, voice);
  const onCorrect = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1600);
    if (quizIndex < quiz.length - 1) setQuizIndex(quizIndex + 1);
    else setStage("end");
  };
  const onWrong = () => speak("Try again!", voice);

  return (
    <div
      className="w-screen h-screen overflow-hidden select-none"
      style={{ background: bg }}
    >
      {stage === "cover" && (
        <Cover story={story} onStart={onCoverStart} onRestart={restartAll} />
      )}
      {stage === "reading" && (
        <Reading
          story={story}
          current={current}
          flowIndex={flowIndex}
          total={flow.length}
          onPlay={handlePlayLine}
          onNext={nextFlow}
          onRestart={restartAll}
          isSpeaking={isSpeaking}
        />
      )}
      {stage === "quiz" && (
        <Quiz
          currentQ={currentQ}
          quizIndex={quizIndex}
          total={quiz.length}
          speakQ={speakQ}
          onCorrect={onCorrect}
          onWrong={onWrong}
          onRestart={restartAll}
        />
      )}
      {stage === "end" && <End onRestart={restartAll} />}
      <StyleInjector />
      <ConfettiBurst show={confetti} />
    </div>
  );
}

// ==========================
// UI SECTIONS
// ==========================
function TopBar({ onRestart }) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
      <button
        onClick={() => {
          window.speechSynthesis.cancel();
          onRestart && onRestart();
        }}
        className="text-black font-bold bg-white/90 rounded-2xl shadow px-5 py-2 border border-black/10"
      >
        Restart
      </button>
      <div
        className="text-white font-bold"
        style={{ fontFamily: "'Times New Roman', serif", fontSize: 24 }}
      >
        Phonics with Stories
      </div>
      <div className="w-[100px]" />
    </div>
  );
}

function Cover({ story, onStart, onRestart }) {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <TopBar onRestart={onRestart} />
      <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center gap-8 px-6">
        <div
          className="text-center"
          style={{ fontFamily: "'Times New Roman', serif" }}
        >
          <h1 className="font-extrabold text-black" style={{ fontSize: 64 }}>
            {story.title}
          </h1>
          <p className="text-black/80" style={{ fontSize: 28 }}>
            Tap below to begin the story.
          </p>
        </div>
        <div className="w-full max-w-5xl h-[55vh] rounded-3xl bg-white shadow-xl border border-black/10 grid grid-cols-2 gap-0 overflow-hidden">
          <div className="h-full bg-[url('https://picsum.photos/seed/cover/1200/900')] bg-cover bg-center" />
          <div className="h-full flex items-center justify-center p-6">
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                onStart();
              }}
              className="w-3/4 h-1/2 rounded-3xl bg-pink-300 hover:bg-pink-200 transition shadow-xl border border-black/10 flex items-center justify-center"
            >
              <span
                className="text-black font-extrabold"
                style={{ fontSize: 40, fontFamily: "'Times New Roman', serif" }}
              >
                Start the Story
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reading({
  story,
  current,
  flowIndex,
  total,
  onPlay,
  onNext,
  onRestart,
  isSpeaking,
}) {
  return (
    <div className="w-screen h-screen">
      <TopBar onRestart={onRestart} />
      <FlipCard keyId={`${flowIndex}-${current && current.type}`} show>
        <div className="max-w-7xl mx-auto h-screen px-6 py-20">
          <div className="w-full h-full rounded-3xl bg-white shadow-2xl border border-black/10 grid grid-cols-2 overflow-hidden relative">
            <div
              className="absolute right-6 top-6 text-black/60"
              style={{ fontSize: 28, fontFamily: "'Times New Roman', serif" }}
            >
              {flowIndex + 1} / {total}
            </div>
            {current && current.type === "page" ? (
              <>
                <div className="h-full w-full bg-black/5 flex items-center justify-center">
                  <img
                    src={current.page.image}
                    alt="illustration"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="h-full w-full flex flex-col items-center justify-center p-10">
                  <div
                    className="text-center leading-snug"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  >
                    <StoryLine line={current.page.line} />
                  </div>
                  <div className="mt-12 flex gap-4">
                    <PageButton
                      onClick={onPlay}
                      label={isSpeaking ? "Playing..." : "Play Line"}
                    />
                    <PageButton onClick={onNext} label="Next Page" />
                  </div>
                </div>
              </>
            ) : (
              <BreakdownPanel
                color={story.themeColor}
                word={current && current.word}
                phonemes={current && current.phonemes}
                onPlay={onPlay}
                onNext={onNext}
              />
            )}
          </div>
        </div>
      </FlipCard>
    </div>
  );
}

function Quiz({
  currentQ,
  quizIndex,
  total,
  speakQ,
  onCorrect,
  onWrong,
  onRestart,
}) {
  return (
    <div className="w-screen h-screen">
      <TopBar onRestart={onRestart} />
      <div className="max-w-7xl mx-auto h-screen px-6 py-20">
        <div className="w-full h-full rounded-3xl bg-white shadow-2xl border border-black/10 p-10 flex flex-col">
          <div className="flex items-center justify-between">
            <h2
              className="text-black font-extrabold"
              style={{ fontSize: 42, fontFamily: "'Times New Roman', serif" }}
            >
              Revision Quiz
            </h2>
            <div
              className="text-black/70"
              style={{ fontSize: 28, fontFamily: "'Times New Roman', serif" }}
            >
              Q {quizIndex + 1} / {total}
            </div>
          </div>
          <div className="flex-1 mt-8 grid place-items-center">
            {currentQ && (
              <QuizItem
                q={currentQ}
                speakQ={speakQ}
                onCorrect={onCorrect}
                onWrong={onWrong}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function End({ onRestart }) {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <TopBar onRestart={onRestart} />
      <div className="max-w-5xl w-full h-[65vh] rounded-3xl bg-white shadow-2xl border border-black/10 flex flex-col items-center justify-center gap-8 p-10">
        <div
          className="text-center"
          style={{ fontFamily: "'Times New Roman', serif" }}
        >
          <h2 className="text-black font-extrabold" style={{ fontSize: 56 }}>
            Great job!
          </h2>
          <p className="text-black/70" style={{ fontSize: 28 }}>
            You finished the story and the quiz.
          </p>
        </div>
        <div className="flex gap-4">
          <PageButton onClick={onRestart} label="Restart" />
        </div>
      </div>
      <ConfettiBurst show />
    </div>
  );
}

// ==========================
// SUBCOMPONENTS
// ==========================
function PageButton({ onClick, label }) {
  return (
    <button
      onClick={() => {
        window.speechSynthesis.cancel();
        onClick && onClick();
      }}
      className="px-8 py-4 rounded-2xl bg-cyan-300 hover:bg-cyan-200 border border-black/10 shadow text-black font-extrabold"
      style={{ fontFamily: "'Times New Roman', serif", fontSize: 28 }}
    >
      {label}
    </button>
  );
}

function StoryLine({ line }) {
  const { first, last } = splitLastWord(line);
  return (
    <p className="mx-auto" style={{ fontSize: 56, maxWidth: 900 }}>
      <span className="text-black">{first} </span>
      <span className="text-red-600 font-bold">{last}</span>
    </p>
  );
}

function BreakdownPanel({ color, word, phonemes, onPlay, onNext }) {
  // Robust letter reveal using substring to guarantee the FIRST letter shows first
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    const w = (word || "").trim();
    setVisibleCount(0);
    let i = 0;
    let id;
    const tick = () => {
      i += 1;
      setVisibleCount(i);
      if (i < w.length) id = setTimeout(tick, 240);
    };
    if (w.length) id = setTimeout(tick, 240); // start from 0 → show first letter after 240ms
    return () => clearTimeout(id);
  }, [word]);

  const w = (word || "").trim();
  const shown = w.slice(0, visibleCount).split("");

  return (
    <div className="col-span-2 h-full w-full flex flex-col items-center justify-center p-10">
      <div
        className="w-full max-w-3xl h-[55vh] rounded-3xl border border-black/10 shadow grid place-items-center"
        style={{ background: color }}
      >
        <div
          className="text-center"
          style={{ fontFamily: "'Times New Roman', serif" }}
        >
          <div className="mb-6" style={{ fontSize: 38 }}>
            {(phonemes || []).map((p, idx) => (
              <span
                key={idx}
                className="inline-block bg-white/80 rounded-2xl px-4 py-2 m-2 border border-black/10"
              >
                {p}
              </span>
            ))}
          </div>
          <div
            className="font-extrabold text-black tracking-wider"
            style={{ fontSize: 90 }}
          >
            {shown.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.22 }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex gap-4">
        <PageButton onClick={onPlay} label="Play" />
        <PageButton onClick={onNext} label="Next" />
      </div>
    </div>
  );
}

function QuizItem({ q, speakQ, onCorrect, onWrong }) {
  useEffect(() => {
    window.speechSynthesis.cancel();
    const t = setTimeout(() => speakQ(q), 200);
    return () => clearTimeout(t);
  }, [q]);
  if (q.type === "missing-letter")
    return <MissingLetter q={q} onCorrect={onCorrect} onWrong={onWrong} />;
  if (q.type === "reorder")
    return <ReorderWord q={q} onCorrect={onCorrect} onWrong={onWrong} />;
  if (q.type === "pick-word")
    return <PickWord q={q} onCorrect={onCorrect} onWrong={onWrong} />;
  return null;
}

function MissingLetter({ q, onCorrect, onWrong }) {
  return (
    <div className="w-full max-w-5xl grid grid-cols-2 gap-10 items-center">
      <div className="w-full h-[55vh] rounded-3xl overflow-hidden border border-black/10 shadow">
        {q.image ? (
          <img
            src={q.image}
            alt={q.word}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full grid place-items-center bg-black/5 text-black"
            style={{ fontSize: 32 }}
          >
            No image
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <div
          className="text-center"
          style={{ fontFamily: "'Times New Roman', serif", fontSize: 40 }}
        >
          {q.display}
        </div>
        <div className="flex gap-6">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => (opt === q.answer ? onCorrect() : onWrong())}
              className="w-24 h-24 rounded-2xl bg-cyan-200 hover:bg-cyan-100 border border-black/10 shadow text-black font-extrabold grid place-items-center"
              style={{ fontSize: 32 }}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PickWord({ q, onCorrect, onWrong }) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8">
      <div
        className="text-center"
        style={{ fontFamily: "'Times New Roman', serif", fontSize: 40 }}
      >
        Tap the correct word
      </div>
      <div className="flex gap-6">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => (opt === q.answer ? onCorrect() : onWrong())}
            className="px-10 py-6 rounded-2xl bg-pink-300 hover:bg-pink-200 border border-black/10 shadow text-black font-extrabold"
            style={{ fontSize: 40, fontFamily: "'Times New Roman', serif" }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReorderWord({ q, onCorrect, onWrong }) {
  const [tiles, setTiles] = useState(q.tiles);
  const [dragIndex, setDragIndex] = useState(null);
  useEffect(() => setTiles(q.tiles), [q]);
  const onDrop = (to) => {
    if (dragIndex === null) return;
    const arr = [...tiles];
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(to, 0, moved);
    setTiles(arr);
  };
  const isCorrect = tiles.join("") === q.answer;
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-10">
      <div
        className="text-center"
        style={{ fontFamily: "'Times New Roman', serif", fontSize: 40 }}
      >
        Drag to form: <span className="font-extrabold">{q.answer}</span>
      </div>
      <div className="flex gap-4">
        {tiles.map((t, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className="w-24 h-24 rounded-2xl bg-green-300 border border-black/10 shadow grid place-items-center cursor-move"
            style={{ fontSize: 40, fontFamily: "'Times New Roman', serif" }}
            title="Drag to reorder"
          >
            {t}
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <PageButton
          onClick={() => (isCorrect ? onCorrect() : onWrong())}
          label={isCorrect ? "Check ✓" : "Check"}
        />
        <PageButton onClick={() => setTiles(shuffle(tiles))} label="Shuffle" />
      </div>
    </div>
  );
}

// --------- Animations / helpers ---------
const ConfettiBurst = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{ left: Math.random() * 100 + "%", top: "-5%" }}
            initial={{ y: -50, rotate: 0 }}
            animate={{
              y: window.innerHeight + 100,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 1.5 + Math.random() * 0.7,
              ease: "easeOut",
            }}
          >
            {Math.random() > 0.5 ? "✨" : "⭐"}
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

const FlipCard = ({ show, children, keyId }) => (
  <AnimatePresence mode="popLayout">
    {show && (
      <motion.div
        key={keyId}
        className="w-full h-full perspective"
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

function StyleInjector() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = ".perspective{perspective:1200px}";
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}
