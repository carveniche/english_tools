import React, { useState } from "react";
import MainSentenceMaker from "./LevelSlection";
import { motion } from "framer-motion";
function StartPage() {
  const [startThePage, setStartThePage] = useState(false);
  const [sendingBackendData,setSendingBackendData]=useState(null);

  const handleStartingTheGame = () => {
    setStartThePage(true);

  };
  function gettingSightData(data) {
        setSendingBackendData(data);
    }
     window.gettingSightData=gettingSightData
//    const data = [
//       { level_id: 888,
//         is_completed:true,
//          words: ['haa','saa',"truest","eloe"] },
//     ];
//   const [sendingBackendData,setSendingBackendData]=useState(data);

  return (
    <>
      {startThePage? (
        // <FindTheWords data={sendingBackendData}/>
        // <MainComponent/>
        <MainSentenceMaker/>
        // <NewPhonicalMaker/>
      ) : (
        <div className="relative  w-full h-[75vh] flex justify-center items-center flex-col gap-[2rem] xl:flex-row">
             <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: "url(https://d3g74fig38xwgn.cloudfront.net/teaching-tool/graphbackground.jpg)",
      //  opacity: 0.3
       }}
  ></div>
          <button
            onClick={handleStartingTheGame}
            className="
  group overflow-hidden inline-flex items-center justify-center
  border
  w-[120px] h-[40px] px-3
  lg:ml-[4rem]
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
                  ⭐ Level Rule ⭐
                </h2>
          
                <ul className="space-y-3 text-lg font-semibold text-indigo-800">
                  <li><b>Level 1:</b> Listen & choose the <b>UPPERCASE</b> letter.</li>
  <li><b>Level 2:</b> Listen & choose the <b>lowercase</b> letter.</li>
  <li><b>Level 3:</b> <b>Drag</b> the matching letter 🎉</li>
  <li><b>Level 4:</b> Listen & choose <b>all matching letters</b>.</li>
  <li><b>Level 5:</b> <b>Collect</b> correct letters to finish.</li>
                </ul>
              </div>
            </motion.div>
        </div>
      )}
    </>
  );
}

export default StartPage;


// import React from 'react'

// function StartPage() {
//   return (
//     <div className='border border-red-950 w-full h-[calc(100vh-30vh)] bg-[#F0FEFF] flex justify-center items-center p-[1rem]'>
//        <div className='w-[90%] border border-green-700 h-[100%] flex justify-center items-center flex-col gap-[2rem]'>
//           <div></div>
//           <div className='w-full border border-black flex justify-evenly items-center flex-row'>

//           </div>
//        </div>
//     </div>
//   )
// }

// export default StartPage