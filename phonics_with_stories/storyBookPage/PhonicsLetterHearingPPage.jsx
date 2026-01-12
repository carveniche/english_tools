import React, { useRef, useState } from "react";
import PhonicsletterSound from '../letter_sound.json'
import LetterPageDescription from "./LetterPageDescription";
function PhonicsLetterHearingPPage({ backendLetter, onStartStory }) {
  const [step, setStep] = useState("listen");
  // listen → record → review → show
// console.log("Phonics page backendLetter:", backendLetter);

  const [recordedUrl, setRecordedUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordedAudioRef = useRef(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const audioRef = useRef(null);
  const recordAudioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const getPhonicsAudio = (letter) => {
  const item = PhonicsletterSound.All_letters.find(
    (l) => l.lab.toLowerCase() === letter?.toLowerCase()
  );
  return item?.audio || null;
};


  // 🔊 Play phonics sound
const playSound = () => {
  if (!audioRef.current) return;

  const audio = audioRef.current;

  if (!audio.src) {
    console.warn("No audio source for letter:", backendLetter);
    return;
  }

  audio.pause();
  audio.currentTime = 0;

  audio.play().catch(() => {});
  
  audio.onended = () => {
    setStep(prev => (prev === "listen" ? "record" : prev));
  };
};



  // 🎤 Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setStep("review");

        // 🛑 Stop mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // ⏱️ Auto stop after 5 sec
      timerRef.current = setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (err) {
      alert("Please allow microphone access");
      console.error(err);
    }
  };

  // ⏹️ Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === "inactive") return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearTimeout(timerRef.current);
  };

  // 🔁 Retry
  const resetRecording = () => {
    setRecordedUrl(null);
    setIsPlayingRecording(false);
    setStep("record");
  };

  const togglePlayRecording = () => {
    if (!recordedAudioRef.current) return;

    if (isPlayingRecording) {
      recordedAudioRef.current.pause();
      setIsPlayingRecording(false);
    } else {
      recordedAudioRef.current.currentTime = 0;
      recordedAudioRef.current.play().catch(() => {});

      setIsPlayingRecording(true);

      recordedAudioRef.current.onended = () => {
        setIsPlayingRecording(false);
      };
    }
  };

  return (
    <div className="h-full w-full flex justify-center items-center relative">
      <div
        className="relative w-[95%] lg-w-[85%] xl:w-[70%] h-[95%] flex justify-center items-center bg-center bg-contain bg-no-repeat "
        style={{ backgroundImage: "" }}
      >
        <img
          src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/phonicsletterBg.png"
          alt="phonicsletterBg"
          className="absolute w-full h-full z-0"
        />
        <div className="w-full h-full flex flex-col gap-[2rem] justify-center items-center relative z-[1]">
                <div className="w-full h-full  absolute">
  <LetterPageDescription step={step} />
</div>

          {/* Hidden phonics audio */}
          <audio ref={audioRef}  src={getPhonicsAudio(backendLetter) || ""} preload="auto" />

          {/* 🔊 TOP: SPEAKER */}
          <div className="w-[80%] h-[20%]  flex justify-start items-center p-[1rem] z-[100]">
            {step === "listen" || step === "show" ? (
              <button onClick={playSound} className="w-[5rem]  rounded-full">
                <img
                  // src="/listenspeaker.png"
                  src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/listenspeaker.png"

                  alt="listenspeaker"
                  className=""
                />
              </button>
            ) : (
              <div className="w-[3rem]  rounded-full">
                <img
                  src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/disableListen.png"
                  alt="disableListen"
                  className=""
                />
              </div>
            )}
          </div>

          {/* 🅰️ CENTER: LETTER */}
          <div
            className="w-[80%] h-[60%]  flex justify-center items-center text-[6rem] font-bold
          bg-center bg-contain bg-no-repeat"
            style={{ backgroundImage: "url('https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/phonics_letterBg.png')" }}
          >
            {step === "show" ? (backendLetter || "❓") : "❓"}

          </div>

          {/* 🎤 BOTTOM: RECORDER */}
          <div className="w-[80%] h-[15%]  flex justify-center items-center z-[100]">
            {/* RECORD */}
            {step === "record" &&
              (!isRecording ? (
                <button className="w-[4rem]" onClick={startRecording}>
                  <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/startRecordLetter.png" alt="startRecord" />
                </button>
              ) : (
                <button className="w-[4rem]" onClick={stopRecording}>
                  <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/stopletter.png" alt="stopRecord" />
                </button>
              ))}

            {/* REVIEW */}
            {/* Hidden recorded audio */}
            <audio ref={recordedAudioRef} src={recordedUrl || ""} />

            {/* REVIEW */}
            {step === "review" && (
              <div className="flex flex-row items-center gap-4">
                {/* ▶️ ⏸️ Play / Pause */}
                <button className="w-[4rem]" onClick={togglePlayRecording}>
                  {isPlayingRecording ? (
                    <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/pauseLetter.png" alt="pause" />
                  ) : (
                    <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/playLetter.png" alt="play" />
                  )}
                </button>

                {/* Retry + OK */}
                <div className="flex gap-4">
                  <button className="w-[4rem]" onClick={resetRecording}>
                    <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/startRecordLetter.png" alt="retry" />
                  </button>

                  <button className="w-[4rem]" onClick={() => setStep("show")}>
                    <img src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/correctANswerRecord.png" alt="ok" />
                  </button>
                </div>
              </div>
            )}

            {/* HIDDEN */}
            {/* {(step === "listen" || step === "show") && (
              <div className="text-gray-400">🎤 Hidden</div>
            )} */}
            {step === "show" && (
              <button
                className="px-6 py-3 bg-[#FF953C] text-white rounded-full text-xl animate-bounce font-bold"
                onClick={onStartStory}
              >
                Start Story 
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhonicsLetterHearingPPage;
