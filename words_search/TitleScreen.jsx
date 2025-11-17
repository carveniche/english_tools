import React, { useEffect, useState } from "react";

function TitleScreen({ onStart, isLoading, error,role_name,isLiveClass }) {
  const title = "WORD SEARCH";
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLetters(i);
      if (i >= title.length) clearInterval(interval);
    }, 250); // animation speed
    return () => clearInterval(interval);
  }, []);

  const istutor = (!isLiveClass) || (isLiveClass && role_name === "tutor");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "10px",
      }}
    >
      {/* Background */}
      <img
        src="https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/wordSearchBg.jpg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        alt="background"
      />

      {/* Dark overlay for contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "clamp(10px, 5vw, 20px)",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(24px, 8vw, 55px)",
            fontWeight: 1000,
            marginBottom: 24,
            textShadow: "0 6px 12px rgba(0,0,0,0.6)",
            letterSpacing: 5,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {title.split("").map((char, i) => (
            <span
              key={i}
              style={{
                color: "#FF8652",
                opacity: i < visibleLetters ? 1 : 0,
                transform: i < visibleLetters ? "scale(1)" : "scale(0.5)",
                display: "inline-block",
                transition: "all 0.4s ease",
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Subtitle or Error/Loading Message */}
        {isLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#fff",
              fontSize: "clamp(16px, 4vw, 22px)",
              marginBottom: 32,
              fontWeight: 600,
              textShadow: "0 3px 8px rgba(0,0,0,0.8)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                border: "4px solid #FF8652",
                borderTop: "4px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            Loading game data...
          </div>
        ) : error ? (
          <p
            style={{
              fontSize: "clamp(16px, 4vw, 22px)",
              maxWidth: 540,
              color: "#ff4d4d",
              marginBottom: 32,
              fontWeight: 600,
              textShadow: "0 3px 8px rgba(0,0,0,0.8)",
            }}
          >
            Error: {error}
          </p>
        ) : (
          <p
            style={{
              fontSize: "clamp(16px, 4vw, 22px)",
              maxWidth: 540,
              color: "#fff",
              marginBottom: 32,
              fontWeight: 600,
              textShadow: "0 3px 8px rgba(0,0,0,0.8)",
            }}
          >
            Sharpen your vocabulary with fun puzzles. Find all the hidden words
            to level up 🚀
          </p>
        )}

        {/* Button */}
        {istutor && (<button
          onClick={onStart}
          onTouchStart={(e) => {
            e.stopPropagation(); // Prevent touch event from bubbling to parent handlers
            onStart();
          }}
          disabled={isLoading || !!error}
          aria-label="Start Word Search Game"
          aria-disabled={isLoading || !!error}
          style={{
            padding: "16px 32px",
            borderRadius: 30,
            border: "3px solid #FF8652",
            background: isLoading || error ? "#ccc" : "#FF8652",
            color: "#fff",
            fontSize: "clamp(16px, 4vw, 22px)",
            fontWeight: 900,
            cursor: isLoading || error ? "not-allowed" : "pointer",
            boxShadow: "0 12px 24px rgba(0,0,0,0.4), 0 0 20px #FF8652",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !error) {
              e.currentTarget.style.transform = "scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Start Game
        </button>)}

        {/* Retry Button for Errors */}
        {error && (
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              borderRadius: 30,
              border: "3px solid #ff4d4d",
              background: "#ff4d4d",
              color: "#fff",
              fontSize: "clamp(14px, 3vw, 18px)",
              fontWeight: 900,
              cursor: "pointer",
              marginTop: 16,
              boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Retry
          </button>
        )}
      </div>

      {/* Inline CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default TitleScreen;