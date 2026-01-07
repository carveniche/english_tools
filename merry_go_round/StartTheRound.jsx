import React, { useEffect, useRef, useState } from "react";
import AllLevel from "./AllLevel";

function StartTheRound() {
      const TestingJson = [
    {
      status: true,
      message: "Fun Game detail fetched successfully",
      fun_game_data: [
        {
          fun_game_detail_id: 19,
          fun_game_id: 7,
          data_set_id: 1,
          game_detail: {
            level_data: [
              {
                level_id: 1,
                distractor_words: ["park","bark","dark","hand","sand","lamp","belt","milk","tent","bank","junk","mask","nest","desk","best",],
                correct_letters: ["park",'hand','lamp','tent','junk'],
              },
              {
                level_id: 2,
                distractor_sentences: [
                  "I live on a farm",
                  "I live in a forest",
                  "I live in a factory",
                  "I live in a house",
                ],
                correct_sentence: "I live on a farm",
              },
              {
                level_id: 3,
                question_data: "Pigs live on a ___",
                distractor_words: ["park", "tree", "farm"],
                correct_word: "farm",
              },
            ],
          },
        },
      ],
    }]
  
//   const [backendData, setBackendData] = useState(null);
  const [backendData, setBackendData] = useState(TestingJson);

  const [openingTheGame, setOpeningTheGame] = useState(false);
  const backendDataRef = useRef(null);
  const [levelId, setLevelId] = useState("");
  const level_data_id = useRef(levelId);
  const BackgroundAUDIO =new Audio('/merry-go-audio.mp3')

  useEffect(() => {
    level_data_id.current = levelId;
  }, [levelId, backendData]);


  function merry_go_round(data) {
    const payload = data?.fun_game_data?.[0];

    if (!payload || !payload.game_detail) {
      console.error("Invalid backend structure", data);
      return;
    }

    // Save level ID
    setLevelId(payload.fun_game_detail_id);
    level_data_id.current = payload.fun_game_detail_id;

    // Save backend game data
    backendDataRef.current = payload.game_detail;
    setBackendData(payload.game_detail);
  }

  useEffect(() => {
    window.merry_go_round = merry_go_round;

    return () => {
      delete window.merry_go_round; // cleanup on unmount
    };
  }, []);
//   const openTheGame = () => setOpeningTheGame(!openingTheGame);
  const openTheGame = (()=>{
    BackgroundAUDIO.play()
    setOpeningTheGame(!openingTheGame)
  });


  if (!backendData) {
    return (
      <div className="flex items-center justify-center h-screen text-black">
        Waiting for game data...
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-20vh)] border border-red-700 flex justify-center items-center">
      {openingTheGame ? (
        <AllLevel backendData={backendData} BgAudio={BackgroundAUDIO}/>
      ) : (
        <button onClick={openTheGame}>Start</button>
      )}
    </div>
  );
}

export default StartTheRound;
