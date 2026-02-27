import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Testimonials.css";

function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((w) => (w ? w[0] : ""))
    .join("")
    .toUpperCase();
}

const PROFILE_COLORS = ["#70b37e", "#42a5f5", "#f6c24b", "#de6372", "#8a7ae6"];
const CARD_FAINTS = [
  "rgba(112,179,126,0.14)",
  "rgba(66,165,245,0.11)",
  "rgba(246,194,75,0.13)",
  "rgba(222,99,114,0.10)",
  "rgba(138,122,230,0.11)",
];

const Testimonials = () => {
  const marqueeRef = useRef(null);
  const [testimonials, setTestimonials] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/testimonials`);
        setTestimonials(data);
      } catch {
        setTestimonials([]);
      }
    }
    fetchTestimonials();
  }, []);

  // Marquee scroll setup for both desktop and mobile
  useEffect(() => {
    if (!marqueeRef.current) return;
    const marquee = marqueeRef.current;
    const scrollSpeed = 100;
    const marqueeWidth = marquee.scrollWidth / 2;
    const duration = marqueeWidth / scrollSpeed;
    marquee.style.animationDuration = `${duration}s`;
    marquee.style.animationPlayState = isPaused ? "paused" : "running";
  }, [isPaused, testimonials]);

  const duplicatedTestimonials = [...testimonials, ...testimonials];

  const openModal = (testimonial, colorIdx) => {
    setModalData({ testimonial, colorIdx });
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div className="bio-testimonial-section">
      <div className="section-header">
        <h2>Success Stories from the Field</h2>
        <p className="subtitle">Trusted by farmers and agricultural experts across India</p>
        <div className="divider"></div>
      </div>

      {/* Marquee for both desktop and mobile */}
      <div
        className="marquee-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="marquee-track" ref={marqueeRef}>
          {duplicatedTestimonials.map((t, i) => {
            const colorIdx = i % PROFILE_COLORS.length;
            return (
              <TestimonialCard
                key={i}
                testimonial={t}
                colorIdx={colorIdx}
                onReadMore={openModal}
              />
            );
          })}
        </div>
      </div>

      {/* Modal for full text */}
      {modalData && (
        <TestimonialModal
          testimonial={modalData.testimonial}
          colorIdx={modalData.colorIdx}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

const TestimonialCard = ({ testimonial, colorIdx, onReadMore }) => {
  const { name, quote } = testimonial;
  const [isTruncated, setIsTruncated] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const quoteRef = useRef(null);

  useEffect(() => {
    const checkTruncation = () => {
      const element = quoteRef.current;
      if (element) {
        // More accurate truncation detection
        const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
        const maxHeight = lineHeight * 5; // 5 lines max
        const isOverflowing = element.scrollHeight > maxHeight + 5; // 5px tolerance
        setIsTruncated(isOverflowing);
      }
    };

    const timer = setTimeout(checkTruncation, 200);
    window.addEventListener('resize', checkTruncation);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkTruncation);
    };
  }, [quote]);

  const handleCardClick = () => {
    if (isTruncated && !showReadMore) {
      setShowReadMore(true);
    }
  };

  const handleReadMoreClick = (e) => {
    e.stopPropagation();
    onReadMore(testimonial, colorIdx);
  };

  return (
    <div
      className={`testimonial-card ${isTruncated ? 'clickable' : ''}`}
      style={{
        background: CARD_FAINTS[colorIdx],
        minHeight: 320,
        maxHeight: 320,
        width: 380,
      }}
      onClick={handleCardClick}
    >
      <div className="card-content">
        <div className="profile-container">
          <div
            className="profile-image-initials"
            style={{ background: PROFILE_COLORS[colorIdx] }}
          >
            {getInitials(name)}
          </div>
          <div
            className="profile-ring"
            style={{ borderColor: PROFILE_COLORS[colorIdx] }}
          ></div>
        </div>

        <div className="testimonial-text">
          <div className="quote-container">
            <svg className="quote-icon" viewBox="0 0 24 24" width={24} height={24}>
              <path
                fill={PROFILE_COLORS[colorIdx]}
                d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983z"
              />
            </svg>
            <div className="quote-wrapper">
              <p ref={quoteRef} className="quote">
                "{quote}"
              </p>
              {isTruncated && showReadMore && (
                <button
                  className="read-more-btn"
                  style={{ backgroundColor: PROFILE_COLORS[colorIdx] }}
                  onClick={handleReadMoreClick}
                >
                  Read More
                </button>
              )}
            </div>
          </div>
          <div className="author-info">
            <h4 className="name">{name}</h4>
          </div>
        </div>
        <div className="testimonial-bg-pattern"></div>
      </div>
    </div>
  );
};

const TestimonialModal = ({ testimonial, colorIdx, onClose }) => {
  const { name, quote } = testimonial;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="testimonial-modal-overlay" onClick={onClose}>
      <div
        className="testimonial-modal-content"
        style={{ background: CARD_FAINTS[colorIdx] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-profile-container">
          <div
            className="modal-profile-initials"
            style={{ background: PROFILE_COLORS[colorIdx] }}
          >
            {getInitials(name)}
          </div>
          <div
            className="modal-profile-ring"
            style={{ borderColor: PROFILE_COLORS[colorIdx] }}
          ></div>
        </div>

        <div className="modal-quote-container">
          <p className="modal-quote">"{quote}"</p>
        </div>

        <div className="modal-author-info">
          <h3 className="modal-name">{name}</h3>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
