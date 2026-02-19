import React, { useState, useEffect } from "react";
import "./TruckAnimation.css";

const TruckAnimation = ({ onClick, disabled, isProcessing }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing]);

  // Clicking (if not disabled) triggers onClick AND animates if not already running
  const handleClick = (e) => {
    if (!disabled && !animate && onClick) {
      onClick(e);
    }
  };

  return (
    <div className="truck-animation-container">
      <button
        type="button"
        className={`order${animate ? " animate" : ""}`}
        onClick={handleClick}
        disabled={disabled || animate}
        aria-busy={isProcessing}
      >
        <span className="default">Place Order</span>
        <span className="success">
          Ordered
          <svg viewBox="0 0 12 10">
            <polyline points="1.5 6 4.5 9 10.5 1" />
          </svg>
        </span>
        <div className="truck">
          <div className="back"></div>
          <div className="front">
            <div className="window"></div>
          </div>
          <div className="light top"></div>
          <div className="light bottom"></div>
        </div>
        <div className="box"></div>
        <div className="lines"></div>
      </button>
    </div>
  );
};

export default TruckAnimation;
