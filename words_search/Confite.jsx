import React, { useMemo } from "react";

function Confetti(){
  const bits = useMemo(()=> Array.from({length: 20}).map((_,i)=>({ left: Math.random()*100, delay: Math.random()*0.8, dur: 1+Math.random()*1.2, size: 6+Math.random()*6, hue: Math.floor(Math.random()*360) })),[]);
  return (
    <div  style={{position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none'}}>
      {bits.map((b,i)=> (
        <div key={i} style={{ position:'absolute', top:'-10%', left:`${b.left}%`, width:b.size, height:b.size, background:`hsl(${b.hue} 90% 60%)`, borderRadius:2, filter:'drop-shadow(0 2px 2px rgba(0,0,0,.2))', animation:`fall ${b.dur}s ease-in ${b.delay}s both` }} />
      ))}
      <style>{`@keyframes fall { to { transform: translateY(120vh) rotate(240deg); opacity:.9; } }`}</style>
    </div>
  );
}
export default Confetti