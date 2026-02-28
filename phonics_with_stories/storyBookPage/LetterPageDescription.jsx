import React, { useEffect, useRef, useState } from "react";

function LetterPageDescription({ step }) {
  const [visible, setVisible] = useState(true);
  const audioRef = useRef(null);

  let src = null;
  let animation = "";
  let voice = null;

  if (step === "listen") {
    src = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/listenToTheSound.png";
    animation = "animate-slideFromTop";
    voice = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/ListentotheSound.mp3";
  } else if (step === "record") {
    src = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/yourTurnMake.png";
    animation = "animate-slideFromBottom";
    voice = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/YourTurntoMaketh.mp3";
  } else {
    src = null;
  }

  useEffect(() => {
    setVisible(true);

    if (step === "show") {
      const t = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (!audioRef.current || !voice) return;

    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;

    const t = setTimeout(() => {
      audio.play().catch(() => {
      });
    }, 300);

    return () => clearTimeout(t);
  }, [voice]);

  // FINAL render guard (AFTER hooks!)
  if (!src || !visible) return null;

  const getPositionClass = () => {
    if (step === "listen") return "top-[1%] left-[30%]";
    if (step === "record") return "bottom-[10%] left-[30%] -translate-x-1/2";
    return "";
  };

  return (
    <div className="absolute inset-0 z-[60] pointer-events-none">
      {/* 🔊 Hidden voice audio */}
      <audio
        ref={audioRef}
        key={voice}
        src={voice}
        preload="auto"
      />

      <img
        src={src}
        alt="helper"
        className={`absolute w-[260px] ${getPositionClass()} ${animation}`}
      />
    </div>
  );
}

export default LetterPageDescription;
