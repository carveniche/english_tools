import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Button from "./Button";
// ==============================
// Sight Memory — Full Working File
// ==============================

// ---- Helper utilities ----
const shuffle = (array) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Pastel palette; twins get different colors
const CARD_PALETTE = [
  "#97C1C8", // teal blue
  "#E9B872", // warm amber
  "#E6C9A8", // sand
  "#D8A7B1", // rose
  "#B8D8BA", // mint
  "#C3B1E1", // lilac
  "#F5A9A9", // blush
  "#9AD0C2", // seafoam
  "#F7D488", // sunshine
  "#A7BED3", // powder blue
  "#FFDAC1", // peach
];
const CARD_BACK = "#2D3A5F";

// ---- Word sets by level (exact list) ----
const LEVEL_WORDS = {
  1: ["the", "and", "for", "are", "you"],
  2: ["now", "who", "was", "all", "any"],
  3: ["one", "out", "put", "saw", "two"],
  4: ["who", "her", "has", "how", "why"],
  5: ["come", "give", "have", "said", "from"],
  6: ["some", "your", "what", "when", "with"],
  7: ["with", "they", "were", "into", "does"],
  8: ["gone", "once", "know", "over", "very"],
  9: ["there", "could", "would", "again", "other"],
  10: ["where", "right", "their", "about", "every"],
  11: ["after", "think", "three", "under", "never"],
  12: ["small", "great", "first", "house", "place"],
};
const MAX_LEVEL = 12;

const buildCardsForLevel = (level) => {
  const words = LEVEL_WORDS[level] || LEVEL_WORDS[1];
  const cards = words.flatMap((word, idx) => {
    const colors = shuffle(CARD_PALETTE);
    const colorA = colors[0];
    const colorB = colors.find((c) => c !== colorA) || CARD_PALETTE[1];
    return [
      { id: `${idx}-a`, word, matched: false, color: colorA },
      { id: `${idx}-b`, word, matched: false, color: colorB },
    ];
  });
  return shuffle(cards);
};

// ---- Voice helpers ----
const speak = (text) => {
  try {
    if (window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.pitch = 1.2;
      utter.rate = 1.0;
      // Prefer a female voice if available
      const choose = () =>
        window.speechSynthesis.getVoices().find((v) => /(female|woman)/i.test(v.name)) ||
        window.speechSynthesis.getVoices().find((v) => /Google UK English Female/i.test(v.name));
      const voice = choose();
      if (voice) utter.voice = voice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  } catch (e) {}
};
const playSound = (url) => {
  try {
    const audio = new Audio(url);
    audio.play().catch((err) => console.error("Audio play failed:", err));
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export default function SightMemory() {
  // Screens
  const [screen, setScreen] = useState("title"); // 'title' | 'game' | 'won'
  // Game state
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [first, setFirst] = useState(null); // {id, index}
  const [second, setSecond] = useState(null);
  const [revealed, setRevealed] = useState({}); // id -> true
  const [cross, setCross] = useState({}); // id -> true
  const [lock, setLock] = useState(false);
  const [elapsed, setElapsed] = useState(0);
 const [flippedCards, setFlippedCards] = useState({});
 const[showDailyLimit,setShowDailyLimit]=useState(false)
  // Refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const autoFlipTimers = useRef({});
  const introMusicRef = useRef(null);
  const replayLevelRef = useRef(null);

  // Start title music
  useEffect(() => {
    if (screen === "title" && introMusicRef.current) {
      const a = introMusicRef.current;
      a.currentTime = 0;
      a.loop = false;
      a.volume = 0.8;
      a.play().catch(() => {});
    }
  }, [screen]);

  const clearTimers = () => {
    clearInterval(timerRef.current);
    Object.values(autoFlipTimers.current).forEach((t) => clearTimeout(t));
    autoFlipTimers.current = {};
  };

  const startLevel = () => {
    clearTimers();
    setCards(buildCardsForLevel(level));
    setFirst(null);
    setSecond(null);
    setRevealed({});
    setCross({});
    setLock(false);
    startTimeRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 200);
  };

  // Clean up on unmount
  useEffect(() => () => clearTimers(), []);

  // Entering game screen -> start level (handle replay request)
  useEffect(() => {
    if (screen === "game") {
      if (replayLevelRef.current != null) {
        setLevel(replayLevelRef.current);
        replayLevelRef.current = null;
        // Defer start until level state applies
        setTimeout(startLevel, 0);
      } else {
        startLevel();
      }
    }
  }, [screen]);

  // All matched?
  const allMatched = useMemo(() => cards.length > 0 && cards.every((c) => c.matched), [cards]);
  useEffect(() => {
    if (allMatched && screen === "game") {
      clearTimers();
      setScreen("won");
    }
  }, [allMatched, screen]);

  const revealWithAutoHide = (cardId) => {

    setRevealed((r) => ({ ...r, [cardId]: true }));
    if (autoFlipTimers.current[cardId]) clearTimeout(autoFlipTimers.current[cardId]);
    autoFlipTimers.current[cardId] = setTimeout(() => {
        // setIsFlipped(!isFlipped)
      setRevealed((r) => {
        const copy = { ...r };
        if (!cards.find((c) => c.id === cardId)?.matched) delete copy[cardId];
      
        return copy;
      });
    }, 5000);
  };

  const onCardClick = (index) => {
    setFlippedCards(prev => ({ ...prev, [card.id]: true }));
    if (lock) return;
    console.log(lock,"lock")
    const card = cards[index];
    console.log(card.matched,"card.matched",revealed[card.id],"revealed[card.id]")
    if (card.matched || revealed[card.id]) return;

    revealWithAutoHide(card.id);

    if (!first) { setFirst({ id: card.id, index }); return; }
    if (first.id === card.id) return; // same card guard

    setSecond({ id: card.id, index });
    setLock(true);

    const firstCard = cards[first.index];
    const secondCard = card;
console.log(firstCard,"firstCard",secondCard)
    try {
      console.log((autoFlipTimers.current[firstCard.id]),"(autoFlipTimers.current[firstCard.id]")
      clearTimeout(autoFlipTimers.current[firstCard.id]);
      clearTimeout(autoFlipTimers.current[secondCard.id]);
    } catch {}

    if (firstCard.word === secondCard.word) {
      setTimeout(() => {
        // speak("Yay, you got that right!");
        // speak('https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/correct-answer.mp3')
        playSound("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/correct-answer.mp3");
        setCards((prev) => prev.map((c) => (c.id === firstCard.id || c.id === secondCard.id ? { ...c, matched: true } : c)));
        setLock(false);
        setFirst(null);
        setSecond(null);
      }, 250);
    } else {
      speak("Try again!");
      setCross((x) => ({ ...x, [firstCard.id]: true, [secondCard.id]: true }));
      setTimeout(() => {
        setCross((x) => { const copy = { ...x }; delete copy[firstCard.id]; delete copy[secondCard.id]; return copy; });
        setRevealed((r) => { const copy = { ...r }; delete copy[firstCard.id]; delete copy[secondCard.id]; return copy; });
        setLock(false);
        setFirst(null);
        setSecond(null);
      }, 900);
    }
  };

  // Shared full-screen background style
  const fullScreenStyle = {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    backgroundImage: 'url(/831.jpg)',
    backgroundImage: 'url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/wordSearchBg.jpg)',
    // backgroundImage: 'url(./sandal.jpg)',

    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflow: "auto",
    overflow:"hidden",
    margin:'auto'
  };

  // ---- UI ----
  if (screen === "title") {
    return (
      // <div className="flex items-center justify-center p-6" style={fullScreenStyle}>
      //   <audio ref={introMusicRef} src="/intro.mp3" />
      //   <div className="max-w-4xl w-full bg-white/95 rounded-2xl shadow-2xl p-6 md:p-8 grid md:grid-cols-2 gap-6">
      //     <div className="flex flex-col gap-4 justify-center">
      //       <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-600 via-rose-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">Sight Memory</h1>
      //       <button
      //         className="mt-1 px-8 py-4 rounded-2xl text-white text-xl font-extrabold shadow-lg hover:scale-[1.03] transition bg-gradient-to-r from-pink-500 via-amber-400 to-lime-500"
      //         onClick={() => { try { introMusicRef.current && introMusicRef.current.pause(); } catch {} setScreen("game"); }}
      //       >
      //         START
      //       </button>
      //     </div>
      //     <div className="flex items-center justify-center">
      //       <img src="/kids.png" alt="Kids reading" className="w-full max-h-80 h-auto rounded-xl shadow-md object-contain bg-white" />
      //     </div>
      //   </div>
      // </div>
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-purple-200 via-pink-200 to-yellow-200 relative overflow-hidden">
  {/* Decorative floating shapes */}
  <div className="absolute top-8 left-8 w-20 h-20 bg-pink-400 rounded-full opacity-60 animate-bounce-slow"></div>
  <div className="absolute bottom-16 right-12 w-16 h-16 bg-purple-400 rounded-full opacity-50 animate-bounce-slow"></div>
  <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-yellow-300 rounded-full opacity-40 animate-bounce-slow"></div>
  <div className="absolute bottom-1/3 left-1/2 w-12 h-12 bg-green-300 rounded-full opacity-50 animate-bounce-slow"></div>

  <audio ref={introMusicRef} src="/intro.mp3" />

  <div className="flex items-center justify-center p-6">
    
    <div className="max-w-3xl w-full bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-8 relative">
      {/* <img src="./boy.png" alt="boy" className="hidden md:block md:absolute md:w-[35%] md:right-[0rem] md:top-[1rem] " /> */}
     
      {/* Title */}
      <h1 className="text-xl md:text-3xl font-extrabold text-black bg-clip-text text-transparent  text-center" style={{color:'black'}}>
        Sight Memory
      </h1>

      {/* Subtitle */}
      <p className="text-xl md:text-xl font-semiboldtext-center">
        Train your brain while having fun!
      </p>

      {/* Start Button */}
      <button
        className=" rounded-full text-white text-xl font-extrabold  hover:scale-110 transition-transform duration-500 relative flex justify-center items-center"
        onClick={() => {
          try { introMusicRef.current && introMusicRef.current.pause(); } catch {}
          setScreen("game");
        }}
      >
            <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/home.png" alt="level" className="w-[8rem] h-[4rem] object-contain relative"  />
            <span className="absolute text-sm text-[#fff] font-extrabold">START</span>
     
      </button>

      {/* Fun Stars */}
      <div className="absolute top-4 right-10 w-6 h-6 bg-yellow-400 rounded-full animate-spin-slow opacity-70"></div>
      <div className="absolute bottom-10 left-16 w-4 h-4 bg-pink-400 rounded-full animate-spin-slow opacity-60"></div>

    </div>
  </div>
</div>


    );
  }

  if (screen ==="won" ) {
  // if (true ) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-r from-cyan-500 from- via-blue-500 via- h-[100vh]" style={{fullScreenStyle,}} >
        {/* <div className="bg-gradient-to-r from-teal-200 to-teal-500 rounded-2xl relative  p-8  w-[70%] xl:w-[60%] text-center flex justify-center items-center flex-col shadow-md gap-[0rem]">
         */}
        <div className=" rounded-2xl relative  p-8  w-[70%] xl:w-[60%] text-center flex justify-center items-center flex-col  gap-[0rem]">

         <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/nextLevel.png" alt="level" className="relative xl:w-[70%] h-[90%] rounded-2xl xl:mt-[-4rem]"/>
          <div className=" flex gap-3 justify-center xl:mt-[-4rem] level-buttons">
            <button
              className=" px-5 relative rounded-xl text-white font-semibold  flex justify-center items-center "
              onClick={() => {
                // Clear current cards/state before moving ahead
                setCards([]); setRevealed({}); setCross({}); setLock(false);
                if (level < MAX_LEVEL) { setLevel(level + 1); setScreen("game"); }
                else { setLevel(1); setScreen("title"); }
              }}
            >
              <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/home.png" alt="level" className="w-[8rem] object-contain relative" style={{boxShadow:'rgb(132 131 59) 1px 1px 3px',borderRadius:'50px'}} />
              <span className="absolute text-sm text-[#fff] font-extrabold">{level < MAX_LEVEL ? "Next Level" : "Finish"}</span>
            </button>
            <button
              className="relative px-5 py-3 rounded-xl  font-semibold   flex justify-center items-center"
              onClick={() => { setCards([]); setRevealed({}); setCross({}); setLock(false); replayLevelRef.current = level; setScreen("game"); }}
            >
              <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/showLevel.png" alt="level" className="w-[8rem]  object-contain relative " style={{boxShadow:'#5b5b84 1px  1px 3px',borderRadius:'50px'}} />
              
               <span className="absolute text-sm text-[#fff] font-extrabold">Replay Level</span>
            </button>
            </div>
          {/* </div> */}
        </div>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="" style={fullScreenStyle}>
      {/* showing the daily limit */}
      {
       true &&(
        <div className="  bg-black/80 absolute w-[100%] mx-auto h-full z-50 flex justify-center items-center">
          <div className="w-[50%] h-[auto] bg-white mx-auto rounded-lg p-[1rem]" style={{background:" #2A7B9B"
                ,background: "linear-gradient(90deg, rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%)"}}>
            <div className="flex justify-center items-center flex-col gap-[1.5rem]">
            <h2 className="text-center text-lg md:text-xl from-neutral-50  drop-shadow">Daily limit is over! Come back tomorrow 🎉<br />
                   Keep practicing and your brain will grow stronger every day! 💡✨</h2>
             <Button/>
            </div>
          </div>
        </div>
       )
      }
      <div className="absolute inset-0 bg-white/90"></div>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center">
            <button className="px-4 py-2 md:px-6 md:py-3 rounded-lg  flex justify-center items-center text-slate-700" onClick={() => setScreen("title")}>
              <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/home.png" alt="level" className="w-[6rem] h-[8rem] object-contain relative"  />
            <span className="absolute text-sm text-[#fff] font-extrabold">Home</span>
            </button>
            {/* Large level badge only */}
            <div className="px-4 py-2 md:px-6 md:py-3 rounded-2xl flex justify-center items-center text-amber-900  text-xl md:text-2xl font-extrabold">
              <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/showLevel.png" alt="level" className="w-[6rem] h-[8rem] object-contain relative"  />
              <span className="absolute text-sm text-[#fff]">Level {level}</span></div>
          </div>
          <div className="flex items-center gap-3">
            {/* <div className="px-3 py-2 rounded-lg bg-white shadow text-slate-700">Time: <b>{elapsed}s</b></div> */}
            <button className="px-4 py-2 md:px-6 md:py-3 rounded-lg  flex justify-center items-center text-slate-700" onClick={() => startLevel()}>
              <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/home.png" alt="level" className="w-[6rem] h-[8rem] object-contain relative"  />
              <span className="absolute text-sm text-[#fff] font-extrabold">↻ Reset</span></button>
          </div>
        </div>

        {/* Two rows × five; each 330x230 */}
        {/* grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 */}
        <div className="flex flex-row flex-wrap gap-[1.5rem] justify-center items-center w-[100%]">
          {cards.map((c, idx) => {
            const isUp = revealed[c.id] || c.matched;
            // console.log(isUp,"isUp")
            const style = {
              width: 200,
              height: 200,
              backgroundColor: isUp ? c.color : CARD_BACK,
              borderColor: isUp ? c.color : "#1f2a44",
              // backgroundImage:'url(./bgPuzzle.webp)'
            };
            return (
              <button
                key={c.id}
                onClick={() =>{
                  onCardClick(idx)
                }}
        
                // onChange={()=>setIsFlipped(!isFlipped)}
                disabled={lock || c.matched}
                style={style}
                className={`relative rounded-[24px] shadow-md border-2 transition-transform ${lock ? "cursor-not-allowed" : "cursor-pointer"} ${c.matched ? "ring-2 ring-emerald-400 bg-[#9bff9b]" : ""}`}
              >
               { c.matched&&(
                <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/rightAnswer.png" alt="right" className="absolute z-10 w-[40px] h-[40px] mx-auto  right-[0.5rem] top-[0.5rem]" />)}
                <motion.div
                   animate={{ rotateY: isUp ? 180 : 0 }}
                   transition={{ duration: 0.6 }}
                   style={{
                     width: "100%",
                     height: "100%",
                     position: "relative",
                     transformStyle: "preserve-3d",
                          }}
                        >
                  <div
                  style={{
                     position: "absolute",
                     width: "100%",
                     height: "100%",
                     backfaceVisibility: "hidden",
                     borderRadius: "24px",
                    //  backgroundColor: CARD_BACK,
                    backgroundImage:'url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/bgPuzzle.webp)',
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     backgroundSize: "cover",      // or "contain"
                     backgroundPosition: "center",
                     backgroundRepeat: "no-repeat",
                     }}
                   >
                 {/* <span className="text-4xl opacity-40">★</span> */}
                 <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/stars.png" alt="★" className="w-[100px] h-[70px]" />
                  </div>
                    <div
                   style={{
                     position: "absolute",
                     width: "100%",
                     height: "100%",
                     backfaceVisibility: "hidden",
                     transform: "rotateY(180deg)", 
                     borderRadius: "24px",
                     backgroundColor: c.matched ? "#9bff9b" : cross[c.id]?'#FFB8B8': c.color,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                   }}
                   >
                     <span className="text-3xl font-extrabold text-slate-900">{c.word}</span>
                   </div>
                {/* )} */}
                {cross[c.id] && (
                  <div className="absolute inset-0 grid place-items-center bg-red-500/20 rounded-[24px]">
                    <span className="text-6xl font-extrabold text-red-600">
                      <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/wrongAnswer.png" alt="wrong" className="absolute w-[40px] h-[40px] mx-auto  left-[0.5rem] top-[0.5rem]" />
                    </span>
                  </div>
                )}
              </motion.div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
