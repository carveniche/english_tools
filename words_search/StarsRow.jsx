import React from 'react'

function StarsRow(){
  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'center' }}>
      {Array.from({length:5}).map((_,i)=> (
        <svg key={i} width="48" height="48" viewBox="0 0 24 24" style={{filter:'drop-shadow(0 4px 8px rgba(0,0,0,.25))', animation:`pop .6s ease ${i*0.08}s both`}}>
          <path d="M12 2l2.8 6.1 6.7.6-5 4.4 1.5 6.6L12 16.7 6 19.7l1.5-6.6-5-4.4 6.7-.6L12 2z" fill="#fde047" stroke="#f59e0b" strokeWidth="1.2"/>
        </svg>
      ))}
      <style>{`@keyframes pop {0%{transform:scale(.2) rotate(-15deg);opacity:0}60%{transform:scale(1.2) rotate(5deg);opacity:1}100%{transform:scale(1)}}`}</style>
    </div>
  );
}

export default StarsRow