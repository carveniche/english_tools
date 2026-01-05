import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LevelOne from "./levels/LevelOne";
import LevelFour from "./levels/LevelFour";
import LevelThree from "./levels/LevelThree";
import LevelFive from "./levels/LevelFive";
const UPPER = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const LOWER = Array.from("abcdefghijklmnopqrstuvwxyz");

function LevelSelection() {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef(null);
  
useEffect(() => {
  if (currentLevel) {
    setTimeSpent(0);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
  }

  return () => clearInterval(timerRef.current);
}, [currentLevel]);
const stopTimer = () => {
  clearInterval(timerRef.current);
};

  // Stop timer automatically when leaving level
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);
  const choose_level = [
    {
      id: 1,
      name: "Level 1",
      comp:"Listen & pick [UpperCase]",
      image:"https://classroomclipart.com/image/static2/preview2/upper-case-letter-m-cartoon-alphabet-24142.jpg",
      render: () => (
        <LevelOne
          letters={UPPER}
          label="(Uppercase) – Click the letter you hear"
          timeSpent={timeSpent}
          comp={'Listen & pick [UpperCase]'}
        stopTimer={stopTimer}
          onGoHome={() => {
            stopTimer();
            setCurrentLevel(null);
          }}
        />
      ),
    },
    {
      id: 2,
      name: "Level 2",
      comp:"Listen & pick [LowerCase]",
      image:"https://cdn.education.com/files/static/game-images/monster-letters-ndhjclwvyz-thumbnail-2022-12-13.png",
      render: () => (
        <LevelOne
          comp={'Listen & pick [LowerCase]'}
          letters={LOWER}
          label="(Lowercase) – Click the letter you hear"
          timeSpent={timeSpent}
          stopTimer={stopTimer}
          onGoHome={() => {
            stopTimer();
            setCurrentLevel(null);
          }}
        />
      ),
    },
    { id: 3, name: "Level 3",
      comp:"Drag The Letter",
      image:"https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/phonics.jpg",
       render: () => <LevelThree timeSpent={timeSpent}
       comp={'Drag The Letter'}
          stopTimer={stopTimer}
          onGoHome={() => {
            stopTimer();
            setCurrentLevel(null);
          }}/> },
    { id: 4, name: "Level 4", 
      comp:"Hear & Tap all letters",
      image:"https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/stars.png",
      render: () => <LevelFour timeSpent={timeSpent}
          stopTimer={stopTimer}
          comp={'Hear & Tab all letter"s'}
          onGoHome={() => {
            stopTimer();
            setCurrentLevel(null);
          }}/> },
    { id: 5, name: "Level 5",
      comp:"Match the letter",
      image:"https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/letterselect.png",
      
       render: () => <LevelFive timeSpent={timeSpent}
          stopTimer={stopTimer}
          comp={'Match the letter'}
          onGoHome={() => {
            stopTimer();
            setCurrentLevel(null);
          }}/> },
  ];

  // if (currentLevel) return currentLevel;
  if (currentLevel) {
  const level = choose_level.find((lvl) => lvl.id === currentLevel);
  return level.render();
}
  // if (true) return <LevelThree
  //         onGoHome={() => setCurrentLevel(null)} />;


  return (
    <div className="relative w-full p-[1rem] h-auto justify-center items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://d3g74fig38xwgn.cloudfront.net/teaching-tool/graphbackground.jpg')] bg-cover bg-center opacity-70" />

      {/* Floating cute clouds */}
      {/* <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-10 left-10 text-6xl opacity-40"
      >
        ☁️
      </motion.div>

      <motion.div
        animate={{ y: [0, -25, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute top-20 right-16 text-7xl opacity-40"
      >
        ☁️
      </motion.div> */}

      {/* Container */}
      <div className="relative z-10 w-[90%] text-center flex flex-col items-center gap-6 p-6 rounded-3xl bg-white/70 backdrop-blur-xl "
      >
        <h2 className="text-xl md:text-xl font-extrabold  drop-shadow">
          Select Your Level
        </h2>

        {/* Level Cards */}
        <div className="flex flex-wrap justify-center  gap-[6rem] mt-4">
          {choose_level.map((data) => (
            <>
            <div className="flex flex-col gap-[0.4rem] ">
            <motion.div
              key={data.id}
              whileHover={{ scale: 1.15, rotate: 2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentLevel(data.id)}

              className="w-[110px] h-[110px] md:w-[170px] md:h-[170px] cursor-pointer rounded-3xl shadow-xl flex items-center justify-center text-xl md:text-2xl font-bold text-white"
              style={{
                position:'relative',
                background: "linear-gradient(135deg, rgb(255 229 0) 0%, rgb(255 237 23) 100%)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow:
                  "0 0 10px rgba(255,255,255,0.7), 0 0 25px rgba(255,200,200,0.8)",
                  overflow:"hidden"
              }}
            >
                <img className="absolute top-0 left-0 w-full h-full"
                src={data.image}/>
             
            </motion.div>
            <div className="relative flex justify-center items-center p-[1rem]"
              onClick={() => setCurrentLevel(data.id)}
            >
             <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/snake.png" alt="" className="absolute w-full h-full z-[1]" />
             <span className=" z-[2] text-[#fff] w-[45%] text-[0.6rem] mx-auto text-center">{data.comp}</span>

            </div>
             </div>
             </>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LevelSelection;
