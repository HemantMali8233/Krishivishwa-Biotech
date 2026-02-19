import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';
import './ImageSlider.css';

import img1 from '../Assets/Images/Bio-Fertilizers.jpg';
import img2 from '../Assets/Images/fungicides.jpg';
import img3 from '../Assets/Images/Insecticides.jpg';
import img4 from '../Assets/Images/Bio-Nematicides.jpg';

const images = [
  {
    src: img1,
    title: 'Bio-Fertilizers',
    category: 'Bio Fertilizers',
    subtitle: 'Natural Way to Nourish Your Soil',
    description: 'Biofertilizers are eco-friendly inputs containing beneficial microorganisms that naturally improve soil fertility by fixing nitrogen, solubilizing phosphorus, and promoting plant growth.',
  },
  {
    src: img2,
    title: 'Bio-Fungicides',
    category: 'Bio Fungicides',
    subtitle: 'Fungal Disease Management',
    description: 'Fungicides help protect crops from harmful fungal infections like mildew, rust, and blight, ensuring healthy plants and maximizing yield throughout the growing season.',
  },
  {
    src: img3,
    title: 'Bio-Insecticides',
    category: 'Bio Insecticides',
    subtitle: 'Insect Pest Protection',
    description: 'Insecticides target and eliminate damaging insects that attack crops, safeguarding agricultural output while minimizing plant stress and crop loss.',
  },
  {
    src: img4,
    title: 'Bio-Nematicides',
    category: 'Bio Nematicides',
    subtitle: 'Root Nematode Control',
    description: 'Nematicides are specialized products designed to manage soil-borne nematodes that damage plant roots, ensuring robust root systems and healthier crop development.',
  },
];

const ImageSlider = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(images[0]);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false
    });
  }, []);

  const handleCardClick = (img) => {
    if (img.src !== selectedCard.src) {
      setFade(true);
      setTimeout(() => {
        setSelectedCard(img);
        setFade(false);
      }, 300);
    }
  };

  const handleShopNow = () => {
    navigate('/shop', { 
    
    });
  };

  return (
    <section className="slider-container">
      <div className="slider-heading-wrapper" data-aos="fade-down" data-aos-delay="100">
        <h2 className="enhanced-title" data-aos="fade-up" data-aos-delay="100">
          Biological Solutions for your Crops
        </h2>
      </div>

      <div className="image-slider">
        <div
          className={`background-layer ${fade ? 'fade-out' : ''}`}
          style={{ backgroundImage: `url(${selectedCard.src})` }}
        ></div>
        <div className="background-dimmer"></div>

        <div className="slider-overlay">
          <div key={selectedCard.title} className="text-content animate" data-aos="fade-up" data-aos-delay="200">
            <h2>{selectedCard.title.toUpperCase()}</h2>
            <h3>{selectedCard.subtitle}</h3>
            <p>{selectedCard.description}</p>
            <button 
              className="see-more"  
              data-aos="zoom-in" 
              data-aos-delay="400"
              onClick={handleShopNow}
            >
              <i className="bi bi-cart-fill"></i>Shop Now
            </button>
          </div>

          <div className="card-carousel">
            {images.map((img, index) => (
              <div
                className="card"
                key={index}
                onClick={() => handleCardClick(img)}
                data-aos="zoom-in-up"
                data-aos-delay={index * 150}
              >
                <img src={img.src} alt={img.title} />
                <div className="card-title-overlay">{img.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageSlider;