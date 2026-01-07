import React, { useEffect, useMemo, useRef, useState } from "react";

const STEP_MS = 1000;
const SET_SIZE = 10;
const SET_TIME_SEC = 60;

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeterministic(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDifferent(arr, disallow, rng) {
  if (arr.length < 2) return arr[0];
  let x = arr[Math.floor(rng() * arr.length)];
  let guard = 0;
  while (x === disallow && guard++ < 50) x = arr[Math.floor(rng() * arr.length)];
  return x;
}

const BANK = {
  cvc: [
    "cat","bat","hat","mat","rat","tap","map","cap","nap","sad","bad","dad","mad","bag","tag","rag",
    "pig","dig","fig","dip","lip","sip","tip","fin","pin","win","sit","hit","fit",
    "dog","log","hog","cot","hot","pot","top","mop","hop","rod","red","bed","web","jet","pen","hen","ten",
    "sun","fun","run","bug","hug","rug","cup","pup","mud","cut","gut"
  ],
  cvcc: [
    "park","bark","dark","hand","sand","lamp","belt","milk","tent","bank","junk","mask","nest","desk","best",
    "wind","kind","mint","gift","lift","soft","left","help","jump","bump","pump","camp","bend","send","fond",
    "tusk","dust","list","rest","fast"
  ],
  cvce: [
    "cake","bake","lake","made","game","name","same","tape","cape","late","gate","rate","home","rope","note","bone",
    "bike","like","time","nine","fine","rise","wide","hide","cute","cube","tune","mule","site","bite","take","case"
  ],
  cvvc: [
    "rain","pail","mail","tail","boat","goat","soap","road","seed","feet","meet","moon","food","soon","team","bead",
    "coat","toad","leaf","seat","cool","pool","wait"
  ],
};

const NOUNS = ["pig", "cat", "dog", "hen", "kid", "man"];
const PLACES = ["park", "farm", "pond", "home"];
const VERBS = ["see", "like", "ride", "make", "run", "jump", "sit", "hop"];
const ARTICLES = ["a", "the"];

function buildLevel1Questions(seed = 101) {
  const rng = mulberry32(seed);
  const pools = {
    cvc: shuffleDeterministic(BANK.cvc, rng).slice(0, 35),
    cvcc: shuffleDeterministic(BANK.cvcc, rng).slice(0, 25),
    cvce: shuffleDeterministic(BANK.cvce, rng).slice(0, 25),
    cvvc: shuffleDeterministic(BANK.cvvc, rng).slice(0, 15),
  };

  const targets = [
    ...pools.cvc.map((w) => ({ w, type: "cvc" })),
    ...pools.cvcc.map((w) => ({ w, type: "cvcc" })),
    ...pools.cvce.map((w) => ({ w, type: "cvce" })),
    ...pools.cvvc.map((w) => ({ w, type: "cvvc" })),
  ];

  const allWords = [...BANK.cvc, ...BANK.cvcc, ...BANK.cvce, ...BANK.cvvc];

  return targets.slice(0, 100).map((t, idx) => {
    const d1 = pickDifferent(allWords, t.w, rng);
    const d2 = pickDifferent(allWords, t.w, rng);
    const opts = shuffleDeterministic([t.w, d1, d2], rng);
    return {
      id: `L1-${idx + 1}`,
      level: 1,
      kind: "word",
      target: t.w,
      options: opts,
      promptText: `Tap the word that says ${t.w}.`,
      speak: `Tap the word that says ${t.w}.`,
    };
  });
}

function buildLevel2Questions(seed = 202) {
  const rng = mulberry32(seed);

  const makeSentence = () => {
    const pattern = Math.floor(rng() * 3);
    if (pattern === 0) {
      const v = VERBS[Math.floor(rng() * VERBS.length)];
      const art = ARTICLES[Math.floor(rng() * ARTICLES.length)];
      const objPool = rng() < 0.5 ? NOUNS : PLACES;
      const obj = objPool[Math.floor(rng() * objPool.length)];
      return `I ${v} ${art} ${obj}`;
    }
    if (pattern === 1) {
      const place = PLACES[Math.floor(rng() * PLACES.length)];
      return `I went to ${place}`;
    }
    const n = NOUNS[Math.floor(rng() * NOUNS.length)];
    const v2 = ["runs", "jumps", "sits", "hops"][Math.floor(rng() * 4)];
    return `The ${n} ${v2}`;
  };

  const seen = new Set();
  const targets = [];
  while (targets.length < 100) {
    const s = makeSentence();
    if (!seen.has(s)) {
      seen.add(s);
      targets.push(s);
    }
  }

  const tweakSentence = (s) => {
    const parts = s.split(" ");
    if (parts[0] === "I" && parts[1] === "went") {
      const place = pickDifferent(PLACES, parts[3], rng);
      return `I went to ${place}`;
    }
    if (parts[0] === "The") {
      const n = pickDifferent(NOUNS, parts[1], rng);
      const v2 = pickDifferent(["runs", "jumps", "sits", "hops"], parts[2], rng);
      return `The ${rng() < 0.5 ? n : parts[1]} ${rng() < 0.5 ? v2 : parts[2]}`;
    }
    const v = pickDifferent(VERBS, parts[1], rng);
    const art = pickDifferent(ARTICLES, parts[2], rng);
    const objPool = [...NOUNS, ...PLACES, ...BANK.cvc.slice(0, 18), ...BANK.cvce.slice(0, 10), ...BANK.cvcc.slice(0, 8)];
    const obj = pickDifferent(objPool, parts[3], rng);
    const choice = Math.floor(rng() * 3);
    if (choice === 0) return `I ${v} ${parts[2]} ${parts[3]}`;
    if (choice === 1) return `I ${parts[1]} ${art} ${parts[3]}`;
    return `I ${parts[1]} ${parts[2]} ${obj}`;
  };

  return targets.map((target, idx) => {
    const d1 = tweakSentence(target);
    const d2 = tweakSentence(target);
    const opts = shuffleDeterministic([target, d1, d2], rng);
    return {
      id: `L2-${idx + 1}`,
      level: 2,
      kind: "sentence",
      target,
      options: opts,
      promptText: "Tap the sentence I said.",
      speak: `Tap the sentence I said. ${target}.`,
      speakTargetOnly: target,
    };
  });
}

function buildLevel3Questions(seed = 303) {
  const rng = mulberry32(seed);

  const stems = [
    { stem: "I went to the ___", pool: PLACES },
    { stem: "I see a ___", pool: NOUNS },
    { stem: "The ___ runs", pool: NOUNS },
    { stem: "I like the ___", pool: PLACES },
    { stem: "I ride a ___", pool: ["bike", "boat"] },
    { stem: "The pig is on the ___", pool: ["farm"] },
  ];

  const distractorPool = [...BANK.cvc, ...BANK.cvcc, ...BANK.cvce, ...BANK.cvvc, ...PLACES, ...NOUNS, "bike", "boat"];

  const qs = [];
  for (let i = 0; i < 100; i++) {
    const st = stems[Math.floor(rng() * stems.length)];
    const target = st.pool[Math.floor(rng() * st.pool.length)];
    const d1 = pickDifferent(distractorPool, target, rng);
    const d2 = pickDifferent(distractorPool, target, rng);
    const options = shuffleDeterministic([target, d1, d2], rng);
    qs.push({
      id: `L3-${i + 1}`,
      level: 3,
      kind: "completion",
      stem: st.stem,
      target,
      options,
      promptText: "Finish the sentence.",
      speak: `Finish the sentence. ${st.stem.replace("___", "blank")}.`,
    });
  }
  return qs;
}

function speak(text, rate = 0.95) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1.1;
    u.volume = 1;
    const voices = window.speechSynthesis.getVoices?.() || [];
    const pref = voices.find(
      (v) => /en/i.test(v.lang) && /female|Samantha|Google UK English Female/i.test(v.name)
    );
    if (pref) u.voice = pref;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
}

function masteryLabel(score) {
  if (score >= 6) return "Mastered";
  if (score >= 4) return "Strong";
  if (score >= 2) return "Practicing";
  return "New";
}

export default function App() {
  const levels = useMemo(
    () => ({
      1: buildLevel1Questions(101),
      2: buildLevel2Questions(202),
      3: buildLevel3Questions(303),
    }),
    []
  );

  const [level, setLevel] = useState(1);
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState("SET");
  const [timer, setTimer] = useState(SET_TIME_SEC);
  const [questionPos, setQuestionPos] = useState(0);
  const [repeatQueue, setRepeatQueue] = useState([]);
  const [repeatPos, setRepeatPos] = useState(0);

  const [carouselIdx, setCarouselIdx] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [tapGlow, setTapGlow] = useState(false);
  const [shake, setShake] = useState(false);

  const [setCorrectCount, setSetCorrectCount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [stars, setStars] = useState(0);
  const [tapStreak, setTapStreak] = useState(0);

  const masteryRef = useRef(new Map());
  const attemptsRef = useRef(new Map());

  const currentLevelQs = levels[level];
  const currentSetQs = useMemo(() => {
    const start = setIndex * SET_SIZE;
    return currentLevelQs.slice(start, start + SET_SIZE);
  }, [currentLevelQs, setIndex]);

  const currentQuestion = useMemo(() => {
    if (phase === "SET") return currentSetQs[questionPos];
    if (phase === "REPEAT") return currentSetQs[repeatQueue[repeatPos]];
    return null;
  }, [phase, currentSetQs, questionPos, repeatQueue, repeatPos]);

  useEffect(() => {
    if (!currentQuestion) return;
    const id = window.setInterval(() => {
      setCarouselIdx((x) => {
        const next = (x + 1) % currentQuestion.options.length;
        return next;
      });
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [currentQuestion]);

  useEffect(() => {
    setPulseKey((k) => k + 1);
  }, [carouselIdx, currentQuestion?.id]);

  useEffect(() => {
    if (phase !== "SET") return;
    setTimer(SET_TIME_SEC);
    const id = window.setInterval(() => {
      setTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, setIndex, level]);

  useEffect(() => {
    if (phase !== "SET") return;
    if (timer !== 0) return;
    if (repeatQueue.length > 0) {
      setPhase("REPEAT");
      setRepeatPos(0);
    } else {
      advanceToNextSetOrLevel();
    }
  }, [timer]);

  useEffect(() => {
    if (!currentQuestion) return;
    attemptsRef.current.set(currentQuestion.id, 0);

    if (level === 2 && currentQuestion.kind === "sentence") {
      speak("Tap the sentence I said.");
      setTimeout(() => speak(currentQuestion.target, 0.9), 450);
    } else {
      speak(currentQuestion.speak);
    }

    setCarouselIdx(0);
  }, [currentQuestion?.id, level]);

  const visibleOption = currentQuestion ? currentQuestion.options[carouselIdx] : "";

  function bumpGlow() {
    setTapGlow(true);
    window.setTimeout(() => setTapGlow(false), 260);
  }

  function bumpShake() {
    setShake(true);
    window.setTimeout(() => setShake(false), 260);
  }

  function updateMastery(qid, firstTryCorrect) {
    const prev = masteryRef.current.get(qid) ?? 0;
    masteryRef.current.set(qid, prev + (firstTryCorrect ? 2 : 1));
  }

  function addReward(firstTryCorrect) {
    setCoins((c) => c + 1);
    if (firstTryCorrect) setStars((s) => s + 1);

    setTapStreak((st) => {
      const next = st + 1;
      if (next === 5 || next === 10 || next === 15) setStars((s) => s + 1);
      return next;
    });
  }

  function onTap() {
    if (!currentQuestion) return;

    const qid = currentQuestion.id;
    const isCorrect = visibleOption === currentQuestion.target;

    const prevAttempts = attemptsRef.current.get(qid) ?? 0;
    const nextAttempts = prevAttempts + 1;
    attemptsRef.current.set(qid, nextAttempts);

    if (isCorrect) {
      bumpGlow();
      setSetCorrectCount((x) => x + 1);

      const firstTryCorrect = nextAttempts === 1;
      updateMastery(qid, firstTryCorrect);
      addReward(firstTryCorrect);

      if (level === 1 || level === 3) speak(currentQuestion.target, 0.92);
      if (level === 2) speak("Yes!", 0.95);

      attemptsRef.current.set(qid, 0);

      if (phase === "SET") {
        const nextQPos = questionPos + 1;
        if (nextQPos < SET_SIZE) {
          setQuestionPos(nextQPos);
        } else {
          if (setCorrectCount + 1 >= 8) setCoins((c) => c + 5);
          if (repeatQueue.length > 0) {
            setPhase("REPEAT");
            setRepeatPos(0);
          } else {
            advanceToNextSetOrLevel();
          }
        }
      } else {
        const nextPos = repeatPos + 1;
        if (nextPos < repeatQueue.length) {
          setRepeatPos(nextPos);
        } else {
          advanceToNextSetOrLevel();
        }
      }
    } else {
      bumpShake();
      setTapStreak(0);
      speak("Try again.");
      if (phase === "SET") {
        const relIdx = questionPos;
        setRepeatQueue((q) => (q.includes(relIdx) ? q : [...q, relIdx]));
      }
    }
  }

  function advanceToNextSetOrLevel() {
    setPhase("SET");
    setQuestionPos(0);
    setRepeatQueue([]);
    setRepeatPos(0);
    setSetCorrectCount(0);
    setTapStreak(0);

    const nextSet = setIndex + 1;
    if (nextSet < 10) {
      setSetIndex(nextSet);
      return;
    }
    setPhase("LEVEL_DONE");
  }

  function goNextLevel() {
    const next = level + 1;
    if (level >= 3) return;
    setLevel(next);
    setSetIndex(0);
    setPhase("SET");
    setQuestionPos(0);
    setRepeatQueue([]);
    setRepeatPos(0);
    setCarouselIdx(0);
    setSetCorrectCount(0);
    setTapStreak(0);
    setTimer(SET_TIME_SEC);
    speak("Next level!", 0.95);
  }

  const topPrompt = useMemo(() => {
    if (!currentQuestion) return "";
    if (level === 2) return "Tap the sentence I said.";
    if (level === 3) return "Finish the sentence.";
    return currentQuestion.promptText;
  }, [currentQuestion, level]);

  const stemText = useMemo(() => {
    if (!currentQuestion) return "";
    if (level !== 3) return "";
    return currentQuestion.stem || "";
  }, [currentQuestion, level]);

  const scoreText = `${setCorrectCount}/10`;
  const timeText = phase === "SET" ? `${timer}s` : "—";

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <div style={styles.promptWrap}>
        <div style={styles.promptBox}>
          <div style={styles.promptMascot}>
            <div style={styles.mascotFace}>🐛</div>
            <div style={styles.mascotBulb}>💡</div>
          </div>
          <div style={styles.promptText}>{topPrompt}</div>
          <button
            style={styles.audioBtn}
            onClick={() => {
              if (!currentQuestion) return;
              if (level === 2 && currentQuestion.kind === "sentence") {
                speak("Tap the sentence I said.");
                setTimeout(() => speak(currentQuestion.target, 0.9), 450);
              } else {
                speak(currentQuestion.speak);
              }
            }}
            aria-label="Hear prompt"
          >
            🔊
          </button>
        </div>
      </div>

      <div style={styles.stageRow}>
        <div style={styles.stage}>
          <div style={styles.skyCard}>
            <div style={styles.merryWrap}>
              <div style={styles.merryRoof} />
              <div style={styles.merryPennants} />
              <div style={styles.merryPole} />

              <button
                onClick={onTap}
                className={shake ? "shake" : ""}
                style={{
                  ...styles.frontCard,
                  boxShadow: tapGlow
                    ? "0 0 0 10px rgba(250,204,21,0.22), 0 18px 50px rgba(0,0,0,0.16)"
                    : "0 18px 40px rgba(0,0,0,0.12)",
                }}
                aria-label="Tap option"
              >
                {level === 3 && (
                  <div style={styles.stemLine}>
                    {stemText.replace("___", "____")}
                  </div>
                )}

                <div key={pulseKey} className="pop" style={styles.optionText}>
                  {visibleOption}
                </div>

                <div style={styles.handWrap}>
                  <div
                    className={tapGlow ? "sparkle" : ""}
                    style={{
                      ...styles.sparkleRing,
                      opacity: tapGlow ? 1 : 0.35,
                    }}
                  />
                  <div style={styles.hand}>🖐️</div>
                </div>
              </button>

              <div style={styles.platform} />
            </div>

            <div style={styles.dotsWrap}>
              {Array.from({ length: SET_SIZE }).map((_, i) => {
                const active =
                  phase === "SET"
                    ? i === questionPos
                    : phase === "REPEAT"
                    ? i === (repeatQueue[repeatPos] ?? 0)
                    : false;
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.dot,
                      opacity: active ? 1 : 0.25,
                      transform: active ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                );
              })}
              <div style={styles.phaseTag}>
                {phase === "REPEAT" ? "Repeat" : phase === "SET" ? "Set" : "Done"}
              </div>
            </div>

            {phase === "LEVEL_DONE" && (
              <div style={styles.overlay}>
                <div style={styles.overlayCard}>
                  <div style={styles.overlayTitle}>🎉 Level {level} complete!</div>
                  <div style={styles.overlayText}>You can go to the next level.</div>
                  <div style={styles.overlayBtns}>
                    <button
                      style={{
                        ...styles.bigBtn,
                        opacity: level < 3 ? 1 : 0.4,
                        cursor: level < 3 ? "pointer" : "not-allowed",
                      }}
                      onClick={goNextLevel}
                      disabled={level >= 3}
                    >
                      Next level →
                    </button>
                    <button
                      style={styles.bigBtnSecondary}
                      onClick={() => {
                        setSetIndex(0);
                        setPhase("SET");
                        setQuestionPos(0);
                        setRepeatQueue([]);
                        setRepeatPos(0);
                        setSetCorrectCount(0);
                        setTapStreak(0);
                        setTimer(SET_TIME_SEC);
                        setCarouselIdx(0);
                        speak("Let's play again!", 0.95);
                      }}
                    >
                      Play again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.sideButtons}>
          <div style={styles.sideBtn}>
            <div style={styles.sideLabel}>Score</div>
            <div style={styles.sideValue}>{scoreText}</div>
          </div>
          <div style={styles.sideBtn}>
            <div style={styles.sideLabel}>Time</div>
            <div style={styles.sideValue}>{timeText}</div>
          </div>

          <button
            style={styles.sideSmall}
            onClick={() => {
              if (!currentQuestion) return;
              if (level === 2 && currentQuestion.kind === "sentence") {
                speak("Tap the sentence I said.");
                setTimeout(() => speak(currentQuestion.target, 0.9), 450);
              } else {
                speak(currentQuestion.speak);
              }
            }}
          >
            🔊 Repeat
          </button>
        </div>
      </div>

      <div style={styles.footer}>
        <span>
          Level <b>{level}</b> • Set <b>{setIndex + 1}</b>/10
        </span>
        <span style={{ opacity: 0.7 }}>
          Mastery sample: <b>{masteryLabel(masteryRef.current.get(currentQuestion?.id || "") ?? 0)}</b>
        </span>
        <span style={{ opacity: 0.7 }}>
          (coins {coins}, stars {stars}, streak {tapStreak})
        </span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 18,
    background:
      "linear-gradient(135deg, rgba(45,212,191,0.22), rgba(59,130,246,0.16), rgba(250,204,21,0.12))",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },

  promptWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16,
  },
  promptBox: {
    width: "min(980px, 96vw)",
    borderRadius: 22,
    padding: "14px 16px",
    background:
      "linear-gradient(180deg, rgba(187,247,208,0.70), rgba(254,249,195,0.55))",
    border: "2px solid rgba(34,197,94,0.25)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.10)",
    display: "grid",
    gridTemplateColumns: "72px 1fr 54px",
    alignItems: "center",
    gap: 12,
  },
  promptMascot: {
    width: 72,
    height: 52,
    borderRadius: 16,
    background: "rgba(34,197,94,0.14)",
    position: "relative",
    display: "grid",
    placeItems: "center",
  },
  mascotFace: { fontSize: 28, transform: "translateY(1px)" },
  mascotBulb: {
    position: "absolute",
    top: -10,
    right: -8,
    fontSize: 18,
    filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.12))",
  },
  promptText: {
    fontSize: 28,
    fontWeight: 900,
    color: "rgba(124,45,18,0.95)",
    textAlign: "center",
    lineHeight: 1.1,
  },
  audioBtn: {
    width: 54,
    height: 54,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontSize: 22,
    boxShadow: "0 12px 26px rgba(0,0,0,0.10)",
  },

  stageRow: {
    width: "min(1180px, 98vw)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 140px",
    gap: 14,
    alignItems: "center",
  },

  stage: {
    borderRadius: 26,
    padding: 12,
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
  },

  skyCard: {
    borderRadius: 22,
    height: 560,
    background:
      "linear-gradient(180deg, rgba(224,242,254,0.92), rgba(255,255,255,0.92))",
    border: "1px solid rgba(0,0,0,0.06)",
    position: "relative",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    padding: 12,
  },

  merryWrap: {
    position: "relative",
    width: "min(820px, 92%)",
    height: 460,
    borderRadius: 24,
    display: "grid",
    placeItems: "center",
  },
  merryRoof: {
    position: "absolute",
    top: 36,
    width: "78%",
    height: 140,
    borderRadius: "60% 60% 18% 18%",
    background:
      "linear-gradient(180deg, rgba(59,130,246,0.75), rgba(59,130,246,0.38))",
    transform: "translateY(-90px)",
    filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.12))",
  },
  merryPennants: {
    position: "absolute",
    top: 88,
    width: "78%",
    height: 24,
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(250,204,21,0.85), rgba(34,197,94,0.70), rgba(59,130,246,0.70), rgba(244,63,94,0.70), rgba(250,204,21,0.85))",
    opacity: 0.95,
    filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.10))",
  },
  merryPole: {
    position: "absolute",
    top: 118,
    width: 10,
    height: 260,
    borderRadius: 999,
    background: "linear-gradient(180deg, rgba(234,179,8,0.9), rgba(234,179,8,0.25))",
    opacity: 0.9,
  },

  platform: {
    position: "absolute",
    bottom: 52,
    width: "92%",
    height: 92,
    borderRadius: 999,
    background: "linear-gradient(180deg, rgba(244,63,94,0.75), rgba(244,63,94,0.35))",
    filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.14))",
  },

  frontCard: {
    position: "absolute",
    bottom: 102,
    width: "min(660px, 92%)",
    height: 170,
    borderRadius: 22,
    border: "2px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.96)",
    cursor: "pointer",
    display: "grid",
    alignContent: "center",
    justifyItems: "center",
    padding: 14,
    userSelect: "none",
  },

  stemLine: {
    width: "100%",
    textAlign: "center",
    fontSize: 22,
    fontWeight: 900,
    opacity: 0.7,
    marginBottom: 6,
  },

  optionText: {
    fontSize: 62,
    fontWeight: 950,
    letterSpacing: 0.2,
    lineHeight: 1,
  },

  handWrap: {
    position: "absolute",
    right: 28,
    bottom: 18,
    display: "grid",
    placeItems: "center",
  },
  sparkleRing: {
    width: 82,
    height: 82,
    borderRadius: 999,
    border: "4px solid rgba(250,204,21,0.90)",
    boxShadow: "0 0 0 10px rgba(250,204,21,0.16)",
    background: "rgba(255,255,255,0.0)",
  },
  hand: { fontSize: 34, marginTop: -18 },

  dotsWrap: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "rgba(0,0,0,0.35)",
    transition: "transform 120ms ease, opacity 120ms ease",
  },
  phaseTag: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 900,
    color: "rgba(15,23,42,0.7)",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.06)",
  },

  sideButtons: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "stretch",
  },
  sideBtn: {
    borderRadius: 18,
    padding: "12px 12px",
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(0,0,0,0.10)",
    boxShadow: "0 16px 34px rgba(0,0,0,0.10)",
    textAlign: "center",
  },
  sideLabel: {
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.7,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  sideValue: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: 950,
  },
  sideSmall: {
    height: 46,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.90)",
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 16px 34px rgba(0,0,0,0.10)",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(15,23,42,0.35)",
    display: "grid",
    placeItems: "center",
    padding: 18,
  },
  overlayCard: {
    width: "min(520px, 92%)",
    background: "white",
    borderRadius: 22,
    padding: 18,
    border: "1px solid rgba(0,0,0,0.10)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
    textAlign: "center",
  },
  overlayTitle: { fontSize: 22, fontWeight: 950 },
  overlayText: { marginTop: 8, fontSize: 14, opacity: 0.85 },
  overlayBtns: { display: "flex", gap: 10, marginTop: 14 },
  bigBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "rgba(34,197,94,0.18)",
    fontWeight: 950,
    cursor: "pointer",
  },
  bigBtnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    fontWeight: 950,
    cursor: "pointer",
  },

  footer: {
    width: "min(1180px, 98vw)",
    margin: "12px auto 0",
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    padding: "0 4px",
  },
};

const css = `
  .pop { animation: popIn 220ms ease-out; }
  @keyframes popIn {
    from { transform: translateY(6px) scale(0.98); opacity: 0.0; }
    to   { transform: translateY(0px) scale(1.0); opacity: 1.0; }
  }
  .sparkle { animation: sparklePulse 260ms ease-out; }
  @keyframes sparklePulse {
    0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
    70% { transform: scale(1.06); filter: drop-shadow(0 14px 18px rgba(250,204,21,0.35)); }
    100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
  }
  .shake { animation: shakeX 220ms ease-in-out; }
  @keyframes shakeX {
    0% { transform: translateX(0px); }
    25% { transform: translateX(-6px); }
    50% { transform: translateX(6px); }
    75% { transform: translateX(-4px); }
    100% { transform: translateX(0px); }
  }
`;