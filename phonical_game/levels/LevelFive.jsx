import React, { useEffect, useMemo, useRef, useState } from "react";
import HomeBack from "../HomeBack";

const FLIP_SENSITIVE = ["s", "r", "f", "g", "m", "n", "e", "k", "c", "u", "y"];

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

function LevelFive({ timeSpent, stopTimer, onGoHome,comp }) {
  const { say } = useVoice();
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const questions = useMemo(() => {
    const n = Math.floor(Math.random() * 2) + 5;
    return shuffle(FLIP_SENSITIVE)
      .slice(0, n)
      .map((l) => ({ base: l, side: Math.random() < 0.5 ? "left" : "right" }));
  }, []);

  const [q, setQ] = useState(0);
  const cur = questions[q];


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

  // Add keyframes for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulseCorrect {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
      @keyframes pulseWrong {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(0.98); }
      }
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes gentleShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
      @keyframes fadeOutUp {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-20px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const playAgain = () => {
  setScore(0);
  setFeedback(null);
  setIsTransitioning(false);
  setQ(0); 
};


 if (!cur)
  return (
    <HomeBack
      playAgain={playAgain}
      onGoHome={onGoHome}
      timeSpent={timeSpent}
      component={comp}
    />
  );





  const letter = cur.base;
  const correctSide = cur.side;

  const Card = ({ flip, onClick, isLeft }) => {
    const isCorrect = feedback === "correct" && correctSide === (isLeft ? "left" : "right");
    const isWrong = feedback === "wrong" && correctSide !== (isLeft ? "left" : "right");
    const isInactive = feedback && !isCorrect && !isWrong;

    return (
      <button
        onClick={onClick}
        disabled={feedback || isTransitioning}
        className={`
          relative
          w-full h-full min-h-[300px]
          rounded-3xl
          flex items-center justify-center
          transition-all duration-500
          transform
          ${isTransitioning ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
          ${isCorrect 
            ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-2xl shadow-green-200 animate-[pulseCorrect_0.5s_ease-in-out]' 
            : isWrong 
            ? 'bg-gradient-to-br from-rose-400 to-red-500 shadow-2xl shadow-red-200 animate-[pulseWrong_0.3s_ease-in-out]' 
            : 'bg-gradient-to-br from-white/90 to-white/70 shadow-xl shadow-purple-100/50'
          }
          ${isInactive ? 'opacity-60 scale-95' : 'opacity-100'}
          overflow-hidden
          group
          border-4
          ${isCorrect ? 'border-emerald-300' : isWrong ? 'border-rose-300' : 'border-white/50'}
        `}
      >
        {/* Background shimmer effect */}
        <div className={`
          absolute inset-0
          transition-opacity duration-700
          ${isCorrect ? 'opacity-100' : isWrong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          ${isCorrect 
            ? 'bg-gradient-to-r from-emerald-200/30 via-emerald-100/20 to-transparent' 
            : isWrong 
            ? 'bg-gradient-to-r from-rose-200/30 via-rose-100/20 to-transparent'
            : 'bg-gradient-to-r from-purple-100/20 via-pink-100/10 to-transparent'
          }
        `}></div>
        
        {/* Letter container */}
        <div className="relative z-10">
          <div
            className="text-9xl font-black tracking-tighter"
            style={{ 
              transform: flip ? "scaleX(-1)" : "none",
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {letter}
          </div>
          
          {/* Feedback indicator */}
          {(isCorrect || isWrong) && (
            <div className={`
              absolute -top-6 left-1/2 transform -translate-x-1/2
              text-2xl font-bold whitespace-nowrap
              transition-all duration-300
              ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}
              animate-[slideIn_0.3s_ease-out]
            `}>
            </div>
          )}
        </div>

        {/* Click hint for inactive state */}
        {!feedback && !isTransitioning && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* <div className="text-sm font-semibold text-purple-600/70 bg-white/80 px-4 py-1 rounded-full">
              Click to choose
            </div> */}
          </div>
        )}
      </button>
    );
  };

  const handleClick = async (side) => {
    if (feedback || isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (side === correctSide) {
      setScore((s) => s + 1);
      setFeedback("correct");
      await say("Nice!");
    } else {
      setFeedback("wrong");
      await say("Try again");
    }

    // Smooth transition to next question
    setTimeout(() => {
      setIsTransitioning(false);
      setFeedback(null);
      setQ((i) => i + 1);
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-56px)] px-4 pb-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Progress bar */}
      <div className="max-w-2xl mx-auto mt-6">
        <div className="flex justify-between text-sm font-medium text-purple-700 mb-2">
          <span>Question {q + 1} of {questions.length}</span>
          <span>Score: {score}/{questions.length}</span>
        </div>
        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-700 ease-out"
            style={{ width: `${((q) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Header */}
      <div className="py-4 text-center animate-[slideIn_0.5s_ease-out]">
        <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Which is written correctly?
        </div>
        <div className="text-lg text-purple-500/80 mt-2 font-medium">
          Choose the card that shows the letter in its normal orientation
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto grid xl:h-[60vh] max-w-[1200px] grid-cols-1 gap-8 mt-8 md:grid-cols-2 px-4">
        {isTransitioning ? (
          // Fading out animation
          <>
            <div className="animate-[fadeOutUp_0.5s_ease-in-out]">
              <Card
                flip={correctSide !== "left"}
                isLeft={true}
                onClick={() => {}}
              />
            </div>
            <div className="animate-[fadeOutUp_0.5s_ease-in-out]">
              <Card
                flip={correctSide !== "right"}
                isLeft={false}
                onClick={() => {}}
              />
            </div>
          </>
        ) : (
          // Normal display
          <>
            <div className="animate-[slideIn_0.4s_ease-out]">
              <Card
                flip={correctSide !== "left"}
                isLeft={true}
                onClick={() => handleClick("left")}
              />
            </div>
            <div className="animate-[slideIn_0.4s_ease-out_0.1s]">
              <Card
                flip={correctSide !== "right"}
                isLeft={false}
                onClick={() => handleClick("right")}
              />
            </div>
          </>
        )}
      </div>

      {/* Instructions */}
      {/* <div className="max-w-lg mx-auto mt-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <span className="text-sm font-medium text-purple-700">
            Green = Correct choice • Red = Wrong choice
          </span>
        </div>
      </div> */}
    </div>
  );
}

export default LevelFive;