import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function LevelTwo({ data, onFinish }) {

  const sentences = data.distractor_sentences;
  const correctAnswer = data.correct_sentence;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSentence, setCurrentSentence] = useState(sentences[0]);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [gameStatus, setGameStatus] = useState("playing"); // playing | won | lost
  const [message, setMessage] = useState("");

  const intervalRef = useRef(null);

  // 🔊 Speak
  const speak = (text) => {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
  };

  // 🔁 Start rotation
  const startRotation = () => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % sentences.length;
        setCurrentSentence(sentences[next]);
        return next;
      });
    }, 3000);
  };

  useEffect(() => {
    startRotation();
    return () => clearInterval(intervalRef.current);
  }, [sentences]);

  // 🖱 Click
  const handleClick = () => {
    if (gameStatus !== "playing") return;

    if (currentSentence === correctAnswer) {
      speak("Excellent! Correct answer");
      setMessage("🎉 Correct!");
      setGameStatus("won");
      clearInterval(intervalRef.current);
    } else {
      speak("Wrong");
      const remaining = attemptsLeft - 1;

      if (remaining <= 0) {
        setAttemptsLeft(0);
        setMessage("❌ Game Over");
        speak("Game over. Try again");
        setGameStatus("lost");
        clearInterval(intervalRef.current);
      } else {
        setAttemptsLeft(remaining);
        setMessage("❌ Wrong! Try again");
      }
    }
  };

  // 🔊 Speaker
  const speakAnswer = () => {
    speak(correctAnswer);
  };

  // 🔁 Reset
  const resetGame = () => {
    setAttemptsLeft(3);
    setGameStatus("playing");
    setMessage("");
    setCurrentIndex(0);
    setCurrentSentence(sentences[0]);
    startRotation();
  };

  return (
    <div style={styles.page}>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={styles.container}
      >

        {/* Header */}
        <div style={styles.header}>
          <motion.div 
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            style={styles.speaker}
            onClick={speakAnswer}
          >
            🔊
          </motion.div>

          <div style={styles.attempts}>
            {"❤️".repeat(attemptsLeft)}
          </div>
        </div>

        <h2 style={styles.title}>Find the correct sentence</h2>

        {/* Sentence Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSentence}
            onClick={handleClick}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: 0.97 }}
            style={{
              ...styles.card,
              backgroundColor: gameStatus !== "playing" ? "#eee" : "#fff"
            }}
          >
            {currentSentence}
          </motion.div>
        </AnimatePresence>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={styles.message}
          >
            {message}
          </motion.div>
        )}

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
  page: {
    width: "100%",
    // minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #dcfce7, #e0f2fe)"
  },
  container: {
    width: 500,
    padding: 25,
    textAlign: "center",
    borderRadius: 25,
    background: "#ffffff",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
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
    fontWeight: "bold",
    color: "#065f46"
  },
  card: {
    margin: "40px auto",
    width: "100%",
    minHeight: 120,
    borderRadius: 25,
    border: "4px solid #10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: "bold",
    cursor: "pointer",
    userSelect: "none",
    padding: 20,
    color: "#064e3b"
  },
  message: {
    fontSize: 24,
    marginTop: 10,
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
    border: "2px solid #10b981",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },
  btnPrimary: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "#10b981",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default LevelTwo;
