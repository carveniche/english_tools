import React, { useEffect, useRef, useState } from "react";

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const isValidQuestion = (q) => {
  if (!q || !q.question_type) return false;

  switch (q.question_type) {
    case "horizontal ordering":
      return Array.isArray(q.words) && q.words.length > 0;

    case "multiple choice":
      return Array.isArray(q.words) && q.words.length > 0;

    case "fill in the blanks":
      return (
        Array.isArray(q.question_words) &&
        q.question_words.length > 0 &&
        Array.isArray(q.option_words) &&
        q.option_words.length > 0
      );

    default:
      return false;
  }
};


function QuizPage({ quizData = [], onQuizComplete,time_spent,level_id }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // const question = quizData[currentIndex];
    if (!Array.isArray(quizData) || quizData.length === 0) {
    return <div className="text-center text-white">Loading quiz...</div>;
  }
  const question = quizData?.[currentIndex];
  useEffect(() => {
  if (!quizData?.length) return;

  // auto-skip invalid questions
  if (!isValidQuestion(question)) {
    let nextIndex = currentIndex + 1;

    while (nextIndex < quizData.length) {
      if (isValidQuestion(quizData[nextIndex])) {
        setCurrentIndex(nextIndex);
        return;
      }
      nextIndex++;
    }

    // no valid questions left → finish quiz
    setQuizCompleted(true);
    onQuizComplete();
  }
}, [currentIndex, quizData]);

// console.log(time_spent,'time_spent')
  const [letters, setLetters] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [filledWord, setFilledWord] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showOgImage, setShowOgImage] = useState(false);
  const storingRef =useRef(time_spent)
  const levelIdRef =useRef(level_id)

  const speakFeedback = (text) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.8;
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };
      useEffect(() => {
      storingRef.current = time_spent;
      levelIdRef.current = level_id
    }, [time_spent,level_id]);
  // initialize question
  useEffect(() => {
    if (!question) return;

    setResult(null);
    setSelectedOption(null);
    setIsCorrect(false);
    setFilledWord(null);

    if (question.question_type === "horizontal ordering") {
      setLetters(shuffleArray(question.words));
    }

    // play audio once if present
    if (question.audio) {
      const audio = new Audio(question.audio);
      audio.play();
    }
  }, [question]);

  /* -----------------------------
     HORIZONTAL ORDERING LOGIC
  ------------------------------*/
  const onDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
  };

  const onDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData("index");
    if (dragIndex === null) return;

    const updated = [...letters];
    const draggedItem = updated.splice(dragIndex, 1)[0];
    updated.splice(dropIndex, 0, draggedItem);

    setLetters(updated);
  };

  const checkOrderingAnswer = () => {
    const formedWord = letters.join("");
    const correct = formedWord === question.answer;

    setResult(correct);
    setIsCorrect(correct);
    setShowOgImage(true);
    speakFeedback(correct ? "Perfect" : "Try again");
  };

  /* -----------------------------
     MULTIPLE CHOICE LOGIC
  ------------------------------*/
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    const correct = option === question.answer;
    setIsCorrect(correct);

    speakFeedback(correct ? "Perfect" : "Try again");
  };

  const handleFillOptionClick = (option) => {
    setFilledWord(option);
    const correct = option === question.answer;
    setIsCorrect(correct);

    speakFeedback(correct ? "Perfect" : "Try again");
  };

  /* -----------------------------
     NEXT QUIZ
  ------------------------------*/
 


  // const nextQuiz = () => {
  //     if (currentIndex < quizData.length - 1) {
  //     setCurrentIndex((prev) => prev + 1);
  //   } 
  //   else {
      
  //     setQuizCompleted(true);
  //     onQuizComplete();
  //     speakFeedback("Quiz completed");
  //   }
  // };
  const nextQuiz = () => {
  let nextIndex = currentIndex + 1;

  while (nextIndex < quizData.length) {
    if (isValidQuestion(quizData[nextIndex])) {
      setCurrentIndex(nextIndex);
      return;
    }
    nextIndex++;
  }

  // no valid questions left
  setQuizCompleted(true);
  onQuizComplete();
  speakFeedback("Quiz completed");
};

  useEffect(()=>{
      if(quizCompleted){
      setQuizCompleted(true);
      onQuizComplete();
      speakFeedback("Quiz completed");
  }
    },[quizCompleted])
    
    useEffect(() => {
      if (quizCompleted) {
        if (typeof window.sendingTimespentStories === "function") {
          const formData = new FormData();
          formData.append("fun_game_detail_id", levelIdRef.current);
          formData.append("time_spent", storingRef.current);
          formData.append("status", "completed");
  
          window.sendingTimespentStories(formData);
        } else {
          console.log("not found sendingTimespentPhonics function");
        }
      }
    }, [quizCompleted]);

  if (quizCompleted) {
    return (
      <></>
      // <div className="flex flex-col items-center gap-6">
      //   {/* quiz UI */}

        // <button
        //   onClick={nextQuiz}
        //   className="px-6 py-3 bg-blue-500 text-white rounded-xl"
        // >
        //   Next →
        // </button>
      // </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <img
        src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/quizTimeImage.png"
        alt=""
        className="hidden md:block absolute left-[-5rem] top-[-2rem] w-[10rem]"
      />
      
      <div className="w-full h-full  rounded-2xl p-6 flex flex-col lg:flex-row gap-[2rem] lg:gap-[3rem] justify-center items-center">
        <h2 className="block md:hidden text-green-800 font-extrabold">Quiz Time</h2>
        <div className="flex justify-center items-center">
          {question.image && (
            <img
              src={question.image}
              alt="quiz"
              className="w-[20rem] lg:max-w-sm rounded-xl object-cover"
            />
          )}
        </div>
        {/* LEFT SIDE – QUIZ */}
        <div className="flex flex-col items-center gap-6 justify-evenly h-full w-[95%] lg:w-[45%] relative">
          <img
            src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/flipStoryPage.png"
            alt="flipStoryPage"
            className="absolute w-full h-full z-0"
          />
          {/* QUESTION TYPE: HORIZONTAL ORDERING */}
          <div className="flex flex-col items-center gap-[1rem] justify-evenly h-[85%] w-[90%] z-10">
            {question.question_type === "horizontal ordering" && (
              <>
                <h2
                  className="p-[2rem] font-bold text-[#F05323] bg-center bg-contain bg-no-repeat"
                  style={{
                    backgroundImage:
                      "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/questionTag.png)",
                  }}
                >
                  Arrange the letters
                  {/* <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/questionTag.png" alt="questionTag" className="w-full h-full absolute" /> */}
                </h2>

                <div className="flex w-[90%] flex-wrap items-center justify-center gap-[0.5rem] h-[80px] md:h-[100px] overflow-y-auto scroll-smooth custom-scroll">
                  {letters.map((letter, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => onDrop(e, index)}
                      className="w-10 h-10 md:w-16 md:h-16 relative flex items-center justify-center text-lg md:text-3xl font-bold rounded-xl cursor-move "
                    >
                      <img
                        src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/arrangeQuiz.png"
                        alt="arrangeQuiz"
                        className="absolute w-full h-full z-0"
                      />
                      {showOgImage && (
                        <img
                          src={
                            isCorrect
                              ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/arrangeQuizCorrect.png"
                              : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/arrangeQuizWrong.png"
                          }
                          alt="chooseQuiz.png"
                          className="absolute w-full h-full z-0"
                        />
                      )}

                      <span
                        className={`${
                          showOgImage
                            ? isCorrect
                              ? "text-white"
                              : "text-white"
                            : ""
                        } z-10`}
                      >
                        {letter}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex w-[100%] md:w-auto flex-row justify-center items-center gap-[1rem] md:gap-[2rem]">
                  <button
                    onClick={checkOrderingAnswer}
                    className="w-[5rem] md:w-[8rem]"
                  >
                    <img
                      src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/checkingTheAnswer.png"
                      alt="checkingTheAnswer"
                      className=""
                    />
                  </button>
                  <button
                    onClick={nextQuiz}
                    disabled={!isCorrect}
                    className={`w-[5em] md:w-[8rem]  `}
                  >
                    <img
                      src={
                        isCorrect
                          ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyNext.png"
                          : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/disableNextBtn.png"
                      }
                      alt="nextbtn"
                    />
                  </button>
                </div>
              </>
            )}

            {/* QUESTION TYPE: MULTIPLE CHOICE */}
            {question.question_type === "multiple choice" && (
              <>
                <h2
                  className="p-[2rem] font-bold text-[12px] md:text-sm  text-[#F05323] bg-center bg-contain bg-no-repeat"
                  style={{
                    backgroundImage:
                      "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/questionTag.png)",
                  }}
                >
                  Choose the correct word
                </h2>

                <div className="flex flex-wrap flex-row gap-4 w-full items-center justify-center h-[70px] md:h-[100px] overflow-y-auto scroll-smooth custom-scroll">
                  {question.words.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isAnswer = option === question.answer;

                    return (
                      // <div className="w-full flex flex-row gap-[1rem]">
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className={` py-1 md:py-2 px-6 md:px-10 text-xl font-bold transition relative flex justify-center items-center
                        ${
                          isSelected
                            ? isAnswer
                              ? " text-white"
                              : " text-white"
                            : ""
                        }
                      `}
                      >
                        <img
                          src={
                            isSelected
                              ? isAnswer
                                ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/correctQuiz.png"
                                : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/wrongQuiz.png"
                              : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/chooseQuiz.png"
                          }
                          alt="chooseQuiz.png"
                          className="absolute w-full h-full z-0"
                        />

                        <span className="z-10 relative md:px-[0.2rem] md:py-[0.2rem]">
                          {" "}
                          {option}
                        </span>
                      </button>
                      //  </div>
                    );
                  })}
                </div>
                <button
                  onClick={nextQuiz}
                  disabled={!isCorrect}
                  className={`w-[6rem] md:w-[8rem] lg:w-[10rem]`}
                >
                  <img
                    src={
                      isCorrect
                        ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyNext.png"
                        : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/disableNextBtn.png"
                    }
                    alt="nextbtn"
                  />
                </button>
              </>
            )}

            {question.question_type === "fill in the blanks" && (
              <>
                <h2
                  className="p-[2rem] font-bold text-[#F05323] bg-center bg-contain bg-no-repeat"
                  style={{
                    backgroundImage:
                      "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/questionTag.png)",
                  }}
                >
                  Fill in the blank
                </h2>

                {/* WORD WITH BLANK */}
                <div className="flex gap-4 text-2xl md:text-4xl font-bold ">
                  {question.question_words.map((char, index) => (
                    <span
                      key={index}
                      className={`w-7 h-7 md:w-14 md:h-14 flex items-center justify-center rounded-xl border-2
            ${
              char === ""
                ? "border-dashed border-gray-400"
                : "border-transparent"
            }`}
                    >
                      {char === "" ? filledWord || "_" : char}
                    </span>
                  ))}
                </div>

                {/* OPTIONS */}
                <div className="flex w-[90%] flex-wrap items-center justify-center gap-[0.5rem] h-[90px] md:h-[100px] overflow-y-auto scroll-smooth custom-scroll">
                  {question.option_words.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleFillOptionClick(option)}
                      className={`py-1 px-[0.8rem] md:px-[1.5rem] text-xl xl:py-2 xl:px-10 xl:text-xl  relative flex justify-center items-center font-bold transition
            ${
              filledWord === option
                ? isCorrect
                  ? " text-white"
                  : " text-white"
                : ""
            }
          `}
                    >
                      <img
                        src={
                          filledWord === option
                            ? isCorrect
                              ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/correctQuiz.png"
                              : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/wrongQuiz.png"
                            : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/chooseQuiz.png"
                        }
                        alt="chooseQuiz.png"
                        className="absolute w-full h-full z-0"
                      />

                      <span className="z-10 relative px-[0.2rem] py-[0.2rem]">
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={nextQuiz}
                  disabled={!isCorrect}
                  className={`w-[6rem] md:w-[7rem] xl:w-[9rem] mt-[-1rem] `}
                >
                  <img
                    src={
                      isCorrect
                        ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyNext.png"
                        : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/disableNextBtn.png"
                    }
                    alt="nextbtn"
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
