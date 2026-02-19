// FounderBanner.js
import React from "react";
import "../AboutUs/FounderSection.css";
import { FaQuoteLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin, FaSeedling } from "react-icons/fa";
import { MdScience, MdEco, MdAgriculture } from "react-icons/md";
import { RiLeafFill, RiPlantFill } from "react-icons/ri";
import Founder from '../../Assets/Images/Founder.jpg';

const FounderBanner = () => {
  return (
    <section className="founder-section">
      {/* Background decorative elements */}
      <div className="bg-leaf bg-leaf-1"><RiPlantFill /></div>
      <div className="bg-leaf bg-leaf-2"><FaSeedling /></div>
      <div className="bg-leaf bg-leaf-3"><RiLeafFill /></div>
      <div className="bg-leaf bg-leaf-4"><MdAgriculture /></div>
      
      <div className="founder-container">
        {/* Animated floating elements */}
        <div className="floating-particle particle-1"></div>
        <div className="floating-particle particle-2"></div>
        <div className="floating-particle particle-3"></div>
        
        <div className="founder-content-wrapper">
          <div className="founder-text">
            <div className="badge-group">
              <span className="badge badge-science">
                <MdScience className="badge-icon" /> Pathologist
              </span>
              <span className="badge badge-eco">
                <MdEco className="badge-icon" /> Visionary Leader
              </span>
            </div>
            
            <p className="subheading">Director & Proprietor</p>
            
            <h1>
              <span className="highlight">Dr. Anil Nivruti Deshmukh</span>
            </h1>
            
            <div className="quote-box">
              <div className="quote-decoration"></div>
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
            
            <div className="signature-block">
              <div className="signature-line"></div>
              <div className="signature-name">Dr. Anil Nivruti Deshmukh</div>
              <div className="signature-title">Founder & Director</div>
            </div>
          </div>

          <div className="founder-image-col">
            <div className="founder-image-wrapper">
              <div className="image-decoration"></div>
              <div className="image-frame">
                <img
                  src={Founder}
                  alt="Dr. Anil Nivruti Deshmukh, Founder of Krishivishwa Biotech"
                  className="founder-image"
                />
                <div className="image-overlay"></div>
              </div>
              <div className="experience-badge">
                <span className="years">20+</span>
                <span className="label">Years of Experience</span>
              </div>
              <div className="achievement-dots">
                <div className="achievement-dot dot-1" data-tooltip="Biotech Innovations"></div>
                <div className="achievement-dot dot-2" data-tooltip="Sustainable Farming"></div>
                <div className="achievement-dot dot-3" data-tooltip="Farmer Education"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderBanner;