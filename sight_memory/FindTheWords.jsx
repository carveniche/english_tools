import React, { useEffect, useRef, useState } from "react";
import MainCardWordFinder from "./MainCardWordFinder";

function FindTheWords({data}) {
    // console.log(data,"data")
  const shufflingTheCards = useRef();
  const timerDivRef = useRef();
  const [storingTime, setStoringTime] = useState(0);


  useEffect(() => {
//        const timer = setTimeout(() => {
//     if (timerDivRef.current) {
//       timerDivRef.current.click();
//       console.log("Clicked automatically after 5 seconds!");
//     }
//   }, 5000);
    const showingTimer = setInterval(() => {
      setStoringTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(showingTimer);
  }, []);
const resetTimer = () => setStoring(0);

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
            opacity: 0.3,
            zIndex: -1,
          }}
        ></div>
        <div className=" w-[95%] mx-auto flex justify-between items-start h-full flex-col gap-[1.5rem]">
          {/* timer */}
          <div className=" flex justify-between items-center w-full">
            {/* <h1>hello storingTime{storingTime}</h1> */}
             <div className=" flex flex-row gap-[1rem] items-center">
            {/* <div
           className=" flex justify-between items-center w-[3rem] cursor-pointer">
            <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/fullscreen.png" alt="full-screen" onClick={toggleFullscreen}/>
          </div> */}
             <button
             ref={timerDivRef}
              onClick={() => shufflingTheCards.current.shuffleCards()}
              className=" relative inline-flex items-center justify-center px-4 md:px-8 py-2.5 overflow-hidden tracking-tighter text-white bg-orange-600 rounded-md group"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out shadow-lg rounded-full group-hover:w-56 group-hover:h-56"></span>
              <span className="absolute bottom-0 left-0 h-full -ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-auto h-full opacity-100 object-stretch"
                  viewBox="0 0 487 487"
                >
                  <path
                    fill-opacity=".1"
                    fill-rule="nonzero"
                    fill="#FFF"
                    d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"
                  ></path>
                </svg>
              </span>
              <span className="absolute top-0 right-0 w-12 h-full -mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="object-cover w-full h-full"
                  viewBox="0 0 487 487"
                >
                  <path
                    fill-opacity=".1"
                    fill-rule="nonzero"
                    fill="#FFF"
                    d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"
                  ></path>
                </svg>
              </span>
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-200"></span>
              <span className="relative text-base font-semibold">
                Shuffle Me{" "}
              </span>
            </button>
            </div>
                        <div className="timting-class-content relative flex flex-col items-center justify-center p-[0.3rem]  border-4 border-black rounded-2xl bg-gray-100">
              <div className=" bg-black p-[0.25rem] rounded-lg flex items-center justify-center shadow-inner">
                <span className="text-green-400 font-mono  tracking-widest">
                  {storingTime}:Sec
                </span>
              </div>
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
