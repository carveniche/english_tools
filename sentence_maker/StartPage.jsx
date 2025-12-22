import React, { useRef, useState } from "react";
import MainSentenceMaker from "./MainComponent";
import { motion } from "framer-motion";
function StartPage() {
  const [startThePage, setStartThePage] = useState(false);
    const [sendingBackendData,setSendingBackendData]=useState(null);
      const backendDataRef = useRef(null);
    
      const handleStartingTheGame = () => {
          if (!backendDataRef.current) {
      console.log("No backend data yet");
      return;
    }
    setSendingBackendData(backendDataRef.current)
     setStartThePage(true);
};


  function gettingSentenceMakerData(data) {
    // setSendingBackendData(data);
     backendDataRef.current = data

  }
  window.gettingSentenceMakerData = gettingSentenceMakerData;



//    const data=  {
//     "status": true,
//     "message": "First Flip Word for this student",
//     "sentence_full_data": [
//         {
//             "sentence_data":[
//              {
//                 "subject_options": [
//                     "She",
//                     "We",
//                     "They"
//                 ],
//                 "verb_options": [
//                     "eats",
//                     "runs",
//                     "paints"
//                 ],
//                 "object_options": [
//                     "juice",
//                     "a ball",
//                     "a picture"
//                 ],
//                 "subject_correct": "She",
//                 "verb_correct": "paints",
//                 "object_correct": "a picture"
//             }
//           ],
//             "sentence_position_id": 1,
//             "is_completed": false,
//             "words_completed": false,
//             "sentence_answer": "She paints a picture.",
//             "sentence_image_url": "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/She-paints-a-book.png"
//         }
//     ]
// }
//   const [sendingBackendData, setSendingBackendData] = useState(data);
// console.log(sendingBackendData.sentence_data,"hjko")

  return (
    <>
      {startThePage ? (
        sendingBackendData ?(
          <MainSentenceMaker data={sendingBackendData} />
        ):
       ( 
        <p>No Data Found</p>
       )
        
      ) : (
        <div className="relative  w-full h-[70vh] flex justify-center items-center flex-col gap-[2rem] xl:flex-row">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://d3g74fig38xwgn.cloudfront.net/teaching-tool/graphbackground.jpg)",
              opacity: 0.3,
            }}
          ></div>
          <button
            onClick={handleStartingTheGame}
            className="
  group overflow-hidden inline-flex items-center justify-center
  border
  w-[120px] h-[40px] px-3
  text-[14px] uppercase tracking-[1px] font-normal
  rounded-[3px] cursor-pointer select-none relative
  shadow-[inset_0_30px_30px_-15px_rgba(255,255,255,0.1),
          inset_0_0_0_1px_rgba(255,255,255,0.3),
          inset_0_1px_20px_rgba(0,0,0,0),
          0_3px_0_#0f988e,
          0_3px_2px_rgba(0,0,0,0.2),
          0_5px_10px_rgba(0,0,0,0.1),
          0_10px_20px_rgba(0,0,0,0.1)]
  bg-[#15ccbe] text-white
  transition-all duration-150 ease-in-out
  active:translate-y-[3px]
  active:shadow-[inset_0_16px_2px_-15px_rgba(0,0,0,0),
                inset_0_0_0_1px_rgba(255,255,255,0.15),
                inset_0_1px_20px_rgba(0,0,0,0.1),
                0_0_0_#0f988e,
                0_0_0_2px_rgba(255,255,255,0.5)]
"
          >
            <span
              className="
    icon mr-2 w-6 h-6 transition-all duration-500 ease-in-out
    group-hover:translate-x-[23px]
  "
            >
              →
            </span>

            <span
              className="
    text transition-all duration-500 ease-in-out
    group-hover:translate-x-[80px]
  "
            >
              Start
            </span>
          </button>
          <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="xl:absolute top-10 left-10 -translate-x-1/2 z-50"
          >
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 shadow-xl border-2 border-white">
              <h2 className="text-center text-2xl font-extrabold text-indigo-900 mb-4">
                ⭐ How To Play? ⭐
              </h2>

              <ul className="space-y-3 text-lg font-semibold text-indigo-800">
                <li>
                  🟢 Step 1 👉 Look at the picture and choose the correct{" "}
                  <b>Subject</b>
                </li>
                <li>
                  🟡 Step 2 👉 Choose the correct <b>Verb</b> to match the
                  picture
                </li>
                <li>
                  🔵 Step 3 👉 Choose the correct <b>Object</b> to complete the
                  sentence
                </li>
                <li>
                  🔊 Step 4 👉 Listen carefully as the full sentence is spoken
                  slowly
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default StartPage;

// {
//   /* <div className="flex justify-center space-x-4 md:space-x-8">
//               {[1, 2, 3, 4].map((s) => (
//                 <div key={s} className="flex flex-col items-center">
//                   <div className={`
//                     w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-lg md:text-xl
//                     ${step >= s ? 'bg-white text-purple-600 shadow-lg' : 'bg-white/20 text-white'}
//                     ${step === s ? 'ring-4 ring-white/50' : ''}
//                     transition-all duration-300
//                   `}>
//                     {s}
//                   </div>
//                   <span className={`text-sm mt-2 font-medium ${step === s ? 'text-white' : 'text-white/70'}`}>
//                     {stepLabels[s].split(' ')[0]}
//                   </span>
//                 </div>
//               ))}
//               </div> */
// }

// import React from "react";
// // import { generateQuestion } from "../../component/testing";
// import { generateQuestion } from "../../component/testing";


// function StartPage() {
//   const [question, setQuestion] = React.useState(null);

//   function handleClick() {
//     const q = generateQuestion();
//     setQuestion(q);
//   }
// console.log(question,"question")
//   return (
//     <>
//       {/* <button className="mx-auto mt-5 border border-red-700 cursor-pointer" onClick={handleClick}>Generate Question</button>

//       {question && (
//         <pre>{JSON.stringify(question, null, 2)}</pre>
//       )} */}
//       <button id="generateBtn">Generate Random Grid</button>

//      <pre id="output"></pre>

//     </>
//   );
// }

// export default StartPage;


// import React, { useState } from "react";
// import { generatePuzzle } from "../../puzzle";

// function StartPage() {
//   const [puzzle, setPuzzle] = useState(null);

//   function handleGenerate() {
//     const sizes = [5, 7, 9];
//     const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
//     const newPuzzle = generatePuzzle(randomSize);
//     setPuzzle(newPuzzle);
//   }

//   return (
//     <>
//       <button onClick={handleGenerate}>Generate Random Grid</button>

//       {puzzle && (
//         <pre style={{ marginTop: "20px" }}>
//           {JSON.stringify(puzzle, null, 2)}
//         </pre>
//       )}
//     </>
//   );
// }

// export default StartPage;
// import React, { useState } from "react";
// import { generatePuzzle } from "../../puzzle";

// function StartPage() {
//   const [puzzle, setPuzzle] = useState(null);

//   function handleGenerate() {
//     const sizes = [5, 7, 9];
//     const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
//     const newPuzzle = generatePuzzle(randomSize);
//     setPuzzle(newPuzzle);
//   }
// console.log(puzzle)
//   return (
//     <>
//       <button onClick={handleGenerate}>Generate Random Grid</button>

//       {puzzle && (
//         <pre style={{ marginTop: "20px" }}>
//           {JSON.stringify(puzzle, null, 2)}
//         </pre>
//       )}
//     </>
//   );
// }

// export default StartPage;
