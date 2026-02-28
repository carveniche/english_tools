import React, { useEffect, useMemo, useRef, useState } from "react";
import StarsRow from "./StarsRow";
import Confetti from "./Confite";
import TitleScreen from "./TitleScreen";
import Loader from "./Loader";
import ForestDropdown from "./DropDown.jsx";
import DailyLimitCard from "./DailyLimitCard.jsx";
import "./WordSearch.css";
import {
  buildPath,
  useViewportSize,
  generatePuzzleFromSet,
  ROWS,
  FOUND_COLORS,
  COLS,
  shuffle,
} from "./buildPath.js";
// ======== Config ========

const CARD_GRADS = [
  // "linear-gradient(135deg,#fef3c7,#fde68a)",
];

// ======== Test Data for Testing Purposes ========
const testDataSet = {
  word_list: [
    {
      data_set_id: 1,
      words: ["VOCABULARY", "DATASET","RACER",'DRIVER','SUBSTANCE','VOLLEYBALL','PILOT','HELICOPTER'],
    },
  ],
};

// ======== Utils ========

// ======== Component ========
export default function WordSearchA1() {
  const [screen, setScreen] = useState("title");
  const [handleBack, setHandleBack] = useState(false);
  const [levelIdx, setLevelIdx] = useState(0);
  const [toolData, setToolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSet, setCurrentSet] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [found, setFound] = useState(() => new Set());
  const [rings, setRings] = useState([]);
  const [drag, setDrag] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  const [storingTime, setStoringTime] = useState(0);
  const timerRef = useRef(null);
  const storingRef = useRef(0);
  const toolDataRef = useRef(null);



  // const [seconds, setSeconds] = useState(0);
  const [timespentSubmitted, setTimespentSubmitted] = useState(false);
  // const elapsedRef = useRef(0); // keeps the precise ms time
  // const timerIntervalRef = useRef(null);
// const startTimeRef = useRef(null);
  // const [timerActive, setTimerActive] = useState(false); // controls interval
  // const [elapsed, setElapsed] = useState(0); // optional, for UI display
  const [selectedLevel, setSelectedLevel] = useState(
    currentSet?.word_list?.[0]?.level || "Easy",
  );
  // console.log(storingRef,"elapsedRef")

// START TIMER

const startTimer = () => {
  if (timerRef.current) return;

  timerRef.current = setInterval(() => {
    storingRef.current += 1; 
    setStoringTime(storingRef.current);
  }, 1000);
};

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const restartTimer = () => {
    stopTimer();
    storingRef.current = 0;
    setStoringTime(0);
    startTimer(); 
  };

  useEffect(() => {
    if (currentSet?.word_list?.[0]?.level) {
      setSelectedLevel(currentSet.word_list[0].level);
    }
  }, [currentSet]);

  // const handleLevelChange = async (level) => {
  //   if (!currentSet) return;
  //   setSelectedLevel(level); // update dropdown UI
  //   setLoading(true);

  //   const currentDataSetId = currentSet.word_list[0].data_set_id;
  //   const timespentSec = Math.round(elapsedRef.current / 1000);
  //   try {
  //     submitTimespent(
  //       currentDataSetId,
  //       timespentSec,
  //       currentSet.word_list[0].level,
  //       celebrate ? "completed" : "inprogress",
  //     );
  //     const newData = await fetchNewWords(
  //       currentDataSetId,
  //       // currentSet.word_list[0].level,
  //       level,
  //       "dropdown",
  //     );
  //     // level
  //     if (newData) {
  //       setCurrentSet(newData);
  //       setPuzzle(generatePuzzleFromSet(newData.word_list[0].words));
  //       setFound(new Set());
  //       setRings([]);
  //       // setElapsed(0);
  //       setTimespentSubmitted(false);
  //       // setTimerActive(true);
  //        restartTimer();
  //     }
  //   } catch (err) {
  //     console.error("Error updating puzzle with new level:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
 
//  const handleLevelChange = async (level) => {
//   if (!currentSet) return;

//   stopTimer();  // 🔥 stop previous timer

//   setSelectedLevel(level);
//   setLoading(true);

//   const currentDataSetId = currentSet.word_list[0].data_set_id;
//   // const timespentSec = Math.floor(elapsedRef.current / 1000);
// const timespentSec = storingRef.current;



//   const newData = await fetchNewWords(
//     currentDataSetId,
//     level,
//     "dropdown",
//   );

  

//   if (newData) {
//     setCurrentSet(newData);
//     setPuzzle(generatePuzzleFromSet(newData.word_list[0].words));
//     setFound(new Set());
//     setRings([]);
//     setTimespentSubmitted(false);
//     setCelebrate(false);

//     restartTimer(); // 🔥 clean restart
//   }

//   setLoading(false);
// };
const handleLevelChange = async (level) => {
  if (!currentSet) return;

  stopTimer();  // stop previous timer

  const currentDataSetId = currentSet.word_list[0].data_set_id;
  const previousLevel = currentSet.word_list[0].level;
  const timespentSec = storingRef.current;

  // 🔥 FIRST submit previous level progress
  submitTimespent(
    currentDataSetId,
    timespentSec,
    previousLevel,
    celebrate ? "completed" : "inprogress"
  );

  setSelectedLevel(level);
  setLoading(true);

  // 🔥 THEN fetch new level words
  const newData = await fetchNewWords(
    currentDataSetId,
    level,
    "dropdown"
  );

  if (newData) {
    setCurrentSet(newData);
    setPuzzle(generatePuzzleFromSet(newData.word_list[0].words));
    setFound(new Set());
    setRings([]);
    setCelebrate(false);
    setTimespentSubmitted(false);

    restartTimer();  // reset + start new level timer
  }

  setLoading(false);
};

  const { w: vw, h: vh } = useViewportSize();
  const isMobile = vw < 640;
  const isTablet = vw >= 640 && vw < 1010;
  const padding = 16,
    gap = 12,
    timeBar = 28;
  const sideW = isMobile
    ? vw - padding * 2
    : isTablet
      ? 200
      : Math.max(220, Math.min(320, Math.floor(vw * 0.26)));
  const availW = isMobile ? vw - padding * 2 : vw - padding * 2 - sideW - gap;
  const availH = vh - padding * 2 - timeBar;

  const cellPx = Math.floor(Math.min(availW / COLS, availH / ROWS));
  const boardW = cellPx * COLS;
  const boardH = cellPx * ROWS;
  const hasValidData = toolData && toolData.word_list?.[0]?.words?.length > 0;
  // useEffect(() => {
  //   if (!timerActive) return;

  //   const id = setInterval(() => {
  //     setElapsed((prev) => {
  //       const newElapsed = prev + 100;
  //       elapsedRef.current = newElapsed;
  //       return newElapsed;
  //     });
  //   }, 100);

  //   return () => clearInterval(id);
  // }, [timerActive]);

//   useEffect(() => {
//   if (!timerActive) return;

//   const startTime = Date.now() - elapsedRef.current;

//   const id = setInterval(() => {
//     const newElapsed = Date.now() - startTime;
//     elapsedRef.current = newElapsed;
//     setElapsed(newElapsed);
//   }, 100);

//   return () => clearInterval(id);
// }, [timerActive]);

  const correctAudio = useMemo(
    () =>
      new Audio(
        "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/correct-answer.mp3",
      ),
    [],
  );

  useEffect(() => {
    correctAudio.load();
  }, [correctAudio]);

  // Initialize puzzle with testDataSet or backend data via window.wordSearchTool
  // useEffect(() => {
  //   window.wordSearchTool = (data) => {
  //     console.log("window.wordSearchTool received data:", data);
  //     if (
  //       data &&
  //       data.data_set &&
  //       Array.isArray(data.data_set) &&
  //       data.data_set[0] &&
  //       data.data_set[0].word_list &&
  //       Array.isArray(data.data_set[0].word_list) &&
  //       data.data_set[0].word_list[0]?.words?.length > 0
  //     ) {
  //       const filteredData = {
  //         word_list: [
  //           {
  //             ...data.data_set[0].word_list[0],
  //             words: data.data_set[0].word_list[0].words.filter(
  //               (word) => word.length <= 10,
  //             ),
  //           },
  //         ],
  //       };
  //       setToolData(filteredData);
  //       setCurrentSet(filteredData);
  //       setPuzzle(generatePuzzleFromSet(filteredData.word_list[0].words));
  //       setLoading(false);
  //     } else {
  //       console.error("Invalid toolData structure:", data);
  //       setToolData(null);
  //       setCurrentSet(null);
  //       setPuzzle(null);
  //       setLoading(false);
  //     }
  //   };
  //   return () => {
  //     window.wordSearchTool = undefined;
  //   };
  // }, []);
  useEffect(() => {
  window.wordSearchTool = (data) => {
    console.log("window.wordSearchTool received data:", data);

    const words = data?.data_set?.[0]?.word_list?.[0]?.words;

    if (Array.isArray(words) && words.length > 0) {
      const filteredWords = words.filter((word) => word.length <= 10);

      const filteredData = {
        word_list: [
          {
            ...data.data_set[0].word_list[0],
            words: filteredWords,
          },
        ],
      };

      // ✅ Update ref immediately (no timing issue)
      toolDataRef.current = filteredData;

      // ✅ Now safely generate puzzle from ref
      const puzzleData = generatePuzzleFromSet(
        toolDataRef.current.word_list[0].words
      );

      setToolData(filteredData);
      setCurrentSet(filteredData);
      setPuzzle(puzzleData);
      setLoading(false);
    } else {
      console.error("Invalid toolData structure:", data);

      toolDataRef.current = null;

      setToolData(null);
      setCurrentSet(null);
      setPuzzle(null);
      setLoading(false);
    }
  };

  return () => {
    window.wordSearchTool = undefined;
  };
}, []);


  // Update puzzle when level changes
  useEffect(() => {
    if (!toolData || !hasValidData || !currentSet) return;
    setPuzzle(generatePuzzleFromSet(currentSet.word_list[0].words));
    setFound(new Set());
    setRings([]);
    // setElapsed(0);
    setCelebrate(false);
    setTimespentSubmitted(false);
    setHandleBack(false);
    setLoading(false);
  }, [toolData, levelIdx, currentSet, hasValidData]);

 

  // Check if puzzle is finished
  const finished = useMemo(
    () =>
      puzzle && puzzle.words.length > 0 && found.size === puzzle.words.length,
    [puzzle, found],
  );


useEffect(() => {
  if (!finished || timespentSubmitted) return;

  stopTimer(); 

  setHandleBack(true);
  setCelebrate(true);

  const level = currentSet?.word_list?.[0]?.level;
  const currentDataSetId = currentSet?.word_list?.[0]?.data_set_id;

  if (currentDataSetId) {
    const timespentSec = storingRef.current;
    submitTimespent(currentDataSetId, timespentSec, level, "completed");
    setTimespentSubmitted(true);
  }
}, [finished]);


  const submitTimespent = (
    data_set_id,
    timespent,
    level,
    status = "completed",
  ) => {
    const formData = new FormData();
    formData.append("data_set_id", data_set_id);
    formData.append("level", level);
    formData.append("status", status);
    formData.append("timespent", String(timespent)); // send seconds

    try {
      window.wordsearchtimespent(formData);
      // console.log("Timespent submitted:", {
      //   data_set_id,
      //   timespent,
      //   status,
      //   level,
      // });
    } catch (err) {
      console.error("Error submitting timespent:", err);
    }
  };

  // const fetchNewWords = async (data_set_id, level, at_from) => {
  //   setLoading(true);
    
  //   try {
  //     const formData = new FormData();
  //     formData.append("data_set_id", data_set_id);
  //     formData.append("level", level);
  //     // formData.append("status", at_from? celebrate?"completed": 'inprogress':'completed');
  //     formData.append(
  //       "status",
  //       at_from === "dropdown"
  //         ? celebrate
  //           ? "completed"
  //           : "inprogress"
  //         : "completed",
  //     );

  //     const backendData = await window.gettingWordSearchData(formData);

  //     console.log("Backend response received:", backendData);

  //     if (
  //       backendData &&
  //       backendData.word_list &&
  //       backendData.word_list[0]?.words?.length > 0
  //     ) {
  //       const filteredData = {
  //         word_list: [
  //           {
  //             ...backendData.word_list[0],
  //             words: backendData.word_list[0].words.filter(
  //               (word) => word.length <= 10,
  //             ),
  //           },
  //         ],
  //       };

  //       // ✅ directly update state here
  //       setToolData(filteredData);
  //       setCurrentSet(filteredData);

  //       return filteredData; // ✅ return fresh data
  //     } else {
  //       throw new Error("No valid data received");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching new words:", err);
  //     return null;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

    // const handleNextLevel = async () => {
    //   if (!currentSet) {
    //     console.error("No currentSet available");
    //     setLoading(false);
    //     return;
    //   }
    // // setTimerActive(false);
    //   setLoading(true);
    //   setCelebrate(false);
    //   setTimespentSubmitted(false);

    //   const level = currentSet.word_list[0].level;
    //   const currentDataSetId = currentSet.word_list[0].data_set_id;

    //   const newData = await fetchNewWords(currentDataSetId, level);

    //   if (newData) {
    //     setLevelIdx((prev) => prev + 1);
    //     setFound(new Set());
    //     setRings([]);
    //     // setElapsed(0);
    //     // setSeconds(0);
    //     // setTimerActive(true);
    //     restartTimer();
    //     setHandleBack(false);
    //   }
    //   setLoading(false);
    // };
const fetchNewWords = async (data_set_id, level) => {
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("data_set_id", data_set_id);
    formData.append("level", level);
    formData.append("status", "completed");

    const backendData = await window.gettingWordSearchData(formData);

    console.log("Backend response:", backendData);

    if (
      backendData?.data_set?.[0]?.word_list?.[0]?.words?.length > 0
    ) {
      const filteredData = {
        word_list: [
          {
            ...backendData.data_set[0].word_list[0],
            words: backendData.data_set[0].word_list[0].words.filter(
              (word) => word.length <= 10
            ),
          },
        ],
      };

      setToolData(filteredData);
      setCurrentSet(filteredData);

      return filteredData;
    } else {
      throw new Error("No valid data received");
    }
  } catch (err) {
    console.error("Error fetching new words:", err);
    return null;
  } finally {
    setLoading(false);
  }
};

//     const handleNextLevel = async () => {
//   if (!currentSet) return;
//   setLoading(true);
//   setCelebrate(false);
//   setTimespentSubmitted(false);

//   const level = currentSet.word_list[0].level;
//   const currentDataSetId = currentSet.word_list[0].data_set_id;

//   const newData = await fetchNewWords(currentDataSetId, level);

//   if (newData) {
//     setLevelIdx((prev) => prev + 1);
//     setFound(new Set());
//     setRings([]);
//     setHandleBack(false);

//     restartTimer(); // ✅ clean restart
//   }

//   setLoading(false);
// };

const handleNextLevel = async () => {
  if (!currentSet) return;

  setLoading(true);
  setCelebrate(false);
  setTimespentSubmitted(false);

  const level = currentSet.word_list[0].level;
  const currentDataSetId = currentSet.word_list[0].data_set_id;

  const newData = await fetchNewWords(currentDataSetId, level);

  if (newData && newData.word_list?.[0]?.words?.length > 0) {
    // ✅ Valid new puzzle
    setLevelIdx((prev) => prev + 1);
    setFound(new Set());
    setRings([]);
    setHandleBack(false);
    restartTimer();
  } else {
    // 🔥 No words returned → trigger DailyLimitCard
    setToolData(null);
    setCurrentSet(null);
    setPuzzle(null);
  }

  setLoading(false);
};
const handleCloseButton = () => {
  if (!currentSet) return;

  stopTimer();  // ✅ stop timer

  const level = currentSet.word_list[0].level;
  const currentDataSetId = currentSet.word_list[0].data_set_id;

  if (!handleBack && !timespentSubmitted) {
    // const timespentSec = Math.floor(elapsedRef.current / 1000);
    const timespentSec = storingRef.current;
    submitTimespent(currentDataSetId, timespentSec, level, "inprogress");
  }

  setScreen("title");
};

  useEffect(() => {
    const closeButton = document.getElementById("closing-btn-in-rails");
    if (closeButton) {
      console.log(
        "Attaching listener - handleBack:",
        handleBack,
        "timespentSubmitted:",
        timespentSubmitted,
      );
      closeButton.addEventListener("click", handleCloseButton);
    }
    return () => {
      if (closeButton) {
        closeButton.removeEventListener("click", handleCloseButton);
      }
    };
  }, [currentSet, handleBack, timespentSubmitted]);

  const onDown = (r, c) =>
    setDrag({ active: true, start: { r, c }, end: { r, c } });
  const onEnter = (r, c) =>
    setDrag((d) => (d?.active ? { ...d, end: { r, c } } : d));
  const onUp = () => {
    if (!drag?.active || !puzzle) return;
    const { start, end } = drag;
    if (!start || !end) {
      setDrag(null);
      return;
    }
    const isStraight = start.r === end.r || start.c === end.c;
    const isDiag = Math.abs(start.r - end.r) === Math.abs(start.c - end.c);
    const forward = end.r >= start.r;

    if ((isStraight || isDiag) && forward) {
      const path = buildPath(start, end);
      const text = path.map(({ r, c }) => puzzle.grid[r][c]).join("");
      const hit = puzzle.words.find((w) => !found.has(w) && w === text);
      if (hit) {
        const colorIndex = found.size;
        const wordColor = FOUND_COLORS[colorIndex % FOUND_COLORS.length];
        setFound((s) => new Set([...s, hit]));
        correctAudio.currentTime = 0;
        correctAudio
          .play()
          .catch((err) => console.error("Correct audio error:", err));
        if (isDiag) {
          setRings((rs) => [
            ...rs,
            ...path.map(({ r, c }, i) => ({
              x: c,
              y: r,
              w: 1,
              h: 1,
              id: `diag-${hit}-${i}-${r}-${c}`,
              color: wordColor,
            })),
          ]);
        } else {
          const x = Math.min(start.c, end.c),
            y = Math.min(start.r, end.r);
          const w = start.r === end.r ? path.length : 1,
            h = start.c === end.c ? path.length : 1;
          setRings((rs) => [
            ...rs,
            {
              x,
              y,
              w,
              h,
              id: `rect-${x}-${y}-${w}-${h}-${hit}`,
              color: wordColor,
            },
          ]);
        }
      }
    }
    setDrag(null);
  };

  const dragCells = useMemo(
    () => (drag?.active && puzzle ? buildPath(drag.start, drag.end) : []),
    [drag, puzzle],
  );
  // testing
  // useEffect(() => {
  //   setLoading(true);

  //   // Set up the callback immediately
  //   window.wordSearchTool = (data) => {
  //     console.log("Received data:", data);

  //     // Handle both possible data structures
  //     let words = [];

  //     if (data?.data_set?.[0]?.word_list?.[0]?.words) {
  //       words = data.data_set[0].word_list[0].words;
  //     } else if (data?.word_list?.[0]?.words) {
  //       words = data.word_list[0].words;
  //     }

  //     if (words.length > 0) {
  //       const filteredData = {
  //         word_list: [
  //           {
  //             data_set_id: 1,
  //             words: words.filter((word) => word && word.length <= 10),
  //           },
  //         ],
  //       };

  //       setToolData(filteredData);
  //       setCurrentSet(filteredData);
  //       setPuzzle(generatePuzzleFromSet(filteredData.word_list[0].words));
  //     } else {
  //       // Fallback to test data
  //       // setToolData(testDataSet);
  //       // setCurrentSet(testDataSet);
  //       // setPuzzle(generatePuzzleFromSet(testDataSet.word_list[0].words));
  //     }

  //     setLoading(false);
  //   };

  //   // For testing, use test data immediately
  //   window.wordSearchTool(testDataSet);

  //   return () => {
  //     window.wordSearchTool = undefined;
  //   };
  // }, []);
  return (
    <div
      style={{
        width: "100%",
        height: isMobile ? "85vh" : isTablet ? "60vh" : "85vh",
        overflow: isMobile ? "scroll" : "hidden",
        borderRadius: "10px",
        // backgroundImage: "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/forestBg.jpg)",
        backgroundImage:
          "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/phonicsBgLeter.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
      onMouseUp={onUp}
      onTouchEnd={(e) => {
        e.preventDefault();
        onUp();
      }}
    >
      {!loading && !hasValidData && <DailyLimitCard />}
      {loading && <Loader />}
      {!loading && hasValidData && screen === "title" && (
        <TitleScreen
          // onStart={() => {
          //   setElapsed(0);
          //   elapsedRef.current = 0; // reset ref
          //   setTimespentSubmitted(false);
          //   setHandleBack(false);
          //   setTimerActive(true); // start timer
          //   setScreen("play");
          // }}
//           onStart={() => {
//   elapsedRef.current = 0;
//   setTimespentSubmitted(false);
//   setHandleBack(false);
//   setScreen("play");
//   startTimer();   // ✅ start here
// }}
onStart={() => {
  restartTimer();     // reset to 0
  setTimespentSubmitted(false);
  setHandleBack(false);
  setScreen("play");
  // startTimer();       // start fresh
}}


        />
      )}
      {!loading &&
        hasValidData &&
        puzzle &&
        currentSet &&
        screen === "play" && (
          <>
            <div
              style={{
                zIndex: "1000",
                position: "absolute",
                top: "3px",
                right: "3px",
              }}
              // className="absolute top-[0px] left-[3px] rounded-[10px] z-10"
            >
              <ForestDropdown
                selectedOption={selectedLevel}
                onChange={handleLevelChange}
              />
            </div>
            <div
              style={{
                position: "relative",
                padding,
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "1rem",
                justifyContent: isMobile ? "start" : "center",
                alignItems: "center",
              }}
            >
              <div
                className="relative rounded-xl flex gap-[0.1rem]"
                style={{
                  width: isMobile ? "100%" : boardW * 0.8,
                  height: isMobile
                    ? "70%"
                    : isTablet
                      ? boardH * 1
                      : boardH * 0.8,
                  backgroundImage:
                    "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/wordBg.jpg)",
                  display: "grid",
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                  padding: "1rem",
                }}
                onMouseLeave={() => setDrag(null)}
              >
                {Array.from({ length: ROWS }).map((_, r) =>
                  Array.from({ length: COLS }).map((__, c) => {
                    const isFound = rings.some(
                      (ring) =>
                        ring.x <= c &&
                        c < ring.x + ring.w &&
                        ring.y <= r &&
                        r < ring.y + ring.h,
                    );
                    const foundRing = rings.find(
                      (ring) =>
                        ring.x <= c &&
                        c < ring.x + ring.w &&
                        ring.y <= r &&
                        r < ring.y + ring.h,
                    );
                    const foundColor = foundRing?.color || "#FF8652";
                    const isDraggingHere = dragCells.some(
                      (p) => p.r === r && p.c === c,
                    );
                    const letter = puzzle.grid[r][c];

                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        className="flex items-center justify-center font-bold border border-white bg-amber-800"
                        style={{
                          fontSize: "1.5rem",
                          borderRadius: "50px",
                          userSelect: "none",
                          background: isFound
                            ? foundColor
                            : isDraggingHere
                              ? "yellow"
                              : "#a56f2a",
                          color: isFound
                            ? "white"
                            : isDraggingHere
                              ? "black"
                              : "white",
                        }}
                        onMouseDown={() => onDown(r, c)}
                        onMouseMove={(e) => {
                          if (e.buttons === 1) onEnter(r, c);
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          onDown(r, c);
                        }}
                        onTouchMove={(e) => {
                          const box =
                            e.currentTarget.parentElement.getBoundingClientRect();
                          const t = e.touches[0];
                          const x = ((t.clientX - box.left) / box.width) * COLS;
                          const y = ((t.clientY - box.top) / box.height) * ROWS;
                          const rr = Math.max(
                            0,
                            Math.min(ROWS - 1, Math.floor(y)),
                          );
                          const cc = Math.max(
                            0,
                            Math.min(COLS - 1, Math.floor(x)),
                          );
                          onEnter(rr, cc);
                        }}
                      >
                        {letter}
                      </div>
                    );
                  }),
                )}
              </div>
              <div />
              <aside
                style={{
                  width: isMobile ? "90%" : sideW,
                  height: isMobile ? "400px" : boardH * 0.8,
                  marginTop: isMobile ? 12 : 0,
                  backgroundImage:
                    "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/puzzleBg.webp)",
                  borderRadius: 16,
                  padding: 10,
                  boxSizing: "border-box",
                  boxShadow: "0 8px 20px rgba(0,0,0,.12)",
                  display: "grid",
                  gridTemplateRows: "auto 1fr",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: 900,
                    marginBottom: isTablet ? 1 : 8,
                    fontSize: isTablet ? "1rem" : "1.5rem",
                    color: "white",
                    width: "100%",
                    height: 100,
                    lineHeight: "80px",
                    backgroundImage:
                      "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/board.png)",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  Word Set
                </div>
                <div
                  className="customScroll"
                  style={{
                    overflowY: "auto",
                    paddingRight: 4,
                    maxHeight: "100%",
                    scrollbarWidth: "thin",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 8,
                    }}
                  >
                    {puzzle.words.map((w, i) => (
                      <div
                        className="puzzle-words-box-styles"
                        key={w}
                        style={{
                          background: found.has(w)
                            ? "linear-gradient(135deg,#bbf7d0,#86efac)"
                            : CARD_GRADS[i % CARD_GRADS.length],
                          color: found.has(w) ? "#065f46" : "white",
                          border: found.has(w)
                            ? "2px solid #22c55e"
                            : "2px solid rgba(0,0,0,.06)",
                          textShadow: found.has(w)
                            ? "none"
                            : "0 1px 0 rgba(255,255,255,.6)",
                        }}
                      >
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
              {celebrate && (
                <div className="celebrate-style-box">
                  <Confetti />
                  <div className="start-row-style">
                    <StarsRow />
                    <button
                      onTouchStart={handleNextLevel}
                      onClick={handleNextLevel}
                      className="fancy-button-for-next-level"
                      onMouseOver={(e) => {
                        e.target.style.transform = "scale(1.1)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      🎉 Go on
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
}
