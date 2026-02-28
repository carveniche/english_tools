import React, { useState } from "react";
import SelectionPage from "./SelectionPage";
import { motion, AnimatePresence } from "framer-motion";
function StartRush() {
  const [showRush, setShowRush] = useState(false);
  const handleOpenRush = () => {
    setShowRush(!showRush);
  };
  return (
    <div
      className="flex justify-center items-center p-[1rem]
    max-w-full  h-[calc(100vh-10vh)] bg-no-repeat bg-center bg-cover select-none "
      style={{
        backgroundImage:
          "url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/rocketRushBg.png)",
      }}
      draggable={false}
    >
      {showRush ? (
        <SelectionPage />
      ) : (
        <div className="w-full h-[90%] flex  justify-center items-center relative">
          {/* <img
            src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/startRush.png"
            alt="startRush"
            className="w-[7rem] cursor-pointer"
            onClick={handleOpenRush}
            draggable={false}

          /> */}
          <img
            // src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/startingRushPage.png"
            src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/RocketRushBgNew.png"
            alt="startingRushPage"
            className="hidden lg:block h-full xl:h-auto"
            draggable={false}
          />
          <img
            src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/tabandmobileatart.png"
            alt="tabandmobileatart"
            className="block lg:hidden h-full lg:h-auto"
            draggable={false}
          />
          <div className=" w-[50%] absolute flex justify-center items-center flex-col gap-[1rem]">
            {/* 1️⃣ First Point */}
            <motion.div
              className="w-full flex justify-start items-center"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
            >
              <img
                // src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/secondContent.png"
                src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/FirstPonitRush.png"
                className="h-[5rem]"
                draggable={false}
              />
            </motion.div>

            {/* 2️⃣ Second Point */}
            <motion.div
              className="w-full flex justify-start items-center"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            >
              <img
                // src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/firstContentRush.png"
                src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/secondPonitRush.png"
                className="h-[5rem]"
                draggable={false}
              />
            </motion.div>

            {/* 3️⃣ Third Point */}
            <motion.div
              className="w-full flex justify-start items-center"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
            >
              <img
                // src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/thirdContentForRush.png"
                src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/ThirdPonitRush.png"
                className="h-[5rem]"
                draggable={false}
              />
            </motion.div>

            {/* 🚀 Start Button */}
            <motion.div
              className="w-full flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 1.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                // src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/StartTheRockertBtn.png"
                src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/StartRocketRushGame.png"
                className="h-[5rem] cursor-pointer"
                draggable={false}
                onClick={handleOpenRush}
              />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartRush;
