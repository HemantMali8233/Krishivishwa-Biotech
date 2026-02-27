import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import './WriteToUs.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function WriteToUs() {
    const sectionRef = useRef(null);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();
    const { token } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginRedirectFrom] = useState(() => (typeof window !== "undefined" ? window.location.pathname : "/"));

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const tokenLS = localStorage.getItem("token");

    // Validation regexes
    const nameRegex = /^[a-zA-Z\s]+$/; // Only letters and spaces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Valid email format
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone format: starts with 6,7,8,9 and exactly 10 digits

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5, rootMargin: "0px 0px -100px 0px" }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }
    }, []);

    const handleChange = (e) => {
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
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        setServerError("");
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

    const handleButtonClick = async () => {
        if (!token && !tokenLS) {
            setShowLoginModal(true);
            return;
        }
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

        if (Object.keys(newErrors).length === 0) {
            setIsSubmitting(true);
            setServerError("");
            try {
                // Integration point: add category for admin
                const payload = {
                    ...formData,
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone,
                    message: formData.message.trim(),
                    category: 'write us'
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
                    const btn = document.querySelector(".animated-button");
                    if (btn) btn.classList.add("sending");

                    setTimeout(() => {
                        if (btn) {
                            btn.classList.remove("sending");
                            btn.classList.add("sent");
                        }
                        setSent(true);
                    }, 1500);

                    setTimeout(() => {
                        if (btn) btn.classList.remove("sent");
                        setSent(false);
                    }, 4000);

                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        message: '',
                    });
                    setErrors({});
                } else {
                    setServerError("Unexpected response from server.");
                }
            } catch (error) {
                setServerError(
                    error.response?.data?.message || "Failed to submit message. Try again later."
                );
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const messageWordCount = getMessageWordCount(formData.message);
    const isMessageValid = messageWordCount >= 5 && messageWordCount <= 50;

    return (
        <div className="write-to-us-section">
            <div className="right-to-use-container" ref={sectionRef}>
                <div className="contact-left">
                    <p className="subheading">GET CONNECT WITH US</p>
                    <h1><span className="highlight">Discuss</span> Your<br />Chemical Solution Needs</h1>
                    <p className="description">
                        Reach out to Krishivishwa Biotech for your agricultural solutions. We are ready to assist you with expert guidance and sustainable products.
                    </p>

                    <div className="contact-info">
                        <p>
                            <i>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope-open-fill" viewBox="0 0 16 16">
                                    <path d="M8.941.435a2 2 0 0 0-1.882 0l-6 3.2A2 2 0 0 0 0 5.4v.314l6.709 3.932L8 8.928l1.291.718L16 5.714V5.4a2 2 0 0 0-1.059-1.765zM16 6.873l-5.693 3.337L16 13.372v-6.5Zm-.059 7.611L8 10.072.059 14.484A2 2 0 0 0 2 16h12a2 2 0 0 0 1.941-1.516M0 13.373l5.693-3.163L0 6.873z" />
                                </svg>
                            </i>
                            <a href="mailto:krishivishwabiotech@gmail.com" className="contact-link">
                                krishivishwabiotech@gmail.com
                            </a>
                        </p>
                        <p>
                            <i>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone-fill" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                                </svg>
                            </i>
                            <a href="tel:9960492426" className="contact-link">Mob.: 9960492426</a>
                            <span style={{ margin: "0 6px" }}>|</span>
                            <a href="tel:02424261100" className="contact-link">Ph.: 02424-261100</a>
                        </p>
                        <p className="mobile-address">
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                                </svg>
                            </span>
                            <span className="address-text">
                                Gat No. 227, At. Virgaon,<br />
                                Tal. Akole, Dist. Ahmednagar (MH), 422605
                            </span>
                        </p>
                    </div>
                </div>

                <div className="contact-right">
                    <form className="contact-form" onSubmit={e => { e.preventDefault(); }} noValidate>
                        <div className="input-group">
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
                            {errors.name && <small className="error-msg">{errors.name}</small>}
                        </div>

                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder=" "
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <label>Email (optional)</label>
                            {errors.email && <small className="error-msg">{errors.email}</small>}
                        </div>

                        <div className="input-group">
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
                            {errors.phone && <small className="error-msg">{errors.phone}</small>}
                            {formData.phone && !errors.phone && (
                                <small className="char-count">
                                    {formData.phone.length}/10 digits
                                </small>
                            )}
                        </div>

                        <div className="input-group">
                            <textarea
                                name="message"
                                placeholder=" "
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                            <label>Message</label>
                            {errors.message && <small className="error-msg">{errors.message}</small>}
                            {formData.message && !errors.message && (
                                <small className={`word-count ${isMessageValid ? 'valid' : 'invalid'}`}>
                                    {messageWordCount}/50 words {messageWordCount < 5 ? '(minimum 5 required)' : ''}
                                </small>
                            )}
                        </div>

                        {serverError && <p className="server-error">{serverError}</p>}

                        <button
                            type="button"
                            className={`animated-button ${sent ? "sent" : ""}`}
                            onClick={handleButtonClick}
                            disabled={isSubmitting}
                        >
                            <span className="btn-wrapper">
                                {isSubmitting ? (
                                    <span className="btn-text">
                                        <span className="spinner"></span>
                                        Sending...
                                    </span>
                                ) : !sent ? (
                                    <>
                                        <span className="btn-text">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                                                <path d="M15.964 0.686a.5.5 0 0 0-.65-.65L.354 7.438a.5.5 0 0 0 .062.94l6.748 1.844 1.844 6.748a.5.5 0 0 0 .94.062L15.964.686z" />
                                            </svg>
                                            Send Message
                                        </span>
                                        <span className="btn-arrow-line"></span>
                                    </>
                                ) : (
                                    <span className="sent-text">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-check-circle-fill success-icon" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                        </svg>
                                        Message Sent
                                    </span>
                                )}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
            {showLoginModal && (
                <div className="login-required-overlay">
                    <div className="login-required-modal">
                        <h3>Login required</h3>
                        <p>You need to log in before sending a message.</p>
                        <div className="login-required-actions">
                            <button className="login-required-back" onClick={() => setShowLoginModal(false)}>
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
