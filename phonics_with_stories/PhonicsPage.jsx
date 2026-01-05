import React, { useRef, useState } from "react";
import all_phonics_sound from "./letter_sound.json";

function PhonicsPage({ pageData, onNext }) {
const audioRef = useRef(null);
const [activeIndex, setActiveIndex] = useState(null);

const stopAllAudio = () => {
  // stop speech
  speechSynthesis.cancel();

  // stop phonics audio
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  }
};
  // play audio file and wait till it finishes
  // const playAudioFile = (url) =>
  //   new Promise((resolve) => {
  //     const audio = new Audio(url);
  //     audio.onended = resolve;
  //     audio.onerror = resolve;
  //     audio.play();
  //   });
  const playAudioFile = (url) =>
  new Promise((resolve) => {
    stopAllAudio(); 

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = resolve;
    audio.onerror = resolve;
    audio.play();
  });


  // fallback speech
  // const playSpeech = (text) =>
  //   new Promise((resolve) => {
  //     const u = new SpeechSynthesisUtterance(text);
  //     u.rate = 0.7;
  //     u.lang = "en-US";
  //     u.onend = resolve;
  //     speechSynthesis.speak(u);
  //   });
  const playSpeech = (text) =>
  new Promise((resolve) => {
    stopAllAudio(); // 👈 stop previous first

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.7;
    u.lang = "en-US";
    u.onend = resolve;

    speechSynthesis.speak(u);
  });


  // const playPhonics = async () => {
  //   speechSynthesis.cancel();

  //   for (let sound of pageData.phonemes) {
  //     // normalize (important)
  //     const normalizedSound = sound.toLowerCase().replace(/[^a-z]/g, "");

  //     const match = all_phonics_sound.All_letters.find(
  //       (item) => item.lab.toLowerCase() === normalizedSound
  //     );

  //     if (match?.audio) {
  //       await playAudioFile(match.audio);
  //     } else {
  //       await playSpeech(sound);
  //     }

  //     // small gap between sounds
  //     await new Promise((res) => setTimeout(res, 300));
  //   }

  //   // play full word at end
  //   await playSpeech(pageData.target_word);
  // };
// const playPhonics = async () => {
//   stopAllAudio(); // 👈 stop before starting
//   speechSynthesis.cancel();

//   for (let sound of pageData.phonemes) {
//     const normalizedSound = sound.toLowerCase().replace(/[^a-z]/g, "");

//     const match = all_phonics_sound.All_letters.find(
//       (item) => item.lab.toLowerCase() === normalizedSound
//     );

//     if (match?.audio) {
//       await playAudioFile(match.audio);
//     } else {
//       await playSpeech(sound);
//     }

//     await new Promise((res) => setTimeout(res, 300));
//   }

//   await playSpeech(pageData.target_word);
// };
const playPhonics = async () => {
  stopAllAudio();
  speechSynthesis.cancel();

  const letters = pageData.target_word.split("");

  for (let i = 0; i < letters.length; i++) {
    const sound = letters[i];
    const normalizedSound = sound.toLowerCase().replace(/[^a-z]/g, "");

    setActiveIndex(i); // 🔥 highlight current letter

    const match = all_phonics_sound.All_letters.find(
      (item) => item.lab.toLowerCase() === normalizedSound
    );

    if (match?.audio) {
      await playAudioFile(match.audio);
    } else {
      await playSpeech(sound);
    }

    await new Promise((res) => setTimeout(res, 300));
  }

  setActiveIndex(null); // remove highlight
  await playSpeech(pageData.target_word);
};


  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      {/* Target Word */}
      <div className="flex justify-center items-center relative w-[95%] md:w-[80%] lg:w-[50%] xl:w-[40%] h-[60%] md:h-full">
        <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/flipStoryPage.png" alt="flipStoryPage"  className="absolute w-full h-full"/>
        <div className="w-full h-[80%] flex flex-col items-center justify-between gap-6 z-10">
                   <h1 className="text-4xl font-extrabold text-white">
        {pageData.target_word}
      </h1>
            {/* Phonemes */}
      <div className="flex gap-4 h-[110px] md:h-[100px] overflow-y-auto scroll-smooth custom-scroll justify-center items-center flex-wrap w-[90%]">
        {pageData.target_word.split("").map((p, i) => (
          <h2
            key={i}
            className=" font-bold flex justify-center items-center  rounded-xl bg-center bg-cover w-[3rem] h-[3rem]  md:w-[5rem] md:h-[5rem]"
            style={{
              backgroundImage:"url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/phonicsStoryLetterBg.png)"
            }}
          >
            {/* <span className="text-white text-[1.5rem] font-extrabold">{p}</span> */}
            <span
  className={`text-[1.5rem] font-extrabold transition-all duration-300 ${
    activeIndex === i
      ? "text-black scale-125 drop-shadow-[0_0_10px_#FFD700]"
      : "text-white"
  }`}
>
  {p}
</span>

          </h2>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex w-[90%] justify-center items-center flex-row gap-[0.5rem]">
        <button
          onClick={playPhonics}
          className="px-4 py-2  w-[8rem] lg:w-[10rem] "
        >
          <img src={"https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/playLine.png"} alt="storyPlayIcon"  />
        </button>

        <button
           onClick={() => {
    stopAllAudio();
    onNext();
  }}
          className="px-4 py-2  w-[8rem] lg:w-[10rem]"
        >
          <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/storyNext.png" alt="storyNext"   />
        </button>
      </div>  
        </div>
      </div>



    </div>
  );
}

export default PhonicsPage;
