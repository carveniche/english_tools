import React, { useEffect, useRef, useState } from "react";
import MainCardWordFinder from "./MainCardWordFinder";

function FindTheWords({data}) {
    // console.log(data,"data")
  const shufflingTheCards = useRef();
  const timerDivRef = useRef();
  const [storingTime, setStoringTime] = useState(0);


  useEffect(() => {
    const showingTimer = setInterval(() => {
      setStoringTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(showingTimer);
  }, []);
const resetTimer = () => setStoringTime(0);

  const toggleFullscreen = () => {
  const geting_full_screen = document.getElementById('enable-full-screen');

  if (!document.fullscreenElement) {
    // Enter fullscreen
    if (geting_full_screen) {
      if (geting_full_screen.requestFullscreen) {
        geting_full_screen.requestFullscreen();
      } else if ((geting_full_screen).webkitRequestFullscreen) {
        (geting_full_screen ).webkitRequestFullscreen();
      } else if ((geting_full_screen).msRequestFullscreen) {
        (geting_full_screen ).msRequestFullscreen();
      }
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document).webkitExitFullscreen) {
      (document ).webkitExitFullscreen();
    } else if ((document ).msExitFullscreen) {
      (document ).msExitFullscreen();
    }
  }
};
  return (
    <>
      <div className="relative   h-auto flex justify-center items-center p-[2rem] " id="enable-full-screen" >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://d3g74fig38xwgn.cloudfront.net/teaching-tool/graphbackground.jpg)",
            // opacity: 0.3,
            zIndex: -1,
          }}
        ></div>
        <div className=" w-[95%] mx-auto flex justify-between items-start h-full flex-col gap-[1.5rem]">
          {/* timer */}
          <div className=" flex justify-between items-center w-full">
             <div className=" flex flex-row gap-[1rem] items-center">
             <button
             ref={timerDivRef}
              onClick={() => shufflingTheCards.current.shuffleCards()}
              className=" relative inline-flex items-center justify-center px-4 md:px-8 py-2.5 overflow-hidden  rounded-md w-[13rem]"
            >
             <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/sendup.png" className="w-full h-full"/>
            </button>
            </div>
                        <div className="timting-class-content relative flex flex-col items-center justify-center p-[0.3rem]   rounded-2xl">

            </div>
          </div>
          {/* card */}
          <div className=" w-full h-full ">
            <MainCardWordFinder setStoringTime={setStoringTime} storing={storingTime} ref={shufflingTheCards} data={data} resetTimer={resetTimer}
            />
          </div>
          {/* sound */}
        </div>
      </div>
    </>
  );
}

export default FindTheWords;
