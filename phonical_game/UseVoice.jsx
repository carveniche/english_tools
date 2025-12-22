import React, { useEffect, useRef } from 'react'

function UseVoice() {
      const vRef = useRef(null);
      useEffect(() => {
        const choose = () => {
          const vs = window.speechSynthesis?.getVoices?.() || [];
          vRef.current =
            vs.find((x) =>
              /female|Google US|UK|Samantha|Aditi|Raveena/i.test(x.name)
            ) ||
            vs[0] ||
            null;
        };
        choose();
        window.speechSynthesis?.addEventListener?.("voiceschanged", choose);
        return () =>
          window.speechSynthesis?.removeEventListener?.("voiceschanged", choose);
      }, []);
      const say = (t) =>
        new Promise((r) => {
          try {
            const u = new SpeechSynthesisUtterance(t);
            if (vRef.current) u.voice = vRef.current;
            u.onend = () => r();
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(u);
          } catch {
            r();
          }
        });
      return { say };
}

export default UseVoice