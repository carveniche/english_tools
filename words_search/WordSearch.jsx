import React, { useEffect, useMemo, useRef, useState } from "react";
import StarsRow from "./StarsRow";
import Confetti from "./Confite";
import TitleScreen from "./TitleScreen";
import Loader from "./Loader";

// ======== Config ========
const ROWS = 8;
const COLS = 12;
const GRID_TINTS = [
  "#e0f2fe", "#fce7f3", "#fef9c3", "#dcfce7", "#ede9fe",
  "#fff7ed", "#f1f5f9", "#f0fdfa", "#fae8ff", "#fee2e2"
];
const FOUND_COLORS = [
  "#FF4C4C", // vivid red
  "#FF7F50", // coral
  "#FFB347", // warm amber
  "#6AB04C", // bright olive green
  "#2980B9", // ocean blue
  "#8E44AD", // deep purple
  "#16A085", // teal
  "#F39C12"  // golden yellow
];


const CARD_GRADS = [
  // "linear-gradient(135deg,#fef3c7,#fde68a)",
];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// ======== Test Data for Testing Purposes ========


// ======== Utils ========
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

<Loader />

function generatePuzzleFromSet(words) {

  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
  const placed = [];

  const chosen = shuffle(words).slice(0, 8);
  const diagCount = Math.max(1, Math.min(2, chosen.length >= 8 ? 2 : 1));
  const diagWords = chosen.slice(0, diagCount);
  const straightWords = chosen.slice(diagCount);

  for (const w of diagWords) {
    if (!placeWord(grid, w, placed, ["diagDR", "diagDL"])) {
      console.warn(`Could not place diagonal word: ${w}, retrying with new grid`);
      return generatePuzzleFromSet(words);
    }
  }
  for (const w of straightWords) {
    if (!placeWord(grid, w, placed, ["across", "down"])) {
      console.warn(`Could not place straight word: ${w}, retrying with new grid`);
      return generatePuzzleFromSet(words);
    }
  }

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!grid[r][c]) grid[r][c] = ALPHA[Math.floor(Math.random() * 26)];

  return { grid, words: chosen, placed };
}

function placeWord(grid, word, placed, allowedDirs = ["across", "down", "diagDR", "diagDL"]) {
  const dirs = shuffle(allowedDirs);
  for (const dir of dirs) {
    let maxR = ROWS - 1, maxC = COLS - 1, minR = 0, minC = 0;
    if (dir === "down") { maxR = ROWS - word.length; }
    if (dir === "across") { maxC = COLS - word.length; }
    if (dir === "diagDR") { maxR = ROWS - word.length; maxC = COLS - word.length; }
    if (dir === "diagDL") { maxR = ROWS - word.length; minC = word.length - 1; maxC = COLS - 1; }

    if (word.length > Math.max(ROWS, COLS)) continue;

    for (let t = 0; t < 500; t++) {
      const r0 = Math.floor(Math.random() * (maxR - minR + 1)) + minR;
      const c0 = Math.floor(Math.random() * (maxC - minC + 1)) + minC;
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + (dir === "down" || dir === "diagDR" || dir === "diagDL" ? i : 0);
        const c = c0 + (dir === "across" || dir === "diagDR" ? i : 0) + (dir === "diagDL" ? -i : 0);
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) {
          ok = false;
          break;
        }
        const ch = grid[r][c];
        if (ch && ch !== word[i]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + (dir === "down" || dir === "diagDR" || dir === "diagDL" ? i : 0);
        const c = c0 + (dir === "across" || dir === "diagDR" ? i : 0) + (dir === "diagDL" ? -i : 0);
        grid[r][c] = word[i];
      }
      placed.push({ word, dir, r0, c0, len: word.length });
      return true;
    }
  }
  console.warn(`Failed to place word: ${word}`);
  return false;
}

function useViewportSize() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onR = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return vp;
}

function buildPath(a, b) {
  const path = [];
  if (!b) return path;
  if (a.r === b.r) {
    const [c1, c2] = a.c < b.c ? [a.c, b.c] : [b.c, a.c];
    for (let c = c1; c <= c2; c++) path.push({ r: a.r, c });
  } else if (a.c === b.c) {
    const [r1, r2] = a.r < b.r ? [a.r, b.r] : [b.r, a.r];
    for (let r = r1; r <= r2; r++) path.push({ r, c: a.c });
  } else if (Math.abs(a.r - b.r) === Math.abs(a.c - b.c)) {
    const steps = Math.abs(a.r - b.r);
    const dr = b.r > a.r ? 1 : -1;
    const dc = b.c > a.c ? 1 : -1;
    for (let i = 0; i <= steps; i++) path.push({ r: a.r + i * dr, c: a.c + i * dc });
  }
  return path;
}

// ======== Component ========
export default function WordSearch({ isNextQuestion, HandleNextQuestion, HandleSaveResponce, DataSet, listingData, isLiveClass, role_name, handleStartGame, isStartedGame, dragElementDataTrack, dragData, handlerClearfunction }) {
  
  const [screen, setScreen] = useState("title");
  const [handleBack, setHandleBack] = useState(false)
  const [levelIdx, setLevelIdx] = useState(0);
  const [toolData, setToolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSet, setCurrentSet] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [found, setFound] = useState(() => new Set());
  const [rings, setRings] = useState([]);
  const [drag, setDrag] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [storedTime, setStoredTime] = useState(0);
  const [storing_level_name, setlevel_data] = useState('')
  const svgRef = useRef(null);
  const { w: vw, h: vh } = useViewportSize();
  const isMobile = vw < 640;
  const isTablet = vw >= 640 && vw < 1010;
  const padding = 16,
    gap = 12,
    timeBar = 28;
  const sideW = isMobile ? vw - padding * 2 : isTablet ? 200 : Math.max(220, Math.min(320, Math.floor(vw * 0.26)));
  const availW = isMobile ? vw - padding * 2 : vw - padding * 2 - sideW - gap;
  const availH = vh - padding * 2 - timeBar;

  const cellPx = Math.floor(Math.min(availW / COLS, availH / ROWS));
  const boardW = cellPx * COLS;
  const boardH = cellPx * ROWS;
  // const level_tag =currentSet.word_list[0].level
  const hasValidData = toolData && toolData.word_list?.[0]?.words?.length > 0;
  const finalTimeRef = useRef(0);
  // Timer for elapsed time
  useEffect(() => {
    let interval;
    // console.log(timerActive, "timerActivetimerActive")
    if (timerActive) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const correctAudio = useMemo(
    () => new Audio("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/correct-answer.mp3"),
    []
  );

  
  useEffect(() => {
    // setPuzzle(ans)
    finalTimeRef.current=seconds
  }, [seconds])


  useEffect(() => {
    correctAudio.load();
  }, [correctAudio]);

  // Initialize puzzle with testDataSet or backend data via window.wordSearchTool
  useEffect(() => {
    //   setLoading(true);
    //   // For testing, initialize with testDataSet
    // console.log("kjj")
    setTimerActive(true)
    setSeconds(0)
    setToolData(DataSet);
    setCurrentSet(DataSet);

    // setPuzzle(generatePuzzleFromSet(testDataSet.word_list[0].words));
    setPuzzle(listingData)
    setLoading(false);


  }, [listingData, DataSet]);



  useEffect(() => {
    if (!toolData || !hasValidData || !currentSet) return;
    // setPuzzle(generatePuzzleFromSet(currentSet.word_list[0].words));
    setFound(new Set());
    setRings([]);
    setElapsed(0);
    setCelebrate(false);
    setLoading(false);
  }, [toolData, levelIdx, currentSet, hasValidData]);

  // Timer for game progress
  useEffect(() => {
    if (screen !== "play") return;
    const id = setInterval(() => setElapsed((e) => e + 100), 100);
    return () => clearInterval(id);
  }, [screen]);

  // Check if puzzle is finished
  const finished = useMemo(() => puzzle && puzzle?.words?.length > 0 && found.size === puzzle?.words?.length, [puzzle, found]);

  useEffect(() => {
    // console.log(finished,"finishedfinished")

    if (!finished) {
      setHandleBack(false);  // Reset only if not finished
      //  console.log(handleBack,"handleBack,1")
      return;
    }
    // console.log(handleBack,"handleBack,2")
    // console.log(timerActive,"setTimerActive")
    // console.log(finished,"finishedfinished")
    // console.log(celebrate,"1st data")
    // if (!finished) return;
    setStoredTime(seconds);
    setTimerActive(false);
    setHandleBack(true);
    setCelebrate(true);
    const level = currentSet.word_list[0].level
    const currentDataSetId = currentSet.word_list[0].data_set_id;
    // console.log("submit calling ",  seconds)
    HandleSaveResponce(currentDataSetId, seconds, level,"completed")
    submitTimespent(currentDataSetId, seconds, level);

  }, [finished]);

  const onDown = (r, c) => setDrag({ active: true, start: { r, c }, end: { r, c } });
  const onEnter = (r, c) => setDrag((d) => (d?.active ? { ...d, end: { r, c } } : d));
  const onUp = () => {
    if (role_name === "tutor") {
      // console.log("wordSearchdatatrack break")
    }
    if (!drag?.active || !puzzle) return;
    const { start, end } = drag;
    if (!start || !end) {
      setDrag(null);
      return;
    }
    if (role_name !== "tutor" && isLiveClass === true) {
      dragElementDataTrack(drag);
    }
    const isStraight = start.r === end.r || start.c === end.c;
    const isDiag = Math.abs(start.r - end.r) === Math.abs(start.c - end.c);
    const forward = end.r >= start.r;

    if ((isStraight || isDiag) && forward) {
      const path = buildPath(start, end);
      const text = path.map(({ r, c }) => puzzle.grid[r][c]).join("");
      const hit = puzzle.words.find((w) => !found.has(w) && w === text);
      if (hit) {
        const colorIndex = found.size; // Index based on find order (0-7)
        const wordColor = FOUND_COLORS[colorIndex % FOUND_COLORS.length];
        setFound((s) => new Set([...s, hit]));
        correctAudio.currentTime = 0;
        correctAudio.play().catch((err) => console.error("Correct audio error:", err));
        if (isDiag) {
          setRings((rs) => [
            ...rs,
            ...path.map(({ r, c }, i) => ({ x: c, y: r, w: 1, h: 1, id: `diag-${hit}-${i}-${r}-${c}`, color: wordColor })),
          ]);
        } else {
          const x = Math.min(start.c, end.c),
            y = Math.min(start.r, end.r);
          const w = start.r === end.r ? path.length : 1,
            h = start.c === end.c ? path.length : 1;
          setRings((rs) => [...rs, { x, y, w, h, id: `rect-${x}-${y}-${w}-${h}-${hit}`, color: wordColor }]);
        }
      }
    }
    setDrag(null);
  };

  useEffect(() => {
    if (role_name === "tutor" && isLiveClass === true && dragData) {
      // console.log(dragData,"wordSearchdatatrack")
      setDrag(dragData)


    }
  }, [dragData])

  useEffect(() => {
    if (isLiveClass === true && role_name === "tutor") {
      onUp()
    }
  }, [drag])


  const fetchNewWords = async (data_set_id, level) => {
    console.log('fetchNewWords called');
    setLoading(true);
    try {
      console.log('Creating formData');
      const formData = new FormData();
      formData.append("data_set_id", data_set_id);
      formData.append("level", level);
      formData.append("status", "completed");
      console.log("Triggering backend:", data_set_id, "status: completed");

      // For testing: Simulate backend response directly (uncomment window.wordSearchTool(mockResponse) if you want to test the callback specifically)

      console.log("Simulated window.wordSearchTool with mock response");

      // Production: Trigger backend to call window.wordSearchTool
      const backendData = await window.gettingWordSearchData(formData);
      console.log("Backend response received:", backendData);

      // Wait briefly to ensure window.wordSearchTool has processed (only needed if using callback)
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log("toolData after fetch:", toolData);
      if (toolData && toolData.word_list && toolData.word_list[0].words) {
        return toolData;
      } else {
        throw new Error("No valid data received");
      }
    } catch (err) {
      console.error("Error fetching new words:", err);
      setScreen("title");
      return null;
    } finally {
      setLoading(false);
    }
  };
  // Submit timespent
  const submitTimespent = (data_set_id, timespent, level) => {
    const formData = new FormData();
    formData.append("data_set_id", data_set_id);
    formData.append("level", level);
    formData.append("status", "completed");
    formData.append("timespent", timespent);
    try {
      window.wordsearchtimespent(formData);
      console.log("Timespent submitted:", { data_set_id, timespent, status: "completed" });
    } catch (err) {
      console.error("Error submitting timespent:", err);
    }
  };

  // Handle Next button
  const handleNextLevel = async () => {

    // if (!currentSet) {
    //   console.error("No currentSet available");
    //   setLoading(false);
    //   return;
    // }

    // setLoading(true);
    // setCelebrate(false);
    setTimerActive(true)
    setSeconds(0)
    const level = currentSet.word_list[0].level
    const currentDataSetId = currentSet.word_list[0].data_set_id;
    // console.log("handleNextLevel: Submitting timespent for data_set_id:", currentDataSetId);
    // submitTimespent(currentDataSetId, seconds,level);
    if (role_name === "tutor") {

      HandleNextQuestion(currentDataSetId, level)
    }
    // console.log("handleNextLevel: Fetching new words for data_set_id:", currentDataSetId);
    // const newData = await fetchNewWords(currentDataSetId);
    // fetchNewWords(currentDataSetId);


    // setLoading(false);
  };

  useEffect(() => {
    if (isNextQuestion) {
      // console.log(isNextQuestion, "isNextQuestion")
      if (role_name !== "tutor") {
        // console.log("sdjfksldjflskdjflksjfs")
        setTimerActive(true)
        setSeconds(0)
        handleNextLevel();
        handlerClearfunction();
      }
    }
  }, [isNextQuestion])

  const latestDataSetRef = useRef(null);

// Update ref whenever DataSet changes
useEffect(() => {
  latestDataSetRef.current = DataSet;
}, [DataSet]); 

  useEffect(() => {
    return () => {
      const latest = latestDataSetRef.current;
  
      const level = latest?.word_list?.[0]?.level;
      const currentDataSetId = latest?.word_list?.[0]?.data_set_id;
  
      // console.log("Cleanup running with latest level:", level);
  
      HandleSaveResponce(
        currentDataSetId,
        finalTimeRef.current,
        level,
        "inprogress"
      );
    };
  }, [])

  // Handle close button
  const handleCloseButton = () => {
    // setStoredTime(seconds)  // REMOVE: Already captured on finish
    console.log("Close Clicked - celebrate:", celebrate, "handleBack:", handleBack, "seconds:", seconds, "storedTime:", storedTime);
    const level_two = currentSet?.word_list?.[0]?.level
    if (!currentSet) return;
    const formData = new FormData();
    formData.append("data_set_id", currentSet.word_list[0].data_set_id);
    const status = handleBack ? "completed" : "inprogress";

    console.log("Status determined:", status, "handleBack:", handleBack);
    formData.append("status", status);
    const timespent = handleBack ? storedTime : seconds;
    console.log("timespent determined:", timespent, "handleBack:", handleBack)
    formData.append("timespent", timespent);  // FIX: Use stored value (captured on finish)
    formData.append("level", level_two);
    try {
      window.wordsearchtimespent(formData);
      console.log("Close button: Timespent submitted:", {
        data_set_id: currentSet.word_list[0].data_set_id,
        status: handleBack ? "completed" : "inprogress",  // FIX: Dynamic status in log
        timespent: storedTime,
      });
    } catch (err) {
      console.error("Error submitting timespent on close:", err);
    }
    setScreen("title");
    //  setTimerActive(false);
  };

 


  useEffect(() => {
    const closeButton = document.getElementById("closing-btn-in-rails");
    if (closeButton) {
      console.log("Attaching listener - handleBack:", handleBack);
      closeButton.addEventListener("click", handleCloseButton);
    }
    return () => {
      if (closeButton) {
        closeButton.removeEventListener("click", handleCloseButton);
      }
    };
  }, [currentSet, handleBack]);

  // const dragCells = useMemo(() => (drag?.active && puzzle ? buildPath(drag.start, drag.end) : []), [drag, puzzle]);
  const dragCells = useMemo(
    () => (drag?.active && puzzle ? buildPath(drag.start, drag.end) : []),
    [drag, puzzle]
  );
  const [avaHeight, setAvaHeight] = useState("82vh"); // initial default

  useEffect(() => {
    function updateViewportHeight() {
      // Calculate the currently visible height in vh units
      const visibleVh = (window.innerHeight);
      setAvaHeight(`${visibleVh.toFixed(2)}px`);
    }

    // updateViewportHeight(); // set on mount

    window.addEventListener("resize", updateViewportHeight);
    // window.addEventListener("orientationchange", updateViewportHeight);

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      // window.removeEventListener("orientationchange", updateViewportHeight);
    };
  }, []);

  const handleStart = () => {
    setSeconds(0);
    setTimerActive(true);
    setScreen("play");
    if (role_name === "tutor" && isLiveClass) {
      handleStartGame()
    }
  }

  useEffect(() => {
    if (isStartedGame && role_name !== "tutor" && isLiveClass) {
      handleStart()
    }
  }, [isStartedGame])
  // const isDraggingHere = dragCells.some(p => p.r === r && p.c === c);
  return (
    <div
      style={{
        width: "100%",
        height: isMobile ? "85vh" : isTablet ? "60vh" : avaHeight,
        overflow: isMobile ? "scroll" : "hidden",
        borderRadius: "10px",
        // background: "linear-gradient(135deg, #ffd6e8, #d6f0ff, #e6ffd6, #fff0d6)",
        backgroundImage: "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/forestBg.jpg)",
        position: "relative",
      }}
      onMouseUp={onUp}
      onTouchEnd={(e) => {
        e.preventDefault();
        onUp();
      }}
    >
      {loading && <Loader />}
      {!loading && !hasValidData && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0, 0, 0, 0.7)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #fceabb, #f8b500)",
              padding: 24,
              borderRadius: 16,
              textAlign: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,.15)",
              color: "#333",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
              No Data Found
            </h3>
            <p style={{ fontSize: 16 }}>
              Sorry, no puzzle data is available at the moment. Please try again later.
            </p>
          </div>
        </div>
      )}
      {!loading && hasValidData && screen === "title" && (
        <TitleScreen
          onStart={handleStart}
          isLiveClass={isLiveClass}
          role_name={role_name}

        />
      )}
      {!loading && hasValidData && puzzle && currentSet && screen === "play" && (
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
            className="relative  rounded-xl flex gap-[0.1rem]"
            style={{
              width: isMobile ? "100%" : boardW * 0.8,
              height: isMobile ? "70%" : isTablet ? boardH * 1 : boardH * 0.7,
              // background: GRID_TINTS[levelIdx % GRID_TINTS.length],
              // background: "#F5DEB3",
              backgroundImage: 'url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/wordBg.jpg)',
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              padding: '1rem'
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
                    r < ring.y + ring.h
                );
                const foundRing = rings.find(
                  (ring) =>
                    ring.x <= c &&
                    c < ring.x + ring.w &&
                    ring.y <= r &&
                    r < ring.y + ring.h
                );
                const foundColor = foundRing?.color || "#FF8652";
                // console.log(isFound,"isFound")
                // ✅ Now r and c exist here
                const isDraggingHere = dragCells.some(
                  (p) => p.r === r && p.c === c
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
                      cursor: role_name === "tutor" ? "not-allowed" : "pointer",
                      background: isFound
                        // ? "linear-gradient(135deg, rgba(22,163,74,0.2), rgba(134,239,172,0.3))"
                        ? foundColor
                        : isDraggingHere
                          // ? "rgba(22,163,74,0.18)"
                          ? "yellow"
                          : "#a56f2a",
                      color: isFound
                        // ? "rgb(22, 163, 74)"
                        ? "white"
                        : isDraggingHere
                          // ? "rgb(21, 128, 61)"
                          ? "black"
                          // : "#0f172a",
                          : "white"
                    }}
                    onMouseDown={() => {
                      if (role_name === "tutor") return;
                      onDown(r, c)
                    }}
                    onMouseMove={(e) => {
                      if (role_name === "tutor") return;
                      if (e.buttons === 1) onEnter(r, c);
                    }}
                    onTouchStart={(e) => {
                      if (role_name === "tutor") return;
                      e.preventDefault();
                      onDown(r, c);
                    }}
                    onTouchMove={(e) => {
                      if (role_name === "tutor") return;
                      const box = e.currentTarget.parentElement.getBoundingClientRect();
                      const t = e.touches[0];
                      const x = ((t.clientX - box.left) / box.width) * COLS;
                      const y = ((t.clientY - box.top) / box.height) * ROWS;
                      const rr = Math.max(0, Math.min(ROWS - 1, Math.floor(y)));
                      const cc = Math.max(0, Math.min(COLS - 1, Math.floor(x)));
                      onEnter(rr, cc);
                    }}
                  >
                    {letter}
                  </div>

                );
              })
            )}

          </div>

          <div />
          <aside
            style={{
              width: isMobile ? "90%" : sideW,
              height: isMobile ? "400px" : boardH * 0.7,
              marginTop: isMobile ? 12 : 0,
              // background: "#ffffff",
              backgroundImage: 'url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/puzzleBg.webp)',
              borderRadius: 16,
              padding: 10,
              boxSizing: "border-box",
              boxShadow: "0 8px 20px rgba(0,0,0,.12)",
              display: "grid",
              gridTemplateRows: "auto 1fr",
              position: "relative"
            }}
          >
            <small className="absolute top-0 right-0 text-xs px-2 py-1 bg-yellow-800 text-white border border-white rounded-full">
              {currentSet?.word_list?.[0]?.level || "easy"}
            </small>



            <div
              style={{
                textAlign: "center",
                fontWeight: 900,
                marginBottom: isTablet ? 1 : 8,
                fontSize: isTablet ? '1rem' : "1.5rem",
                color: "white",
                width: "100%",
                height: 100, // add height so image is visible
                lineHeight: "80px", // vertically center text
                backgroundImage: 'url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/board.png)',
                backgroundSize: "cover", // cover entire div
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              Word Set
            </div>

            <div style={{
              overflowY: "auto",
              paddingRight: 4,
              maxHeight: "100%",
              scrollbarWidth: "thin",
            }}>
              <style>
                {`
                  div::-webkit-scrollbar {
                    width: 4px;
                  }
                  div::-webkit-scrollbar-track {
                    background: #f0fff4;
                    borderRadius: 8px;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: lightgrey;
                    borderRadius: 8px;
                    border: 2px solid #f0fff4;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: #22c55e;
                  }
                `}
              </style>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                {puzzle.words.map((w, i) => (
                  <div
                    key={w}
                    style={{
                      height: 40,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 12,
                      background: found.has(w) ? "linear-gradient(135deg,#bbf7d0,#86efac)" : CARD_GRADS[i % CARD_GRADS.length],
                      // color: found.has(w) ? "#065f46" : "#0f172a",
                      color: found.has(w) ? "#065f46" : "white",
                      border: found.has(w) ? "2px solid #22c55e" : "2px solid rgba(0,0,0,.06)",
                      fontWeight: 1000,
                      letterSpacing: 1,
                      textShadow: found.has(w) ? "none" : "0 1px 0 rgba(255,255,255,.6)",
                    }}
                  >
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </aside>
          {celebrate && (
            <div style={{ position: "absolute", inset: 0, background: "#000c", display: "grid", placeItems: "center" }}>
              <Confetti />
              <div style={{ position: "relative", display: "grid", gap: 16, placeItems: "center" }}>
                <StarsRow />
                {role_name === "tutor" && (<button
                  onTouchStart={handleNextLevel}
                  onClick={handleNextLevel}
                  style={{
                    padding: "14px 22px",
                    borderRadius: "999px",
                    border: "none",
                    background: "linear-gradient(135deg, #ff9a9e, #fad0c4, #fbc2eb)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "18px",
                    cursor: "pointer",
                    boxShadow: "0 6px 16px rgba(0,0,0,.2)",
                    textShadow: "1px 1px 2px rgba(0,0,0,.3)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "scale(1.1)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  🎉 Next Level
                </button>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}