import React, { useEffect, useRef, useState } from "react";
import StoryPage from "./StoryPage";
import DailyLimitCard from "./DailyLimit";

function MainPhoicsPage() {
  const story_data = [
    {
      status: true,
      message: "First Flip Word for this student",
      data: [
        {
          id: 1,
          title: "Sam and the Cap",
          thumbnail_image: "https://d3g74fig38xwgn.cloudfront.net/english_game/phonics-stories/st_01/sam01.png",
          daily_limit: false,
          story_pages: [
            {
              image: "https://picsum.photos/seed/cap/1200/1200",
              line: "Sam has a red cap",
              target_word: "cap",
              phonemes: ["k", "æ", "p", "a", "w", "z"],
            },
            {
                "image": "https://picsum.photos/seed/mat/1200/1200",
                "line": "The cat sits on the mat",
                "target_word": "mat",
                "phonemes": [
                    "m",
                    "æ",
                    "t"
                ]
            },
            // {
            //     "image": "https://picsum.photos/seed/pat/1200/1200",
            //     "line": "Sam can pat the cat",
            //     "targetWord": "pat",
            //     "phonemes": [
            //         "/p/",
            //         "/æ/",
            //         "/t/"
            //     ]
            // },
            // {
            //     "image": "https://picsum.photos/seed/fan/1200/1200",
            //     "line": "A fan spins by the mat",
            //     "targetWord": "fan",
            //     "phonemes": [
            //         "/f/",
            //         "/æ/",
            //         "/n/"
            //     ]
            // }
          ],
          quiz_questions: [
            {
                "question_type": "horizontal ordering",
                "words": [
                    "c",
                    "a",
                    "p"
                ],
                "answer": "cap",
                "audio": "",
                "image": "https://picsum.photos/seed/fan2/1200/1200"
            },
            {
                "question_type": "multiple choice",
                "words": [
                    "fan",
                    "pat"
                ],
                "answer": "fan",
                "audio": "",
                "image": "https://picsum.photos/seed/fan2/1200/1200"
            },
            {
              question_type: "fill in the blanks",
              question_words: ["m", "a", ""],
              option_words: ["p", "d", "t"],
              answer: "t",
              image: "https://picsum.photos/seed/fan2/1200/1200",
            },
          ],
        },
      ],
    },
  ];

  const story_data2 = [
    {
      status: true,
      message: "First Flip Word for this student",
      data: [
        {
          id: 1,
          title: "Sam and the Cap22",
          thumbnail_image: "https://picsum.photos/seed/cover/1200/900",
          daily_limit: false,
          story_pages: [
            {
              image: "https://picsum.photos/seed/cap/1200/1200",
              line: "Sam has a red cap22",
              targetWord: "cap",
              phonemes: ["k", "æ", "p"],
            },
            {
              image: "https://picsum.photos/seed/mat/1200/1200",
              line: "The cat sits on the mat",
              targetWord: "mat",
              phonemes: ["m", "æ", "t"],
            },
            {
              image: "https://picsum.photos/seed/pat/1200/1200",
              line: "Sam can pat the cat",
              targetWord: "pat",
              phonemes: ["p", "æ", "t"],
            },
            // {
            //     "image": "https://picsum.photos/seed/fan/1200/1200",
            //     "line": "A fan spins by the mat",
            //     "targetWord": "fan",
            //     "phonemes": [
            //         "/f/",
            //         "/æ/",
            //         "/n/"
            //     ]
            // }
          ],
          quizQuestion: [
            // {
            //     "question_type": "horizontal ordering",
            //     "words": [
            //         "c",
            //         "a",
            //         "p"
            //     ],
            //     "answer": "cap",
            //     "audio": "",
            //     "image": "https://picsum.photos/seed/fan2/1200/1200"
            // },
            {
              question_type: "multiple choice",
              words: ["fan", "pat"],
              answer: "fan",
              audio: "",
              image: "https://picsum.photos/seed/fan2/1200/1200",
            },
            {
              question_type: "fill in the blanks",
              question_words: ["m", "a", ""],
              option_words: ["p", "d", "t"],
              answer: "t",
              image: "https://picsum.photos/seed/fan2/1200/1200",
            },
          ],
        },
      ],
    },
  ];
  // const [backend_data, setBackend_data] = useState(story_data[0].data[0]);
  const [backend_data, setBackend_data] = useState(null);
  
  const [openingThePage, setOpeningThePage] = useState(false);

  const [storingTime, setStoringTime] = useState(0);
  const timerRef = useRef(null);
  const [isWordsCompleted, setIsWordsCompleted] = useState(false);
  const [showNextStory, setShowNextStory] = useState(false);
  // const totalPages = backend_data.story_pages.length;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [levelId, setLevelId] = useState("");
  const level_data_id =useRef(levelId)
  useEffect(()=>{
    level_data_id.current = levelId;
  },[levelId])
  
  useEffect(() => {
    if (backend_data?.fun_game_detail_id) {
      setLevelId(backend_data.fun_game_detail_id);
    }
  }, [backend_data]);

  // const progressPercent =
  //   totalPages > 0 ? ((currentPageIndex + 1) / totalPages) * 100 : 0;

  const startClicking = () => {
    setOpeningThePage(!openingThePage);
  };

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
      openingThePage
      // isCompleted === false &&
      // isWordsCompleted === false
    ) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [openingThePage]);

  // const handleLoadStory = async () => {
  //   // console.log("hell next")
  //   //   setBackend_data(story_data[0].data[0]);

  //   resetTimer();
  //   const formData = new FormData();
  //   formData.append("fun_game_detail_id", level_data_id.current);
  //   formData.append("status", "completed");
  //   try {
  //     console.log("next");
  //     const payload = await window.phonics_with_stories_game(formData);
  //     setBackend_data({
  //     id: payload.fun_game_detail_id,
  //     title: payload.game_detail.story_title,
  //     thumbnail_image: payload.game_detail.thumbnail_url,
  //     daily_limit: false,
  //     story_pages: payload.game_detail.story_pages,
  //     quiz_questions: payload.game_detail.quiz_questions
  //   });
  //     setOpeningThePage(false);
  //     setShowNextStory(false);
  //     setStoringTime(0);
  //   } catch (err) {
  //     console.error("Failed to load next level", err);
  //   }
  // };
const handleLoadStory = async () => {
  resetTimer();

  const formData = new FormData();
  formData.append("fun_game_detail_id", level_data_id.current);
  formData.append("status", "completed");

  try {
    const response = await window.phonics_with_stories_game(formData);

    const payload = response?.fun_game_data?.[0];
    if (!payload || !payload.game_detail) {
      console.error("Invalid payload structure", response);
      return;
    }

    setBackend_data({
      id: payload.fun_game_detail_id,
      title: payload.game_detail.story_title,
      thumbnail_image: payload.game_detail.thumbnail_url,
      daily_limit: false,
      story_pages: payload.game_detail.story_pages,
      quiz_questions: payload.game_detail.quiz_questions
    });

    setOpeningThePage(false);
    setShowNextStory(false);
    setStoringTime(0);

  } catch (err) {
    console.error("Failed to load next level", err);
  }
};

  // function gettingStoriesData(response) {
  //   // console.log(response, "response");
  //   // console.log(response.data?.[0]?.title, "datatitle");

  //   if (!response?.data?.length) return;

  //   setBackend_data(response.data[0]);
  // }

  // window.gettingStoriesData = gettingStoriesData;

//   useEffect(() => {
//   window.gettingStoriesData = (response) => {
//     if (!response?.data?.length) return;
//     setBackend_data(response.data[0]);
//   };

//   // If backend already sent data before React loaded
//   if (window.__PHONICS_STORY_DATA__) {
//     const response = window.__PHONICS_STORY_DATA__;
//     setBackend_data(response.data[0]);
//   }

//   return () => {
//     delete window.gettingStoriesData;
//   };
// }, []);
useEffect(() => {
  window.gettingStoriesData = (response) => {
    if (!response?.fun_game_data?.length) return;

    const payload = response.fun_game_data[0];

    setBackend_data({
      id: payload.fun_game_detail_id,
      title: payload.game_detail.story_title,
      thumbnail_image: payload.game_detail.thumbnail_url,
      daily_limit: false,
      story_pages: payload.game_detail.story_pages,
      quiz_questions: payload.game_detail.quiz_questions
    });
  };

  // If backend already sent data before React loaded
  if (window.__PHONICS_STORY_DATA__) {
    const response = window.__PHONICS_STORY_DATA__;
    const payload = response?.fun_game_data?.[0];

    if (payload) {
      setBackend_data({
        id: payload.fun_game_detail_id,
        title: payload.game_detail.story_title,
        thumbnail_image: payload.game_detail.thumbnail_url,
        daily_limit: false,
        story_pages: payload.game_detail.story_pages,
        quiz_questions: payload.game_detail.quiz_questions
      });
    }
  }

  return () => {
    delete window.gettingStoriesData;
  };
}, []);


  if (!backend_data) {
    return <div className="text-center font-semibold">Loading story...</div>;
  }

  const totalPages = backend_data.story_pages.length;
  // console.log(totalPages, "total pages");

  const progressPercent =
    totalPages > 0 ? ((currentPageIndex + 1) / totalPages) * 100 : 0;
  return (
    <>
      {backend_data.daily_limit ? (
        <>
          <DailyLimitCard />
        </>
      ) : (
        <>
          <div className="relative  w-full h-[100vh] lg:h-[calc(100vh-30vh)] bg-[#226C96] flex justify-center items-center p-[1rem] rounded-xl">
            {openingThePage ? (
              <>
                <div className="w-[85%] items-center justify-between z-[100] mx-auto absolute top-[0.2rem] flex flex-row gap-[0.5rem]">
                  {/* <div className="w-[3rem] flex justify-end text-white text-sm mb-1">
                    <span>
                       {currentPageIndex + 1} / {totalPages}
                    </span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div> */}

                  <div className="w-full h-2 bg-[#E4F5FD] border border-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F47721] transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <StoryPage
                  story_data={backend_data}
                  time_spent={storingTime}
                  onPageChange={(index) => setCurrentPageIndex(index)}
                  onStoryFinished={() => {
                    setShowNextStory(true);
                    stopTimer();
                  }}
                />
              </>
            ) : (
              <div className="relative w-full h-full flex justify-center items-center">
                {/* Animated background with floating bubbles */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <div className="absolute w-full h-full bg-gradient-to-br from-[#4ECDC4] via-[#44A08D] to-[#093637]"></div>

                  {/* Floating bubbles */}
                  <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-yellow-300/30 rounded-full animate-float"></div>
                  <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-pink-300/30 rounded-full animate-float animation-delay-1000"></div>
                  <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-blue-300/20 rounded-full animate-float animation-delay-500"></div>
                  <div className="absolute top-3/4 right-1/3 w-14 h-14 bg-purple-300/25 rounded-full animate-float animation-delay-1500"></div>

                  {/* Cloud decorations */}
                  <div className="absolute -top-4 left-8 w-32 h-12 bg-white/20 rounded-full blur-sm"></div>
                  <div className="absolute top-4 right-12 w-24 h-10 bg-white/20 rounded-full blur-sm"></div>
                </div>

                {/* Main content card */}
                <div className="relative z-10 w-[95%] max-w-4xl h-[85%] bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-yellow-400 p-8 flex flex-col lg:flex-row items-center gap-8">
                  {/* Left side - Game Image with playful frame */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="relative">
                      {/* Image with playful shadow and border */}
                      <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-2xl shadow-lg border-4 border-white overflow-hidden">
                        {/* Shiny overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>

                        <img
                          src={backend_data.thumbnail_image}
                          alt="Game Preview"
                          className="w-[15rem] h-auto rounded-xl shadow-inner"
                        />

                        {/* Playful corner accents */}
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-400 rounded-lg rotate-45"></div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-lg rotate-45"></div>
                        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-lg rotate-45"></div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-400 rounded-lg rotate-45"></div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Game Info & Start Button */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    {/* Game Title with playful design */}
                    <div className="relative text-center">
                      <div className="absolute -inset-4  blur-xl opacity-50"></div>
                      <h1 className="relative text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
                        {backend_data.title}
                      </h1>
                    </div>

                    {/* Animated Start Button */}
                    <div
                      className="relative group cursor-pointer"
                      onClick={startClicking}
                    >
                      {/* Button shadow animation */}
                      <div className="absolute -inset-4  rounded-full blur opacity-30 group-hover:opacity-50 transition-all duration-300 animate-pulse"></div>

                      {/* Main button */}
                      <button className="relative bg-gradient-to-r from-green-400 to-emerald-500 text-white text-2xl font-bold py-4 px-12 rounded-full  transform transition-all duration-300 hover:scale-110  active:scale-95">
                        <div className="flex items-center gap-3">
                          <span>Start Reading</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {showNextStory && (
            <div className="flex justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ">
              <button
                onClick={handleLoadStory}
                className="w-[7rem] md:w-[12rem]"
              >
              <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/nextStoryBtn.png" alt="nextstory" className="w-full h-full" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default MainPhoicsPage;
