import React, { useRef, useState } from "react";

function PhonicsLetterHearingPPage({ backendLetter }) {

  const [step, setStep] = useState("listen"); 
  // listen → record → review → show

  const [recordedUrl, setRecordedUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const audioRef = useRef(null);
  const recordAudioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // 🔊 Play phonics sound
  const playSound = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play();

    audioRef.current.onended = () => {
      if (step === "listen") {
        setStep("record");
      }
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
        stream.getTracks().forEach(track => track.stop());
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
    setStep("record");
  };

  return (
    <div className="h-full w-full flex justify-center items-center">
      <div
        className="w-[40%] h-[95%] flex justify-center items-center bg-center bg-contain bg-no-repeat border"
        style={{ backgroundImage: "url(/phonicsletterBg.png)" }}
      >
        <div className="w-full h-full flex flex-col gap-[2rem] justify-center items-center">

          {/* Hidden phonics audio */}
          <audio ref={audioRef} src="/gotIt.mp3" preload="auto" />

          {/* 🔊 TOP: SPEAKER */}
          <div className="w-[80%] h-[20%] border border-green-800 flex justify-center items-center">
            {(step === "listen" || step === "show") ? (
              <button
                onClick={playSound}
                className="px-6 py-3 bg-blue-500 text-white rounded-full"
              >
                🔊 Listen
              </button>
            ) : (
              <div className="text-gray-400">🔊 Locked</div>
            )}
          </div>

          {/* 🅰️ CENTER: LETTER */}
          <div className="w-[80%] h-[60%] border border-blue-800 flex justify-center items-center text-[6rem] font-bold
          bg-center bg-contain bg-no-repeat"
          style={{backgroundImage:"url('/phonics_letterBg.png')"}}>
            {step === "show" ? backendLetter : "❓"}
          </div>

          {/* 🎤 BOTTOM: RECORDER */}
          <div className="w-[80%] h-[20%] border border-yellow-800 flex justify-center items-center">

            {/* RECORD */}
            {step === "record" && (
              !isRecording ? (
                <button
                  className="px-6 py-3 bg-red-500 text-white rounded-full"
                  onClick={startRecording}
                >
                  🎤 Start
                </button>
              ) : (
                <button
                  className="px-6 py-3 bg-gray-800 text-white rounded-full"
                  onClick={stopRecording}
                >
                  ⏹️ Stop
                </button>
              )
            )}

            {/* REVIEW */}
            {step === "review" && (
              <div className="flex flex-col items-center gap-2">
                <audio ref={recordAudioRef} src={recordedUrl || ""} controls />
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                    onClick={resetRecording}
                  >
                    🔁 Retry
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={() => setStep("show")}
                  >
                    ✅ OK
                  </button>
                </div>
              </div>
            )}

            {/* HIDDEN */}
            {(step === "listen" || step === "show") && (
              <div className="text-gray-400">🎤 Hidden</div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default PhonicsLetterHearingPPage;
