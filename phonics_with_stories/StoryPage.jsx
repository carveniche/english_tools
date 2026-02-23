import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhonicsPage from "./PhonicsPage";
import QuizPage from "./QuizPage";

function StoryPage({ story_data,time_spent ,onStoryFinished,onPageChange }) {
  const pages = story_data.story_pages || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screen, setScreen] = useState("story");
  const currentPage = pages[currentIndex];
  const [showPlay,setShowPlay]=useState(false)
  const storingRef = useRef(time_spent);
  const levelIdRef =useRef(story_data?.id)
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  useEffect(() => {
  onPageChange(currentIndex);
}, [currentIndex]);

const stopSpeech = () => {
  speechSynthesis.cancel();
};

      useEffect(() => {
      storingRef.current = time_spent;
      levelIdRef.current = story_data?.id
    }, [time_spent,story_data]);

  // const handleNext = () => {
  //   setScreen("phonics");
  // };

  // const handleNextPage = () => {
  //   if (currentIndex < pages.length - 1) {
  //     setCurrentIndex((prev) => prev + 1);
  //     setScreen("story");
  //   }
  // };
  
    useEffect(() => {
      
      const btn = document.getElementById("closing-btn-phonics-with-stories");

      const onClick = () => {
        if (isQuizCompleted) return;
        if (typeof window.sendingTimespentStories === "function") {
          const formdata = new FormData();
                formdata.append("fun_game_detail_id", levelIdRef.current);
                formdata.append("status", "inprogress");
                formdata.append("time_spent",storingRef.current);
                window.sendingTimespentStories(formdata);
        } else {
          console.log( "not found sendingTimespentPhonics function");
        }

        if (typeof window.resetTimer === "function") {
          window.resetTimer();
        }
      };

      if (btn) btn.addEventListener("click", onClick);

      return () => {
        if (btn) btn.removeEventListener("click", onClick);
      };
    }, [isQuizCompleted]);



  const handleNextFromPhonics = () => {
     stopSpeech();
    if (currentIndex < pages.length - 1) {
      // go to next story page
      setCurrentIndex((prev) => prev + 1);
      setScreen("story");
    } else {
      // no more story pages → open quiz
      setScreen("quiz");
    }
  };



  const goToPhonics = () => {
    stopSpeech();
    setScreen("phonics");
  };

  const playTitle = () => {
    if (!currentPage?.line) return;
    stopSpeech();
   setShowPlay(true)
    // stop any previous speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentPage.line);

    utterance.rate = 0.75; // slower for kids
    utterance.pitch = 1;
    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);
  };

  const highlightTargetWord = (sentence, targetWord) => {
    if (!targetWord) return sentence;

    const parts = sentence.split(new RegExp(`(${targetWord})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === targetWord.toLowerCase() ? (
        <span key={i} className="text-red-600 font-extrabold underline">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

useEffect(() => {
  return () => {
    stopSpeech();
  };
}, []);



  if (!currentPage) return null;

  return (
    <div className="w-[95%] h-full flex justify-center items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="relative w-full h-full  rounded-2xl   flex flex-col items-center justify-center bg-no-repeat "
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyPageBgImage.png" alt="storyPageBgImage" className="absolute w-full h-full "  />
          {/* Play Title */}
          <div className="z-[10] w-[90%] h-[90%] flex justify-center flex-col lg:flex-row items-center  gap-[2rem]">
            
          {screen === "story" && (
            <>
              {/* story UI */}
              <img src={currentPage.image} className="w-[18rem] rounded-xl" />
            <div className="flex flex-col gap-[2rem]">
              <p className="text-3xl text-center">
                {highlightTargetWord(currentPage.line, currentPage.target_word)}
              </p>
            <div className="w-full flex flex-row gap-[2rem] justify-center items-center">
              <button
                onClick={playTitle}
                className="  px-4 py-2 w-[8rem] lg:w-[10rem]"
              >
                <img src={"https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/playLine.png"} alt="storyPlayIcon"  />
              </button>

              <button
                onClick={goToPhonics}
                className="  px-4 py-2 w-[8rem] lg:w-[10rem]"
              >
            <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyNext.png" alt="storyNext"  />

              </button>
              </div>
              </div>
            </>
          )}
            
          {screen === "phonics" && (
            <PhonicsPage
              pageData={currentPage}
              onNext={handleNextFromPhonics}
            />
          )}

          {screen === "quiz" && (
            <QuizPage quizData={story_data.quiz_questions} time_spent={storingRef.current} level_id={levelIdRef.current}  onQuizComplete={() => {
            setIsQuizCompleted(true); 
            onStoryFinished();
          }} />
          )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default StoryPage;
