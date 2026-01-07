import React, { useEffect, useState } from "react";
import LevelOne from "./level/LevelOne";
import LevelTwo from "./level/LevelTwo";
import LevelThree from "./level/LevelThree";

function AllLevel({ backendData }) {
  console.log(backendData[0]?.fun_game_data?.[0].game_detail?.level_data, "backendData");
  
  // Fix: backendData is already the game_detail object, not the nested structure
//   const levels = backendData?.level_data || [];
 const levels =backendData?.[0]?.fun_game_data?.[0]?.game_detail?.level_data || [];
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelTime, setLevelTime] = useState(30);
  const [overallTime, setOverallTime] = useState(0);
  const [levelFinished, setLevelFinished] = useState(false);

  const currentLevel = levels[currentLevelIndex];

  // 🕒 Overall timer
  useEffect(() => {
    const overallTimer = setInterval(() => {
      setOverallTime(t => t + 1);
    }, 1000);

    return () => clearInterval(overallTimer);
  }, []);

  // ⏱ Level timer
  useEffect(() => {
    if (levelFinished) return;

    if (levelTime === 0) {
      setLevelFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setLevelTime(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [levelTime, levelFinished]);

  // ✅ When user finishes level
  const finishLevel = () => {
    setLevelFinished(true);
  };

  // 🔁 Try again same level
  const tryAgain = () => {
    setLevelTime(30);
    setLevelFinished(false);
  };

  // ➡️ Next level
  const nextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(i => i + 1);
      setLevelTime(30);
      setLevelFinished(false);
    } else {
      alert("Next Set Will Load Here");
    }
  };

  // 🧱 Render correct level
  const renderLevel = () => {
    if (!currentLevel) return null;

    if (currentLevel.level_id === 1)
      return <LevelOne data={currentLevel} onFinish={finishLevel} />;

    if (currentLevel.level_id === 2)
      return <LevelTwo data={currentLevel} onFinish={finishLevel} />;

    if (currentLevel.level_id === 3)
      return <LevelThree data={currentLevel} onFinish={finishLevel} />;
  };

  return (
    <div style={{ padding: 20 }} className="h-full w-full justify-center items-center flex flex-col select-none">
      {/* <h3>Overall Time: {overallTime}s</h3>
      <h3>Level Time Left: {levelTime}s</h3>
      <h3>Level: {currentLevelIndex + 1}</h3> */}

      <hr />
   <div className="h-full w-full flex justify-center items-center">
      {renderLevel()}
      </div>

      <br />

      {levelFinished && (
        <div>
          <button onClick={tryAgain}>Try Again</button>
          {currentLevelIndex < levels.length - 1 ? (
            <button onClick={nextLevel}>Next Level</button>
          ) : (
            <button onClick={nextLevel}>Next Set</button>
          )}
        </div>
      )}
    </div>
  );
}

export default AllLevel;