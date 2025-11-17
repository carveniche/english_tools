import React from 'react'

function Loader() {
return(
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      background: "rgba(0, 0, 0, 0.7)",
      // zIndex: 20,
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "24px 32px",
        borderRadius: "16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "6px dashed #ff85a2",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <div
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#fff",
          letterSpacing: "1px",
        }}
      >
        Loading...
      </div>
    </div>
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

export default Loader