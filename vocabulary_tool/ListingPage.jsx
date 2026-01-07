import React, { useState } from "react";
import "./css/main.css";
import Vocabulary from "./vocabulary/Vocabulary.tsx";


const ListingPage = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [toolData, setToolData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

//   const testData = {
//     words_data: [
//       {
//         set: 1,
//         is_completed: true, 
//         word_list: [
//           {
//             word: "run",
//             meaning: "To move quickly on foot",
//             sentence: "She likes to run in the park every morning.",
//             quote: "Run like the wind!",
//             phrase: "run the show",
//             phraseMeaning: "To be in charge or control",
//             image: "https://t3.ftcdn.net/jpg/13/93/23/60/240_F_1393236065_t9p9dLQ8c5MLAGixTQ8yIteNqQxu492N.jpg",
//             "translated_word": "दौड़ना",
//             "translated_meaning": "पैरों से तेजी से चलना",
//             "translated_sentence": "वह हर सुबह पार्क में दौड़ना पसंद करती है।",
//             "translated_quote": "हवा की तरह दौड़ो!",
//             "translated_phrase": "शो चलाना",
//             "translated_phraseMeaning": "जिम्मेदारी लेना या नियंत्रण करना"
            
//           },
//           {
//             word: "cat",
//             meaning: "A small animal often kept as a pet",
//             sentence: "The cat slept on the sofa all day.",
//             quote: "Curiosity killed the cat. - Proverb",
//             phrase: "let the cat out of the bag",
//             phraseMeaning: "reveal a secret",
//             image: "https://m.media-amazon.com/images/I/81dxjiYexOL._UF1000,1000_QL80_.jpg",
//              translated_word :"hello",
//           },
//           {
//             word: "pig",
//             meaning: "A farm animal with a flat nose",
//             sentence: "The pig rolled happily in the mud.",
//             quote: "Do not cast pearls before swine. - Proverb",
//             phrase: "eat like a pig",
//             phraseMeaning: "eat very messily",
//             image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTul3tfYswxAgJ89T2LwmmHiI5GULuK0k3oTfFZJ9xSKhY1n-nWzeRIhUhtDMHS_iS2vZc&usqp=CAU",
//              translated_word :"hello",
//           },
//           {
//             word: "fish",
//             meaning: "An animal that lives in water and has fins",
//             sentence: "We saw colorful fish in the pond.",
//             quote: "A big fish in a small pond. - Proverb",
//             phrase: "fish out of water",
//             phraseMeaning: "feel uncomfortable",
//             image: "https://i.pinimg.com/564x/a0/1e/e1/a01ee144ef543cfc7fdd2fe701a6ddfe.jpg",
//              translated_word :"hello",
//           },
//           {
//             word: "duck",
//             meaning: "A bird that swims and quacks",
//             sentence: "The duck swam across the lake.",
//             quote: "Like water off a duck's back. - Proverb",
//             phrase: "sitting duck",
//             phraseMeaning: "easy target",
//             image: null,
//              translated_word :"hello",
//           },
//           {
//             word: "dolphin",
//             meaning: "A smart sea animal with a curved mouth",
//             sentence: "The dolphin jumped over the waves.",
//             quote: "The sea holds one in its net of wonder forever. - Cousteau",
//             phrase: "swim with dolphins",
//             phraseMeaning: "do something exciting",
//             image: null,
//              translated_word :"hello",
//           },
//           {
//             word: "zebra",
//             meaning: "An animal with black and white stripes",
//             sentence: "The zebra ran across the field.",
//             quote: "Nature wears the colors of the spirit. - Emerson",
//             phrase: "zebra crossing",
//             phraseMeaning: "pedestrian crossing",
//             image: null,
//              translated_word :"hello",
//           },
//           {
//             word: "panda",
//             meaning: "A large black and white bear from China",
//             sentence: "The panda ate bamboo for lunch.",
//             quote: "Save the pandas.",
//             phrase: "panda eyes",
//             phraseMeaning: "dark circles under eyes",
//             image: null,
//              translated_word :"hello",
//           },
//         ],
//         is_translated: true,
//         questions: [
//           {
//             question: { question: "Complete the action: ___ in the park." },
//             options: ["run", "cat", "pig"],
//           },
//           {
//             question: { question: "Complete the action: ___ slept on the sofa." },
//             options: ["cat", "run", "fish"],
//           },
//           {
//             question: { question: "Complete the action: ___ swam across the lake." },
//             options: ["duck", "zebra", "panda"],
//           },
//         ],
//     languages: [
//     { "code": "bn", "name": "Bengali" },
//     { "code": "gu", "name": "Gujarati" },
//     { "code": "hi", "name": "Hindi" },
//     { "code": "kn", "name": "Kannada" },
//     { "code": "ml", "name": "Malayalam" },
//     { "code": "mr", "name": "Marathi" },
//     { "code": "pa", "name": "Punjabi" },
//     { "code": "ta", "name": "Tamil" },
//     { "code": "te", "name": "Telugu" },
//     { "code": "ur", "name": "Urdu" },
//     { "code": "th", "name": "Thai" }
//   ],
//  category_id: "5",

//       },
//     ],
//     categories: [
//       { id: 1, name: "Elementary" },
//       { id: 2, name: "Emotions" },
//       { id: 3, name: "Objects" },
//     ],
//   };


const testData ={
    "status": true,
    "message": "Data sent successfully",
    "words_data": [
        {
            "set": 1,
            "is_completed": false,
            "word_list": [
                // {
                //     "word": "snake",
                //     "meaning": "A long, thin reptile with no legs",
                //     "sentence": "The snake moved quietly through the grass.",
                //     "quote": "“Even snakes are afraid of snakes.” – Proverb",
                //     "phrase": "Snake in the grass",
                //     "phraseMeaning": null,
                // },
                // {
                //     "word": "cat",
                //     "meaning": "A small animal often kept as a pet",
                //     "sentence": "The cat slept on the sofa all day.",
                //     "quote": "“Curiosity killed the cat.” – Proverb",
                //     "phrase": "Let the cat out of the bag",
                //     "phraseMeaning": null
                // },
                // {
                //     "word": "pig",
                //     "meaning": "A farm animal with a flat nose",
                //     "sentence": "The pig rolled happily in the mud.",
                //     "quote": "“Don’t cast pearls before a pig.” – Proverb",
                //     "phrase": "Eat like a pig",
                //     "phraseMeaning": null
                // },
                {
                    "word": "fish",
                    "meaning": "An animal that lives in water and has fins",
                    "sentence": "We saw colorful fish in the pond.",
                    "quote": "“A big fish in a small pond.” – Proverb",
                    "phrase": "Fish out of water",
                    "phraseMeaning": null
                },
                {
                    "word": "duck",
                    "meaning": "A bird that swims and quacks",
                    "sentence": "The duck swam across the lake.",
                    "quote": "“Like water off a duck’s back.” – Proverb",
                    "phrase": "Sitting duck",
                    "phraseMeaning": null
                },
                {
                    "word": "dolphin",
                    "meaning": "A smart sea animal that can jump and play",
                    "sentence": "The dolphin leapt out of the ocean.",
                    "quote": "“Dolphins may leap, but they never forget to breathe.” – Saying",
                    "phrase": "Swim with dolphins",
                    "phraseMeaning": null
                },
                {
                    "word": "zebra",
                    "meaning": "An African animal with black-and-white stripes",
                    "sentence": "The zebra ran fast across the plain.",
                    "quote": "“You can’t change a zebra’s stripes.” – Proverb",
                    "phrase": "Horse of a different color",
                    "phraseMeaning": null
                },
                {
                    "word": "panda",
                    "meaning": "A big black-and-white bear that eats bamboo",
                    "sentence": "The panda munched on bamboo shoots.",
                    "quote": "“Save the panda, save the planet.” – Saying",
                    "phrase": "Panda eyes",
                    "phraseMeaning": null
                }
            ],
            // "questions": [
            //     {
            //         "question": {
            //             "question": "The ___ slid quietly on the ground, showing its long body."
            //         },
            //         "options": [
            //             // "earthworm",
            //             "duck",
            //             "snake",
            //             "fish"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "Timmy's pet ____ sat on the mat waiting for milk."
            //         },
            //         "options": [
            //             "dolphin",
            //             "zebra",
            //             "cat"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "The pink ___ rolled in the mud near the farm."
            //         },
            //         "options": [
            //             "pig",
            //             "snake",
            //             "fish"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "The ___ swam in the pond, moving its fins."
            //         },
            //         "options": [
            //             "fish",
            //             "cow",
            //             "cat"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "The ___ quacked loudly by the lake."
            //         },
            //         "options": [
            //             "duck",
            //             "fish",
            //             "pig"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "The ___ jumped out of the water and played with waves."
            //         },
            //         "options": [
            //             "cow",
            //             "dolphin",
            //             "cat"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "The ___ has black and white stripes on its body."
            //         },
            //         "options": [
            //             "fish",
            //             "pig",
            //             "zebra"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "The ___ eats bamboo in the forest."
            //         },
            //         "options": [
            //             "duck",
            //             "pig",
            //             "panda"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "I have ___ sugar."
            //         },
            //         "options": [
            //             "some",
            //             "a",
            //             "an"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "Can ____ come here, Maya?"
            //         },
            //         "options": [
            //             "me",
            //             "I",
            //             "you"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "____ like his sweater."
            //         },
            //         "options": [
            //             "he",
            //             "some",
            //             "the"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "____ enjoys singing her mother's songs."
            //         },
            //         "options": [
            //             "we",
            //             "me",
            //             "she"
            //         ]
            //     },
            //     {
            //         "question": {
            //             "question": "Are ____ coming to the party?"
            //         },
            //         "options": [
            //             "she",
            //             "they",
            //             "me"
            //         ]
            //     }
            // ]
        }
    ],
    "categories": [
        {
            "id": 1,
            "name": "Elementary"
        },
        {
            "id": 2,
            "name": "Beginner"
        },
        {
            "id": 3,
            "name": "Intermediate"
        },
        {
            "id": 4,
            "name": "Advanced"
        }
    ],
    "languages": [
        {
            "code": "bn",
            "name": "Bengali"
        },
        {
            "code": "gu",
            "name": "Gujarati"
        },
        {
            "code": "hi",
            "name": "Hindi"
        },
        {
            "code": "kn",
            "name": "Kannada"
        },
        {
            "code": "ml",
            "name": "Malayalam"
        },
        {
            "code": "mr",
            "name": "Marathi"
        },
        {
            "code": "pa",
            "name": "Punjabi"
        },
        {
            "code": "ta",
            "name": "Tamil"
        },
        {
            "code": "te",
            "name": "Telugu"
        },
        {
            "code": "ur",
            "name": "Urdu"
        },
        {
            "code": "th",
            "name": "Thai"
        }
    ],
    "category_id": 1

}
  function changeVacabularyTool(data) {
    setToolData(data);
  }

  window.changeVacabularyTool=changeVacabularyTool

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        {toolData && activeComponent === "Vocabulary" && (
          <Vocabulary toolData={toolData} />
        )}
      </div>
    );
  }
// toolData
// testData
if (toolData) {
  return <Vocabulary toolData={toolData} />;
} else {
  return (
    <p className="text-white text-lg font-semibold text-center p-8 bg-[#0F2A3D] min-h-[82vh] flex items-center justify-center">
      No Vocabulary Found
    </p>
  );
}

  return null; // Nothing to show if no active component or data
};

export default ListingPage;