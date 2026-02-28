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
  "🧑‍🚀 Future Astronaut in Making!",
];

function RocketRushLevel({ difficulty = "easy", onExit }) {
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
  // Game Data (🔥 ONLY CHANGE)
  // ---------------------------
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

  // ---------------------------
  // Init sounds
  // ---------------------------
  useEffect(() => {
    wrongAudioRef.current = new Audio(
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/NOPE.mp3"
    );
    rightAudioRef.current = new Audio(
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/gotIt.mp3"
    );
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

    // ⏱ Auto next
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

    const correctAnswer = questions[currentSet].answer;

    if (option === correctAnswer) {
      rightAudioRef.current?.play();

      setScore((prev) => prev + 1);
      setTotal((prev) => prev + 1);

      clearTimeout(autoNextTimerRef.current);

      setTimeout(() => {
        goNextQuestion();
      }, 700);
    } else {
      wrongAudioRef.current?.play();

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
  // END SCREEN
  // ---------------------------
  const totalQuestions = sets.length;
  const accuracy =
    total > 0 ? Math.round((score / total) * 100) : 0;

  if (currentSet >= sets.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold">Mission Completed!</h1>

        <div className="mt-4 text-xl">
          <div>✅ Correct: {score}</div>
          <div>🧮 Total: {totalQuestions}</div>
          <div>🎯 Accuracy: {accuracy}%</div>
        </div>

        <button
          className="mt-8 px-6 py-3 bg-red-600 rounded-lg font-bold"
          onClick={onExit}
        >
          Exit to Home
        </button>
      </div>
    );
  }

  // ---------------------------
  // GAME UI (same as your Easy)
  // ---------------------------
  return (
    <div
      className="w-full h-full flex flex-col gap-[1rem] items-center justify-between bg-no-repeat bg-center bg-cover p-[0.5rem]"
      style={{ backgroundImage: "url(/EasyLevelBg.png)" }}
    >
      {/* Question */}
      <div className="relative text-white text-xl font-bold">
        {questions[currentSet].question}
      </div>

      {/* Options */}
      <div className="relative w-full h-full flex justify-center items-end overflow-hidden">
        {renderSet && (
          <div
            ref={containerRef}
            key={currentSet}
            className="flex justify-evenly w-full"
            style={{
              position: "absolute",
              bottom: move ? "500px" : "0px",
              transition: "bottom 10s linear",
            }}
          >
            {renderSet.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(option)}
                className="relative flex flex-col items-center"
              >
                <img src={currentRocketSkin} />

                <span
                  className={`absolute top-[40%] p-2 rounded-lg
                  ${
                    option === selectedOption
                      ? option === questions[currentSet].answer
                        ? "bg-green-600"
                        : "bg-red-600"
                      : "bg-purple-700"
                  }`}
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

export default RocketRushLevel;
