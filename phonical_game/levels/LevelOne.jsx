import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import Tile from "../Tile";
import { Star } from "lucide-react";
import HomeBack from "../HomeBack";
import UseVoice from "../UseVoice";

const pick = (a) => a[Math.floor(Math.random() * a.length)];
function LevelOne({  letters, label,onGoHome, timeSpent,  
  stopTimer,comp } ) {

  useEffect(() => {
  // console.log("timeSpentone", timeSpent);
}, [timeSpent]);

  const { say } = UseVoice();
  const [target, setTarget] = useState(pick(letters));
  // const [attempts, setAttempts] = useState(2);
  const [score, setScore] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [star, setStar] = useState(null);
  const [shake, setShake] = useState(false);
  const [finishTask,setFinishTask]=useState(false)

 const playAgain = () => {
  setFinishTask(false);
  setScore(0);
  setReveal(false);
  setStar(null);

  const newLetter = pick(letters);
  setTarget(newLetter);
  say(newLetter);
};
  useEffect(() => {
    say(target);
  }, []);

useEffect(() => {
  if (score > 2) {
    setFinishTask(true);
  }
}, [score]);


  const play = () => say(target);

  const next = () => {
    const n = pick(letters.filter((x) => x !== target));
    setTarget(n);
    setReveal(false);
    say(n);
  };

  const choose = (ch) => {
    if (reveal) return;
    if (ch === target) {
  say("Great job!");

  setScore((s) => {
    const newScore = s + 1;

    if (newScore > 2) {
      setFinishTask(true);
    }

    return newScore;
  });

  setStar(Date.now());

  setTimeout(() => {
    setStar(null);
    if (score + 1 <= 2) {
      next();
    }
  }, 900);
}
 else {
      setShake(true);
      setTimeout(() => setShake(false), 350);
      say("Try again!");
      
    }
  };

  const labelRef = useRef(comp);
const timeSpentRef = useRef(timeSpent);

useEffect(() => {
  labelRef.current = comp;
}, [comp]);

useEffect(() => {
  timeSpentRef.current = timeSpent;
}, [timeSpent]);


useEffect(() => {
  const btn = document.getElementById("closing-btn-phonics");

  const onClick = () => {
    if (typeof window.sendingTimespentPhonics === "function") {
      const formdata = new FormData();
      formdata.append("level_name", labelRef.current);
      formdata.append("timespent", timeSpentRef.current);

      window.sendingTimespentPhonics(formdata);
    } else {
      console.log("not found sendingTimespentPhonics function");
    }
  };

  if (btn) btn.addEventListener("click", onClick);

  return () => {
    if (btn) btn.removeEventListener("click", onClick);
  };
}, []); 



  return (
    <>
    {
        finishTask?(<>
        <HomeBack playAgain={playAgain} onGoHome={onGoHome} timeSpent={timeSpent} component={label}/>
        </>):(<>
    <div
      className="h-full xl:h-[70vh] px-4 py-6 flex flex-col items-center bg-gradient-to-b from-blue-200 via-pink-100 to-yellow-100"
      style={{ backgroundSize: "cover" }}
    >
      {/* Controls */}
      <div className="flex items-center justify-center gap-3 py-4 ">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={play}
          className="rounded-2xl bg-pink-400 px-6 py-3 text-white text-lg font-bold shadow-lg hover:bg-pink-500"
        >
         Play Again
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={next}
          className="rounded-2xl bg-blue-400 px-6 py-3 text-white text-lg font-bold shadow-lg hover:bg-blue-500"
        >
           New Letter
        </motion.button>
      </div>

      <div className="text-slate-700 font-semibold mb-3 text-lg">
        {label}
      </div>

      {/* Letter Grid */}
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="mx-auto grid w-[70%]  grid-cols-[repeat(auto-fit,minmax(70px,1fr))] gap-4 p-4"
      >
        {letters.map((L, i) => (
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            key={L}
            onClick={() => choose(L)}
            className={`
              cursor-pointer flex justify-center items-center 
              text-4xl font-extrabold rounded-3xl 
              shadow-lg p-6 
              transition-all select-none
              ${
                reveal && L === target
                  ? "bg-yellow-300 ring-4 ring-yellow-500"
                  : "bg-white"
              }
            `}
            style={{
              background: `linear-gradient(135deg,
                hsl(${i * 30}, 90%, 80%),
                hsl(${i * 30}, 90%, 65%)
              )`,
              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
            }}
          >
            {L}
          </motion.div>
        ))}
      </motion.div>

      {/* Star Animation */}
      <AnimatePresence>
        {star && (
          <motion.div
            key="star"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-10 right-10 text-yellow-400"
          >
            <Star size={80} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
        </>)
    }

    </>

  );
}

export default LevelOne;
