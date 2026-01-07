import React, { useState } from "react";
import { motion } from "framer-motion";

function LevelThree({ data, onFinish }) {

  if (!data) return null;

  const question = data.question_data || "Choose the correct answer";
  const options =  data.distractor_words || [];
  const correctAnswer = data.correct_word;

  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("playing"); // playing | answered
  const [message, setMessage] = useState("");

  const handleClick = (option) => {
    if (status !== "playing") return;

    setSelected(option);

    if (option === correctAnswer) {
      setMessage("🎉 Correct!");
    } else {
      setMessage("❌ Wrong!");
    }

    setStatus("answered");
  };

  const reset = () => {
    setSelected(null);
    setStatus("playing");
    setMessage("");
  };

  return (
    <div style={styles.page}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={styles.container}
      >

        <h2 style={styles.title}>Choose the correct answer</h2>

        <div style={styles.questionBox}>
          {question}
        </div>

        {/* OPTIONS */}
        <div style={styles.options}>
          {options.length === 0 && (
            <div style={{ color: "red" }}>
              ⚠ No options found in backend data
            </div>
          )}

          {options.map((opt, i) => {
            const isCorrect = opt === correctAnswer;
            const isSelected = opt === selected;

            let bg = "#fff";
            let border = "2px solid #0ea5e9";

            if (status === "answered") {
              if (isCorrect) {
                bg = "#dcfce7";
                border = "2px solid #22c55e";
              } else if (isSelected) {
                bg = "#fee2e2";
                border = "2px solid #ef4444";
              }
            }

            return (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={i}
                onClick={() => handleClick(opt)}
                style={{ ...styles.optionBtn, background: bg, border }}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {/* ACTION BUTTONS */}
        {status === "answered" && (
          <div style={styles.actions}>
            <button style={styles.btn} onClick={reset}>Try Again</button>
            <button style={styles.btnPrimary} onClick={onFinish}>
              Next Level
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    // minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    width: 500,
    padding: 25,
    borderRadius: 20,
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  title: {
    fontSize: 22,
    marginBottom: 10
  },
  questionBox: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 15,
    marginBottom: 20,
    borderRadius: 12,
    background: "#f0f9ff",
    border: "2px solid #38bdf8"
  },
  options: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 15
  },
  optionBtn: {
    padding: "12px",
    fontSize: 18,
    fontWeight: "bold",
    borderRadius: 12,
    cursor: "pointer",
    background: "#fff"
  },
  message: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15
  },
  actions: {
    marginTop: 20,
    display: "flex",
    gap: 12,
    justifyContent: "center"
  },
  btn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "2px solid #0ea5e9",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },
  btnPrimary: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default LevelThree;
