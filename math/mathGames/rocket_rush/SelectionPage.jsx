import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// Import your level components
import LevelEasy from "./LevelEasy";
import LevelMedium from "./LevelMedium";
import LevelHard from "./LevelHard";
import RocketRushLevel from "./RocketRushLevel";

const softSpring = { type: "spring", damping: 14, stiffness: 120 };
const fastSpring = { type: "spring", damping: 10, stiffness: 180 };

function SelectionPage() {
  const [selected, setSelected] = useState("easy");
  const [startGame, setStartGame] = useState(false);

  // Sound refs
  const selectSoundRef = useRef(null);
  const startSoundRef = useRef(null);
  const bgMusicRef = useRef(null);

  // Init sounds
  useEffect(() => {
    if (!selectSoundRef.current) {
      selectSoundRef.current = new Audio("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/levelselection.mp3");
      selectSoundRef.current.volume = 0.6;
    }
    if (!startSoundRef.current) {
      startSoundRef.current = new Audio("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/statTherrRocketRush.mp3");
      startSoundRef.current.volume = 0.7;
    }
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/RocketRushBackGroundMusic.mp3");
      bgMusicRef.current.volume = 0.4;
      bgMusicRef.current.loop = true; // loop infinitely
      bgMusicRef.current.play().catch(() => {
        // Autoplay blocked: will play on user interaction
        console.log("Background music autoplay blocked");
      });
    }
  }, []);

  // Play / stop functions
  const playBgMusic = () => {
    bgMusicRef.current?.play().catch(() => console.log("Play blocked"));
  };

  const stopBgMusic = () => {
    bgMusicRef.current?.pause();
    bgMusicRef.current.currentTime = 0; // optional: reset
  };

  const playSelectSound = () => selectSoundRef.current?.play();
  const playStartSound = () => startSoundRef.current?.play();

  const items = [
    { id: "easy", img: "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/easyRocketRush.png" },
    { id: "medium", img: "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/mediumRocketRush.png" },
    { id: "hard", img: "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/hardRocketRush.png" },
  ];


    useEffect(() => {
      
      const btn = document.getElementById("closing-btn-with-math-rocket-rush");
      const onClick = () => {
        stopBgMusic()
      };
      if (btn) btn.addEventListener("click", onClick);
      return () => {
        if (btn) btn.removeEventListener("click", onClick);
      };
    }, []);

//   if (startGame) {
//     if (selected === "easy") return <LevelEasy />;
//     if (selected === "medium") return <LevelMedium />;
//     if (selected === "hard") return <LevelHard />;
//   }
if (startGame) {
  return (
    // <RocketRushLevel
    //   difficulty={selected}
    //   onExit={() => setStartGame(false)}
    // />
    <LevelEasy
      difficulty={selected}
      onExit={() => setStartGame(false)}
      stopBgMusic={stopBgMusic}
    />
  );
}

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-[3rem]">
      <motion.div
  className="w-full flex justify-center items-center"
  initial={{ opacity: 0, y: -40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  <img
    // src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/selectTheLevel.png"
    src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/SelectingTheLevel.png"
    alt="selectTheLevel"
    className="h-[5rem]"
  />
</motion.div>
      {/* Cards */}
      <div className="flex justify-center items-center gap-[2.5rem]">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 80, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...softSpring, delay: i * 0.25 }}
            className="relative"
          >
            <motion.img
            draggable={false}
              src={item.img}
              alt={item.id}
              className={`w-[15rem] cursor-pointer select-none ${
                selected && selected !== item.id ? "opacity-40" : ""
              }`}
              transition={fastSpring}
              whileHover={{
                scale: 1.1,
                filter: "drop-shadow(0px 0px 25px rgba(0,255,255,0.9))",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSelectSound();
                setSelected(item.id);
                playBgMusic(); // play on first click if blocked
              }}
              animate={selected === item.id ? { scale: [1, 1.06, 1] } : {}}
            />

            {selected === item.id && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Play Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={fastSpring}
        onClick={() => {
          playStartSound();
          setTimeout(() => setStartGame(true), 300);
        }}
        // style={{backgroundImage:"url(/startRushBtn.png)"}}
        className=" flex justify-center relative  items-center flex-row gap-[5px] text-[1rem] font-bold rounded-xl  text-[#FFFFFF] shadow-lg bg-center bg-cover bg-no-repeat"
      >
        {/* <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/slidestartPlaybtn.png" alt="slidestartPlaybtn" className="w-[5rem] absolute z-10 left-[-2.5rem] top-0" draggable={false}/> */}
        

        <div className="flex justify-center relative  w-[10rem] items-center flex-row gap-[5px] text-[1rem] font-bold rounded-xl  text-[#FFFFFF] shadow-lg bg-center bg-cover bg-no-repeat">
        {/* <span className="w-full flex justify-center items-center h-full">
        <svg xmlns="http://www.w3.org/2000/svg" width="" height="" viewBox="0 0 317 85" fill="none">
  <path d="M316.454 42.0425V84.0851H0L0.00922366 42.0425V0H262.206L316.454 42.0425Z" fill="url(#paint0_linear_320_216911)"/>
  <defs>
    <linearGradient id="paint0_linear_320_216911" x1="223.025" y1="-20.1953" x2="131.97" y2="125.424" gradientUnits="userSpaceOnUse">
      <stop offset="0.0112" stop-color="#FD301D"/>
      <stop offset="1" stop-color="#F0841F"/>
    </linearGradient>
  </defs>
</svg>
</span>
        <span className=" w-[85%] absolute flex justify-center items-start text-lg">
             PLAY {selected.toUpperCase()}
        </span> */}
        <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/PlayNowBtnRush.png" alt="PlayNowBtnRush" />
        </div>
      </motion.button>

      {/* Stop Music Button */}
      {/* <motion.button
        className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        onClick={stopBgMusic}
      >
        Stop Music
      </motion.button> */}
    </div>
  );
}

export default SelectionPage;
