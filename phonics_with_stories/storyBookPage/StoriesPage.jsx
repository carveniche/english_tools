import React, { useState, useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import PhonicsLetterHearingPPage from "./PhonicsLetterHearingPPage";
import MainStoryBook from "./MainStoryBook";
      const story_data = [
    {
      status: true,
      message: "First Flip Word for this student",
      data: [
        {
          id: 1,
          title: "Sam and the Cap",
          phonics_letter:"z",
          thumbnail_image: "https://d3g74fig38xwgn.cloudfront.net/english_game/phonics-stories/st_01/sam01.png",
          daily_limit: false,
          story_pages: [
            {
              image: "https://picsum.photos/seed/cap/1200/1200",
              line: "Sam has a red cap",
              target_word: "cap",
              phonemes: ["k", "a", "p"],
            },
            {
                "image": "https://picsum.photos/seed/mat/1200/1200",
                "line": "The cat sits on the mat",
                "target_word": "mat",
                "phonemes": [
                    "m",
                    "a",
                    "t"
                ]
            },
            {
                "image": "https://picsum.photos/seed/pat/1200/1200",
                "line": "Sam can pat the cat",
                "targetWord": "pat",
                "phonemes": [
                    "/p/",
                    "/a/",
                    "/t/"
                ]
            },
            {
                "image": "https://picsum.photos/seed/fan/1200/1200",
                "line": "A fan spins by the mat",
                "targetWord": "fan",
                "phonemes": [
                    "/f/",
                    "/a/",
                    "/n/"
                ]
            }
          ],
          quiz_questions: [
            {
                "question_type": "horizontal ordering",
                "words": [
                    "c",
                    "a",
                    "p"
                ],
                "answer": "cap",
                "audio": "",
                "image": "https://picsum.photos/seed/fan2/1200/1200"
            },
            {
                "question_type": "multiple choice",
                "words": [
                    "fan",
                    "pat"
                ],
                "answer": "fan",
                "audio": "",
                "image": "https://picsum.photos/seed/fan2/1200/1200"
            },
            {
              question_type: "fill in the blanks",
              question_words: ["m", "a", ""],
              option_words: ["p", "d", "t"],
              answer: "t",
              image: "https://picsum.photos/seed/fan2/1200/1200",
            },
          ],
        },
      ],
    },
  ];
function Book({ backend_data,onFinishCorrect ,timespent }) {
  // console.log(timespent,"timespent")
  const [phonicsLetter, setPhonicsLetter] = useState(null);
  const [phonicsData, setPhonicsData] = useState(null);
  const [showNextStoryBtn, setShowNextStoryBtn] = useState(false);


  const [showStoryBookPage, setShowStoryBookPage] = useState(false);
 
  useEffect(() => {
    if (backend_data) {
      if (backend_data?.phonics_letter) {
        setPhonicsLetter(backend_data?.phonics_letter);
      }
      setPhonicsData(backend_data);
    }
  }, [backend_data]);

  // console.log(backend_data.phonics_letter);



  return (
    // <HTMLFlipBook
    //   width={370}
    //   height={500}
    //   maxShadowOpacity={0.5}
    //   drawShadow={true}
    //   showCover={true}
    //   size='fixed'
    // >

    // </HTMLFlipBook>
    <div className="relative w-full h-full  flex justify-center items-center overflow-hidden">
      <div
        className={`transition-all duration-700 ease-in-out transform
        ${
          showStoryBookPage
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
        absolute w-full h-full`}
      >
        <MainStoryBook
  phonicsData={phonicsData}
  timespent={timespent}
   onCorrect={() => {
            onFinishCorrect(); // notify parent
          }}
            onFinishQuiz={() => {
    onFinishCorrect(); 
  }}
/>

      </div>

      <div
        className={`transition-all duration-700 ease-in-out transform
        ${
          showStoryBookPage
            ? "-translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
        }
        absolute w-full h-full`}
      >
        
        <PhonicsLetterHearingPPage
          backendLetter={phonicsLetter}
          onStartStory={() => setShowStoryBookPage(true)}
        />
      </div>
    

    </div>
  );
}

export default Book;

//   const pokemonData = [
//     {
//       id: "006",
//       name: "Charizard",
//       types: ["Fire", "Flying"],
//       description: "Flies in search of strong opponents. Breathes extremely hot fire that melts anything, but never uses it on weaker foes."
//     },
//     {
//       id: "025",
//       name: "Pikachu",
//       types: ["Electric"],
//       description: "When Pikachu meet, they touch tails to exchange electricity as a greeting."
//     },
//     {
//       id: "125",
//       name: "Electabuzz",
//       types: ["Electric"],
//       description: "Often kept at power plants to regulate electricity. Competes with others to attract lightning during storms."
//     },
//     {
//       id: "185",
//       name: "Sudowoodo",
//       types: ["Rock"],
//       description: "Despite looking like a tree, its body is more like rock. Hates water and hides when it rains."
//     },
//     {
//       id: "448",
//       name: "Lucario",
//       types: ["Fighting", "Steel"],
//       description: "Can read thoughts and movements by sensing others' aura. No foe can hide from Lucario."
//     },
//     {
//       id: "658",
//       name: "Greninja",
//       types: ["Water", "Dark"],
//       description: "Creates throwing stars from compressed water that can slice through metal when thrown at high speed."
//     },
//     {
//       id: "491",
//       name: "Darkrai",
//       types: ["Dark"],
//       description: "A legendary Pokémon that appears on moonless nights, putting people to sleep and giving them nightmares."
//     }
//   ];

{
  /* <div className="page" style={{ background: 'transparent' }}>
        <div className="page-content cover">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg" 
            alt="Pokémon Logo" 
            className="pokemon-logo"
          />
        </div>
      </div> */
}

{
  /* {pokemonData.map((pokemon) => (
        <div className="page" key={pokemon.id}>
          <div className="page-content">
            <div className="pokemon-container">
              <img 
                src={`https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${pokemon.id}.png`} 
                alt={pokemon.name} 
              />
              <div className="pokemon-info">
                <h2 className="pokemon-name">{pokemon.name}</h2>
                <p className="pokemon-number">#{pokemon.id}</p>
                <div>
                  {pokemon.types.map((type) => (
                    <span key={type} className={`pokemon-type type-${type.toLowerCase()}`}>
                      {type}
                    </span>
                  ))}
                </div>
                <p className="pokemon-description">{pokemon.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))} */
}
