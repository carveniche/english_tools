import React, { useState, useEffect } from "react";
import Particles from "react-tsparticles";

const ParticleEffect = ({ done }) => {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (done) {
      setShowParticles(true);

      const timer = setTimeout(() => {
        setShowParticles(false);
      }, 6000); // show for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [done]);

  if (!showParticles) return null;

  return (
    <Particles
    className={`absolute z-50`}
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        particles: {
          number: { value: 120, density: { enable: true, area: 800 } },
          color: { value: "#00ff88" },
          shape: { type: "circle" },
          opacity: { value: 0.6 },
          size: { value: { min: 2, max: 5 } },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            outModes: { default: "out" },
          },
        },
        detectRetina: true,
      }}
      style={{
        position: "absolute",
        inset: 0, // shorthand for top/right/bottom/left: 0
        width: "100%",
        height: "100%",
        zIndex: 10,
      }}
    />
  );
};

export default ParticleEffect;
