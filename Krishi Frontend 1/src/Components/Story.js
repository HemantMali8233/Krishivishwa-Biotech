import React, { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom'; // import useNavigate
import './Story.css';
import Image1 from '../Assets/Images/B.png';
import Image2 from '../Assets/Images/A.png';
import Image3 from '../Assets/Images/C.png';
import TransparentLogo from '../Assets/Images/Building.jpg';

const floatingCards = [
  {
    id: 1,
    image: Image1,
    title: 'Inauguration Ceremony',
    description:
      'In 2007, Krishivishwa Biotech was proudly inaugurated with Hon. Dr. R. B. Deshmukh (Ex. Vice Chancellor, MPKV Rahuri) as Chief Guest. This marked the start of a mission to transform Indian agriculture through eco-conscious practices.'
  },
  {
    id: 2,
    image: Image2,
    title: 'Our Vision & Commitment',
    description:
      'Driven by trust and science, we provide innovative microbial solutions that promote soil health, increase yield, and restore balance. With every product, we deliver our promise of quality, sustainability, and farmer-first values.'
  },
  {
    id: 3,
    image: Image3,
    title: 'Direct to Farmer (DTF)',
    description:
      'Through our DTF model, we ensure fresh, high-quality bio-products are delivered straight to farmers. This transparent connection builds trust and helps farmers adopt modern, sustainable methods efficiently and affordably.'
  }
];

const Story = ({ id }) => {
  const [activeCard, setActiveCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardsRef = useRef([]);
  const navigate = useNavigate(); // initialize navigation

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        activeCard !== null &&
        !cardsRef.current[activeCard]?.contains(e.target)
      ) {
        setActiveCard(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeCard, isMobile]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    const cards = document.querySelectorAll('.slide-card');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  return (
    <div id={id} className="story">
      {/* Banner Section */}
      <div className="offer-banner container" data-aos="fade-up">
        <div className="offer-banner-inner">
          <div className="offer-content" data-aos="fade-up">
            <h2>Our <span>Story</span></h2>
            <p>
              Founded in 2007 in the heart of Maharashtra, Krishivishwa Biotech has grown from a humble vision to become a trusted name in India’s bio-fertilizer and sustainable agriculture industry. What began as a Sole Proprietorship firm has evolved into a respected <span className="highlight">Manufacturer</span>, <span className="highlight">Wholesaler</span>, and <span className="highlight">Retailer</span> of Bio Fertilizers, Potash Mobilizing Bacteria, and a wide range of microbial-based solutions.
              <br /><br />
              We are driven by one purpose — to empower Indian farmers with <span className="highlight">eco-friendly</span>, <span className="highlight">innovative</span> products that enhance soil health, improve crop yield, and restore natural balance to the land.
            </p>
            <div className="button-contact">
              <Button variant="success" onClick={() => navigate('/aboutus')}>Learn More</Button>
            </div>
          </div>
          <div className="kvt-img" data-aos="fade-up">
            <img src={TransparentLogo} alt="KVT Logo" className="kvbt-logo" />
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="floating-images container" data-aos="fade-up">
        {floatingCards.map((card) => (
          <div
            key={card.id}
            className={`slide-card ${activeCard === card.id ? 'active' : ''}`}
            onClick={() => {
              if (isMobile) {
                setActiveCard(activeCard === card.id ? null : card.id);
              } else {
                setActiveCard(activeCard === card.id ? null : card.id); // toggle on desktop too
              }
            }}
            ref={(el) => (cardsRef.current[card.id] = el)}
          >
            {!isMobile ? (
              <div className="story-card-content">
                <div className="image-slide">
                  <img src={card.image} alt={card.title} />
                  <div className="info-icon-wrapper">
                    <span className="info-icon">i</span>
                    <div className="tooltip-text">Click to view details</div>
                  </div>
                </div>
                <div className="text-slide">
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mobile-image-wrapper">
                  <img src={card.image} alt={card.title} />
                  <div className="info-icon-wrapper">
                    <span className="info-icon">i</span>
                    <div className="tooltip-text">Tap to view details</div>
                  </div>
                </div>
                {activeCard === card.id && (
                  <div className="mobile-text-slide">
                    <h4>{card.title}</h4>
                    <p>{card.description}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Story;
