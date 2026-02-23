// import React, { useEffect, useState } from "react";
// import PathTracer from "./PathTracerWeb.tsx";

// type WriteLetterProps = {
//   selectedLetter?: string;
// };

// const WriteLetter: React.FC<WriteLetterProps> = ({ selectedLetter = "d" }) => {
//   const [letter, setLetter] = useState<string>(selectedLetter);
//   const [upperProgress, setUpperProgress] = useState<number>(0);
//   const [lowerProgress, setLowerProgress] = useState<number>(0);
  
//   useEffect(() => {
//     setLetter(selectedLetter);
//     setUpperProgress(0);
//     setLowerProgress(0);
//   }, [selectedLetter]);

//   return (
//     <div style={styles.container}>
//       {/* <button
//         style={styles.closeBtn}
//         onClick={() => (window.location.href = "/english-zone-question-type-listing")}
//       >
//         ✕
//       </button> */}

//       <div style={styles.row}>
//         {/* Uppercase on the left */}
//         <div style={styles.letterBox}>
//           <h3 style={styles.letterLabel}>Uppercase</h3>
//           <div style={styles.tracerWrapper}>
//             <PathTracer
//               letter={letter}
//               isUpper={true}
//               onProgress={setUpperProgress}
//             />
//           </div>
//         </div>

//         {/* Lowercase on the right */}
//         <div style={styles.letterBox}>
//           <h3 style={styles.letterLabel}>Lowercase</h3>
//           <div style={styles.tracerWrapper}>
//             <PathTracer
//               letter={letter}
//               isUpper={false}
//               onProgress={setLowerProgress}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WriteLetter;

// const styles: Record<string, React.CSSProperties> = {
//   container: {
//     padding: 16,
//     minHeight: "100vh",
//     backgroundColor: "#a3cbf9",
//     position: "relative",
//   },
//   row: {
//     display: "flex",
//     justifyContent: "space-around",
//     marginTop: 55,
//     gap: 40,
//     flexWrap: "wrap",
//   },
//   letterBox: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     width: "45%", // make it responsive
//   },
//   tracerWrapper: {
//     width: "100%",
//     height: 300,
//     touchAction: "none", // IMPORTANT! Allows drag events to work
//     position: "relative",
//   },
//   letterLabel: {
//     marginBottom: 8,
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1e293b",
//   },
//   closeBtn: {
//     position: "absolute",
//     top: 35,
//     right: 12,
//     width: 32,
//     height: 32,
//     borderRadius: "50%",
//     backgroundColor: "#ffffff",
//     border: "none",
//     cursor: "pointer",
//     fontSize: 18,
//     fontWeight: 700,
//     color: "#1e293b",
//     boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//   },
// };
// import React, { useEffect, useState } from "react";
// import PathTracer from "./PathTracerWeb.tsx";

// type WriteLetterProps = {
//   selectedLetter?: string;
// };

// const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

// const getNextLetter = (current: string): string => {
//   const lower = current.toLowerCase();
//   const idx = ALPHABET.indexOf(lower);
//   if (idx === -1) return "a";
//   return ALPHABET[(idx + 1) % ALPHABET.length];
// };

// const WriteLetter: React.FC<WriteLetterProps> = ({ selectedLetter = "a" }) => {
//   const [letter, setLetter] = useState(selectedLetter.toLowerCase());

//   const [upperDone, setUpperDone] = useState(false);
//   const [lowerDone, setLowerDone] = useState(false);

//   // Reset when letter changes
//   useEffect(() => {
//     setUpperDone(false);
//     setLowerDone(false);
//   }, [letter]);

//   const handleUpperComplete = () => {
//     setUpperDone(true);
//   };

//   const handleLowerComplete = () => {
//     setLowerDone(true);
//   };

//   const bothDone = upperDone && lowerDone;

//   const goToNextLetter = () => {
//     if (!bothDone) return;
//     setLetter(getNextLetter(letter));
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <h2 style={styles.title}>Trace the Letter: {letter.toUpperCase()}</h2>
//       </div>

//       <div style={styles.row}>
//         <div style={styles.letterBox}>
//           <h3 style={styles.letterLabel}>
//             Uppercase {upperDone && "✅"}
//           </h3>
//           <div style={styles.tracerWrapper}>
//             <PathTracer
//               letter={letter}
//               isUpper={true}
//               onProgress={(p) => { /* optional: keep progress if you want */ }}
//               onComplete={handleUpperComplete}
//             />
//           </div>
//         </div>

//         <div style={styles.letterBox}>
//           <h3 style={styles.letterLabel}>
//             Lowercase {lowerDone && "✅"}
//           </h3>
//           <div style={styles.tracerWrapper}>
//             <PathTracer
//               letter={letter}
//               isUpper={false}
//               onProgress={(p) => { /* optional */ }}
//               onComplete={handleLowerComplete}
//             />
//           </div>
//         </div>
//       </div>

//       {bothDone && (
//         <div style={styles.nextButtonContainer}>
//           <button style={styles.nextButton} onClick={goToNextLetter}>
//             Next Letter → {getNextLetter(letter).toUpperCase()}
//           </button>
//           <p style={styles.completionText}>Great job! 🎉 Both letters completed</p>
//         </div>
//       )}
//     </div>
//   );
// };
// export default WriteLetter

// // styles remain unchanged...

// const styles: Record<string, React.CSSProperties> = {
//   container: {
//     padding: 16,
//     minHeight: "100vh",
//     backgroundColor: "#a3cbf9",
//     position: "relative",
//   },
//   header: {
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 36,
//     fontWeight: "bold",
//     color: "#1e293b",
//     margin: 0,
//   },
//   row: {
//     display: "flex",
//     justifyContent: "space-around",
//     marginTop: 20,
//     gap: 40,
//     flexWrap: "wrap",
//   },
//   letterBox: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     width: "45%",
//   },
//   tracerWrapper: {
//     width: "100%",
//     height: 300,
//     touchAction: "none",
//     position: "relative",
//   },
//   letterLabel: {
//     marginBottom: 12,
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#1e293b",
//   },
//   nextButtonContainer: {
//     textAlign: "center",
//     marginTop: 40,
//     marginBottom: 40,
//   },
//   nextButton: {
//     padding: "16px 40px",
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "white",
//     backgroundColor: "#059669",
//     border: "none",
//     borderRadius: 12,
//     cursor: "pointer",
//     boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
//     transition: "all 0.2s ease",
//   },
//   completionText: {
//     marginTop: 16,
//     fontSize: 18,
//     color: "#1e293b",
//     fontWeight: 500,
//   },
// };


// WriteLetter.tsx
// import React, { useEffect, useState } from "react";
// import PathTracer from "./PathTracerWeb.tsx";

// type WriteLetterProps = {
//   selectedLetter?: string;
// };

// const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

// const getNextLetter = (current: string): string => {
//   const lower = current.toLowerCase();
//   const idx = ALPHABET.indexOf(lower);
//   if (idx === -1) return "a";
//   return ALPHABET[(idx + 1) % ALPHABET.length];
// };

// const WriteLetter: React.FC<WriteLetterProps> = ({ selectedLetter = "a" }) => {
//   const [letter, setLetter] = useState(selectedLetter.toLowerCase());
//   const [upperDone, setUpperDone] = useState(false);
//   const [lowerDone, setLowerDone] = useState(false);

//   useEffect(() => {
//     setUpperDone(false);
//     setLowerDone(false);
//   }, [letter]);

//   const handleUpperComplete = () => setUpperDone(true);
//   const handleLowerComplete = () => setLowerDone(true);

//   const bothDone = upperDone && lowerDone;

//   const goToNextLetter = () => {
//     if (!bothDone) return;
//     setLetter(getNextLetter(letter));
//   };

//   return (
//     <div style={styles.pageContainer}>
//       <div style={styles.card}>
//         <h2 style={styles.title}>
//           Trace the Letter: <span style={styles.letterHighlight}>{letter.toUpperCase()}</span>
//         </h2>

//         <div className="flex justify-center items-center flex-col lg:flex-row gap-[1rem]">
//           {/* Uppercase - larger section */}
//           <div style={styles.section}>
//             <h3 style={styles.sectionTitle}>
//               Capital Letter {upperDone && <span style={styles.checkmark}>✅</span>}
//             </h3>
//             <div style={styles.tracerBoxLarge}>
//               <PathTracer
//                 letter={letter}
//                 isUpper={true}
//                 onProgress={() => {}} // optional
//                 onComplete={handleUpperComplete}
//               />
//             </div>
//           </div>

//           {/* Lowercase - smaller section */}
//           <div style={styles.section}>
//             <h3 style={styles.sectionTitle}>
//               Small Letter {lowerDone && <span style={styles.checkmark}>✅</span>}
//             </h3>
//             <div style={styles.tracerBoxSmall} className="flex justify-center items-center relative">
//               <PathTracer
//                 letter={letter}
//                 isUpper={false}
//                 onProgress={() => {}} // optional
//                 onComplete={handleLowerComplete}
//               />
//             </div>
//           </div>
//         </div>

//         {bothDone && (
//           <div style={styles.nextContainer}>
//             <button style={styles.nextButton} onClick={goToNextLetter}>
//               Next Letter → {getNextLetter(letter).toUpperCase()}
//             </button>
//             <p style={styles.completionMessage}>Great job! Both letters completed 🎉</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles: Record<string, React.CSSProperties> = {
//   pageContainer: {
//     minHeight: "100vh",
//     padding: "20px 16px",
//     background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "flex-start",
//   },
//   card: {
//     width: "100%",
//     maxWidth: "720px",
//     background: "white",
//     borderRadius: "24px",
//     padding: "32px 24px",
//     boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
//     border: "1px solid #e0f2fe",
//   },
//   title: {
//     textAlign: "center",
//     fontSize: "clamp(28px, 6vw, 40px)",
//     fontWeight: 700,
//     color: "#1e293b",
//     margin: "0 0 40px 0",
//   },
//   letterHighlight: {
//     color: "#2563eb",
//     fontWeight: 800,
//   },
//   tracingContainer: {
//     display: "flex",
//     flexDirection: "row",
//     // gap: "clamp(32px, 6vw, 48px)",
//     gap:"1rem"
//   },
//   section: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//   },
//   sectionTitle: {
//     fontSize: "clamp(20px, 4.5vw, 26px)",
//     fontWeight: 600,
//     color: "#334155",
//     marginBottom: "16px",
//   },
//   checkmark: {
//     marginLeft: "10px",
//     fontSize: "28px",
//   },
//   tracerBoxLarge: {
//     width: "100%",
//     // height: "clamp(320px, 60vw, 420px)",
//     background: "#ffffff",
//     borderRadius: "16px",
//     overflow: "hidden",
//     border: "2px solid #3b82f6",
//     boxShadow: "0 6px 20px rgba(59,130,246,0.15)",
//   },
//   tracerBoxSmall: {
//     width: "100%",
//     // maxWidth: "420px",
//     // height: "clamp(240px, 45vw, 320px)",
//     margin: "0 auto",
//     background: "#ffffff",
//     borderRadius: "16px",
//     overflow: "hidden",
//     border: "2px solid #f59e0b",
//     boxShadow: "0 6px 20px rgba(245,158,11,0.15)",
    
//   },
//   nextContainer: {
//     textAlign: "center",
//     marginTop: "clamp(40px, 8vw, 60px)",
//   },
//   nextButton: {
//     padding: "16px 48px",
//     fontSize: "clamp(18px, 4.5vw, 22px)",
//     fontWeight: 600,
//     color: "white",
//     backgroundColor: "#10b981",
//     border: "none",
//     borderRadius: "12px",
//     cursor: "pointer",
//     boxShadow: "0 6px 16px rgba(16,185,129,0.3)",
//     transition: "all 0.2s ease",
//   // ":hover": {
//   //     backgroundColor: "#059669",
//   //     transform: "translateY(-2px)",
//   //     boxShadow: "0 10px 24px rgba(16,185,129,0.4)",
//   //   } as any,
//   },
//   completionMessage: {
//     marginTop: "16px",
//     fontSize: "clamp(16px, 4vw, 18px)",
//     color: "#334155",
//     fontWeight: 500,
//   },
// };

// export default WriteLetter;

import React, { useEffect, useState } from "react";
import PathTracer from "./PathTracerWeb.tsx";

type WriteLetterProps = {
  selectedLetter?: string;
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

const getNextLetter = (current: string): string => {
  const lower = current.toLowerCase();
  const idx = ALPHABET.indexOf(lower);
  if (idx === -1) return "a";
  return ALPHABET[(idx + 1) % ALPHABET.length];
};

const WriteLetter: React.FC<WriteLetterProps> = ({ selectedLetter = "a" }) => {
  const [letter, setLetter] = useState(selectedLetter.toLowerCase());
  const [upperDone, setUpperDone] = useState(false);
  const [lowerDone, setLowerDone] = useState(false);

  // 🔍 search state
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setUpperDone(false);
    setLowerDone(false);
  }, [letter]);

  const handleUpperComplete = () => setUpperDone(true);
  const handleLowerComplete = () => setLowerDone(true);

  const bothDone = upperDone && lowerDone;

  const goToNextLetter = () => {
    if (!bothDone) return;
    setLetter(getNextLetter(letter));
    setSearchValue("");
    setError("");
  };

  // ✅ VALIDATION + SEARCH
  const applySearchLetter = () => {
    const val = searchValue.trim().toLowerCase();

    if (!val) {
      setError("Please enter a letter");
      return;
    }

    if (!/^[a-z]$/.test(val)) {
      setError("Only one alphabet letter (A–Z) is allowed");
      return;
    }

    setError("");
    setLetter(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applySearchLetter();
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          Trace the Letter:{" "}
          <span style={styles.letterHighlight}>{letter.toUpperCase()}</span>
        </h2>

        {/* 🔍 SEARCH BOX */}
        <div style={styles.searchBox}>
          <input
            type="text"
            value={searchValue}
            placeholder="Type a letter (A–Z)"
            maxLength={1}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            style={styles.searchInput}
          />
          <button style={styles.searchButton} onClick={applySearchLetter}>
            Go
          </button>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <div className="flex justify-center items-center flex-col lg:flex-row gap-[1rem]">
          {/* Uppercase */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Capital Letter {upperDone && <span style={styles.checkmark}>✅</span>}
            </h3>
            <div style={styles.tracerBoxLarge}>
              <PathTracer
                letter={letter}
                isUpper={true}
                onProgress={() => {}}
                onComplete={handleUpperComplete}
              />
            </div>
          </div>

          {/* Lowercase */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Small Letter {lowerDone && <span style={styles.checkmark}>✅</span>}
            </h3>
            <div style={styles.tracerBoxSmall}>
              <PathTracer
                letter={letter}
                isUpper={false}
                onProgress={() => {}}
                onComplete={handleLowerComplete}
              />
            </div>
          </div>
        </div>

        {bothDone && (
          <div style={styles.nextContainer}>
            <button style={styles.nextButton} onClick={goToNextLetter}>
              Next Letter → {getNextLetter(letter).toUpperCase()}
            </button>
            <p style={styles.completionMessage}>
              Great job! Both letters completed 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    minHeight: "100vh",
    padding: "20px 16px",
    background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  card: {
    width: "100%",
    maxWidth: "720px",
    background: "white",
    borderRadius: "24px",
    padding: "32px 24px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
  },
  title: {
    textAlign: "center",
    fontSize: "clamp(28px, 6vw, 40px)",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "24px",
  },
  letterHighlight: {
    color: "#2563eb",
    fontWeight: 800,
  },

  /* 🔍 SEARCH */
  searchBox: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  searchInput: {
    width: "120px",
    padding: "10px 14px",
    fontSize: "20px",
    textAlign: "center",
    borderRadius: "10px",
    border: "2px solid #3b82f6",
    outline: "none",
  },
  searchButton: {
    padding: "10px 20px",
    fontSize: "18px",
    fontWeight: 600,
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#3b82f6",
    color: "#fff",
  },
  errorText: {
    textAlign: "center",
    color: "#dc2626",
    fontWeight: 500,
    marginBottom: "12px",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "12px",
  },
  checkmark: {
    marginLeft: "8px",
    fontSize: "24px",
  },
  tracerBoxLarge: {
    width: "100%",
    borderRadius: "16px",
    border: "2px solid #3b82f6",
    overflow: "hidden",
  },
  tracerBoxSmall: {
    width: "100%",
    borderRadius: "16px",
    border: "2px solid #f59e0b",
    overflow: "hidden",
  },
  nextContainer: {
    textAlign: "center",
    marginTop: "40px",
  },
  nextButton: {
    padding: "14px 36px",
    fontSize: "20px",
    fontWeight: 600,
    color: "white",
    backgroundColor: "#10b981",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
  },
  completionMessage: {
    marginTop: "12px",
    fontSize: "18px",
  },
};

export default WriteLetter;
