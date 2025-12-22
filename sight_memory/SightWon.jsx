import React from 'react'

function SightWon() {
 
  if (screen === "won") {
    // if (true ) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-r from-cyan-500 from- via-blue-500 via- h-[100vh]"
        style={{ fullScreenStyle }}
      >
        {/* <div className="bg-gradient-to-r from-teal-200 to-teal-500 rounded-2xl relative  p-8  w-[70%] xl:w-[60%] text-center flex justify-center items-center flex-col shadow-md gap-[0rem]">
         */}
        <div className=" rounded-2xl relative  p-8  w-[70%] xl:w-[60%] text-center flex justify-center items-center flex-col  gap-[0rem]">
          <img
            src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/nextLevel.png"
            alt="level"
            className="relative xl:w-[70%] h-[90%] rounded-2xl xl:mt-[-4rem]"
          />
          <div className=" flex gap-3 justify-center xl:mt-[-4rem] level-buttons">
            <button
              className=" px-5 relative rounded-xl text-white font-semibold  flex justify-center items-center "
              onClick={() => {
                // Clear current cards/state before moving ahead
                setCards([]);
                setRevealed({});
                setCross({});
                setLock(false);
                if (level < MAX_LEVEL) {
                  setLevel(level + 1);
                  setScreen("game");
                } else {
                  setLevel(1);
                  setScreen("title");
                }
              }}
            >
              <img
                src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/home.png"
                alt="level"
                className="w-[8rem] object-contain relative"
                style={{
                  boxShadow: "rgb(132 131 59) 1px 1px 3px",
                  borderRadius: "50px",
                }}
              />
              <span className="absolute text-sm text-[#fff] font-extrabold">
                {level < MAX_LEVEL ? "Next Level" : "Finish"}
              </span>
            </button>
            <button
              className="relative px-5 py-3 rounded-xl  font-semibold   flex justify-center items-center"
              onClick={() => {
                setCards([]);
                setRevealed({});
                setCross({});
                setLock(false);
                replayLevelRef.current = level;
                setScreen("game");
              }}
            >
              <img
                src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/showLevel.png"
                alt="level"
                className="w-[8rem]  object-contain relative "
                style={{
                  boxShadow: "#5b5b84 1px  1px 3px",
                  borderRadius: "50px",
                }}
              />

              <span className="absolute text-sm text-[#fff] font-extrabold">
                Replay Level
              </span>
            </button>
          </div>
          {/* </div> */}
        </div>
      </div>
    );
  }
}

export default SightWon


  {/* {!true && (
        <div className="  bg-black/80 absolute w-[100%] mx-auto h-full z-50 flex justify-center items-center">
          <div
            className="w-[50%] h-[auto] bg-white mx-auto rounded-lg p-[1rem]"
            style={{
              background: " #2A7B9B",
              background:
                "linear-gradient(90deg, rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%)",
            }}
          >
            <div className="flex justify-center items-center flex-col gap-[1.5rem]">
              <h2 className="text-center text-lg md:text-xl from-neutral-50  drop-shadow">
                Daily limit is over! Come back tomorrow 🎉
                <br />
                Keep practicing and your brain will grow stronger every day!
                💡✨
              </h2>
              <Button />
            </div>
          </div>
        </div>
      )} */}