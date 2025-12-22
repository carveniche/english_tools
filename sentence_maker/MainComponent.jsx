import React, { useEffect, useRef, useState } from "react";
import DailyLimitCard from "./DailyLimiter";

import { motion } from "framer-motion";

const PLACEHOLDER_IMAGES = [
  "https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_1280.png",
  "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
  "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_1280.png",
  "https://cdn.pixabay.com/photo/2016/04/01/10/04/avatar-1299803_1280.png",
  "https://cdn.pixabay.com/photo/2016/04/01/10/29/avatar-1299807_1280.png",
];

export default function SentenceFun({ data }) {
  // console.log(data,"data")
  const [screen, setScreen] = useState("game");
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState({ s: null, v: null, o: null });
  const [faded, setFaded] = useState([[], [], []]);
  const [showSentence, setShowSentence] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [storingBackendData, setStoringBackendData] = useState(data);
  const [levelName, setLevelName] = useState("");
  const [answer, setanswer] = useState("");
  const [image, setImage] = useState("");
  const [level_id, setLevel_id] = useState(0);
  const [storingTime, setStoringTime] = useState(0);
  const timerRef = useRef(null);
  const [isWordsCompleted, setIsWordsCompleted] = useState(false);

  // console.log(storingTime,"storingTime")
  const startTimer = () => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setStoringTime((prev) => prev + 1);
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
    setStoringTime(0);
  };

  useEffect(() => {
    if (
      screen === "game" &&
      isCompleted === false &&
      isWordsCompleted === false
    ) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [screen, isCompleted, isWordsCompleted]);

  const [item, setItem] = useState({});

  useEffect(() => {
    // const items = storingBackendData?.[0]?.sentence_full_data?.[0] || {};
    const items =
      storingBackendData?.sentence_full_data?.[0]?.sentence_data?.[0];

    setItem(items);
    //  console.log(data,"datadata")

    const isComplete =
      storingBackendData?.sentence_full_data?.[0]?.is_completed || false;
    const isWords_Completed =
      storingBackendData?.sentence_full_data?.[0]?.words_completed || false;
    const level_id =
      storingBackendData?.sentence_full_data?.[0]?.sentence_position_id || 0;
    const image_url =
      storingBackendData?.sentence_full_data?.[0]?.sentence_image_url || null;
    const full_answer =
      storingBackendData?.sentence_full_data?.[0]?.sentence_answer || null;
    setLevel_id(level_id);
    setImage(image_url);
    setanswer(full_answer);
    setIsCompleted(isComplete);
    setIsWordsCompleted(isWords_Completed);
  }, [storingBackendData, idx]);

  const speakSlowly = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // stop any previous speech

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.6; // 🔴 slow (normal = 1)
    utterance.pitch = 1; // natural
    utterance.volume = 1; // full volume
    utterance.lang = "en-US";

    // Optional: choose a clearer voice (if available)
    const voices = window.speechSynthesis.getVoices();
    const clearVoice = voices.find(
      (v) => v.lang === "en-US" && v.name.toLowerCase().includes("female")
    );
    if (clearVoice) utterance.voice = clearVoice;

    window.speechSynthesis.speak(utterance);
  };

  const progress = idx + (step === 4 ? 1 : 0);

  useEffect(() => {
    setStep(1);
    setPicked({ s: null, v: null, o: null });
    setFaded([[], [], []]);
    setShowSentence(false);
    setImgError(false);
  }, [idx]);

  const showPositiveFeedback = () => {
    const messages = [
      "Great job! 🎉",
      "Excellent! ⭐",
      "Perfect! 👏",
      "Awesome! 🌟",
      "Well done! 🏆",
    ];
    setFeedbackMessage(messages[Math.floor(Math.random() * messages.length)]);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  const choose = (which, opt) => {
    const clickSound = new Audio(
      "https://d3g74fig38xwgn.cloudfront.net/teaching-tool/clickbtN.wav"
    );
    clickSound.play();
    let correct = false;

    if (which === 1) {
      if (opt === item.subject_correct) {
        setPicked((p) => ({ ...p, s: opt }));
        setStep(2);
        correct = true;
      } else {
        setFaded((f) => [[...f[0], opt], f[1], f[2]]);
      }
    } else if (which === 2) {
      if (opt === item.verb_correct) {
        setPicked((p) => ({ ...p, v: opt }));
        setStep(3);
        correct = true;
      } else {
        setFaded((f) => [f[0], [...f[1], opt], f[2]]);
      }
    } else if (which === 3) {
      if (opt === item.object_correct) {
        setPicked((p) => ({ ...p, o: opt }));
        setStep(4);
        setShowSentence(true);
        // speakSlowly({{picked.s} {picked.v} {picked.o}})
        // console.log(`${picked.s} ${picked.v} ${picked.o}`)
        correct = true;
        showPositiveFeedback();
        setTimeout(() => {
          // stopTimer()
          const totalItems =
            storingBackendData?.sentence_full_data?.length || 0;

          if (idx + 1 < totalItems) {
            setIdx((i) => i + 1);
          } else {
            setScreen("complete");
          }
        }, 3000);
      } else {
        setFaded((f) => [f[0], f[1], [...f[2], opt]]);
      }
    }
  };

  const storingRef = useRef(storingTime);
  const dataSetIdRef = useRef(level_id);
  const screenRef = useRef(screen);
  const isCompRef = useRef(isCompleted);
  const isWordCompRef = useRef(isWordsCompleted);
// console.log(isCompRef,"isCompRef",isWordCompRef,"isWordCompRef")
// console.log(isCompleted,"isCompleted")
  useEffect(() => {
    storingRef.current = storingTime;
    dataSetIdRef.current = level_id;
    screenRef.current = screen;
    isCompRef.current = isCompleted;
    isWordCompRef.current = isWordsCompleted;
  }, [storingTime, level_id, screen, isCompleted, isWordsCompleted]);

  useEffect(() => {
    if (screenRef.current === "complete") {
      if (typeof window.sendingTimespentSentenceMaker === "function") {
        const formData = new FormData();
        formData.append("sentence_position_id", dataSetIdRef.current);
        formData.append("time_spent", storingRef.current);
        formData.append("status", "completed");

        window.sendingTimespentSentenceMaker(formData);
      } else {
        console.log("not found sendingTimespentPhonics function");
      }
    }
  }, [screen]);

  useEffect(() => {
    const btn = document.getElementById("closing-btn-sentence-Maker");

    const onClick = () => {
      // if(screenRef.current != 'complete' && !isCompRef && !isWordCompRef){
      if (
        screenRef.current !== "complete" &&
        !isCompRef.current &&
        !isWordCompRef.current
      ) {
        if (typeof window.sendingTimespentSentenceMaker === "function") {
          const formData = new FormData();
          formData.append("sentence_position_id", dataSetIdRef.current);
          formData.append("time_spent", storingRef.current);
          formData.append("status", "inprogress");
          window.sendingTimespentSentenceMaker(formData);
        } else {
          console.log( "not found sendingTimespentPhonics function");
        }
      }
    };

    if (btn) btn.addEventListener("click", onClick);

    return () => {
      if (btn) btn.removeEventListener("click", onClick);
    };
  }, []);

  const handle_next_level_data = async () => {
    resetTimer();
    const formData = new FormData();
    formData.append("sentence_position_id", dataSetIdRef.current);
    formData.append("time_spent", storingRef.current);
    formData.append("status", "completed");
    try {
      console.log("next");
      const data = await window.fetch_sentence_maker_game(formData);
      // console.log(formData,"formData")
      //       const  data = [
      //   {
      //       is_completed: false,
      //     level_id:23,
      //     level:'easy',
      //       items:[
      //             {
      //   id: 1,
      //   image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      //   subjectOptions: [ "She", "Him"],
      //   subjectCorrect: "She",
      //   verbOptions: ["eats", "play", "writes"],
      //   verbCorrect: "eats",
      //   objectOptions: ["an apple", "a ball", "a car"],
      //   objectCorrect: "an apple",
      //   answer: "She eats an apple.",
      // },]}]
      // console.log(formData,"formData")

      setStoringBackendData(data);
      // setStoringBackendData(data);
      setIsCompleted(false);
      setScreen("game");
      setIdx(0);
      setStep(1);
      setPicked({ s: null, v: null, o: null });
      setFaded([[], [], []]);
      setShowSentence(false);
      startTimer();
    } catch (err) {
      console.error("Failed to load next level", err);
    }
  };

  useEffect(() => {
    if (showSentence) {
      const sentence = [picked.s, picked.v, picked.o].filter(Boolean).join(" ");

      speakSlowly(sentence);
    }
  }, [showSentence, picked.s, picked.v, picked.o]);

  // if (!item.subject_options) {
  //   return <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">No items found.</div>;
  // }

  if (screen === "complete") {
    // if ("complete")

    return (
      <div className="min-h-screen  p-4 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto bg-[#85e785] backdrop-blur-sm rounded-3xl  p-8 md:p-12 border border-gray-200">
          <p className="text-xl text-gray-700 mb-8">Congratulations !</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handle_next_level_data}
              className="px-8 py-4 rounded-2xl bg-[#ff3535d9]  active:scale-95 transition-all duration-300 text-white font-bold text-lg "
            >
              Next sentence →
            </button>
          </div>
        </div>
      </div>
    );
  }
      if(isCompleted || isWordsCompleted) {
        return <DailyLimitCard
         isCompleted={isCompleted}
         isWordCompleted={isWordsCompleted}
      />
    
      }


  const stepOptions =
    step === 1
      ? item?.subject_options
      : step === 2
      ? item?.verb_options
      : item?.object_options;
  const currentFaded = step === 1 ? faded[0] : step === 2 ? faded[1] : faded[2];

  if (!stepOptions) {
    return (
      <>
        <p>Loading</p>
      </>
    );
  }

  const stepLabels = {
    1: "Choose Subject",
    2: "Choose Verb",
    3: "Choose Object",
    4: " Complete!",
  };
  return (
    <>
    <div className="min-h-screen  p-4 md:p-6 ">
      <div className="max-w-6xl mx-auto">
        {/* Main Game Area */}
        <div className=" rounded-3xl w-full  overflow-hidden flex justify-center items-center flex-col gap-[1rem] ">
          {/* Step Indicator */}
          <div className=" p-[0.5rem] w-full  rounded-3xl bg-[#15ccbe]">
            <div className="flex justify-between items-center">
              <div className="w-full flex flex-col justify-center  items-center gap-[1rem] relative">
                {/* <h3 className="text-xl font-bold text-gray-700  text-center">
                    {stepLabels[step]}
                  </h3> */}

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 w-full shadow-inner">
                  <div className="flex flex-wrap justify-center gap-3 items-center ">
                    <span
                      className={`text-2xl md:text-3xl font-bold px-4 py-2 rounded-xl ${
                        picked.s
                          ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {picked.s || "______"}
                    </span>
                    <span className="text-gray-400 text-2xl">+</span>
                    <span
                      className={`text-2xl md:text-3xl font-bold px-4 py-2 rounded-xl ${
                        picked.v
                          ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {picked.v || "______"}
                    </span>
                    <span className="text-gray-400 text-2xl">+</span>
                    <span
                      className={`text-2xl md:text-3xl font-bold px-4 py-2 rounded-xl ${
                        picked.o
                          ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {picked.o || "______"}
                    </span>
                  </div>

                  {showSentence && (
                    // {speakSlowly(`${picked.s} ${picked.v} ${picked.o}`)}
                    <div className="absolute h-full w-full top-0 left-0 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl border-2 border-emerald-200 ">
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="text-xl font-bold text-gray-800">
                          "{picked.s} {picked.v} {picked.o}"
                        </div>
                        <div className="text-3xl text-emerald-500">✓</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full p-4 md:p-8 bg-[rgb(239,205,255)] rounded-3xl">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Image & Sentence */}
              <div className="lg:w-1/2 flex flex-col items-center">
                {/* Image Container */}
                <div className="relative w-full max-w-md">
                  <div className="aspect-square rounded-2xl overflow-hidden  bg-white h-[20rem] w-full p-[1rem]">
                    {!imgError && image ? (
                      <img
                        src={image}
                        alt="Visual clue"
                        className="w-full h-full object-contain transition-transform duration-500 hover:scale-105 rounded-lg"
                        onError={() => {
                          setImgError(true);
                        }}
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <div className="text-center">
                          <div className="text-8xl mb-4">📚</div>
                          {/* <p className="text-gray-600 font-semibold">Sentence {item.id}</p> */}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xl shadow-lg">
                    ✨
                  </div>
                </div>

                {/* Current Sentence Preview */}
              </div>

              {/* Right Column - Options */}
              <div className="lg:w-1/2">
                <div className="h-full flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Select the{" "}
                      {step === 1 ? "subject" : step === 2 ? "verb" : "object"}
                    </h3>
                    <p className="text-gray-600">
                      Click on the correct option to build a proper sentence
                    </p>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
                    {stepOptions.map((opt, index) => (
                      <button
                        key={opt}
                        onClick={() => choose(step, opt)}
                        disabled={currentFaded.includes(opt)}
                        className={`
                          relative group p-6 rounded-2xl border-3 transition-all duration-300
                          transform hover:-translate-y-1 active:translate-y-0
                          ${
                            currentFaded.includes(opt)
                              ? "opacity-40 cursor-not-allowed border-gray-300 bg-gray-100"
                              : `border-transparent hover:border-purple-300 
                               bg-gradient-to-br from-white to-gray-50
                               hover:shadow-xl active:scale-95
                               ${
                                 step === 1
                                   ? "hover:from-emerald-50 hover:to-emerald-100"
                                   : step === 2
                                   ? "hover:from-blue-50 hover:to-blue-100"
                                   : "hover:from-purple-50 hover:to-purple-100"
                               }`
                          }
                          shadow-lg
                        `}
                      >
                        {/* Option Number */}
                        <div
                          className={`
                          absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center
                          font-bold text-white text-sm
                          ${
                            currentFaded.includes(opt)
                              ? "bg-gray-400"
                              : step === 1
                              ? "bg-emerald-500"
                              : step === 2
                              ? "bg-blue-500"
                              : "bg-purple-500"
                          }
                        `}
                        >
                          {index + 1}
                        </div>

                        {/* Option Text */}
                        <span
                          className={`
                          text-xl font-bold block text-center
                          ${
                            currentFaded.includes(opt)
                              ? "text-gray-500"
                              : step === 1
                              ? "text-emerald-700"
                              : step === 2
                              ? "text-blue-700"
                              : "text-purple-700"
                          }
                        `}
                        >
                          {opt}
                        </span>

                        {/* Hover Effect */}
                        {!currentFaded.includes(opt) && (
                          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-current opacity-20"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center space-x-4 md:space-x-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-lg md:text-xl
                    ${
                      step >= s
                        ? " text-purple-600  bg-green-200"
                        : "bg-white/20 text-white"
                    }
                    ${step === s ? "ring-4 ring-white/50" : ""}
                    transition-all duration-300
                  `}
                >
                  {s}
                </div>
                <span
                  className={`text-sm mt-2 font-medium ${
                    step === s ? "text-purple-600" : "text-white/70"
                  }`}
                >
                  {/* {stepLabels[s].split(' ')[0]} */}
                  {stepLabels[s].split(" ")[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
