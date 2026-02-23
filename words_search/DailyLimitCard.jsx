import React from 'react'

function DailyLimitCard() {
  return (
            <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0, 0, 0, 0.7)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #fceabb, #f8b500)",
              padding: 24,
              borderRadius: 16,
              textAlign: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,.15)",
              color: "#333",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
              Daily Limit is over
            </h3>
            <p style={{ fontSize: 16 }}>
              Sorry, no puzzle data is available at the moment. Please come back
              tomorrow.
            </p>
          </div>
        </div>
  )
}

export default DailyLimitCard