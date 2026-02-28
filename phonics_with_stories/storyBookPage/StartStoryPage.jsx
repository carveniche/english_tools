import React, { useEffect, useRef, useState } from 'react'
import StoriesPage from './StoriesPage'
function StartStoryPage() {
      const story_data = [
    {
      status: true,
      message: "First Flip Word for this student",
      data: [
        {
          id: 1,
          title: "Sam and the Cap",
          phonics_letter:"z",
          thumbnail_image: "https://d3g74fig38xwgn.cloudfront.net/english_game/phonics-stories/st_01/sam01.png",
          daily_limit: false,
          story_pages: [
            {
              image: "https://picsum.photos/seed/cap/1200/1200",
              line: "Sam has a red cap",
              target_word: "cap",
              phonemes: ["k", "short-a", "p"],
            },
            {
                "image": "https://picsum.photos/seed/mat/1200/1200",
                "line": "The cat sits on the mat",
                "target_word": "mat",
                "phonemes": [
                    "m",
                    "short-a",
                    "t"
                ]
            },
            {
                "image": "https://picsum.photos/seed/pat/1200/1200",
                "line": "Sam can pat the cat",
                "targetWord": "pat",
                "phonemes": [
                    "/p/",
                    "short-a",
                    "/t/"
                ]
            },
            {
                "image": "https://picsum.photos/seed/fan/1200/1200",
                "line": "A fan spins by the mat",
                "targetWord": "fan",
                "phonemes": [
                    "/f/",
                    "short-a",
                    "/n/"
                ]
            }
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
          title: "Sam and the Capsss",
          phonics_letter:"e",
          thumbnail_image: "https://d3g74fig38xwgn.cloudfront.net/english_game/phonics-stories/st_01/sam01.png",
          daily_limit: false,
          story_pages: [
            {
              image: "https://picsum.photos/seed/cap/1200/1200",
              line: "Sam has a red capccc",
              target_word: "cap",
              phonemes: ["e", "a", "p"],
            },
            {
                "image": "https://picsum.photos/seed/mat/1200/1200",
                "line": "The cat sits on the mat",
                "target_word": "mat",
                "phonemes": [
                    "m",
                    "e",
                    "t"
                ]
            },
            {
                "image": "https://picsum.photos/seed/pat/1200/1200",
                "line": "Sam can pat the cat",
                "targetWord": "pat",
                "phonemes": [
                    "/p/",
                    "/e/",
                    "/t/"
                ]
            },
            {
                "image": "https://picsum.photos/seed/fan/1200/1200",
                "line": "A fan spins by the mat",
                "targetWord": "fan",
                "phonemes": [
                    "/f/",
                    "/s/",
                    "/n/"
                ]
            }
          ],
          quiz_questions: [
            {
                "question_type": "horizontal ordering",
                "words": [
                    "t",
                    "a",
                    "p"
                ],
                "answer": "tap",
                "audio": "",
                "image": "https://picsum.photos/seed/fan2/1200/1200"
            },
            {
                "question_type": "multiple choice",
                "words": [
                    "fan",
                    "aat"
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

  // const [backend_data, setBackend_data] = useState(story_data[0].data[0]);
  const [backend_data, setBackend_data] = useState(null);
  const [openingThePage, setOpeningThePage] = useState(false);
  const [showNextStoryBtn, setShowNextStoryBtn] = useState(false);
   const [lastCorrect, setLastCorrect] = useState(false);
  const [storingTime, setStoringTime] = useState(0);
  const timerRef = useRef(null);
  const storingRef = useRef(0);
//   const [isWordsCompleted, setIsWordsCompleted] = useState(false);
//   const [showNextStory, setShowNextStory] = useState(false);
  // const totalPages = backend_data.story_pages.length;
//   const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [levelId, setLevelId] = useState("");
  const level_data_id =useRef(levelId)

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
    setStoringTime(0);
  };

  useEffect(()=>{
    level_data_id.current = levelId;
  },[levelId])
  
  useEffect(() => {
    if (backend_data?.id) {
      setLevelId(backend_data.id);
    }
  }, [backend_data]);
const startClicking = () => {
  
    setOpeningThePage(!openingThePage);
};

  useEffect(() => {
    window.gettingStoriesData = (response) => {
      if (!response?.fun_game_data?.length) return;
      const payload = response.fun_game_data[0];
  
      setBackend_data({
        id: payload.fun_game_detail_id,
        title: payload.game_detail.story_title,
        thumbnail_image: payload.game_detail.thumbnail_url,
        phonics_letter:payload.game_detail.phonics_letter,
        daily_limit: false,
        story_pages: payload.game_detail.story_pages,
        quiz_questions: payload.game_detail.quiz_questions
      });
    };
    if (window.__PHONICS_STORY_DATA__) {
      const response = window.__PHONICS_STORY_DATA__;
      const payload = response?.fun_game_data?.[0];
  
      if (payload) {
        setBackend_data({
          id: payload.fun_game_detail_id,
          title: payload.game_detail.story_title,
          thumbnail_image: payload.game_detail.thumbnail_url,
          phonics_letter:payload.game_detail.phonics_letter,
          daily_limit: false,
          story_pages: payload.game_detail.story_pages,
          quiz_questions: payload.game_detail.quiz_questions
        });
        setLevelId(payload.fun_game_detail_id);
      }
    }
  
    return () => {
      delete window.gettingStoriesData;
    };
  }, []);

useEffect(() => {
  if (openingThePage) startTimer();
  else stopTimer();

  return () => stopTimer();
}, [openingThePage]);

useEffect(() => {
  if (lastCorrect) stopTimer();
}, [lastCorrect]);


  
//     const handleLoadStory = async () => {
 
// setBackend_data(story_data2[0].data[0])
  

// };

useEffect(() => {
  if (lastCorrect) {
    if (typeof window.sendingTimespentStories === "function") {
      const formData = new FormData();
      formData.append("fun_game_detail_id", level_data_id.current);
      formData.append("time_spent", storingRef.current);
      formData.append("status", "completed");
      window.sendingTimespentStories(formData);
    } else {
      console.log("not found sendingTimespentPhonics function");
    }
  }
}, [lastCorrect]);


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
      phonics_letter: payload.game_detail.phonics_letter || "",
      daily_limit: false,
      story_pages: payload.game_detail.story_pages,
      quiz_questions: payload.game_detail.quiz_questions
    });

    setOpeningThePage(false);
    setLastCorrect(false);
  } catch (err) {
    console.error("Failed to load next level", err);
  }
};

    useEffect(() => {
      
      const btn = document.getElementById("closing-btn-phonics-with-stories");

      const onClick = () => {
        if (lastCorrect || !openingThePage) return;
        if (typeof window.sendingTimespentStories === "function") {
          const formdata = new FormData();
                formdata.append("fun_game_detail_id", level_data_id.current);
                formdata.append("status", "inprogress");
                formdata.append("time_spent",storingRef.current);
                window.sendingTimespentStories(formdata);
        } else {
          console.log( "not found sendingTimespentPhonics function");
        }

        if (typeof resetTimer === "function") {
          resetTimer();
        }
      };

      if (btn) btn.addEventListener("click", onClick);

      return () => {
        if (btn) btn.removeEventListener("click", onClick);
      };
    }, [lastCorrect,openingThePage]);



    if (!backend_data) {
      return <div className="text-center font-semibold">Loading story...</div>;
    }
  return (
    <div className='h-[calc(100vh-15vh)] w-full flex justify-center items-center bg-center bg-cover bg-no-repeat'
    style={{backgroundImage:"url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/phonicsBgLeter.png)"}}>
         {openingThePage ? (
            <StoriesPage backend_data={backend_data} onFinishCorrect={() => setLastCorrect(true)} timespent={storingTime} />
         ):(
<button
  type="submit"
  // onClick={startClicking} 
   onTouchStart={(e) => {
    e.preventDefault();
    e.stopPropagation();
    startClicking();
  }}
  onClick={(e) => {
    e.stopPropagation();
    startClicking();
  }}
  className="flex justify-center gap-2 items-center mx-auto shadow-xl text-lg bg-gray-50 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
>
  Start The Story
  <svg
    class="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
    viewBox="0 0 16 19"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
      class="fill-gray-800 group-hover:fill-gray-800"
    ></path>
  </svg>
</button>

         )}

{lastCorrect && (
  <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/40">
    <button
      className="
        px-12 py-6 text-3xl font-bold
        rounded-2xl
        bg-gradient-to-br from-yellow-400 to-orange-500
        text-white
        shadow-2xl
        animate-bounce
      "
  //       onTouchStart={(e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   // setShowNextStoryBtn(false);
  //   handleLoadStory();
  // }}
  onClick={(e) => {
    e.stopPropagation();
    // setShowNextStoryBtn(false);
    handleLoadStory();
  }}
    >
      📖 Next Story
    </button>
  </div>
)}
    </div>
  )
}

export default StartStoryPage