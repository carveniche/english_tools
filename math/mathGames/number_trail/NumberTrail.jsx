import React, { useEffect, useRef, useState } from "react";
import { generateQuestion } from "./number_trail";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const GAME_TIME = 60;

const BUTTON_SKINS = [
  "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/numberTrailGreenBtn.png",
  "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/numberTrailOrangeBtn.png",
  "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/numberTrailPurpleBtn.png"
];

function randomSkin() {
  return BUTTON_SKINS[Math.floor(Math.random() * BUTTON_SKINS.length)];
}

function NumberTrail() {
  const [currentSkin, setCurrentSkin] = useState(randomSkin());
  const [question, setQuestion] = useState(() => {
    const q = generateQuestion();
    return { ...q, skin: currentSkin };
  });

  const [selected, setSelected] = useState([]);
  const [tempPrompt, setTempPrompt] = useState(null);
  const [errorPrompt, setErrorPrompt] = useState(null);

  const [sum, setSum] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [trail, setTrail] = useState([]);
  const [path, setPath] = useState([]);
  const errorSoundRef = useRef(null);

//  const [solvedQuestions, setSolvedQuestions] = useState([]);
const [solvedPaths, setSolvedPaths] = useState([]);


  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [storingTime, setStoringTime] = useState(0);
  const timerRef = useRef(null);
  const storingRef = useRef(0);
  const confettiRef = useRef(null);
useEffect(() => {
  confettiRef.current = confetti.create(undefined, { resize: true, useWorker: true });
}, []);

function pathSignature(path) {
  // Example: "0-1|0-2|1-2"
  return path.map(p => `${p.r}-${p.c}`).join("|");
}

  const { grid, target, prompt } = question;

const startTimer = () => {
  if (timerRef.current) return;

  timerRef.current = setInterval(() => {
    storingRef.current += 1; 
    setStoringTime(storingRef.current);
  }, 1000);
};

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    storingRef.current = 0;
    setStoringTime(0);
  };

  function stopConfetti() {
  if (confettiRef.current) {
    confettiRef.current.reset(); // 🔥 Kills all particles immediately
  }
}

useEffect(() => {
  errorSoundRef.current = new Audio(
    "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/NOPE.mp3"
  );
  errorSoundRef.current.preload = "auto";
}, []);


useEffect(() => {
  if (!gameOver) {
    startTimer();
  }
  return () => stopTimer();
}, [gameOver]);


  useEffect(()=>{
    if (gameOver){
        stopTimer()
         if (typeof window.sendingTimespentMathTrail === "function") {
          const formdata = new FormData();
                formdata.append("fun_game_code", "FUN_G10");
                formdata.append("coins_earned", score);
                formdata.append("time_spent",storingRef.current);
                formdata.append("result",score);
                formdata.append("solved_sequences", JSON.stringify(solvedPaths));
                formdata.append("at_from","web");


                window.sendingTimespentMathTrail(formdata);
        } else {
          console.log( "not found sendingTimespentMathTrail function");
        }
    }
  },[gameOver])

//   API 
    useEffect(() => {
      
      const btn = document.getElementById("closing-btn-phonics-with-stories");

      const onClick = () => {
        if (gameOver) return;
          stopConfetti();
         stopTimer();
        if (typeof window.sendingTimespentMathTrail === "function") {
          const formdata = new FormData();
                formdata.append("fun_game_code", "FUN_G10");
                formdata.append("coins_earned", score);
                formdata.append("time_spent",storingRef.current);
                formdata.append("result",score);
                formdata.append("solved_sequences", JSON.stringify(solvedPaths));
                formdata.append("at_from","web");


                window.sendingTimespentMathTrail(formdata);
                // restartGame()
                //   setGameOver(true);

                
        } else {
          console.log( "not found sendingTimespentMathTrail function");
        }

        if (typeof resetTimer === "function") {
          resetTimer();
        }
      };

      if (btn) btn.addEventListener("click", onClick);

      return () => {
        if (btn) btn.removeEventListener("click", onClick);
      };
    }, [gameOver]);

  // TIMER
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  function resetPath() {
    setSelected([]);
    setSum(0);
    setDragging(false);
    setTrail([]);
    setPath([]);
  }

  function newPuzzle() {
    const q = generateQuestion();
    const skin = randomSkin();
    setCurrentSkin(skin);
    setQuestion({ ...q, skin });
    resetPath();
  }

function restartGame() {
stopConfetti();
  resetTimer();
  setScore(0);
  setSolvedPaths([]);   // 🔥 CLEAR OLD DATA
  setTimeLeft(GAME_TIME);
  setGameOver(false);
  newPuzzle();
  startTimer();
  
}



  function isAdjacent(a, b) {
    if (!a) return true;
    const dr = Math.abs(a.r - b.r);
    const dc = Math.abs(a.c - b.c);
    return dr <= 1 && dc <= 1;
  }

  function startDrag(r, c) {
    if (gameOver) return;
    resetPath();
    setDragging(true);
    selectCell(r, c);
  }

//   function endDrag() {
//     if (gameOver) return;
//     setDragging(false);

//     if (sum === target) {
//       confettiRef.current?.({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
//       setSolvedQuestions(prev => [...prev, { prompt, target }]);
//       setScore(s => s + 1);
//     //   setTimeout(() => newPuzzle(), 600);
//     } else {
//       setTimeout(() => resetPath(), 400);
//     }
//   }
function endDrag() {
  if (gameOver) return;
  setDragging(false);

  if (sum === target) {
    const signature = pathSignature(path);

    const alreadySolved = solvedPaths.includes(signature);

    if (alreadySolved) {
     setTempPrompt("⚠️ You already tried this path!");
      setTimeout(() => {
    setTempPrompt(null);
  }, 2000);
      resetPath();
      return;
    }

    // ✅ New valid path
    setSolvedPaths(prev => [...prev, signature]);

    confettiRef.current?.({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    setScore(s => s + 1);

    // ❗ Do NOT generate new puzzle
    // setTimeout(() => newPuzzle(), 600);

    resetPath();
  } else {
    setTimeout(() => resetPath(), 400);
  }
}

  function addTrail(x, y) {
    setTrail(prev => [...prev.slice(-30), { x, y, id: Math.random() }]);
  }

  function handleMove(e) {
    if (!dragging || gameOver) return;
    const p = e.touches ? e.touches[0] : e;
    if (!p) return;

    addTrail(p.clientX, p.clientY);

    const el = document.elementFromPoint(p.clientX, p.clientY);
    if (!el) return;

    const r = el.getAttribute("data-row");
    const c = el.getAttribute("data-col");

    if (r !== null && c !== null) {
      selectCell(Number(r), Number(c));
    }
  }

  function selectCell(r, c) {
    if (gameOver) return;

    const key = `${r}-${c}`;
    if (selected.includes(key)) return;

    const last = path[path.length - 1];
    if (!isAdjacent(last, { r, c })) return;

    const value = grid[r][c];
    const newSum = sum + value;

    setSelected(prev => [...prev, key]);
    setPath(prev => [...prev, { r, c }]);
    setSum(newSum);

    // if (newSum > target) {
    //   setTimeout(() => resetPath(), 300);
    // }
    if (newSum > target) {
  if (errorSoundRef.current) {
    errorSoundRef.current.currentTime = 0; 
    errorSoundRef.current.play().catch(() => {});
  }
  setErrorPrompt("Oops! That’s more than the target!");
   setTimeout(() => {
    setErrorPrompt(null);
  }, 2000);
  setTimeout(() => resetPath(), 300);
  return;
}

  }

  function getFeedback() {
    if (score < 20) return "🙂 Keep practicing! You’ll get better!";
    if (score < 50) return "😎 Nice job! You’re getting good!";
    if (score < 100) return "🔥 Amazing! Your brain is fast!";
    return "🧠⚡ GENIUS LEVEL!";
  }
  // Trigger confetti once when gameOver becomes true
// useEffect(() => {
//   if (gameOver) {
//     confettiRef.current?.({
//       particleCount: 200,
//       spread: 100,
//       origin: { y: 0.5 },
//     });
//   }
// }, [gameOver]);



  // GAME OVER SCREEN
 if (gameOver) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 text-white p-6">
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="text-3xl md:text-6xl font-extrabold drop-shadow-lg"
      >
        🏁 Game Over
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-black/50 backdrop-blur-md rounded-3xl px-8 py-6 flex flex-col items-center shadow-xl"
      >
        <div className="text-4xl mb-2">
          ⭐ Score: <span className="text-yellow-400">{score}</span>
        </div>
        <div className="text-xl text-green-300 font-semibold text-center">{getFeedback()}</div>
      </motion.div>

      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 20 }}
        onClick={restartGame}
        className="flex items-center gap-3 bg-gradient-to-r from-green-400 to-lime-300 text-black font-bold px-10 py-5 rounded-2xl text-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200"
      >
         Try Again
      </motion.button>
    </div>
  );
}


  // Build dynamic sum string: 3 + 7 + 2 = 12
  const sumDisplay = selected
    .map(key => {
      const [r, c] = key.split("-").map(Number);
      return grid[r][c];
    })
    .join(" + ");

  return (
    <div
      className="w-full h-full flex flex-col items-center gap-6 p-6 text-white select-none relative justify-between"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onMouseUp={endDrag}
      onTouchEnd={endDrag}
    >
      {/* HUD */}
      <div className="absolute top-4 right-1 md:right-4 flex flex-row gap-2 text-xl font-bold  p-4 rounded-xl z-50">
        <div className="flex justify-center items-center flex-row gap-[0.5rem]">
        <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/timesSecond.png" alt="times" className="w-[2rem]" />

            {timeLeft}s</div>
        <div className="flex justify-center items-center flex-row gap-[0.5rem]">
            <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/scorePoint.png" alt="score" className="w-[1.3rem]" />
             {score}</div>
      </div>

      {/* TRAIL + LINE CONNECT */}
      <div className="fixed inset-0 pointer-events-none">
        <svg className="w-full h-full absolute top-0 left-0">
          {path.map((cell, i) => {
            if (i === 0) return null;
            const prev = path[i - 1];
            const prevEl = document.querySelector(`[data-row="${prev.r}"][data-col="${prev.c}"]`);
            const currEl = document.querySelector(`[data-row="${cell.r}"][data-col="${cell.c}"]`);
            if (!prevEl || !currEl) return null;
            const prevRect = prevEl.getBoundingClientRect();
            const currRect = currEl.getBoundingClientRect();
            return (
              <line
                key={i}
                x1={prevRect.left + prevRect.width / 2}
                y1={prevRect.top + prevRect.height / 2}
                x2={currRect.left + currRect.width / 2}
                y2={currRect.top + currRect.height / 2}
                stroke="lime"
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        <AnimatePresence>
          {trail.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.6 }}
              style={{
                position: "absolute",
                left: p.x - 10,
                top: p.y - 10,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(34,197,94,0.7)",
                filter: "blur(10px)"
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Prompt */}
    <div className="w-fit overflow-hidden relative top-[3rem] xl:top-[1rem]">
  <AnimatePresence mode="wait">
    <motion.h1
      key={prompt} // triggers animation on change
      className="text-xl md:text-3xl font-bold p-[0.7rem] md:p-[1rem] rounded-2xl bg-center bg-cover"
      style={{ backgroundImage: "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/numberTrailPrpomtShow.png)" }}
      initial={{ x: -300, opacity: 0 }}  // start off-screen to the left
      animate={{ x: 0, opacity: 1 }}     // slide to center
      exit={{ x: 300, opacity: 0 }}      // exit to right
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* {tempPrompt || <span className="text-red-700">{errorPrompt}</span> || prompt}
       */}
       {tempPrompt
  ? <span className="text-yellow-400">{tempPrompt}</span>
  : errorPrompt
  ? <span className="text-red-700">{errorPrompt}</span>
  : prompt}

    </motion.h1>
  </AnimatePresence>
</div>


      {/* Running Sum */}
      <div className=" text-lg md:text-2xl font-semibold bg-white text-black mt-[1rem]  p-[1rem] rounded-lg">
        {sumDisplay} {sumDisplay ? "= " : ""}
        <b className="text-green-400">{sum}</b>
      </div>

      {/* GRID */}
      <motion.div className="grid grid-cols-4 md:grid-cols-5 gap-6">
        {grid.map((row, r) =>
          row.map((num, c) => {
            const key = `${r}-${c}`;
            const isSelected = selected.includes(key);

            return (
              <motion.button
                key={key}
                data-row={r}
                data-col={c}
                onMouseDown={() => startDrag(r, c)}
                onTouchStart={() => startDrag(r, c)}
                whileTap={{ scale: 0.8 }}
                animate={{
                  scale: isSelected ? 1.2 : 1,
                  filter: isSelected
                    ? "drop-shadow(0 0 25px rgba(34,197,94,0.9))"
                    : dragging
                    ? "drop-shadow(0 0 10px rgba(255,255,255,0.4))"
                    : "none"
                }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="w-[4rem] h-[4rem] text-2xl font-bold rounded-xl text-black bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url(${currentSkin})` }}
              >
                <motion.span
                  animate={{
                    scale: isSelected ? 1.4 : 1,
                    color: isSelected ? "#fff" : "#000"
                  }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {num}
                </motion.span>
              </motion.button>
            );
          })
        )}
      </motion.div>
    </div>
  );
}

export default NumberTrail;
