import React, { useEffect, useState, useRef } from "react";
import { generateQuestions } from "./questionGenerator";

function LevelHard() {
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
    "/rocketOption.png",
    "/rocketOptionTwo.png",
    "/rocketOptionThree.png",
  ];

  // ---------------------------
  // Sounds
  // ---------------------------
  const wrongAudioRef = useRef(null);
  const rightAudioRef = useRef(null);

  // ---------------------------
  // Game Data
  // ---------------------------
  const [EasyQuestionType] = useState(() => generateQuestions("hard"));
  const sets = EasyQuestionType.map((q) => q.options);

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

    // ⏱ AUTO NEXT when rocket reaches top (10s = CSS time)
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

    const correctAnswer = EasyQuestionType[currentSet].answer;

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

  // ---------------------------
  // End screen
  // ---------------------------
  if (currentSet >= sets.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white text-2xl">
        ✅ Quiz Completed! <br />
        Score: {score}/{total}
      </div>
    );
  }

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div
      className="w-full h-full flex flex-col gap-[1rem] items-center justify-between bg-no-repeat bg-center bg-cover rounded-lg overflow-hidden p-[0.5rem]"
      style={{ backgroundImage: "url(/EasyLevelBg.png)" }}
    >
      {/* Score */}
      <div className="w-full border-2 border-white flex justify-end gap-[1rem] px-2">
        <div className="text-white">Score: {score}</div>
        <div className="text-white">Total: {total}</div>
      </div>

      {/* Question */}
      <div className="w-full border-2 border-white flex justify-center py-2 text-white text-xl font-bold">
        {EasyQuestionType[currentSet].question}
      </div>

      {/* Options */}
      <div className="relative w-full border border-yellow-300 h-full flex justify-center items-end overflow-hidden">
        {renderSet && (
          <div
            ref={containerRef}
            key={currentSet}
            className="flex justify-evenly items-center w-full"
            style={{
              position: "absolute",
              bottom: move ? "500px" : "0px",
              transition: "bottom 5s linear",
              gap: "1rem",
              border:"1px solid red"
            }}
          >
            {renderSet.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(option)}
                className="relative cursor-pointer flex justify-center items-center"
              >
                <img src={currentRocketSkin} alt="rocketOption" />

                <span
                  className={`
                    absolute border border-dashed rounded-lg p-[0.5rem] text-white transition-all
                    ${
                      option === selectedOption
                        ? option === EasyQuestionType[currentSet].answer
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

export default LevelHard;
