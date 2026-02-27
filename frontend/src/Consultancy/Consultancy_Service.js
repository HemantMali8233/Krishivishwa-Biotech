import { useState, useEffect } from "react";
import './Consultancy_Service.css';
import { 
  FaInfoCircle, 
  FaCalendarAlt, 
  FaEdit, 
  FaPhoneAlt, 
  FaTimes,
  FaGift,
  FaPhoneVolume,
} from "react-icons/fa";
import { GiFarmTractor } from "react-icons/gi";
import Field from '../Assets/Images/Field-Consultancy.jpg';
import Call from '../Assets/Images/Call-Consultancy.jpg';

const Consultancy_Service = () => {
  const cardsData = [
    {
      id: 1,
      title: "Welcome to KrishiVishwa Consultancy",
      desc: "Grow smarter with expert advice.",
      img: Call,
     icon: <FaInfoCircle className="card-icon-svg" />,
      price: "Affordable Plans",
      theme: "yellow",
      features: [
        "✓ Field Visit Consultations",
        "✓ Phone Consultations",
        "✓ Expert Recommendations",
        "✓ Customized Support",
      ],
    },
    {
      id: 2,
      title: "Phone Consultation",
      desc: "Expert advice and recommendations over the phone.",
      img: Call,
      icon: <FaPhoneVolume className="card-icon-svg" />,
      price: "₹500",
      theme: "blue",
      features: [
        "✓ Strategic crop planning",
        "✓ Fertilizer suggestions",
        "✓ Problem diagnosis",
        "✓ Follow-up included",
      ],
    },
    {
      id: 3,
      title: "Field Visit Consultation",
      desc: "On-site expert analysis with comprehensive report.",
      img: Field,
      icon: <GiFarmTractor className="card-icon-svg" />,
      price: "₹2,500",
      theme: "orange",
      features: [
        "✓ Soil testing & analysis",
        "✓ Crop health assessment",
        "✓ Pest & disease detection",
        "✓ Treatment recommendations",
      ],
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cardsData.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cardsData.length) % cardsData.length);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setActiveIndex(0);
    }
  }, [isMobile]);

  return (
    <div className="consultancy-service-container">
      {/* Service Section */}
      <section className="consultancy-services-section">
        <div className="consultancy-services-container">
          {/* Left Intro Section */}
          <div className="consultancy-services-intro">
            <h2 className="consultancy-section-title">Choose Your Consultation Type</h2>
            <p className="consultancy-section-subtitle">
              Select from our professional consultancy services tailored to meet your specific farming needs.
            </p>
            <button 
              className="consultancy-btn-more consultancy-instruction-btn" 
              onClick={() => setShowModal(true)}
            >
              <FaInfoCircle className="consultancy-btn-icon" /> Instructions
            </button>
          </div>

          <div className={`consultancy-cards-wrapper ${isMobile ? 'consultancy-mobile-mode' : ''}`}>
            {isMobile && (
              <div className="consultancy-carousel-controls">
                <button onClick={handlePrev}>&lt;</button>
                <button onClick={handleNext}>&gt;</button>
              </div>
            )}

            {cardsData.map((card, index) => {
              let position = "consultancy-next";
              if (index === activeIndex) {
                position = "consultancy-active";
              } else if (index === (activeIndex - 1 + cardsData.length) % cardsData.length) {
                position = "consultancy-prev";
              }

              const shouldRenderCard = !isMobile || 
                position === "consultancy-active" || 
                position === "consultancy-prev" || 
                position === "consultancy-next";

              return shouldRenderCard ? (
                <div
                  key={card.id}
                  className={`consultancy-card ${position} consultancy-theme-${card.theme} ${index === activeIndex ? 'consultancy-active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="consultancy-card-inner">
                    <div className="consultancy-card-icon">{card.icon}</div>
                    <h3 className="consultancy-card-title">{card.title}</h3>
                    <p className="consultancy-card-desc">{card.desc}</p>
                    <img src={card.img} alt={card.title} className="consultancy-card-img" />
                    <ul className="consultancy-card-features">
                      {card.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                    <div className="consultancy-card-price">{card.price}</div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </section>

      {/* Modal Popup */}
      {showModal && (
        <div className="consultancy-popup-overlay" onClick={() => setShowModal(false)}>
          <div className="consultancy-popup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="consultancy-popup-header">
              <h3><FaInfoCircle className="consultancy-info-icon" /> Consultation Instructions</h3>
              <FaTimes 
                className="consultancy-close-icon" 
                onClick={() => setShowModal(false)} 
              />
            </div>
            <ul className="consultancy-popup-points">
              <li>
                <FaInfoCircle className="consultancy-list-icon" />
                Select your suitable consultation plan.
              </li>
              <hr className="consultancy-popup-separator" />
              <li>
                <FaEdit className="consultancy-list-icon" />
                Fill the form according to the currently selected consultation card.
              </li>
              <hr className="consultancy-popup-separator" />
              <li>
                <FaCalendarAlt className="consultancy-list-icon" />
                After booking, our team will contact you within 2–3 days to schedule your appointment.
              </li>
              <hr className="consultancy-popup-separator" />
              <li>
                <FaPhoneAlt className="consultancy-list-icon" />
                Ensure the number you provide is active and has WhatsApp access.
              </li>
              <hr className="consultancy-popup-separator" />
              <li>
                <FaEdit className="consultancy-list-icon" />
                Fill the form carefully with accurate and up-to-date information.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultancy_Service;