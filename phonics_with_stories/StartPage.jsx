import React from 'react'

function StartPage() {
const STORY_DATA = [
  {
    id: 1,
    title: "Sam and the Cap",
    thumbnail_image :"https://picsum.photos/seed/cover/1200/900",
    story_pages: [
      {
        image: "https://picsum.photos/seed/cap/1200/1200",
        line: "Sam has a red cap",
        targetWord: "cap",
        phonemes: ["/k/", "/æ/", "/p/"],
      },
      {
        image: "https://picsum.photos/seed/mat/1200/1200",
        line: "The cat sits on the mat",
        targetWord: "mat",
        phonemes: ["/m/", "/æ/", "/t/"],
      },
    ],
    quizQuestion:[
        {
            question_type :"horizontal ordering",
            words:['c','a','p'],
            answer:"cap",
            audio: "",
            image:"https://picsum.photos/seed/fan2/1200/1200"

        },{
           question_type :"multiple choice",
            words:['fan','pat'],
            answer:"fan" ,
            audio: "",
            image:"https://picsum.photos/seed/fan2/1200/1200"
        },{
            question_type :"fill in the blanks",
            question_words:['m','','a'],
            option_words:['p','d','t'],
            answer:"t" ,
            image:"https://picsum.photos/seed/fan2/1200/1200"
        },

    ]
  },
];
const Ballon_data =[
    {
        id:1,
        targetWord:'d',
        image:"https://picsum.photos/seed/fan2/1200/1200",
        level_data :[
            {
             level_id :1,
             level_type:"easy",
             distact_words:['s','b','j','l','u'],
             correct_words:['d'],
            },
            {
             level_id :2,
             level_type:"medium",
             distact_words:['cap','done','jug','tape'],
             correct_words:['mad','sad','dad','card'],
            },
            {
             level_id :3,
             level_type:"hard",
             distact_words:['sad','card','cap','jug'],
             correct_words:['desk','dummy','done','data'],
            },
    ]   
    }
]
  return (
    <div>StartPage</div>
  )
}

export default StartPage