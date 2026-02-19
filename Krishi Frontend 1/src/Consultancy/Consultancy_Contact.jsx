import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import './Consultancy_Contact.css';

const Consultancy_Contact = () => {
  const handleCardClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <section className="consultancy-contact-section" data-aos="fade-up">
      <div className="contact-container">
        <h2 className="contact-section-title">Get In Touch With Us</h2>
        <p className="contact-section-subtitle">Our experts are ready to assist you with personalized solutions</p>
        
        <div className="contact-grid">
          {/* Phone Card */}
          <div 
            className="contact-card phone-card"
            data-aos="zoom-in" 
            data-aos-delay="100"
            onClick={() => handleCardClick('tel:+919876543210')}
          >
            <div className="card-content">
              <div className="contact-icon-container">
                <FaPhoneAlt className="contact-icon" />
              </div>
              <h3>Call Our Experts</h3>
              <p>+91 98765 43210</p>
              <span className="contact-hours">Mon-Sat: 9 AM - 7 PM</span>
              <div className="action-link">
                <span>Call Now</span>
                <FaArrowRight className="arrow-icon" />
              </div>
            </div>
            <div className="card-hover-effect"></div>
          </div>

          {/* Email Card */}
          <div 
            className="contact-card email-card"
            data-aos="zoom-in" 
            data-aos-delay="200"
            onClick={() => handleCardClick('mailto:krishivishwabiotech@gmail.com')}
          >
            <div className="card-content">
              <div className="contact-icon-container">
                <FaEnvelope className="contact-icon" />
              </div>
              <h3>Email Us</h3>
              <p>krishivishwabiotech@gmail.com</p>
              <span className="contact-hours">24/7 Support</span>
              <div className="action-link">
                <span>Send Email</span>
                <FaArrowRight className="arrow-icon" />
              </div>
            </div>
            <div className="card-hover-effect"></div>
          </div>

          {/* Location Card */}
          <div 
            className="contact-card location-card"
            data-aos="zoom-in" 
            data-aos-delay="300"
            onClick={() => handleCardClick('https://www.google.com/maps/place/Gat+No.+227,+At.+Virgaon,+Tal.+Akole,+Dist.+Ahmednagar+(MH),+422605')}
          >
            <div className="card-content">
              <div className="contact-icon-container">
                <FaMapMarkerAlt className="contact-icon" />
              </div>
              <h3>Visit Our Office</h3>
              <p className="address">
                Gat No. 227, At. Virgaon,<br />
                Tal. Akole, Dist. Ahmednagar (MH), 422605
              </p>
              <span className="contact-hours">Get Directions</span>
              <div className="action-link">
                <span>View Map</span>
                <FaArrowRight className="arrow-icon" />
              </div>
            </div>
            <div className="card-hover-effect"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consultancy_Contact;