import React, { useState, useEffect } from "react";
import MathCross from "./MathCross";
import { Play, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function StartGross() {
  const [start, setStart] = useState(false);
  const [hover, setHover] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(true);
      setTimeout(() => setBounce(false), 800);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-10vh)] overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!start && (
          <motion.div
            key="start"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* ===== START SCREEN ===== */}
            <div
              className="w-full h-full relative overflow-hidden flex items-center justify-center p-2 sm:p-4"
              style={{
                backgroundImage:
                  "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/numberTrailBg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/40 z-0" />

              {/* Main Card */}
              <div className="relative z-10 w-full max-w-5xl h-full bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-purple-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-purple-400 flex flex-col justify-between p-2 sm:p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-white" />
                    </div>
                    <h1 className="font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent text-[clamp(1.6rem,4vw,3.5rem)]">
                      Math Cross
                    </h1>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 max-w-3xl mx-auto">
                  <Feature icon="🔢" title="Fun Puzzles" />
                  <Feature icon="🧠" title="Brain Power" />
                </div>

                {/* How To Play */}
                <div className="bg-gradient-to-r from-purple-800/70 to-pink-800/70 rounded-2xl p-2 sm:p-4 border-2 border-purple-300 shadow-lg">
                  <h3 className="text-center text-sm sm:text-lg md:text-xl font-bold text-purple-200 mb-2">
                    How to Play?
                  </h3>

                  <div className="flex items-center justify-center gap-3 sm:gap-6">
                    <PuzzlePreview />
                    <div className="text-xl sm:text-3xl md:text-5xl text-purple-300 animate-pulse">
                      ➜
                    </div>
                    <PuzzleSolved />
                  </div>
                </div>

                {/* Start Button */}
                <div className="text-center">
                  <button
                    onClick={() => setStart(true)}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    className={`
                      relative font-bold rounded-2xl transition-all duration-300 transform
                      ${bounce ? "animate-bounce" : ""}
                      ${hover ? "scale-105 shadow-2xl" : "shadow-xl"}
                      bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500
                      text-white border-4 border-yellow-300
                      px-4 py-2 sm:px-8 sm:py-4 md:px-12 md:py-5
                      text-sm sm:text-xl md:text-2xl
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <Play
                        className={`w-4 h-4 sm:w-6 sm:h-6 md:w-10 md:h-10 ${
                          hover ? "animate-pulse" : ""
                        }`}
                        fill="white"
                      />
                      START
                    </div>
                  </button>

                  <p className="mt-2 sm:mt-4 text-amber-200 font-medium text-xs sm:text-sm md:text-lg animate-pulse">
                    ✨ Start your math adventure ✨
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {start && (
          <motion.div
            key="game"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <MathCross />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Components ---------------- */

function Feature({ icon, title }) {
  return (
    <div className="bg-gradient-to-br from-blue-800/70 to-blue-900/70 p-2 sm:p-4 rounded-xl border border-blue-400 text-center text-white text-xs sm:text-base">
      <div className="text-lg sm:text-2xl mb-1">{icon}</div>
      <div className="font-bold">{title}</div>
    </div>
  );
}

function PuzzlePreview() {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {[1, "+", 2, "=", "?", 3].map((c, i) => (
        <div
          key={i}
          className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center font-bold bg-gray-800 text-white border border-purple-300 rounded text-xs sm:text-lg md:text-2xl"
        >
          {c}
        </div>
      ))}
    </div>
  );
}

function PuzzleSolved() {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {[1, "+", 2, "=", 3, 3].map((c, i) => (
        <div
          key={i}
          className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center font-bold bg-emerald-700 text-white border border-emerald-300 rounded text-xs sm:text-lg md:text-2xl"
        >
          {c}
        </div>
      ))}
    </div>
  );
}

export default StartGross;
