// FounderBanner.js
import React from "react";
import "../AboutUs/FounderSection.css";
import { FaQuoteLeft, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { MdScience, MdEco } from "react-icons/md";
import Founder from '../../Assets/Images/Founder.jpg';

const FounderBanner = () => {
  return (
    <section className="founder-section">
      <div className="founder-container">
        <div className="founder-content-wrapper">
          <div className="founder-text">
            <div className="badge-group">
              <span className="badge badge-science">
                <MdScience className="badge-icon" /> Agricultural Biotech
              </span>
              <span className="badge badge-eco">
                <MdEco className="badge-icon" /> Sustainability Expert
              </span>
            </div>
            
            <p className="subheading">Visionary Leader</p>
            
            <h1>
              <span className="highlight">Dr. Anil Nivruti Deshmukh</span>
            </h1>
            
            <div className="quote-box">
              <FaQuoteLeft className="quote-icon" />
              <p className="quote-text">
                "Our mission is simple yet powerful: Wealthy Farmers. Healthy Society."
              </p>
            </div>
            
            <p className="description">
              Rooted in the rural heartland of Virgaon, Akole Tehsil, Ahilyanagar,
              Mr. Deshmukh pursued his passion for agriculture through academic excellence,
              earning a Bachelor's degree from Dhule and a Master's in Plant Pathology from
              MPKV, Rahuri.
            </p>
            <p className="description">
              After witnessing the harmful effects of synthetic agrochemicals during his early
              career, he became determined to develop sustainable alternatives for Indian farmers.
              This vision led to the founding of <strong>Krishivishwa Biotech</strong>, a company
              focused on producing biofertilizers and biopesticides, and <strong>Krishivishwa
              Foundation</strong>, promoting organic and residue-free farming.
            </p>

            {/* Quick Connect Section */}
            <div className="quick-connect">
              <h3 className="connect-title">Quick Connect</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>+91 1234567890</span>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <span>info@krishivishwa.com</span>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>Ahmednagar, Maharashtra</span>
                </div>
              </div>
            </div>
          </div>

          <div className="founder-image-col">
            <div className="founder-image-wrapper">
              <div className="image-decoration"></div>
              <img
                src={Founder}
                alt="Dr. Anil Nivruti Deshmukh, Founder of Krishivishwa Biotech"
                className="founder-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderBanner;