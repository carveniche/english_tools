import React, { useEffect, useState, useRef } from "react";
import { generateQuestions } from "./questionGenerator";
import { motion, AnimatePresence } from "framer-motion";

// 🎉 Random feedback lines
const FEEDBACKS = [
  "🚀 Amazing flying, Captain!",
  "🌟 Great job, Space Hero!",
  "🛰️ Mission Successful!",
  "🔥 You're a Rocket Genius!",
  "💫 Outstanding Performance!",
  "✨ Keep Exploring Space!",
  "🧑‍🚀 Future Astronaut in Making!"
];

function LevelEasy({difficulty,onExit,stopBgMusic}) {
    // console.log(difficulty,"difficulty")
  // ---------------------------
  // Helpers
  // ---------------------------
  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ---------------------------
  // Assets
  // ---------------------------
  const RocketTheme = [
    "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/rocketOption.png",
    "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/rocketOptionTwo.png",
    "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/rocketOptionThree.png",
  ];

  // ---------------------------
  // Sounds
  // ---------------------------
  const wrongAudioRef = useRef(null);
  const rightAudioRef = useRef(null);

  // ---------------------------
  // Game Data
  // ---------------------------
//   const [EasyQuestionType] = useState(() => generateQuestions({difficulty}));
//   const sets = EasyQuestionType.map((q) => q.options);
const [questions] = useState(() => generateQuestions(difficulty));
const sets = questions.map((q) => q.options);


  // ---------------------------
  // States
  // ---------------------------
  const [currentRocketSkin, setCurrentRocketSkin] = useState(RocketTheme[0]);
  const [currentSet, setCurrentSet] = useState(0);
  const [renderSet, setRenderSet] = useState(null);
  const [move, setMove] = useState(false);

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [locked, setLocked] = useState(false);

  const containerRef = useRef(null);
  const autoNextTimerRef = useRef(null);
const TRAIL_COLORS = ["#00f0ff", "#ff00ff", "#00ff5a", "#ffaa00"];
const currentTrailColor = TRAIL_COLORS[currentSet % TRAIL_COLORS.length];
const endReportedRef = useRef(false);


  const [storingTime, setStoringTime] = useState(0);
  const timerRef = useRef(null);
  const storingRef = useRef(0);


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

  // ---------------------------
  // Init sounds
  // ---------------------------
  useEffect(() => {
    wrongAudioRef.current = new Audio("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/NOPE.mp3");
    rightAudioRef.current = new Audio("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/gotIt.mp3");
  }, []);

  // ---------------------------
  // Animate options
  // ---------------------------
  useEffect(() => {
    if (currentSet >= sets.length) return;

    setRenderSet(sets[currentSet]);
    setMove(false);
    setSelectedOption(null);
    setLocked(false);

    setCurrentRocketSkin(randomFrom(RocketTheme));

    if (containerRef.current) containerRef.current.offsetHeight;

    const startTimer = setTimeout(() => {
      setMove(true);
    }, 50);

    // ⏱ Auto next when rocket reaches top (10s)
    autoNextTimerRef.current = setTimeout(() => {
      goNextQuestion();
    }, 10000);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(autoNextTimerRef.current);
    };
  }, [currentSet]);

  // ---------------------------
  // Click handler
  // ---------------------------
  const handleOptionClick = (option) => {
    if (locked) return;

    setLocked(true);
    setSelectedOption(option);

    const correctAnswer = questions[currentSet].answer

    if (option === correctAnswer) {
      // ✅ CORRECT
      if (rightAudioRef.current) {
        rightAudioRef.current.currentTime = 0;
        rightAudioRef.current.play();
      }

      setScore((prev) => prev + 1);
      setTotal((prev) => prev + 1);

      clearTimeout(autoNextTimerRef.current);

      setTimeout(() => {
        goNextQuestion();
      }, 700);
    } else {
      // ❌ WRONG
      if (wrongAudioRef.current) {
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play();
      }

      // allow retry
      setTimeout(() => {
        setLocked(false);
        setSelectedOption(null);
      }, 600);
    }
  };

  function goNextQuestion() {
    clearTimeout(autoNextTimerRef.current);
    setRenderSet(null);
    setSelectedOption(null);
    setLocked(false);
    setTotal((prev) => prev + 1);
    setCurrentSet((prev) => prev + 1);
  }

  useEffect(()=>{
    startTimer()
  },[])
  console.log(storingRef.current,"storingRef.current")
  // ---------------------------
  // END SCREEN STATS
  // ---------------------------
  const totalQuestions = sets.length;
  const attempted = total;
  const correct = score;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const randomFeedback = FEEDBACKS[Math.floor(Math.random() * FEEDBACKS.length)];

  

  useEffect(() => {
    
    const btn = document.getElementById("closing-btn-with-math-rocket-rush");
    const onClick = () => {
      stopBgMusic()
      if (currentSet >= sets.length) return;
       stopTimer();
      if (typeof window.sendingTimespentMathRocket === "function") {
        const formdata = new FormData();
              formdata.append("fun_game_code", "FUN_G11");
              formdata.append("coins_earned", score);
              formdata.append("time_spent",storingRef.current);
              formdata.append("result",score);
            //   formdata.append("solved_sequences", JSON.stringify(solvedPaths));
              formdata.append("at_from","web");
              window.sendingTimespentMathRocket(formdata);
              // restartGame()
              //   setGameOver(true);
              
      } else {
        console.log( "not found sendingTimespentMathRocket function");
      }
      if (typeof resetTimer === "function") {
        resetTimer();
      }
    };
    if (btn) btn.addEventListener("click", onClick);
    return () => {
      if (btn) btn.removeEventListener("click", onClick);
    };
  }, [sets,currentSet]);

  // ---------------------------
  // End screen
  // ---------------------------
useEffect(() => {
  if (currentSet >= sets.length && !endReportedRef.current) {
    endReportedRef.current = true;

    stopTimer();

    if (typeof window.sendingTimespentMathRocket === "function") {
      const formdata = new FormData();
      formdata.append("fun_game_code", "FUN_G11");
      formdata.append("coins_earned", score);
      formdata.append("time_spent", storingRef.current);
      formdata.append("result", score);
      formdata.append("at_from", "web");

      window.sendingTimespentMathRocket(formdata);
    } else {
      console.log("not found sendingTimespentMathRocket function");
    }

    resetTimer();
  }
}, [currentSet, sets.length, score]);



if (currentSet >= sets.length) {
        //    stopTimer();
        //  if (typeof window.sendingTimespentMathRocket === "function") {
        //   const formdata = new FormData();
        //         formdata.append("fun_game_code", "FUN_G11");
        //         formdata.append("coins_earned", score);
        //         formdata.append("time_spent",storingRef.current);
        //         formdata.append("result",score);
        //         // formdata.append("solved_sequences", JSON.stringify(solvedPaths));
        //         formdata.append("at_from","web");
        //         window.sendingTimespentMathRocket(formdata);
        // } else {
        //   console.log( "not found sendingTimespentMathRocket function");
        // }
        //         resetTimer();
// if(true){
  return (
    <AnimatePresence>
      <motion.div
        className="w-[80%] md:w-[60%] relative  h-[70%] flex flex-col items-center justify-center text-white bg-blue-950 md:bg-transparent bg-no-repeat bg-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Background */}
        <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/GameOverBg.png" className="absolute hidden w-full h-full md:block" />

        {/* Panel */}
        <motion.div
          className="w-full md:w-[80%] z-10 h-[95%] md:h-[60%] flex flex-col justify-start items-start gap-[2rem] p-6 relative"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Title */}
          <motion.div
            className="text-4xl font-bold text-center mx-auto font-mono"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          >
            Mission Completed!
          </motion.div>

          {/* Stats */}
          <motion.div
            className="text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="font-mono hidden md:block">1. Score --------- <b className="text-green-600">{correct}</b></div>
            <div className="font-mono hidden md:block">2. Total Questions ----------- <b className="text-yellow-500">{totalQuestions}</b></div>
            <div className="font-mono hidden md:block">3. Accuracy ------------ <b className="text-orange-500">{accuracy}%</b></div>
             <div className="font-mono block  md:hidden">1. Score  <b className="text-green-600">{correct}</b></div>
            <div className="font-mono block md:hidden">2. Total Questions  <b className="text-yellow-500">{totalQuestions}</b></div>
            <div className="font-mono block md:hidden">3. Accuracy  <b className="text-orange-500">{accuracy}%</b></div>

            {/* <div className="mt-4 text-yellow-300">{randomFeedback}</div> */}
          </motion.div>

          {/* Button */}
          {/* <motion.button
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold absolute bottom-[1rem] left-[40%]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
          >
            Exit to Home
          </motion.button> */}
           <motion.div
            className="w-full flex justify-center items-center"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
             whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
          >
            <img
              src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/backToHomeRocket.png"
              alt="backToHomeRocket"
              className="h-[5rem] cursor-pointer"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div
      className="w-full h-full flex flex-col gap-[1rem] items-center justify-between bg-no-repeat bg-center bg-cover rounded-lg overflow-hidden p-[0.5rem]"
      style={{ backgroundImage: "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/EasyLevelBg.png)" }}
    >
      {/* Score */}
      {/* <div className="w-full  flex justify-end gap-[1rem] px-2">
        <div className="text-white">Score: {score}</div>
        <div className="text-white">Total: {total}</div>
      </div> */}
      {/* Score & Bottle Progress */}
<div className="w-full flex justify-end items-center px-4 gap-4">

  {/* Score */}
  <div className="text-white text-[1rem] gap-[1rem] font-bold flex justify-start items-center flex-row">
        <span className="text-sm">
      {currentSet + 1} / {totalQuestions}
    </span>
    <span>
     ⭐{score}
    </span>

  </div>

  {/* Bottle Progress */}
  <div className="flex flex-col items-center gap-1">

    {/* Label */}
    {/* <div className="text-white text-sm font-bold">
    </div> */}

    {/* Bottle */}
    <div className="relative w-[30px] h-[30px] ">

      {/* Bottle neck */}
      {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[15px] h-[15px]  rounded-t-lg bg-[#4b2c82]" /> */}

      {/* Bottle body */}
      <div className="absolute top-[0px] left-0 w-full h-[30px]  rounded-[5px] overflow-hidden bg-[#4b2c82]">

        {/* Liquid */}
        <div
          className="absolute bottom-0 w-full transition-all duration-700"
          style={{
            height: `${((currentSet + 1) / totalQuestions) * 100}%`,
            background: "linear-gradient(180deg, #00f0ff, #00ff9c)",
          }}
        />

        {/* Shine */}
        <div className="absolute left-2 top-2 w-[6px] h-full bg-white/20 rounded-full" />

      </div>
    </div>

  </div>

  {/* Total */}
  {/* <div className="text-white text-lg font-bold">
    🧮 Total: {total}
  </div> */}

</div>


      {/* Question */}
      <div className="w-full  flex items-center justify-center py-2 text-white text-xl font-bold relative">
        <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/questionBoard.png" alt="questionBoard" className="w-[12rem] h-[4.2rem]" draggable={false} />
        <span className="absolute">
          {questions[currentSet].question}
        </span>
      </div>

      {/* Options */}
      <div className="relative w-full h-full flex justify-center items-end overflow-hidden ">
        <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/astroRocks.png" alt="astroRocks" className="absolute top-[-0.3rem] w-full z-20" draggable={false}/>
        {renderSet && (
          <div
            ref={containerRef}
            key={currentSet}
            className="flex justify-evenly items-center w-full"
            style={{
              position: "absolute",
              bottom: move ? "500px" : "0px",
              transition: "bottom 10s linear",
              gap: "1rem",
            }}
          >
           {renderSet.map((option, i) => (
  <button
    key={i}
    onClick={() => handleOptionClick(option)}
    className="relative cursor-pointer flex flex-col justify-center items-center"
  >
    {/* 🚀 Rocket with glow */}
    <img
      src={currentRocketSkin}
      alt="rocketOption"
      className="relative z-10 drop-shadow-[0_0_12px_rgba(255,180,80,0.9)]"
      draggable={false}
    />

    {/* 🛤️ Glowing track */}
    <div className="relative -mt-2">
      {/* Glow aura */}
      <div className="absolute inset-0 w-[6px] h-[45px] bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 rounded-full blur-[6px] opacity-90"></div>
    </div>

    {/* 🏷️ Option bubble */}
    <span
      className={`
        absolute top-[40%] z-10 mt-2 border border-dashed rounded-lg p-[0.5rem] text-white transition-all
        ${
          option === selectedOption
            ? option === questions[currentSet].answer
              ? "bg-green-600 border-green-800"
              : "bg-red-600 border-red-800"
            : "bg-[#654991] border-[#442D70]"
        }
      `}
    >
      {option}
    </span>
  </button>
))}

          </div>
        )}
      </div>
    </div>
  );
}

export default LevelEasy;
