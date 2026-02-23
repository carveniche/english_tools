import React, { useMemo, useState, useEffect, useRef } from "react";
import { generatePuzzle } from "./math_cross";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const POP_SOUND =
  "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/clockTickingSound.mp3";

const Theme = [
  {
    id: "3d",
    plusImage:
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/mathCrossPlus.png",
    minusImage:
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/mathCrossMinus.png",
    divisionImage:
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/mathCrossDivision.png",
    multipleImage:
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/mathCrossMultiple.png",
    equalImage:
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/mathCrossEqual.png",
    alreadyAnswerFilledImage:
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/arrangeQuizCorrect.png",
  },
];

function MathCross() {
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(9));
  const { grid, answers } = puzzle;

  const theme = useMemo(() => Theme[0], []);

  const [inputs, setInputs] = useState({});
  const [currentInputId, setCurrentInputId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  // const [startTime, setStartTime] = useState(Date.now());
  // const [endTime, setEndTime] = useState(null);
const startTimeRef = useRef(Date.now());
const endTimeRef = useRef(null);




  const [animKey, setAnimKey] = useState(0);
  const popAudioRef = useRef(null);
  const [cellSize, setCellSize] = useState(64);
    const confettiRef = useRef(null);
useEffect(() => {
  confettiRef.current = confetti.create(undefined, { resize: true, useWorker: true });
}, []);
useEffect(() => {
  function updateSize() {
    const w = window.innerWidth;

    if (w < 480) setCellSize(36);      // mobile
    else if (w < 768) setCellSize(40);
    else if (w < 1024) setCellSize(48); // tablet
    else setCellSize(64);              // desktop
  }

  updateSize();
  window.addEventListener("resize", updateSize);
  return () => window.removeEventListener("resize", updateSize);
}, []);


  // Init audio
  useEffect(() => {
    popAudioRef.current = new Audio(POP_SOUND);
  }, []);

  // 🔊 Play sound only while grid animates
  useEffect(() => {
    if (!popAudioRef.current) return;

    const audio = popAudioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.loop = true;
    audio.play().catch(() => {});

    const stopTimer = setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, grid.length * grid.length * 40 + 500);

    return () => {
      clearTimeout(stopTimer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [animKey, grid.length]);




    

  // Set first input
  useEffect(() => {
    const ids = Object.keys(answers);
    if (ids.length) setCurrentInputId(ids[0]);
  }, [answers]);

  function handleChange(id, value) {
    if (!/^\d*$/.test(value)) return;
    const v = value.slice(0, 2);

    setInputs((prev) => ({ ...prev, [id]: v }));

    const ids = Object.keys(answers);
    const idx = ids.indexOf(id);
    if (idx >= 0 && idx + 1 < ids.length) {
      setCurrentInputId(ids[idx + 1]);
    }
  }

  function checkAnswers() {
        console.log(score,"hello")

    let correct = 0;
    for (let id in answers) {
      if (Number(inputs[id]) === answers[id]) correct++;
    }
    setScore(correct);
    endTimeRef.current = Date.now();

    setShowResult(true);
 
  }

  useEffect(() => {
  startTimeRef.current = Date.now();
}, []);
//           confettiRef.current?.({ particleCount: 100, spread: 100, origin: { y: 0.6 } });


// useEffect(()=>{
  
//        if(score>=3){
//         console.log(score,"hello")

//     }
// },[score])
useEffect(() => {
  const total = Object.keys(answers).length;

  if (showResult && score === total) {
    const duration = 2000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      confettiRef.current?.({
        particleCount: 20,
        spread: 120,
        startVelocity: 30,
        origin: { y: 0.6 },
      });

      if (Date.now() > end) clearInterval(interval);
    }, 200);
  }
}, [showResult, score, answers]);


  function resetGame() {
    const newPuzzle = generatePuzzle(9);
    setPuzzle(newPuzzle);
    setInputs({});
    setScore(0);
    setShowResult(false);
    // setStartTime(Date.now());
    // setEndTime(null);
    
    startTimeRef.current = Date.now();
endTimeRef.current = null;


    const ids = Object.keys(newPuzzle.answers);
    if (ids.length) setCurrentInputId(ids[0]);

    setAnimKey((k) => k + 1);
  }

  const allFilled = Object.keys(answers).every(
    (id) => inputs[id] !== undefined && inputs[id] !== ""
  );

  // const timeTaken =
  //   endTime && startTime ? ((endTime - startTime) / 1000).toFixed(2) : 0;
  // const timeTakenSec = endTimeRef.current
  // ? Math.max(1, Math.floor((endTimeRef.current - startTimeRef.current) / 1000))
  // : 0;
  function getTimeSpentSec() {
  const end = endTimeRef.current || Date.now();
  return Math.max(1, Math.floor((end - startTimeRef.current) / 1000));
}


const totalQuestions = Object.keys(answers).length;
const isWin = score === totalQuestions;
const resultStatus = isWin ? "win" : "lose";

// if (score === Object.keys(answers).length) {
//   result = "win";
// } else {
//   result = "lose";
// }



      useEffect(()=>{
      if (showResult){
           if (typeof window.sendingTimespentMathCross === "function") {
            const formdata = new FormData();
                  formdata.append("fun_game_code", "FUN_G09");
                  formdata.append("coins_earned", score);
                  formdata.append("time_spent",getTimeSpentSec());
                  formdata.append("result",resultStatus);
                  formdata.append("at_from","web");
  
  
                  window.sendingTimespentMathCross(formdata);
          } else {
            console.log( "not found sendingTimespentMathCross function");
          }
      }
    },[showResult])

     useEffect(() => {
          
          const btn = document.getElementById("closing-btn-phonics-with-math-cross");
    
          const onClick = () => {
            if (showResult) return;
              // stopConfetti();
            //  stopTimer();
            if (typeof window.sendingTimespentMathCross === "function") {
              const formdata = new FormData();
                    formdata.append("fun_game_code", "FUN_G09");
                    formdata.append("coins_earned", score);
                    formdata.append("time_spent",getTimeSpentSec());
                    formdata.append("result",resultStatus);
                    formdata.append("at_from","web");
    
    
                    window.sendingTimespentMathCross(formdata);
                    // restartGame()
                    //   setGameOver(true);
    
                    
            } else {
              console.log( "not found sendingTimespentMathCross function");
            }
          };
    
          if (btn) btn.addEventListener("click", onClick);
    
          return () => {
            if (btn) btn.removeEventListener("click", onClick);
          };
        }, [showResult]);

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.3 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div
      className="relative flex flex-col justify-center items-center gap-6 h-[calc(100vh-10vh)] bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage:
          "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/allBg.png)",
      }}
    >
      {/* GRID */}
      <motion.div
        key={animKey}
        className="grid p-4 gap-1"
        // style={{ gridTemplateColumns: `repeat(${grid.length}, 64px)` }}
        style={{ gridTemplateColumns: `repeat(${grid.length}, ${cellSize}px)` }}

        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <motion.div
              key={`${r}-${c}`}
              // className="w-[64px] h-[64px]"
              style={{ width: cellSize, height: cellSize }}

              variants={cellVariants}
            >
              {cell && (
                <div className="w-full h-full">
                  {renderCell(cell, inputs, handleChange, theme, currentInputId)}
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      {/* CHECK BUTTON */}
      {!showResult && (
        <button
          disabled={!allFilled}
          onClick={checkAnswers}
          className={`absolute left-2 top-1
            p-[0.5rem] xl:p-[1rem] text-[1rem]  xl:text-xl font-extrabold rounded-2xl shadow-xl transition-all duration-300
            ${
              allFilled
                ? "bg-gradient-to-r from-green-500 to-lime-500 hover:scale-110 active:scale-95 text-white animate-pulse"
                : "bg-gray-400 text-gray-700 cursor-not-allowed opacity-60"
            }
          `}
        >
          <span className="hidden xl:block">CHECK ANSWERS</span>
          <span className="block xl:hidden">CHECK</span>
        </button>
      )}

      {/* RESULT POPUP */}
      {showResult && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-200 p-6 rounded-3xl w-[440px] text-center shadow-2xl border-[6px] border-yellow-500"
          >
            <h2 className="text-3xl font-extrabold text-purple-800 drop-shadow">
              🏆 LEVEL COMPLETE!
            </h2>

            <p className="mt-3 text-xl font-bold text-blue-800">
              ⭐ Score: {score} / {Object.keys(answers).length}
            </p>
            <p className="text-lg font-bold text-red-700">
              ⏱ Time: {getTimeSpentSec()}s
            </p>

            {/* ANSWER GRID */}
            <div
              className="grid gap-1 mt-4 justify-center bg-white/60 p-3 rounded-xl shadow-inner"
              // style={{ gridTemplateColumns: `repeat(${grid.length}, 32px)` }}
              style={{ gridTemplateColumns: `repeat(${grid.length}, ${Math.floor(cellSize / 2)}px)` }}

            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  if (!cell)
                    return <div key={`${r}-${c}`} className="w-8 h-8" />;

                  const val =
                    cell.type === "input"
                      ? answers[cell.id]
                      : cell.type === "number"
                      ? cell.value
                      : cell.type === "op"
                      ? cell.value
                      : "=";

                  return (
                    <div
                      key={`${r}-${c}`}
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold border rounded-md bg-green-100"
                    >
                      {val}
                    </div>
                  );
                })
              )}
            </div>

            {/* <p className="mt-3 font-bold text-purple-700">
              {["Great job!", "Awesome!", "Keep practicing!"][
                Math.floor(Math.random() * 3)
              ]}
            </p> */}

            <button
              onClick={resetGame}
              className="mt-5 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:scale-110 transition"
            >
              PLAY AGAIN
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ---------------- CELL RENDER ---------------- */
function renderCell(cell, inputs, handleChange, theme, currentInputId) {
  const baseStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "2px solid #ccc",
    backgroundColor: "white",
  };

  if (cell.type === "number") return <div style={baseStyle}>{cell.value}</div>;

  if (cell.type === "input") {
    const isCurrent = currentInputId === cell.id;

    return (
      <div
        style={{
          ...baseStyle,
          backgroundImage: `url(${theme.alreadyAnswerFilledImage})`,
          backgroundPosition: "center",
          boxShadow: isCurrent ? "0 0 25px 8px gold" : "none",
          border: isCurrent ? "3px solid orange" : baseStyle.border,
        }}
      >
        <input
          value={inputs[cell.id] || ""}
          onChange={(e) => handleChange(cell.id, e.target.value)}
          maxLength={2}
          className="w-full h-full bg-transparent text-center font-bold text-2xl outline-none"
          style={{ color: "#fff" }}
          autoFocus={isCurrent}
        />
      </div>
    );
  }

  if (cell.type === "op" || cell.type === "eq") {
    const imgSrc =
      cell.type === "op"
        ? {
            "+": theme.plusImage,
            "-": theme.minusImage,
            "×": theme.multipleImage,
            "÷": theme.divisionImage,
          }[cell.value]
        : theme.equalImage;

    return (
      <div style={baseStyle}>
        <img src={imgSrc} alt="" className="w-[2rem]" />
      </div>
    );
  }

  return null;
}

export default MathCross;
