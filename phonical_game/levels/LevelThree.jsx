import React, { useEffect, useMemo, useRef, useState } from "react";
import UseVoice from "../UseVoice";
import { motion } from "framer-motion";
import HomeBack from "../HomeBack";

const UPPER = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

const GRAD = [
  "from-orange-400 to-amber-500",
];

const Uppercase = ["from-[#a9a9a9] to-[#a9a9a9]"];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function LevelThree({onGoHome,timeSpent,comp}) {
  
  useEffect(() => {
  // console.log("timeSpentthree", timeSpent);
}, [timeSpent]);

  const { say } = UseVoice();

  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState({});

  const [round, setRound] = useState(null);


  
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

  // Function to create a new round
  const createRound = () => {
    const picked = shuffle(UPPER).slice(0, 8);
    setRound({ uppers: picked, lowers: picked.map((u) => u.toLowerCase()) });
    setMatched({});
    setScore(0);
  };

  // Initialize the round on first render
  useEffect(() => {
    createRound();
  }, []);

  const lowers = useMemo(
    () => (round ? shuffle(round.lowers) : []),
    [round]
  );

  const onDrop = (lower, upper) => {
    if (lower.toUpperCase() === upper) {
      setMatched((m) => ({ ...m, [upper]: true }));
      setScore((s) => s + 1);
      say("Great job!");
    }
  };

  const playAgain = () => {
    createRound();
  };

  if (!round) return null;

  // Show HomeBack when round is completed
  if (Object.keys(matched).length === round.uppers.length) {
    return (
      <div className="h-[calc(100vh-56px)] flex flex-col items-center justify-center">
        <HomeBack playAgain={playAgain} onGoHome={onGoHome} timeSpent={timeSpent} component={comp}/>
      </div>
    );
  }

  return (
    <div className="h-auto xl:h-[calc(100vh-56px)] px-4 pb-6">
      {/* HEADER */}
      <div className="sticky top-0 z-20 p-[1rem] flex items-center justify-between bg-white/70 backdrop-blur-lg rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl font-bold">
            Score: {score}
          </div>
          {/* <div className="px-4 py-2 bg-sky-100 text-sky-600 rounded-xl font-bold">
            Round 1/1
          </div> */}
        </div>
      </div>

      <div className="myGrid_data">
        <style jsx>{`
    .myGrid_data {
      display: grid;
      width: 100%;
      gap: 1.5rem;
      grid-template-columns: 1fr;
    }

    @media (min-width: 1030px) {
      .myGrid_data {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `}</style>
        {/* UPPER SECTION */}
        <div
          className={`p-4 rounded-xl border-4 transition-all duration-300 shadow-xl ${
            Object.keys(matched).length === round.uppers.length
              ? "border-yellow-400 shadow-yellow-300/60"
              : ""
          }`}
        >
          <div className="mb-3 text-center font-extrabold text-purple-600 text-2xl tracking-wide">
            UPPERCASE
          </div>

          <div className="grid grid-cols-4 gap-[2rem]">
            {round.uppers.map((U, i) => (
              <motion.div
                key={U}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e.dataTransfer.getData("text/plain"), U)}
                className={`relative grid aspect-square place-items-center rounded-3xl bg-gray-600 ${
                  Uppercase[i % Uppercase.length]
                } text-[1.5rem] md:text-3xl font-extrabold text-white shadow-xl transition-all duration-300 hover:scale-105 ${
                  matched[U]
                    ? " !text-white  border-[0.4rem] border-green-600 bg-green-600 scale-105"
                    : ""
                }`}
              >
                <span>{U}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* LOWER SECTION */}
        <div
          className={`p-4 rounded-3xl border-4 transition-all duration-300 shadow-xl ${
            Object.keys(matched).length === round.uppers.length
              ? "border-yellow-400 shadow-yellow-300/60"
              : ""
          }`}
        >
          <div className="mb-3 text-center font-extrabold text-emerald-600 text-2xl tracking-wide">
            LOWERCASE (Drag & Match)
          </div>

          <div className="grid grid-cols-4 gap-[2rem]">
            {lowers.map((l, i) => (
              <motion.div
                key={l}
                draggable
                whileDrag={{ scale: 1.15 }}
                whileHover={{ scale: 1.08 }}
                onDragStart={(e) => e.dataTransfer.setData("text/plain", l)}
                className={`grid aspect-square place-items-center rounded-3xl bg-gradient-to-br ${
                  GRAD[(i + 3) % GRAD.length]
                } text-[1.5rem] md:text-3xl font-extrabold text-white cursor-grab shadow-xl active:scale-90`}
              >
                {l}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelThree;

