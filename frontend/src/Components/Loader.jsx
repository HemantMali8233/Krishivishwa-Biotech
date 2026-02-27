import React from "react";

function Loader({ text = "Loading...", height = "70vh" }) {
  return (
    <div
      style={{
        width: "100%",
        height,
        background: "linear-gradient(135deg, #84cc16, #a3e635)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "4px solid rgba(255,255,255,0.3)",
          borderTop: "4px solid white",
          borderRadius: "50%",
          animation: "kv-spin 1s linear infinite",
        }}
      ></div>
      <p style={{ color: "white", fontSize: "18px", fontWeight: 500, margin: 0 }}>
        {text}
      </p>
      <style>{`
        @keyframes kv-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Loader;

