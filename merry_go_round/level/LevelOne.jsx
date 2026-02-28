import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "react-slick";

function LevelOne({ data, onFinish }) {
  const words = data?.distractor_words || [];
  const correctAnswer = data?.correct_letters;

  const sliderRef = useRef(null);

  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [gameStatus, setGameStatus] = useState("playing");
  const [message, setMessage] = useState("");
  const [clickedWord, setClickedWord] = useState(null);
  const [breakWord, setBreakWord] = useState(false);

  // 🔊 Speak
  const speak = (text) => {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
  };

  const speakAnswer = () => {
    const audio = new Audio("https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/tabTheWord.mp3");
    audio.play();
  };

  // 🖱 Click word
// 🖱 Click word
const [foundWords, setFoundWords] = useState([]);
const [usedWords, setUsedWords] = useState([]);

const handleClick = (word) => {
  if (gameStatus !== "playing") return;

  setClickedWord(word);
  setUsedWords(prev => [...prev, word]); // mark clicked so it won't repeat

  if (correctAnswer.includes(word)) {
    if (!foundWords.includes(word)) {
      const updatedFound = [...foundWords, word];
      setFoundWords(updatedFound);
      speak("Excellent! Correct answer");
      setMessage(`🎉 Found: ${updatedFound.join(", ")}`);

      // ✅ Only finish game when all correct words are found
      if (updatedFound.length === correctAnswer.length) {
        setGameStatus("won");
        setMessage("🎉 You found all correct words!");
      }
    }
  } else {
    // wrong word
    speak("Wrong");
    setBreakWord(true);

    const remaining = attemptsLeft - 1;
    setAttemptsLeft(remaining > 0 ? remaining : 0);

    if (remaining <= 0) {
      setGameStatus("lost");
      setMessage("❌ Game Over. Try again!");
      speak("Game over. Try again");
    } else {
      setMessage("❌ Wrong! Try again");
    }

    // Reset broken word animation
    setTimeout(() => {
      setBreakWord(false);
      setClickedWord(null);
    }, 800);
  }
};


  // 🔁 Reset
const resetGame = () => {
  setAttemptsLeft(3);
  setGameStatus("playing");
  setMessage("");
  setClickedWord(null);
  setBreakWord(false);
  setFoundWords([]);
  setUsedWords([]);

  // Restart carousel from first slide
  if (sliderRef.current) {
    sliderRef.current.slickGoTo(0, true); // go to first slide and trigger re-render
  }
};


  // 🎠 Carousel settings
const settings = {
  dots: false,
  infinite: true,
  autoplay: gameStatus === "playing", // controls rotation
  autoplaySpeed: 2000, // 2 seconds
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  pauseOnHover: false,
  swipe: false
};


  return (
    <div
      className="relative w-[80%] h-full flex justify-center items-center bg-no-repeat bg-contain bg-center border border-green-800"
      style={{ backgroundImage: "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/levelonemerry.png)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={styles.container}
      >
        {/* Header */}
        <div className="absolute border border-black top-0 left-0 flex justify-center items-center p-[1rem]">
          <div className=" border border-green-700 flex justify-start items-center gap-[1rem]">
               <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/listenspeaker.png" alt="speaker" className="w-[3rem] cursor-pointer" onClick={speakAnswer} />
                <h2 className="text-[1.5rem] font-bold text-[#ffffff]">Find the correct word</h2>
          </div>

        </div>
        {/* <div style={styles.header}>
          <div style={styles.speaker} onClick={speakAnswer}>🔊</div>
          <div style={styles.attempts}>{"❤️".repeat(attemptsLeft)}</div>
        </div> */}

        {/* <h2 style={styles.title}>Find the correct word</h2> */}

        {/* 🎠 Carousel */}
        <div style={{ marginTop: 40 }}>
          <Slider ref={sliderRef} {...settings}>
            {words.map((word, i) => {
              const isBroken = breakWord && clickedWord === word;

              return (
                <div key={i}>
                  <div
                    className="bg-center bg-contain bg-no-repeat"
                    onClick={() => handleClick(word)}
                    style={{
                      ...styles.wordCard,
                      backgroundImage: "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/carosel.png)",
                      cursor: "pointer",
                      overflow: "hidden"
                    }}
                  >
                    {/* If breaking, animate letters */}
                    {isBroken ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        {word.split("").map((char, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                            animate={{
                              x: (Math.random() - 0.5) * 200,
                              y: (Math.random() - 0.5) * 200,
                              rotate: (Math.random() - 0.5) * 360,
                              opacity: 0
                            }}
                            transition={{ duration: 0.8 }}
                            style={{ display: "inline-block" }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </div>
                    ) : (
                      // Normal / Correct bounce
                      <motion.div
                        animate={
                          clickedWord === word && gameStatus === "won"
                            ? { scale: [1, 1.3, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.6 }}
                      >
                        {word}
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>

        {/* Message */}
        {/* {message && <div style={styles.message}>{message}</div>} */}

        {/* Buttons */}
        {gameStatus !== "playing" && (
          <div style={styles.buttons}>
            <button style={styles.btn} onClick={resetGame}>Try Again</button>
            <button style={styles.btnPrimary} onClick={onFinish}>Next Level</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    width: 400,
    padding: 25,
    textAlign: "center",
    borderRadius: 25
  },
  header: {
    display: "flex",
    justifyContent: "space-between"
  },
  speaker: {
    fontSize: 36,
    cursor: "pointer"
  },
  attempts: {
    fontSize: 24
  },
  title: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: "bold"
  },
  wordCard: {
    margin: "0 auto",
    width: 260,
    height: 120,
    borderRadius: 25,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 36,
    fontWeight: "bold",
    userSelect: "none"
  },
  message: {
    fontSize: 24,
    marginTop: 20,
    fontWeight: "bold"
  },
  buttons: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: 20
  },
  btn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "2px solid #6366f1",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },
  btnPrimary: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default LevelOne;
