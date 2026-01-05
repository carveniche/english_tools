import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import all_phonics_sound from "../phonics_with_stories/letter_sound.json";

const getPhonicsAudio = (letter) => {
  const item = all_phonics_sound.All_letters.find(
    (l) => l.lab.toLowerCase() === letter.toLowerCase()
  );
  return item?.audio || null;
};

/* ---------------- GAME JSON ---------------- */
const gameData = {
  target_word: "d",
  image: "https://picsum.photos/seed/fan2/1200/1200",
  level_data: [
    {
      level_id: 1,
      level_type: "easy",
      distractor_letters: ["s", "b", "j", "l", "u"],
      correct_letters: ["d"],
    },
    {
      level_id: 2,
      level_type: "medium",
      distractor_words: ["captail", "doneee", "jokker", "taperecord"],
      correct_words: ["mad", "sad", "dad", "card"],
    },
    {
      level_id: 3,
      level_type: "hard",
      distractor_words: ["sad", "card", "cap", "jug"],
      correct_words: ["desk", "dummy", "done", "data"],
    },
  ],
};

/* ---------------- HELPERS ---------------- */
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);
const correctSound = new Audio(
  "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/backgroundBgm.mpeg"
);
const bomb = new Audio(
  "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/bombsound.mpeg"
);
const answerCorrect = new Audio(
  "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/correctAnswerBallon.mp3"
);
const isColliding = (a, b) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

/* ---------------- CONSTANTS ---------------- */
const GAME_TIME = 8;
const SCORE_TO_NEXT_LEVEL = 5;
const BOMB_TEXT = "";
const BOMB_PENALTY = 1;
const LEVEL_TARGET_SCORE = 20;

const MIN_X_GAP = 10; // percentage
const MIN_Y_GAP = 80;
/* ---------------- COMPONENT ---------------- */
function ParentPage() {
  const [letters, setLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [showNextLevel, setShowNextLevel] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  // const [backenData,setSendingBackendData]=useState(null)
  const [backenData, setSendingBackendData] = useState(gameData);
  const [showInstructions, setShowInstructions] = useState(false); // hidden initially
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [playStarted, setPlayStarted] = useState(false);

  const boxRef = useRef(null);
  const dragging = useRef(false);
  const animationRef = useRef(null);
  const spawnRef = useRef(null);
  const timerRef = useRef(null);
  const backendDataRef = useRef(null);
  const gameAreaRef = useRef(null);

  //   const [boxX, setBoxX] = useState(window.innerWidth / 2 - 110);
  const [boxX, setBoxX] = useState(0);

  useEffect(() => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (rect) {
      setBoxX(rect.width / 2 - 100);
    }
  }, []);

  const currentLevel = backenData?.level_data[levelIndex];
const startDelayRef = useRef(null);
  const [storingTime, setStoringTime] = useState(0);
  const timerRefData = useRef(null);
  const seconds = useRef(storingTime);
  const [levelId, setLevelId] = useState("");
  const level_data_id = useRef(levelId);
  useEffect(() => {
    level_data_id.current = levelId;
    seconds.current = storingTime;
  }, [levelId, storingTime, backenData]);

  const speechVoiceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      speechVoiceRef.current =
        voices.find((v) => v.lang === "en-US") ||
        voices.find((v) => v.lang.includes("en")) ||
        voices[0];
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

//   const startGameWithDelay = () => {
//     let settingTimer = 0
//     if(currentLevel.level_type === "easy"){
//        settingTimer=3000
//     }
//     else{
//        settingTimer=5000

//     }
//   setPlayStarted(false);

//   setTimeout(() => {
//     setPlayStarted(true);
//   }, settingTimer);
// };

const startGameWithDelay = () => {
  let settingTimer = currentLevel.level_type === "easy" ? 3000 : 6000;

  setPlayStarted(false);

  // clear old delay if exists
  if (startDelayRef.current) {
    clearTimeout(startDelayRef.current);
  }

  startDelayRef.current = setTimeout(() => {
    setPlayStarted(true);
  }, settingTimer);
};


  const startTimer = () => {
    if (timerRefData.current) return;

    timerRefData.current = setInterval(() => {
      setStoringTime((prev) => prev + 1);
    }, 1000);
  };
  const stopTimer = () => {
    if (timerRefData.current) {
      clearInterval(timerRefData.current);
      timerRefData.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setStoringTime(0);
  };
  // useEffect(() => {
  //   console.log(storingTime, "storingTime");
  // }, [storingTime]);

  function gettingPhonicsWithData(data) {
    const payload = data?.fun_game_data?.[0];

    if (!payload || !payload.game_detail) {
      console.error("Invalid backend structure", data);
      return;
    }

    // ✅ SAVE ID FIRST
    setLevelId(payload.fun_game_detail_id);
    level_data_id.current = payload.fun_game_detail_id;

    // ✅ SAVE GAME DATA
    backendDataRef.current = payload.game_detail;
    setSendingBackendData(payload.game_detail);
  }

  window.gettingPhonicsWithData = gettingPhonicsWithData;

  /* ---------------- START LEVEL ---------------- */
  const startLevel = () => {
    window.speechSynthesis.resume();
    startTimer();
    correctSound.play();
    correctSound.loop = true;
    correctSound.volume = 0.15;
    setLetters([]);
    setScore(0);
    setTimeLeft(GAME_TIME);
    setShowNextLevel(false);
    setGameActive(true);
    setHasGameStarted(true);
    setShowInstructions(true);
    startGameWithDelay();
    //     const instruction = getInstructionText();
    //   if (instruction) {
    //     setTimeout(() => {
    //       speakInstruction(instruction);
    //     }, 300);
    //   }
  };

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    // if (!gameActive) return;
    if (!gameActive || !playStarted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameActive(false);
          const isLastLevel = levelIndex === backenData.level_data.length - 1;

          if (isLastLevel) {
            setGameOver(true); // ✅ directly game over
          } else {
            setShowNextLevel(true); // ✅ go to next level screen
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameActive,playStarted]);

  /* ---------------- SPAWN ITEMS ---------------- */
  useEffect(() => {
    // if (!gameActive) return;
    if (!gameActive || !playStarted) return;

    spawnRef.current = setInterval(() => {
      setLetters((prev) => {
        let selected;

        // 💣 25% guaranteed bomb chance
        // if (Math.random() < 0.25) {
        //   selected = { value: BOMB_TEXT, type: "bomb" };
        // } else {
        //   if (currentLevel.level_type === "easy") {
        //     const pool = [
        //       ...currentLevel.correct_letters.map((v) => ({
        //         value: v,
        //         type: "correct",
        //       })),
        //       ...currentLevel.distractor_letters.map((v) => ({
        //         value: v,
        //         type: "wrong",
        //       })),
        //     ];
        //     selected = pool[Math.floor(Math.random() * pool.length)];
        //   } else {
        //     const pool = [
        //       ...currentLevel.correct_words.map((v) => ({
        //         value: v,
        //         type: "correct",
        //       })),
        //       ...currentLevel.distractor_words.map((v) => ({
        //         value: v,
        //         type: "wrong",
        //       })),
        //     ];
        //     selected = pool[Math.floor(Math.random() * pool.length)];
        //   }
        // }
        // let selected;
        const r = Math.random();

        if (r < 0.2) {
          // 💣 20% bomb
          selected = { value: BOMB_TEXT, type: "bomb" };
        } else if (r < 0.7) {
          // ✅ 50% correct
          if (currentLevel.level_type === "easy") {
            const letter =
              currentLevel.correct_letters[
                Math.floor(Math.random() * currentLevel.correct_letters.length)
              ];
            selected = { value: letter, type: "correct" };
          } else {
            const word =
              currentLevel.correct_words[
                Math.floor(Math.random() * currentLevel.correct_words.length)
              ];
            selected = { value: word, type: "correct" };
          }
        } else {
          // ❌ 30% wrong
          if (currentLevel.level_type === "easy") {
            const letter =
              currentLevel.distractor_letters[
                Math.floor(
                  Math.random() * currentLevel.distractor_letters.length
                )
              ];
            selected = { value: letter, type: "wrong" };
          } else {
            const word =
              currentLevel.distractor_words[
                Math.floor(Math.random() * currentLevel.distractor_words.length)
              ];
            selected = { value: word, type: "wrong" };
          }
        }

        let x;
        let tries = 0;

        do {
          x = Math.random() * 80;
          tries++;
        } while (
          prev.some(
            (item) =>
              Math.abs(item.x - x) < MIN_X_GAP &&
              Math.abs(item.y + 40) < MIN_Y_GAP
          ) &&
          tries < 10
        );

        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            value: selected.value,
            type: selected.type,
            x,
            y: -MIN_Y_GAP,
            speed: (currentLevel.level_type === "easy" ? 2 : 3) + Math.random(),
          },
        ];
      });
    }, 900); // slightly faster so bomb is noticeable

    return () => clearInterval(spawnRef.current);
  }, [gameActive, levelIndex,playStarted]);

  /* ---------------- FALL ANIMATION ---------------- */
  useEffect(() => {
    if (!gameActive) return;

    const animate = () => {
      setLetters((prev) =>
        prev.flatMap((item) => {
          const newY = item.y + item.speed;
          const box = boxRef.current?.getBoundingClientRect();
          const containerRect = gameAreaRef.current?.getBoundingClientRect();

          if (!box || !containerRect) {
            return [{ ...item, y: newY }];
          }

          const letterBox = {
            x: containerRect.left + (item.x / 100) * containerRect.width,
            y: containerRect.top + newY,
            width: 60,
            height: 60,
          };

          if (
            isColliding(letterBox, {
              x: box.left,
              y: box.top,
              width: box.width,
              height: box.height,
            })
          ) {
            if (item.type === "bomb") {
              bomb.currentTime = 0;
              bomb.play();
              setScore((s) => Math.max(0, s - BOMB_PENALTY));
              return [];
            }

            // if (item.type === "correct") {
            //     answerCorrect.currentTime = 0;
            //     answerCorrect.play();
            //   setScore((s) => s + 1);
            //   return [];
            // }

            if (item.type === "correct") {
              answerCorrect.currentTime = 0;
              answerCorrect.play();

              setScore((prev) => {
                const newScore = prev + 1;

                // 🎯 Finish level immediately when score reaches 10
                if (newScore >= LEVEL_TARGET_SCORE) {
                  setGameActive(false);

                  const isLastLevel =
                    levelIndex === backenData.level_data.length - 1;

                  if (isLastLevel) {
                    setGameOver(true);
                  } else {
                    setShowNextLevel(true);
                  }
                }

                return newScore;
              });

              return [];
            }

            return [];
          }

          if (newY > containerRect.height) return [];
          return [{ ...item, y: newY }];
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameActive, levelIndex,playStarted]);

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !text) return resolve();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      if (speechVoiceRef.current) {
        utterance.voice = speechVoiceRef.current;
      }

      utterance.onend = resolve;

      window.speechSynthesis.speak(utterance);
    });
  };

  const playPhonicsSound = (letter) => {
    return new Promise((resolve) => {
      const audioUrl = getPhonicsAudio(letter);
      if (!audioUrl) return resolve();

      const audio = new Audio(audioUrl);
      audio.volume = 1;
      audio.onended = resolve;
      audio.play();
    });
  };
  const playAudioAndWait = (src) => {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      audio.volume = 1;
      audio.onended = resolve;
      audio.play();
    });
  };

  // const speakInstructionWithPhonics = async () => {
  //   const MainSound =new Audio('/soundPhonics.mp3')
  //   const CatchThe=new Audio('./catchThe.mp3')
  //   const target = backenData?.target_word;
  //   if (!target || !currentLevel) return;

  //   window.speechSynthesis.cancel();

  //   if (currentLevel.level_type === "easy") {
  //     // await speakText("Catch the");
  //     await(CatchThe.play())
  //     await playPhonicsSound(target);
  //     // await speakText("sound");
  //     await (MainSound.play())
  //   }

  //   if (currentLevel.level_type === "medium") {
  //     await speakText("Find the word ending with");
  //     await playPhonicsSound(target);
  //     await speakText("sound");
  //   }

  //   if (currentLevel.level_type === "hard") {
  //     await speakText("Find the word starting with");
  //     await playPhonicsSound(target);
  //     await speakText("sound");
  //   }
  // };

  const speakInstructionWithPhonics = async () => {
    const target = backenData?.target_word;
    if (!target || !currentLevel) return;

    // stop any running speech/audio
    window.speechSynthesis.cancel();

    if (currentLevel.level_type === "easy") {
      await playAudioAndWait("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/catchThe.mp3"); // 🎧 "Catch the"
      await playPhonicsSound(target); // 🔊 phonics sound
      await playAudioAndWait("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/soundPhonics.mp3"); // 🎧 "sound"
    }

    if (currentLevel.level_type === "medium") {
      // await speakText("Find the word ending with");
      await playAudioAndWait("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/endsWith.mp3");
      await playPhonicsSound(target);
      await playAudioAndWait("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/soundPhonics.mp3");
    }

    if (currentLevel.level_type === "hard") {
      // await speakText("Find the word starting with");
      await playAudioAndWait("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/startsWith.mp3");
      await playPhonicsSound(target);
      await playAudioAndWait("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/soundPhonics.mp3");
    }
  };

  /* ---------------- LEVEL COMPLETE ---------------- */

  useEffect(() => {
    if (timeLeft !== 0) return;

    const isLastLevel = levelIndex === backenData.level_data.length - 1;

    if (isLastLevel) {
      setGameOver(true);
    } else {
      setShowNextLevel(true);
    }
  }, [timeLeft]);

  if (showNextLevel) {
    correctSound.pause();
    stopTimer();
  }
  if (gameOver) {
    correctSound.pause();
    stopTimer();
  }

  /* ---------------- NEXT LEVEL ---------------- */

  // const goNextLevel = () => {
  //   setLevelIndex((l) => l + 1);
  //   startLevel();
  //     startGameWithDelay();
  // };
  const goNextLevel = () => {
  // stop old stuff
  setPlayStarted(false);

  setLevelIndex((l) => l + 1);
startLevel();
  setLetters([]);
  setScore(0);
  setTimeLeft(GAME_TIME);
  setShowNextLevel(false);
  setGameOver(false);

  setGameActive(true);

  startGameWithDelay(); 
};


  const tryAgainBtn = () => {
    // 🛑 stop all timers
    stopTimer();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 🔇 stop sounds
    correctSound.pause();
    correctSound.currentTime = 0;
    bomb.pause();
    answerCorrect.pause();

    // 🔄 reset gameplay state
    setLetters([]);
    setScore(0);
    setTimeLeft(GAME_TIME);

    // 🔥 exit overlays
    setGameOver(false);
    setShowNextLevel(false);

    // ▶️ restart same level
    setGameActive(true);

    // ⏱ restart timer + bgm
    startTimer();
    correctSound.play();
    correctSound.loop = true;
    correctSound.volume = 0.15;

    // 🔊 replay phonics instruction
    speakInstructionWithPhonics();
     startGameWithDelay();
  };

//   const tryAgainBtn = () => {
//   // stop timers
//   stopTimer();
//   if (timerRef.current) {
//     clearInterval(timerRef.current);
//     timerRef.current = null;
//   }

//   // stop sounds
//   correctSound.pause();
//   correctSound.currentTime = 0;

//   // reset state
//   setLetters([]);
//   setScore(0);
//   setTimeLeft(GAME_TIME);
//   setShowNextLevel(false);
//   setGameOver(false);

//   setGameActive(true);

//   correctSound.play();
//   correctSound.loop = true;
//   correctSound.volume = 0.15;

//   startGameWithDelay(); // ✅ 3 sec delay again
// };

  const dragOffsetX = useRef(0);

  /* ---------------- BOX MOVE ---------------- */
  //   const startDrag = () => (dragging.current = true);
  const startDrag = (e) => {
    dragging.current = true;
    document.body.style.userSelect = "none";
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const boxRect = boxRef.current?.getBoundingClientRect();

    if (!boxRect) return;

    // 🔥 correct offset based on actual screen position
    dragOffsetX.current = clientX - boxRect.left;
  };

  const stopDrag = () => {
    dragging.current = false;
    document.body.style.userSelect = "auto";
  };

  //   const moveBox = (x) => {
  //     if (!dragging.current) return;
  //     setBoxX(Math.max(0, Math.min(x - 110, window.innerWidth - 220)));
  //   };

  // const moveBox = (x) => {
  //   if (!dragging.current) return;

  //   const newX = x - dragOffsetX.current;

  //   setBoxX(
  //     Math.max(0, Math.min(newX, window.innerWidth - 200)) // 200 = box width
  //   );
  // };
  const moveBox = (clientX) => {
    if (!dragging.current) return;

    const containerRect = gameAreaRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const newX = clientX - dragOffsetX.current - containerRect.left;

    const clampedX = Math.max(0, Math.min(newX, containerRect.width - 200));

    setBoxX(clampedX);

    requestAnimationFrame(() => {
      const box = boxRef.current?.getBoundingClientRect();
      if (box) {
        handleCollisionWithBox({
          x: box.left,
          y: box.top,
          width: box.width,
          height: box.height,
        });
      }
    });
  };

  // useEffect(() => {
  //   if (!hasGameStarted) return;

  //   const instruction = getInstructionText();
  //   if (instruction) {
  //     speakInstruction(instruction);
  //   }
  // }, [levelIndex, hasGameStarted]);

  useEffect(() => {
    if (!hasGameStarted) return;
    speakInstructionWithPhonics();
  }, [levelIndex, hasGameStarted]);

  useEffect(() => {
    const preventDrag = (e) => e.preventDefault();
    window.addEventListener("dragstart", preventDrag);
    return () => window.removeEventListener("dragstart", preventDrag);
  }, []);

  useEffect(() => {
    const block = (e) => e.preventDefault();
    window.addEventListener("dragstart", block);
    return () => window.removeEventListener("dragstart", block);
  }, []);

  useEffect(() => {
    if (gameOver) {
      if (typeof window.sendingTimespentLetters === "function") {
        const formData = new FormData();
        formData.append("fun_game_detail_id", level_data_id.current);
        formData.append("time_spent", seconds.current);
        formData.append("status", "completed");

        window.sendingTimespentLetters(formData);
      } else {
        console.log("not found sendingTimespentPhonics function");
      }
    }
  }, [gameOver]);

  const resetGame = async () => {
    resetTimer();

    const formData = new FormData();
    formData.append("fun_game_detail_id", level_data_id.current);
    formData.append("status", "completed");

    try {
      const response = await window.phonics_with_letters_game(formData);

      const payload = response?.fun_game_data?.[0];
      if (!payload || !payload.game_detail) {
        console.error("Invalid payload structure", response);
        return;
      }
      setLevelId(payload.fun_game_detail_id);
      level_data_id.current = payload.fun_game_detail_id;
      setSendingBackendData(payload.game_detail);
    } catch (err) {
      console.error("Failed to load next set", err);
    }
    // setSendingBackendData(gameData);

    // stop timers
    stopTimer();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // stop sounds
    correctSound.pause();
    correctSound.currentTime = 0;

    // reset state
    setLetters([]);
    setScore(0);
    setTimeLeft(GAME_TIME);
    setLevelIndex(0);
    setShowNextLevel(false);
    setGameOver(false);

    // 🚀 IMPORTANT: directly start level
    setGameActive(true);

    // restart timer + bgm
    startTimer();
    correctSound.play();
    correctSound.loop = true;
    correctSound.volume = 0.15;
    startGameWithDelay();
  };

  useEffect(() => {
    const btn = document.getElementById("closing-btn-phonics-with-letters");

    const onClick = () => {
      correctSound.pause();
      if ((!gameActive && !showNextLevel) || gameOver) return;
      if (typeof window.sendingTimespentLetters === "function") {
        const formdata = new FormData();
        formdata.append("fun_game_detail_id", level_data_id.current);
        formdata.append("status", "inprogress");
        formdata.append("time_spent", seconds.current);
        window.sendingTimespentLetters(formdata);
      } else {
        console.log("not found sendingTimespentPhonics function");
      }

      if (typeof resetTimer === "function") {
        resetTimer();
      }
    };

    if (btn) btn.addEventListener("click", onClick);

    return () => {
      if (btn) btn.removeEventListener("click", onClick);
    };
  }, [gameActive, gameOver, showNextLevel]);

  const handleCollisionWithBox = (boxRect) => {
    const containerRect = gameAreaRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setLetters((prev) =>
      prev.flatMap((item) => {
        const letterBox = {
          x: containerRect.left + (item.x / 100) * containerRect.width,
          y: containerRect.top + item.y,
          width: 60,
          height: 60,
        };

        if (isColliding(letterBox, boxRect)) {
          if (item.type === "bomb") {
            bomb.currentTime = 0;
            bomb.play();
            setScore((s) => Math.max(0, s - BOMB_PENALTY));
            return [];
          }

          // if (item.type === "correct") {
          //     answerCorrect.currentTime = 0;
          //     answerCorrect.play();
          //   setScore((s) => s + 1);
          //   return [];
          // }

          if (item.type === "correct") {
            answerCorrect.currentTime = 0;
            answerCorrect.play();

            setScore((prev) => {
              const newScore = prev + 1;

              // 🎯 Finish level immediately when score reaches 10
              if (newScore >= LEVEL_TARGET_SCORE) {
                setGameActive(false);

                const isLastLevel =
                  levelIndex === backenData.level_data.length - 1;

                if (isLastLevel) {
                  setGameOver(true);
                } else {
                  setShowNextLevel(true);
                }
              }

              return newScore;
            });

            return [];
          }

          return [];
        }

        return item;
      })
    );
  };

  const speakInstruction = (text) => {
    if (!window.speechSynthesis || !text) return;

    // 🔥 FULL reset (important for Chrome)
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    if (speechVoiceRef.current) {
      utterance.voice = speechVoiceRef.current;
    }

    // ⏱ Small delay ensures Chrome speaks again
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 150);
  };

  useEffect(() => {
    if (gameOver) {
      window.speechSynthesis.cancel();
    }
  }, [gameOver]);

  // useEffect(() => {
  //   if (!hasGameStarted) return;

  //   const instruction = getInstructionText();
  //   if (instruction) {
  //     speakInstruction(instruction);
  //   }
  // }, [levelIndex]);

  const getInstructionText = () => {
    const target = backenData?.target_word?.toUpperCase();

    if (!currentLevel || !target) return "";

    switch (currentLevel.level_type) {
      case "easy":
        return `Catch the "${target}" sound`;

      case "medium":
        return `Find the word ending with "${target}" sound`;

      case "hard":
        return `Find the word starting with "${target}" sound`;

      default:
        return "";
    }
  };

  const getItemImage = (type, levelType) => {
    if (type === "bomb") {
      if (levelType === "easy")
        return "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/bomb.png";

      if (levelType === "medium")
        return "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/newhoneyBomb.png";

      if (levelType === "hard")
        return "/snowBomb.png";

      return "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/bomb.png";
    }

    // normal items
    if (levelType === "easy")
      return "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/leveloneballon.png";

    if (levelType === "medium")
      return "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/newBees.png";

    if (levelType === "hard")
      return "/snowBall.png";

    return "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/leveloneballon.png";
  };

  useEffect(() => {
    if (showNextLevel || gameOver) {
      const audio = new Audio(
        score >= LEVEL_TARGET_SCORE ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/allRight.mp3" : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/oppsMessage.mp3"
      );

      audio.play();
    }
  }, [showNextLevel, gameOver, score]);

  if (!backenData) {
    return (
      <div className="flex items-center justify-center h-screen text-black">
        Waiting for game data...
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[100vh] bg-black lg:h-[calc(100vh-10vh)] bg-center bg-cover 2xl:bg-cover overflow-hidden bg-no-repeat select-none"
      style={{
        backgroundImage: `url(${
          currentLevel.level_type == "easy"
            ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/phonics_letterBg.png"
            : currentLevel.level_type == "medium"
            ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/honebeeBg.png"
            : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/penguinBg.png"
        })`,
      }}
      onMouseMove={(e) => moveBox(e.clientX)}
      onMouseUp={stopDrag}
      onTouchMove={(e) => moveBox(e.touches[0].clientX)}
      onTouchEnd={stopDrag}
    >
      {/* HUD */}
      <div className="absolute w-[7rem]  top-4 left-4 bg-[#FFF0A2] rounded-xl p-[0.3rem] text-[#DD5131] font-extrabold flex justify-evenly items-center flex-row gap-[0.3rem]">
        <img
          src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/scorePoint.png"
          alt=""
          className="w-[2rem]"
        />{" "}
        <span>
          {score} / {LEVEL_TARGET_SCORE}
        </span>
      </div>

      <div className={`absolute top-4 right-[3rem] ${currentLevel.level_type == "easy"?'text-white':'text-black'}  w-[3rem] gap-[0.5rem] flex justify-center items-center`}>
              <img
        src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/hearAgain.png"
        alt="hearAgain"
        className="w-[2rem] relative top-[0.3rem] cursor-pointer "
        onClick={() => {
          speakInstructionWithPhonics();
        }}
      />
        <img
          src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/timesSecond.png"
          alt=""
          className="w-full h-full"
        />
        {timeLeft}s
      </div>
      {/* Instructions / Menu */}
      <AnimatePresence>
        {hasGameStarted && showInstructions && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-24 left-4 w-[8rem] bg-[#FFD74E] backdrop-blur-md p-4 rounded-xl shadow-lg z-0"
          >
            {/* Close */}
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg font-bold"
            >
              <img
                src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/closeflip.png"
                className="
      w-[2rem]"
              />
            </button>
            {backenData?.image ? (
              <img
                src={backenData?.image}
                alt="target"
                className="w-24 h-24 mx-auto rounded-md mb-2"
              />
            ) : (
              <p className="text-center font-bold text-2xl text-gray-800">
                {backenData?.target_word?.toUpperCase()}
              </p>
            )}

            <p className="text-center text-sm text-gray-600 mt-1">
              {/* {getInstructionText()} */}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Button */}
      <AnimatePresence>
        {hasGameStarted && !showInstructions && (
          <motion.button
            key="menu"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              //   setShowInstructions(true);
              //   speakInstruction(getInstructionText());
              // speakInstructionWithPhonics();
              setShowInstructions(true);
              speakInstructionWithPhonics();
            }}
            className="absolute top-24 left-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-2xl font-bold z-50 hover:bg-white"
          >
            {/* ☰ */}
            <img
              src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/commonMenu.png"
              alt="menubar"
              className=""
            />
            {/* commonMenu.png */}
          </motion.button>
        )}
      </AnimatePresence>


      <div
        ref={gameAreaRef}
        className="w-[80%] md:w-[70%] xl:w-[80%] zxl:w-[85%] mx-auto h-full relative"
      >
        {/* Falling Items */}
        {letters.map((l) => (
          <div
            key={l.id}
            className="absolute text-white text-2xl font-bold flex  select-none "
            style={{ left: `${l.x}%`, top: l.y }}
          >
            <div className=" relative">
              <img
                src={getItemImage(l.type, currentLevel.level_type)}
                alt="game item"
                className={`${
                  currentLevel.level_type == "hard"
                    ? "w-full h-full"
                    : "w-full h-full"
                } relative left-1 top-[1rem] object-contain pointer-events-none`}
              />

              <h2
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2
  font-bold text-xl pointer-events-none select-none
${
  currentLevel.level_type == "medium" || "hard"
    ? "text-black text-[1.1rem] text-center w-[60px] flex-wrap"
    : "text-white"
}`}
              >
                <span className={`${
  currentLevel.level_type == "easy"
    ? "text-white "
    : "text-black"
}`}>{l.value}</span>
              </h2>
            </div>
          </div>
        ))}

        {/* Catch Box */}
        <div
          ref={boxRef}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="absolute bottom-10 w-[200px] h-[150px]  
         
        flex justify-center items-center text-white text-xl cursor-pointer"
          style={{ left: boxX }}
        >
          <img
            src={
              currentLevel.level_type == "easy"
                ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/basket.png"
                : currentLevel.level_type == "medium"
                ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/honeyBasket.png"
                : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/penguinBasket.png"
            }
            alt="basket"
            draggable={false}
            className={`${
              currentLevel.level_type == "hard" ? " w-[8rem] h-[8rem]" : ""
            }pointer-events-none`}
          />
          {/* Catch */}
        </div>
      </div>
      {/* START */}
      {!gameActive && !showNextLevel && !gameOver && (
        <div
          className="absolute inset-0 bg-black/70 flex items-center justify-center bg-center bg-cover bg-no-repeat w-full"
          style={{
            backgroundImage:
              "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/startPage.png)",
          }}
        >
          <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="xl:absolute top-10  -translate-x-1/2 z-50 w-full"
          >
            <img
              src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/startPhonicsLetter.png"
              alt="startPhonicsLetter"
              // onClick={startLevel}
              className="mx-auto z-0 relative"
            />
          </motion.div>
          <button
            onClick={startLevel}
            className="px-6 py-3 bg-green-500 text-white text-xl rounded z-[100] absolute bottom-[9rem]"
          >
            Start Level
          </button>
        </div>
      )}

      {showNextLevel && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white gap-6">
          <div className="flex flex-col items-center gap-4">
            {/* Title */}
            <div
              className={`px-8 py-3 rounded-full text-4xl font-extrabold tracking-wide shadow-lg
      `}
            >
              {score < LEVEL_TARGET_SCORE ? "Oops 😢" : "Wow 🎉"}
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl shadow-md">
              <span className="text-xl text-gray-200">Final Score</span>

              <span className="text-3xl font-bold text-white">{score}</span>

              <span className="text-xl text-gray-300">
                / {LEVEL_TARGET_SCORE}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={goNextLevel}
              className="px-6 py-3 bg-green-500 text-white text-xl rounded"
            >
              Next Level
            </button>

            <button
              onClick={tryAgainBtn}
              className="px-6 py-3 bg-blue-500 text-white text-xl rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {/* {gameOver && (
  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white gap-6">
    <div className="text-4xl">Game Over</div>
  <div className="flex flex-row gap-[1rem] justify-center items-center">
    <button
      onClick={resetGame}
      className="px-8 py-3 bg-green-500 text-white text-xl rounded hover:bg-green-600"
    >
      Next Set
    </button>
     <button
            onClick={tryAgainBtn}
            className="px-6 py-3 bg-blue-500 text-white text-xl rounded"
          >
           Try Again
          </button>
          </div>
  </div>
)} */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white gap-6">
          <div className="flex flex-col items-center gap-4">
            {/* Title */}
            <div
              className={`px-8 py-3 rounded-full text-4xl font-extrabold tracking-wide shadow-lg
      `}
            >
              {score < LEVEL_TARGET_SCORE ? "Oops 😢" : "Wow 🎉"}
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl shadow-md">
              <span className="text-xl text-gray-200">Final Score</span>

              <span className="text-3xl font-bold text-white">{score}</span>

              <span className="text-xl text-gray-300">
                / {LEVEL_TARGET_SCORE}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-green-500 text-white text-xl rounded"
            >
              Next Set
            </button>

            <button
              onClick={tryAgainBtn}
              className="px-6 py-3 bg-blue-500 text-white text-xl rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentPage;
