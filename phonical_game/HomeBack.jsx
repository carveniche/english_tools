import React, { useEffect } from "react";
import { motion } from "framer-motion";

function HomeBack({ playAgain, onGoHome,timeSpent,component }) {
    useEffect(() => {
    // console.log("timeSpentHome",component, timeSpent);
  }, [timeSpent]);

const handlebackFunction=(()=>{
      if (typeof window.sendingTimespentPhonics === "function") {
        const formdata = new FormData
        formdata.append('level_name',component)
        formdata.append('timespent',timeSpent)
        window.sendingTimespentPhonics(formdata);
      } else {
        // console.log(timeSpent,"timeSpenttimeSpenttimeSpent")
        // console.log("not found sendingTimespentPhonics function");
      }
    
})
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative inset-0 flex items-center justify-center z-50 px-4"
    >
      <div className="w-full max-w-sm p-6 rounded-3xl bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 shadow-2xl border-4 border-white">
        
        {/* Title */}
        <h2 className="text-center text-3xl font-extrabold text-purple-800 mb-5 drop-shadow-sm">
          🎉 Game Over! 🎉
        </h2>

        {/* Cute character */}
        <div className="flex justify-center mb-5">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-yellow-400"
          >
            <span className="text-5xl">😊</span>
          </motion.div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-center flex-col gap-4">

          {/* Play Again */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={playAgain}
            className="w-full px-5 py-3 rounded-2xl bg-green-400 text-white font-extrabold shadow-lg text-lg tracking-wide border-2 border-green-300 hover:bg-green-500 transition"
          >
             Play Again
          </motion.button>

          {/* Home */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={()=>{
              onGoHome()
              handlebackFunction()
            }}
            className="w-full px-5 py-3 rounded-2xl bg-blue-400 text-white font-extrabold shadow-lg text-lg tracking-wide border-2 border-blue-300 hover:bg-blue-500 transition"
          >
             Home
          </motion.button>

        </div>
      </div>
    </motion.div>
  );
}

export default HomeBack;
