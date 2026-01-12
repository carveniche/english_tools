import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import QuizBook from "./QuizListingPage";
import PhonicsletterSound from "../letter_sound.json";

function MainStoryBook({ phonicsData,onCorrect,onFinishQuiz,timespent }) {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const speechRef = useRef(window.speechSynthesis);
  const bookRef = useRef(null);
  const [showQuiz, setShowQuiz] = useState(false);
const [showNextStory, setShowNextStory] = useState(false);


  useEffect(() => {
    if (phonicsData) setData(phonicsData);
  }, [phonicsData]);

  if (!data) return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-48 h-12 bg-gray-300 rounded-lg mb-4"></div>
        <div className="text-gray-600">Loading book...</div>
      </div>
    </div>
  );

  const speak = (text) => {
    if (!text) return;
    speechRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.85;
    speechRef.current.speak(utter);
  };

  // Play phoneme sound from JSON
const playPhonemeSound = (phoneme) => {
  if (!phoneme) return;

  // Clean phoneme like "/p/" -> "p"
  const clean = phoneme.replace(/\//g, "").toLowerCase();

  const soundObj = PhonicsletterSound.All_letters.find(
    (l) => l.lab.toLowerCase() === clean
  );

  if (soundObj?.audio) {
    const audio = new Audio(soundObj.audio);
    audio.play();
  } else {
    console.warn("No audio found for phoneme:", phoneme);
  }
};


  const highlightWord = (line, word) => {
    if (!word || !line) return line;
    const parts = line.split(new RegExp(`(${word})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === word.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 px-1 rounded font-bold">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // Create all pages as separate children without fragments
  const allPages = [];

  // Front Cover
  allPages.push(
    <div key="cover" className=" relative">
      {/* <div className="absolute left-0 top-0 w-6 h-full bg-gradient-to-r from-blue-800/80 to-transparent"></div> */}
      <div className="h-full flex flex-col items-center justify-center p-8 text-white bg-center bg-contain bg-no-repeat"
      style={{backgroundImage:"url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyPageBg.avif)"}}>
        <div className="mb-8">
          <div className="w-[20rem] h-[20rem] mx-auto bg-white/10 backdrop-blur-sm rounded-full p-6">
            <img 
              src={data.thumbnail_image} 
              alt="Cover" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="text-center">
          {/* <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-4">
            Phonics Learning
          </div> */}
          <h2 className="text-4xl font-bold mb-2 leading-tight text-[#a76121]">{data.title}</h2>
        </div>
      </div>
    </div>
  );

  // Story Pages
  data.story_pages.forEach((story, index) => {
    const word = story?.target_word || story?.targetWord || "";
    const letters = word.split("");
    const phonemes = story?.phonemes || [];

    // Left Page - Story
    allPages.push(
      <div key={`story-${index}-left`} className="bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4yIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')]"></div> */}
        <div className="h-full p-8 flex flex-col bg-center bg-contain bg-no-repeat"
         style={{backgroundImage:"url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyPageBg.avif)"}}>
          {/* <div className="absolute top-0 right-0 w-16 h-16">
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gray-300"></div>
          </div> */}
          <div className="absolute bottom-4 left-6 text-gray-400 text-sm">
            {index * 2 + 1}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="mb-8 max-w-xs">
              <div className="relative">
                <img 
                  src={story.image} 
                  alt="Story illustration"
                  className="w-full h-56 object-cover rounded-xl shadow-lg border-4 border-white"
                />
                {/* <div className="  absolute -top-3 -right-3 
  w-12 h-12 
  bg-gradient-to-br from-yellow-700 to-yellow-500
  rounded-full 
  flex items-center justify-center 
  text-yellow-100 font-bold 
  shadow-[3px_3px_0_#8b5e3c]
  border-2 border-yellow-800
  text-lg">
                  {index + 1}
                </div> */}
              </div>
            </div>
            <div className="mb-6">
              <div className="text-2xl text-gray-700 leading-relaxed text-center px-4">
                {highlightWord(story.line, word)}
              </div>
            </div>
            <button
               onClick={() => speak(story.line)}
  onPointerDown={(e) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
  }}
              className="flex items-center justify-center transform hover:-translate-y-0.5 transition-all duration-200
               rounded-[1.5rem] 
  bg-gradient-to-br from-yellow-100 to-yellow-300
  shadow-[5px_5px_0_#b87b2a]
  text-lg  text-yellow-900 px-[0.8rem] py-[0.2rem] mt-2
   "
            >
              <span className="font-semibold 
 
">Listen to Story</span>
            </button>
          </div>
        </div>
      </div>
    );

    // Right Page - Word Study
    allPages.push(
      <div key={`story-${index}-right`} className=" relative overflow-hidden "
>
        <div className=" "
              ></div>
        <div className="h-full p-8 flex flex-col bg-center bg-contain bg-no-repeat"
        style={{backgroundImage:"url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyPageBg.avif)"}}>
          {/* <div className="absolute top-0 left-0 w-16 h-16">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gray-300"></div>
          </div> */}
          <div className="absolute bottom-4 right-6 text-gray-400 text-sm">
            {index * 2 + 2}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="mb-8 text-center">
              {/* <div className="inline-block px-4 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
                Focus Letter Sound
              </div> */}
              <h3 className="text-5xl font-bold  bg-clip-text  text-[#a76121]">
                {word.toLowerCase()}
              </h3>
               <button
    onClick={() => speak(word.toLowerCase())}
    onPointerDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
    className="w-[3rem] absolute top-[4rem] left-[3rem]"
  >
    <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/listenspeaker.png" alt="speaker" />
  </button>
            </div>
            {/* <button
              onClick={() => speak(word)}
              className="mb-8 flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-2xl">🔊</span>
              <span className="text-lg font-semibold">Say the Word</span>
            </button> */}
            <div className="w-full">
              {/* <div className="text-center mb-6">
                <h4 className="text-gray-700 font-semibold mb-2">Break it Down</h4>
                <div className="w-32 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 mx-auto"></div>
              </div> */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {letters.map((letter, i) => (
                  <button
                    key={i}
                    onClick={() => playPhonemeSound(phonemes[i] || letter)}
  onPointerDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
                    className="relative group w-14 h-14   bg-gradient-to-br from-yellow-700 to-yellow-500 text-white text-2xl font-bold rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span>{letter.toLowerCase()}</span>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {i + 1}
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-center text-gray-600 text-sm">
                Click each letter to hear its sound
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  // Back Cover
  allPages.push(
    <div key="back-cover" className=" relative bg-gradient-to-br from-yellow-100 to-yellow-300 bg-center bg-contain bg-no-repeat flex justify-center items-center w-full"
    style={{backgroundImage:"url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyPageBg.avif)"}}>
    <button
    // onClick={() => setShowQuiz(true)}
    onClick={() => {
  setTimeout(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, 200);
}}

     className="
  border-4 border-yellow-800 
  rounded-[1.5rem] 
  bg-gradient-to-br from-yellow-100 to-yellow-300
  shadow-[5px_5px_0_#b87b2a]
  text-2xl font-serif text-yellow-900 
  hover:scale-105 hover:shadow-[8px_8px_0_#b87b2a] 
  transition-transform duration-200
  absolute top-1/2 left-1/2
  -translate-x-1/2 -translate-y-1/2
  p-[1rem]
">
  Start The Quiz
</button>


    </div>
  );
  // ===== QUIZ PAGES =====
allPages.push(
  <div key="quiz-page-1" className="h-full w-full flex items-center justify-center bg-center bg-contain bg-no-repeat"
    style={{backgroundImage:"url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyPageBg.avif)"}}
  >
    <QuizBook quizData={data.quiz_questions} onFinishQuiz={() => {
    setShowNextStory(true);      // local (optional)
    onFinishQuiz?.();           // 🔥 TELL PARENT (Book.jsx)
  }}/>
  </div>
);


  const totalPages = allPages.length;

  return (
    <div className="w-full h-full ">
      {!showQuiz ? (
        <>
      {/* Main Book Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 h-full">
        {/* Book Navigation */}
        <div className="hidden lg:flex flex-col space-y-4">
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
            className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-105 transition-all"
          >
            ←
          </button>
          <div className="text-center text-sm text-gray-600">Flip left</div>
        </div>

        {/* The Book */}
        <div className="relative">
          {/* Bookshelf Shadow */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-5/6 h-4 bg-black/20 blur-lg rounded-full"></div>
          
          {/* Book */}
          <HTMLFlipBook
            ref={bookRef}
            width={450}
            height={600}
            maxShadowOpacity={0.2}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={(e) => setCurrentPage(e.data)}
            className="book-shadow flex justify-center items-center"
            style={{
              // boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff'
            }}
          >
            {allPages}
          </HTMLFlipBook>
        </div>

        {/* Book Navigation */}
        <div className="hidden lg:flex flex-col space-y-4">
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipNext()}
            className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-105 transition-all"
          >
            →
          </button>
          <div className="text-center text-sm text-gray-600">Flip right</div>
        </div>
      </div>
</>): (
      // === Quiz View ===
      <div className="w-full h-full animate-fade-in">
        {/* <QuizBook quizData={data.quiz_questions} /> */}
      </div>
    )}
      {/* Mobile Controls */}
      <div className="lg:hidden mt-8">
        <div className="flex items-center justify-center space-x-6">
          {/* <button
            onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
            className="px-6 py-3 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow flex items-center space-x-2"
          >
            <span>←</span>
            <span>Previous</span>
          </button> */}
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipNext()}
            className="px-6 py-3 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow flex items-center space-x-2"
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Story Progress</h3>
            <span className="text-sm text-gray-600">
              {Math.round(((currentPage) / totalPages) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPage) / totalPages) * 100}%` }}
            ></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.story_pages.map((story, i) => {
              const pageNumber = i * 2 + 1; // Calculate actual page number (accounting for cover)
              return (
                <button
                  key={i}
                  onClick={() => {
                    // Navigate to the story page
                    // Note: react-pageflip doesn't have direct page navigation
                    // This would require a custom implementation
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    currentPage >= pageNumber 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Story {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center text-gray-600">
        <div className="inline-flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <span className="text-lg">📖</span>
          <span>Drag the corners to flip pages</span>
          <span className="text-lg">🎧</span>
          <span>Click buttons to hear sounds</span>
        </div>
      </div>
    </div>
  );
}

export default MainStoryBook;


// {
//     "id": 1,
//     "title": "Sam and the Cap",
//     "phonics_letter_word": "c",
//     "thumbnail_image": "https://d3g74fig38xwgn.cloudfront.net/english_game/phonics-stories/st_01/sam01.png",
//     "daily_limit": false,
//     "story_pages": [
//         {
//             "image": "https://picsum.photos/seed/cap/1200/1200",
//             "line": "Sam has a red cap",
//             "    ": "cap",
//             "phonemes": [
//                 "k",
//                 "æ",
//                 "p",
//                 "a",
//                 "w",
//                 "z"
//             ]
//         },
//         {
//             "image": "https://picsum.photos/seed/mat/1200/1200",
//             "line": "The cat sits on the mat",
//             "target_word": "mat",
//             "phonemes": [
//                 "m",
//                 "æ",
//                 "t"
//             ]
//         },
//         {
//             "image": "https://picsum.photos/seed/pat/1200/1200",
//             "line": "Sam can pat the cat",
//             "targetWord": "pat",
//             "phonemes": [
//                 "/p/",
//                 "/æ/",
//                 "/t/"
//             ]
//         },
//         {
//             "image": "https://picsum.photos/seed/fan/1200/1200",
//             "line": "A fan spins by the mat",
//             "targetWord": "fan",
//             "phonemes": [
//                 "/f/",
//                 "/æ/",
//                 "/n/"
//             ]
//         }
//     ],
//     "quiz_questions": [
//         {
//             "question_type": "horizontal ordering",
//             "words": [
//                 "c",
//                 "a",
//                 "p"
//             ],
//             "answer": "cap",
//             "image": "https://picsum.photos/seed/fan2/1200/1200"
//         },
//         {
//             "question_type": "multiple choice",
//             "words": [
//                 "fan",
//                 "pat"
//             ],
//             "answer": "fan",
//             "audio": "",
//             "image": "https://picsum.photos/seed/fan2/1200/1200"
//         },
//         {
//             "question_type": "fill in the blanks",
//             "question_words": [
//                 "m",
//                 "a",
//                 ""
//             ],
//             "option_words": [
//                 "p",
//                 "d",
//                 "t"
//             ],
//             "answer": "t",
//             "image": "https://picsum.photos/seed/fan2/1200/1200"
//         }
//     ]
// }