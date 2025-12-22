import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import DailyLimitCard from "./DailyLimit";
import Confetti from "../words_search/Confite";

const MainCardWordFinder = forwardRef(
  ({ storing, data, resetTimer, setStoringTime }, ref) => {
    //  ({ storing, onNextLevel }, ref) => {
    // console.log(storing,"storing")
    // const data = [
    //   { level_id: 888, words: ['h','s','t'] },
    // ];
    const [storingBackendData, setStoringBackendData] = useState(data);
    const [dataSetId, setDataSetId] = useState();
    const [showingDailyLimitCard, setShowingDailyLimit] = useState(false);
    const [showingOverALLData, setShowingOverALLData] = useState(false);

    useEffect(() => {
      if (!storingBackendData) return;
      const getting_data_set_Id = storingBackendData?.[0]?.position || 0;
      const isCompleted = storingBackendData?.[0]?.is_completed || false;
      const isWordsOver = storingBackendData?.[0]?.words_completed || false;
      const words = storingBackendData[0].words;
      const cardList = words.map((w, i) => ({ id: i + 1, card_name: w }));

      const dup = cardList.flatMap((card) => [
        { ...card, uniqueId: card.id + "-a" },
        { ...card, uniqueId: card.id + "-b" },
      ]);
      setDataSetId(getting_data_set_Id);
      setCards(shuffleArray(dup));
      setShowingDailyLimit(isCompleted);
      setShowingOverALLData(isWordsOver)
    }, [storingBackendData]);

    function shuffleArray(array) {
      return [...array].sort(() => Math.random() - 0.5);
    }

    const [cards, setCards] = useState([]);
    const [flippedState, setFlippedState] = useState({});
    const [matchedCards, setMatchedCards] = useState({});
    const [completed, setCompleted] = useState(false);
    //   const audioClick ='https://d3g74fig38xwgn.cloudfront.net/teaching-tool/clickbtN.wav'

    const shuffleCards = () => {
      const unmatched = cards.filter((c) => !matchedCards[c.uniqueId]);
      const matched = cards.filter((c) => matchedCards[c.uniqueId]);
      const shuffle = new Audio(
        "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/shuffle.mp3"
      );
      shuffle.play();
      setCards([...matched, ...shuffleArray(unmatched)]);
      setFlippedState({});
    };

    useImperativeHandle(ref, () => ({
      shuffleCards,
    }));

    const flipCard = (card) => {
      const { uniqueId } = card;

      if (matchedCards[uniqueId] || flippedState[uniqueId]) return;
      if (Object.keys(flippedState).length >= 2) return;
      const clickSound = new Audio(
        "https://d3g74fig38xwgn.cloudfront.net/teaching-tool/clickbtN.wav"
      );
      clickSound.play();
      const newFlipped = { ...flippedState, [uniqueId]: true };
      setFlippedState(newFlipped);

      const flippedCards = Object.keys(newFlipped);
      if (flippedCards.length === 2) {
        const [firstId, secondId] = flippedCards;
        const firstCard = cards.find((c) => c.uniqueId === firstId);
        const secondCard = cards.find((c) => c.uniqueId === secondId);

        if (firstCard.id === secondCard.id) {
          const correctSound = new Audio(
            "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/correct-answer.mp3"
          );
          correctSound.play();
          setMatchedCards((prev) => ({
            ...prev,
            [firstId]: true,
            [secondId]: true,
          }));
        }

        setTimeout(() => {
          setFlippedState((prev) => {
            const updated = { ...prev };
            if (!matchedCards[firstId]) delete updated[firstId];
            if (!matchedCards[secondId]) delete updated[secondId];
            return updated;
          });
        }, 1000);
      }
    };

    const allMatched =
      Object.keys(matchedCards).length === cards.length && cards.length > 0;

    const storingRef = useRef(storing);
    const dataSetIdRef = useRef(dataSetId);
    const showingDailyLimitRef = useRef(showingDailyLimitCard);
    const showingAllCardLimitRef = useRef(showingOverALLData);


    // keep refs updated
    useEffect(() => {
      storingRef.current = storing;
      dataSetIdRef.current = dataSetId;
      showingDailyLimitRef.current = showingDailyLimitCard;
      showingAllCardLimitRef.current = showingOverALLData;
    }, [storing, dataSetId,showingDailyLimitCard,showingOverALLData]);

    const handleTimspent = (data) => {
       if (showingDailyLimitRef.current) return;
       if (showingAllCardLimitRef.current) return;
      if (typeof sendingTimespent === "function") {
        sendingTimespent(data);
      } else {
        console.log("not found sendingTimespent function");
      }
      
  }
    useEffect(() => {
      storingRef.current = storing;
      dataSetIdRef.current = dataSetId;
    }, [storing, dataSetId]);

    useEffect(() => {
      const timerDiv = document.querySelector(".timting-class-content");
      if (allMatched) {
        if (timerDiv) timerDiv.style.display = "none";
        // console.log("hello");
        setStoringTime(0);
        // console.log(setStoringTime, "setStoringTime");
        setCompleted(true);
        const formdata = new FormData();
        formdata.append("position", dataSetIdRef.current);
        formdata.append("status", "completed");
        formdata.append("time_spent", storingRef.current);
        handleTimspent(formdata);
      }
    }, [allMatched]);

    useEffect(() => {
      const btn = document.getElementById("closing-btn");

      const onClick = () => {
        if (allMatched) return;
        const formdata = new FormData();
        formdata.append("position", dataSetIdRef.current);
        formdata.append("status", "inprogress");
        formdata.append("time_spent",storingRef.current);

        handleTimspent(formdata);

        if (typeof resetTimer === "function") {
          resetTimer();
        }
      };

      if (btn) btn.addEventListener("click", onClick);

      return () => {
        if (btn) btn.removeEventListener("click", onClick);
      };
    }, [allMatched]);

    const getting_next_level_data = async () => {
      const formData = new FormData();
      formData.append("position", dataSetIdRef.current);
      formData.append("status", "completed");

      try {
        // console.log("next");
        const response = await window.sight_memory_game(formData);
        //  const data = [
        //     { level_id: 888, words: ['h','s','t'] },
        //   ];
        setStoringBackendData(response.data);
        setMatchedCards({});
        setFlippedState({});
        setCompleted(false);
        const timerDiv = document.querySelector(".timting-class-content");
        setStoringTime(0);
        if (timerDiv) timerDiv.style.display = "flex";
        if (typeof resetTimer === "function") {
          resetTimer();
        }
      } catch (err) {
        console.error("Failed to load next level", err);
      }
    };


    return (
      <>
        {showingDailyLimitCard || showingOverALLData ? (
          <><div className="h-[10rem]">
            <DailyLimitCard showingDailyLimitRef={showingDailyLimitRef} showingAllCardLimitRef={showingAllCardLimitRef}/>
            </div>
          </>
        ) : (
          <>
            {allMatched && (
              <div className="flex justify-center absolute items-center w-full h-full left-0 top-0">
                <div className="w-full bg-black h-full  z-[1] opacity-[0.5]"></div>
                <button
                  onClick={getting_next_level_data}
                  className="bg-green-500 rounded absolute shadow-xl px-6 py-3  z-[2]"
                >
                  Next Level
                </button>
              </div>
            )}
            <div className="w-fit mx-auto grid grid-cols-3 xl:grid-cols-4 gap-6 place-items-center relative">
              {cards.map((card) => {
                const flipped =
                  flippedState[card.uniqueId] || matchedCards[card.uniqueId];
                  

                return (
                  <motion.div
                    key={card.uniqueId}
                    layout
                    onClick={() => flipCard(card)}
                    className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] xl:w-[150px] xl:h-[150px]  cursor-pointer perspective-1000 relative"
                  >
                    <motion.div
                      animate={{ rotateY: flipped ? 180 : 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 w-full h-full"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      
                      {/* Front */}
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, #8d837c, #5d564f 70%)`,
                          border: "3px solid #4b433e",
                          borderRadius: "20% 30% 25% 35%",
                          backfaceVisibility: "hidden",
                        }}
                      >
                
                      </div>

                      {/* Back */}
                      <div
                        className="absolute inset-0 flex items-center justify-center rounded-xl h2-large text-white  text-3xl font-bold"
                        style={{
                          background: flipped
                            ? matchedCards[card.uniqueId]
                              ? "rgb(71 245 33)"
                              : "#3e3a36"
                            : "#3e3a36",
                            boxShadow:flipped?matchedCards[card.uniqueId]?'2px 2px 16px -3px':'':'',
                            border: matchedCards[card.uniqueId]
                            ? "3px solid "
                            : "3px solid #4b433e",
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                                  {matchedCards[card.uniqueId] && (

      <Confetti />

  )}
                        {card.card_name}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </>
    );
  }
);

export default MainCardWordFinder;
