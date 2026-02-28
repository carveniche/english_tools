import React, { useRef, useState } from "react";
import FindTheWords from "./FindTheWords";
import { motion } from "framer-motion";
function FindTheWordsParent() {
  const [startThePage, setStartThePage] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [sendingBackendData, setSendingBackendData] = useState(null);
  const backendDataRef = useRef(null);
  const handleStartingTheGame = () => {
    if (!backendDataRef.current) {
      console.log("No backend data yet");
      return;
    }
    // setSendingBackendData(data)
    setSendingBackendData(backendDataRef.current);
    setStartThePage(true);
    console.log(sendingBackendData, "start btn sendingBackendData");
  };
  function gettingSightData(response) {
    // setSendingBackendData(response.data);
    backendDataRef.current = response.data;
  }
  window.gettingSightData = gettingSightData;
   const data = [
      { position: 888,
        is_completed:false,
        words_completed:true,
         words: ['between','althrough','uncommitted','hhh','jjj'] },
    ];

  // const [sendingBackendData,setSendingBackendData]=useState(data);

  return (
    <>
      {startThePage ? (
        sendingBackendData ? (
          <FindTheWords data={sendingBackendData} />
        ) : (
          <p>No data found</p>
        )
      ) : (
        <div className="relative  w-full h-[80vh] flex justify-center items-center flex-col-reverse gap-[2rem] xl:flex-col-reverse">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/allBg.png)",
            }}
          ></div>

          <button
            onClick={handleStartingTheGame}
            className="start-game-btn flex justify-center items-center w-[140px] z-[10]  active:scale-95"
          >
            <img
              src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/play.png"
              alt="Start Game"
              className="start-game-img rounded-[50px]"
            />
          </button>

          <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="xl:top-10 left-10 -translate-x-1/2 z-50 w-[22rem] md:w-[30rem] lg:w-[40rem] mx-auto"
          >
            <div className=" relative overflow-hidden flex justify-between items-start h-[20rem] md:h-[25rem] flex-row">
              {/* Toggle Button */}
              {showInfo ? (
                <img
                  src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/closeflip.png"
                  className="
      w-[3rem]
      cursor-pointer
      absolute
      z-10
      transition-transform duration-300
      hover:scale-110
      active:scale-95
      top-[3px]
      right-[13px]
    "
                  onClick={() => setShowInfo(!showInfo)}
                />
              ) : (
                <img
                  src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/howtoplays.png"
                  className="
      w-[5rem]
      cursor-pointer
      absolute
      z-10
      transition-transform duration-300
      hover:scale-110
      active:scale-95
      top-[3px]
      right-[8px]
    "
                  onClick={() => setShowInfo(!showInfo)}
                />
              )}
              {/* Title Card */}
              <img
                src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/flipTitle.png"
                className={`
      w-full absolute left-0 top-[30%]
      transition-all duration-500 ease-in-out
      ${showInfo ? "-translate-x-10 opacity-0" : "translate-x-0 opacity-100"}
    `}
              />

              {/* How To Play Card */}
              <img
                src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/howtoplay.png"
                className={`
      w-full absolute left-0 top-0
      transition-all duration-500 ease-in-out
      ${showInfo ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}
    `}
              />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default FindTheWordsParent;
