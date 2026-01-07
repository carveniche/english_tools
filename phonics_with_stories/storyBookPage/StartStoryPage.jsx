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
          phonics_letter_word:"c",
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
            {
                "image": "https://picsum.photos/seed/pat/1200/1200",
                "line": "Sam can pat the cat",
                "targetWord": "pat",
                "phonemes": [
                    "/p/",
                    "/æ/",
                    "/t/"
                ]
            },
            {
                "image": "https://picsum.photos/seed/fan/1200/1200",
                "line": "A fan spins by the mat",
                "targetWord": "fan",
                "phonemes": [
                    "/f/",
                    "/æ/",
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

  const [backend_data, setBackend_data] = useState(story_data[0].data[0]);
//   const [backend_data, setBackend_data] = useState(null);
  const [openingThePage, setOpeningThePage] = useState(false);
//   const [storingTime, setStoringTime] = useState(0);
//   const timerRef = useRef(null);
//   const [isWordsCompleted, setIsWordsCompleted] = useState(false);
//   const [showNextStory, setShowNextStory] = useState(false);
  // const totalPages = backend_data.story_pages.length;
//   const [currentPageIndex, setCurrentPageIndex] = useState(0);
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
  return (
    <div className='h-[calc(100vh-30vh)] w-full flex justify-center items-center bg-center bg-cover bg-no-repeat'
    style={{backgroundImage:"url(/storyBookBgNew.png)"}}>
         {"openingThePage" ? (
            <StoriesPage backend_data={backend_data}/>
         ):(
            <button onClick={startClicking} className='mx-auto w-full'>Start The Story</button>
         )}
    </div>
  )
}

export default StartStoryPage