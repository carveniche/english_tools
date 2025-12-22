import React, { useEffect, useState } from "react";

const ITEMS = [
  {
    id: 1,
    subjectOptions: ["She", "They", "Him"],
    subjectCorrect: "She",
    verbOptions: ["eats", "play", "writes"],
    verbCorrect: "eats",
    objectOptions: ["an apple", "a ball", "a car"],
    objectCorrect: "an apple",
    answer: "She eats an apple.",
  },
  // Add more sentence objects here, ensuring each has the same structure
];

const IMAGE_URLS = {
  // 1: "/images/sentences/1.jpg",
  1:'https://images.teachthis.com.au/Product/image/original/1484402044EmergentReaders_SentenceMatchingStrips.png'
  // Add mappings for all sentence IDs here
};

export default function SentenceFun() {
  const [screen, setScreen] = useState("game");
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState({ s: null, v: null, o: null });
  const [faded, setFaded] = useState([[], [], []]);
  const [showSentence, setShowSentence] = useState(false);
  const [imgError, setImgError] = useState(false);

  const item = ITEMS[idx] || {};
  const progress = idx + (step === 4 ? 1 : 0);

  useEffect(() => {
    setStep(1);
    setPicked({ s: null, v: null, o: null });
    setFaded([[], [], []]);
    setShowSentence(false);
    setImgError(false);
  }, [idx]);

  const imgSrcFor = (it) => IMAGE_URLS[it.id] || `/images/sentences/${it.id}.jpg`;

  const choose = (which, opt) => {
    if (which === 1) {
      if (opt === item.subjectCorrect) {
        setPicked((p) => ({ ...p, s: opt }));
        setStep(2);
      } else setFaded((f) => [[...f[0], opt], f[1], f[2]]);
    } else if (which === 2) {
      if (opt === item.verbCorrect) {
        setPicked((p) => ({ ...p, v: opt }));
        setStep(3);
      } else setFaded((f) => [f[0], [...f[1], opt], f[2]]);
    } else if (which === 3) {
      if (opt === item.objectCorrect) {
        setPicked((p) => ({ ...p, o: opt }));
        setStep(4);
        setShowSentence(true);
        try {
          new Audio("/audio/yay.mp3").play();
        } catch (e) {}
        setTimeout(() => {
          if (idx + 1 < ITEMS.length) setIdx((i) => i + 1);
          else setScreen("complete");
        }, 1200);
      } else setFaded((f) => [f[0], f[1], [...f[2], opt]]);
    }
  };

  if (!item.subjectOptions) {
    return <div className="h-screen w-screen flex items-center justify-center">No items found.</div>;
  }

  if (screen === "complete") {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-emerald-200 via-sky-200 to-fuchsia-200 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <h2 className="text-5xl font-extrabold text-emerald-800 mb-4">Great job! 🎉</h2>
          <p className="text-2xl text-slate-800 mb-8">You finished all {ITEMS.length} sentences.</p>
          <button onClick={() => { setIdx(0); setScreen("game"); }} className="px-10 py-4 rounded-3xl shadow-lg bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 hover:opacity-95 active:scale-95 transition text-white text-2xl font-bold">PLAY AGAIN</button>
        </div>
      </div>
    );
  }

  const stepOptions = step === 1 ? item.subjectOptions : step === 2 ? item.verbOptions : item.objectOptions;
  const currentFaded = step === 1 ? faded[0] : step === 2 ? faded[1] : faded[2];

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="font-extrabold tracking-tight text-slate-900 text-2xl">Sentence Fun</div>
          <div className="text-slate-900 text-2xl">{progress}/{ITEMS.length}</div>
        </div>

        <div className="rounded-[28px] shadow-2xl border-8 border-white bg-gradient-to-br from-yellow-300 via-pink-300 to-green-300 p-6 md:p-8 min-h-[70vh] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="w-[230px] h-[330px] rounded-3xl shadow-inner overflow-hidden bg-white flex items-center justify-center mb-5 border-4 border-slate-500">
              {!imgError ? (
                <img src={imgSrcFor(item)} alt={item.answer} className="w-full h-full object-contain select-none" onError={() => setImgError(true)} draggable={false} />
              ) : (
                <div className="text-[120px]">🖼️</div>
              )}
            </div>
            <div className="text-slate-900 mb-4 text-2xl">Pick the correct Subject, Verb, and Object.</div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {stepOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => choose(step, opt)}
                disabled={currentFaded.includes(opt)}
                className={`min-w-[200px] px-6 py-4 rounded-2xl border-4 text-2xl font-semibold transition ${currentFaded.includes(opt) ? "opacity-30 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"} bg-gradient-to-br from-yellow-300 via-cyan-300 to-fuchsia-300 border-fuchsia-400 hover:shadow-xl`}
              >
                {opt}
              </button>
            ))}
          </div>

          {showSentence && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-4 px-6 py-4 rounded-3xl bg-emerald-100 border-4 border-emerald-300 shadow">
                <div className="font-bold text-slate-900 text-2xl">{picked.s} {picked.v} {picked.o}</div>
                <div className="text-4xl text-emerald-600">✓</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
