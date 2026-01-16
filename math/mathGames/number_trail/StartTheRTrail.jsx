import React, { useState } from 'react';
import NumberTrail from './NumberTrail';

function StartTheTrail() {
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <div 
      className='w-full h-[calc(100vh-10vh)]  bg-center bg-cover bg-no-repeat relative'
      style={{backgroundImage:"url(https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/numberTrailBg.png)"}}
    >
      {!isStarted ? (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-gradient-to-br from-black/50 via-transparent to-black/30">
          <div className="text-center text-white mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wider bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Number Trail
            </h1>
            <div className="space-y-4 mb-10">
              <p className="text-2xl md:text-3xl font-semibold flex items-center justify-center gap-3">
                <span className="inline-block w-4 h-4 bg-blue-500 rounded-full"></span>
                Connect the path
              </p>
              <p className="text-2xl md:text-3xl font-semibold flex items-center justify-center gap-3">
                <span className="inline-block w-4 h-4 bg-green-500 rounded-full"></span>
                Add the numbers
              </p>
              <p className="text-2xl md:text-3xl font-semibold flex items-center justify-center gap-3">
                <span className="inline-block w-4 h-4 bg-red-500 rounded-full"></span>
                Hit the target
              </p>
            </div>
          </div>
          
          <button
            onClick={handleStart}
            className="relative px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl font-bold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl transform hover:scale-110 hover:shadow-2xl active:scale-105 group overflow-hidden"
          >
            <span className="relative z-10">Start Trail</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>
          </button>
          
          <div className="mt-16 text-white/70 text-lg">
            <p>Ready for the challenge?</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
          <NumberTrail />
        </div>
      )}
    </div>
  );
}

export default StartTheTrail;