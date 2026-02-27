import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaPhoneAlt,
  FaMapMarkerAlt
} from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import './ContactUs.css';
import ContactBanner from '../Components/ContactBanner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

export default function ContactUs() {
  const headingRef = useRef(null);
  const infoRefs = useRef([]);
  const formSectionRef = useRef(null);
  const companyInfoRef = useRef(null);
  const contactFormRef = useRef(null);
  const dialogueRef = useRef(null);
  const navigate = useNavigate();
  const { token } = useAuth();
  const tokenLS = localStorage.getItem("token");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirectFrom] = useState("/contact");


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Validation regexes
  const nameRegex = /^[a-zA-Z\s]+$/; // Only letters and spaces
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Valid email format
  const phoneRegex = /^[6-9]\d{9}$/; // Indian phone format: starts with 6,7,8,9 and exactly 10 digits

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (dialogueRef.current) observer.observe(dialogueRef.current);
    return () => {
      if (dialogueRef.current) observer.unobserve(dialogueRef.current);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('animate');
        });
      },
      { threshold: 0.3 }
    );

    if (headingRef.current) observer.observe(headingRef.current);
    infoRefs.current.forEach(ref => ref && observer.observe(ref));
    if (formSectionRef.current) observer.observe(formSectionRef.current);
    if (companyInfoRef.current) observer.observe(companyInfoRef.current);
    if (contactFormRef.current) observer.observe(contactFormRef.current);

    return () => observer.disconnect();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;

    // Special handling for different fields
    if (name === 'name') {
      // Only allow letters and spaces for name field
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === 'phone') {
      // Only allow digits for phone field
      const filteredValue = value.replace(/[^0-9]/g, '');
      if (filteredValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: filteredValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  // Enhanced validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    if (!nameRegex.test(name.trim())) {
      return "Name must contain only letters and spaces";
    }
    if (name.trim().length > 50) {
      return "Name must be less than 50 characters";
    }
    if (name.trim() !== name) {
      return "Name cannot start or end with spaces";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "";
    }
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email format (example@domain.com)";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    if (!phoneRegex.test(phone)) {
      return "Phone must be exactly 10 digits and start with 6, 7, 8, or 9";
    }
    return "";
  };

  const validateMessage = (message) => {
    if (!message.trim()) {
      return "Message is required";
    }

    const words = message.trim().split(/\s+/).filter(word => word.length > 0);

    if (words.length < 5) {
      return "Message must contain at least 5 words";
    }
    if (words.length > 50) {
      return "Message must not exceed 50 words";
    }
    return "";
  };

  // Get message word count
  const getMessageWordCount = (message) => {
    const words = message.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const messageError = validateMessage(formData.message);
    if (messageError) newErrors.message = messageError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!token && !tokenLS) {
      setShowLoginModal(true);
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        message: formData.message.trim(),
        category: 'contact us'
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/messages`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...((token || tokenLS) && { Authorization: `Bearer ${token || tokenLS}` }),
          },
        }
      );


      if (response.status === 201) {
        setIsSent(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setErrors({});
        setTimeout(() => setIsSent(false), 4500);
      } else {
        setServerError('Unexpected response from server.');
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageWordCount = getMessageWordCount(formData.message);
  const isMessageValid = messageWordCount >= 5 && messageWordCount <= 50;

  return (
    <div className="main-contact-page">
      <ContactBanner />

      <div className="main-contact-info">
        {/* Phone */}
        <div ref={el => (infoRefs.current[0] = el)} className="info-card fade-left">
          <div className="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 16 16">
              <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58z" fill="#facc15" />
            </svg>
          </div>
          <h3>Mob.: 9960492426 <br /> Ph.: 02424-261100</h3>
          <p>Call us for queries, support, or product details</p>
        </div>

        {/* Email */}
        <div ref={el => (infoRefs.current[1] = el)} className="info-card fade-center">
          <div className="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 16 16">
              <path d="M8.941.435a2 2 0 0 0-1.882 0l-6 3.2A2 2 0 0 0 0 5.4v.314l6.709 3.932L8 8.928l1.291.718L16 5.714V5.4a2 2 0 0 0-1.059-1.765zM16 6.873l-5.693 3.337L16 13.372v-6.5Zm-.059 7.611L8 10.072.059 14.484A2 2 0 0 0 2 16h12a2 2 0 0 0 1.941-1.516M0 13.373l5.693-3.163L0 6.873z" fill="#facc15" />
            </svg>
          </div>
          <h3>krishivishwabiotech@gmail.com</h3>
          <p>Write to us for partnerships, services, and feedback</p>
        </div>

        {/* Location */}
        <div ref={el => (infoRefs.current[2] = el)} className="info-card fade-right">
          <div className="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 16 16">
              <path d="M8 0a5 5 0 0 0-5 5c0 4.5 5 11 5 11s5-6.5 5-11a5 5 0 0 0-5-5zm0 7.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="#facc15" />
            </svg>
          </div>
          <h3>Akole, Ahmednagar</h3>
          <p>Gat. No.: 227 At. Virgaon, Tal. Akole, Dist. Ahmednagar (MH). Pin. 422605.</p>
        </div>
      </div>

      <div ref={dialogueRef} className={`Get-connect-dialogue ${isVisible ? 'show' : ''}`}>
        <div className="overlay"></div>
        <p>Reach out to us with any questions or inquiries</p>
      </div>

      <div className="form-container">
        <div className="form-left">
          <h2 className="form-heading">Form</h2>
          <h1 className="form-title">Get In Touch !!</h1>
          <p className="form-desc">
            Krishivishwa Biotech is dedicated to eco-friendly farming solutions. From biofertilizers to plant growth promoters, we help farmers achieve better yield sustainably. Let's build a healthier future together.
          </p>
        </div>

        <form className="form-right" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder=" "
              value={formData.name}
              onChange={handleChange}
              maxLength={50}
              required
            />
            <label>Name</label>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
            />
            <label>Email (optional)</label>
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder=" "
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              required
            />
            <label>Phone</label>
            {errors.phone && <span className="error">{errors.phone}</span>}
            {formData.phone && !errors.phone && (
              <small className="char-count">
                {formData.phone.length}/10 digits
              </small>
            )}
          </div>

          <div className="form-group">
            <textarea
              name="message"
              placeholder=" "
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <label>Message</label>
            {errors.message && <span className="error">{errors.message}</span>}
            {formData.message && !errors.message && (
              <small className={`word-count ${isMessageValid ? 'valid' : 'invalid'}`}>
                {messageWordCount}/50 words {messageWordCount < 5 ? '(minimum 5 required)' : ''}
              </small>
            )}
          </div>

          {serverError && <div className="server-error">{serverError}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="loader"></span>
              : isSent ? <span className="tick">✓ Sent</span> : "Submit"}
          </button>
        </form>
      </div>

      <div className='map-section'>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30062.96693794592!2d74.08232365013733!3d19.632817735159154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdda83a14c89ee9%3A0x55a8e3ee2501477a!2sKrishivishwa%20Bio-Tech!5e0!3m2!1sen!2sin!4v1752481686211!5m2!1sen!2sin"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {showLoginModal && (
        <div className="login-required-overlay">
          <div className="login-required-modal">
            <h3>Login required</h3>
            <p>You need to log in before sending a message.</p>
            <div className="login-required-actions">
              <button
                className="login-required-back"
                onClick={() => setShowLoginModal(false)}
              >
                Back
              </button>
              <button
                className="login-required-login"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/login', {
                    state: { showSignup: false, from: loginRedirectFrom },
                  });
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
