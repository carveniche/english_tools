import React, { useEffect, useState } from "react";

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function QuizListingPage({ quizData,onFinishQuiz  }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [letters, setLetters] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState("");

  const currentQuiz = quizData[currentIndex];

  // ---------- Setup ----------
  useEffect(() => {
    if (!currentQuiz) return;

    setIsCorrect(false);
    setFeedback("");
    setSelectedIndex(null);
    setSelectedOption(null);

    if (currentQuiz.question_type === "horizontal ordering") {
      setLetters(shuffleArray(currentQuiz.words));
    }

    if (currentQuiz.question_type === "multiple choice") {
      setOptions(shuffleArray(currentQuiz.words));
    }

    if (currentQuiz.question_type === "fill in the blanks") {
      setOptions(shuffleArray(currentQuiz.option_words));
    }
  }, [currentIndex]);


  useEffect(() => {
  if (isCorrect) {
    const t = setTimeout(() => {
      if (currentIndex < quizData.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        // 🎉 Quiz finished
        onFinishQuiz?.();
      }
    }, 800); // small delay for success animation

    return () => clearTimeout(t);
  }
}, [isCorrect]);


    const correctAudio = new Audio("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/gotIt.mp3");
const wrongAudio = new Audio("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/NOPE.mp3");

const playCorrect = () => {
  correctAudio.currentTime = 0;
  correctAudio.play();
};

const playWrong = () => {
  wrongAudio.currentTime = 0;
  wrongAudio.play();
};

  // ---------- Swap logic (kid friendly) ----------
  const clickLetter = (index) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else {
      const arr = [...letters];
      const temp = arr[selectedIndex];
      arr[selectedIndex] = arr[index];
      arr[index] = temp;
      setLetters(arr);
      setSelectedIndex(null);
    }
  };

  // ---------- Check ----------
const checkAnswer = () => {
  setFeedback("");

  let correct = false;

  if (currentQuiz.question_type === "horizontal ordering") {
    if (letters.join("") === currentQuiz.answer) {
      correct = true;
    }
  }

  if (currentQuiz.question_type === "multiple choice") {
    if (selectedOption === currentQuiz.answer) {
      correct = true;
    }
  }

  if (currentQuiz.question_type === "fill in the blanks") {
    if (selectedOption === currentQuiz.answer) {
      correct = true;
    }
  }

  if (correct) {
    playCorrect();      // ✅ play success sound
    setIsCorrect(true);
  } else {
    playWrong();        // ❌ play error sound
    setFeedback("❌ Try again!");
  }
};




  // ---------- Next ----------
  const nextQuestion = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // alert("🎉 Quiz Completed!");
      console.log("🎉 Quiz Completed!")
    }
  };

  if (!currentQuiz) return null;

  return (
  <div
  className="h-full w-full py-[3rem] flex flex-col items-center justify-between select-none touch-none bg-center bg-cover bg-no-repeat"
style={{backgroundImage:'url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyPageBg.avif)'}}
  onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
  onTouchMove={(e) => { e.stopPropagation(); e.preventDefault(); }}
  onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); }}
  onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
  onPointerMove={(e) => { e.stopPropagation(); e.preventDefault(); }}
  onPointerUp={(e) => { e.stopPropagation(); e.preventDefault(); }}
  onWheel={(e) => { e.stopPropagation(); e.preventDefault(); }}
>

      <h2 className="text-2xl font-bold text-[#ffffff] mb-10">
        {currentQuiz.question_type === "horizontal ordering" && "Arrange the letters"}
        {currentQuiz.question_type === "multiple choice" && "Choose the correct answer"}
        {currentQuiz.question_type === "fill in the blanks" && "Fill in the missing letter"}
      </h2>

     {currentQuiz.image && (
  <div className="mb-8 w-full flex justify-center">
    <img
      src={currentQuiz.image}
      alt="Quiz visual"
      className={`${currentQuiz.question_type === "fill in the blanks"?'max-w-[10rem]':"max-w-[15rem]"} w-full h-auto rounded-xl shadow-lg`}
    />
  </div>
)}
      {/* ---------------- ORDERING ---------------- */}
      {currentQuiz.question_type === "horizontal ordering" && (
        <div className="flex gap-4 mb-10">
          {letters.map((l, i) => (
            <div
              key={i}
              onClick={(e) => {
  e.stopPropagation();
  clickLetter(i);
}}
onTouchStart={(e) => {
    e.stopPropagation();
    clickLetter(i);
  }}

              className={`w-[4rem] h-[4rem] rounded-2xl flex items-center justify-center text-5xl font-bold shadow-lg cursor-pointer transition ${
                selectedIndex === i
                  ? "bg-orange-400 scale-110"
                  : "bg-gradient-to-br from-yellow-700 to-yellow-500 text-white"
              }`}
            >
              {l.toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {/* ---------------- MULTIPLE CHOICE ---------------- */}
      {currentQuiz.question_type === "multiple choice" && (
        <div className="flex gap-6 mb-10">
          {options.map((opt, i) => (
            <button
              key={i}
             onClick={(e) => {
  e.stopPropagation();
  setSelectedOption(opt);
}}
onTouchStart={(e) => {
    e.stopPropagation();
    setSelectedOption(opt);
  }}

              className={`w-[6rem] h-[4rem]  text-2xl font-bold rounded-2xl shadow-xl transition ${
                selectedOption === opt
                  ? "bg-orange-400 text-white scale-110"
                  : "bg-gradient-to-br from-yellow-600 to-yellow-400 text-white"
              }`}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* ---------------- FILL IN BLANK ---------------- */}
      {currentQuiz.question_type === "fill in the blanks" && (
        <>
          <div className="flex gap-4 mb-10">
            {currentQuiz.question_words.map((l, i) => (
              <div
                key={i}
                className="w-[3rem] h-[3rem] border-4 border-dashed border-yellow-700 rounded-xl flex items-center justify-center text-3xl font-bold bg-white"
              >
                {l === "" ? (selectedOption ? selectedOption.toUpperCase() : "?") : l.toUpperCase()}
              </div>
            ))}
          </div>

          <div className="flex gap-6 mb-10">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedOption(opt)}
                onTouchStart={(e) => {
    e.preventDefault();   // ⛔ stop click from firing again
    e.stopPropagation();
    setSelectedOption(opt);
  }}
                className={`w-[4rem] h-[4rem] text-4xl font-bold rounded-2xl shadow-xl transition ${
                  selectedOption === opt
                    ? "bg-orange-400 text-white scale-110"
                    : "bg-gradient-to-br from-yellow-600 to-yellow-400 text-white"
                }`}
              >
                {opt.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ---------------- BUTTONS ---------------- */}
      <div className="flex gap-8 justify-center items-center w-full">
        <button
          onClick={checkAnswer}
           onTouchStart={(e) => {
    e.preventDefault();
    e.stopPropagation();
    checkAnswer();
  }}
          className="flex items-center justify-center transform hover:-translate-y-0.5 transition-all duration-200
               rounded-[1.5rem] 
  bg-gradient-to-br from-yellow-100 to-yellow-300
  shadow-[5px_5px_0_#b87b2a]
  text-lg  text-yellow-900 px-[0.8rem] py-[0.2rem] mt-2 cursor-pointer"
        >
          CHECK
        </button>

        <button
          onClick={nextQuestion}
            onTouchStart={(e) => {
    if (!isCorrect) return;
    e.preventDefault();
    e.stopPropagation();
    nextQuestion();
  }}
          disabled={!isCorrect}
          className={`cursor-pointer flex items-center justify-center transform hover:-translate-y-0.5 transition-all duration-200
               rounded-[1.5rem] 
  

  text-lg   px-[0.8rem] py-[0.2rem] mt-2  ${
            isCorrect ? "bg-gradient-to-br from-yellow-100 to-yellow-300 text-yellow-900   shadow-[5px_5px_0_#b87b2a]" : "bg-gray-400 text-gray-200"
          }`}
        >
          NEXT
        </button>
      </div>

      {/* ---------------- FEEDBACK ---------------- */}
      {/* {feedback && (
        <div className="mt-8 text-red-600 font-bold text-3xl">
          {feedback}
        </div>
      )} */}

      {/* {isCorrect && (
        <div className="mt-8 text-green-600 font-bold text-3xl animate-bounce">
          🎉 Correct!
        </div>
      )} */}
    </div>
  );
}

export default QuizListingPage;
