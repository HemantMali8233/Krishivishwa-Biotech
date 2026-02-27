"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import "./Consultancy_Booking.css";

export default function ConsultancyBooking() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirectFrom] = useState("/consultancy");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    farmSize: "",
    cropType: "",
    location: "",
    consultationType: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [focused, setFocused] = useState(null);
  const [serverError, setServerError] = useState("");

  // Regex patterns for validation
  const namePattern = /^[A-Za-z\s]+$/; // Only letters and spaces allowed
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Simple email validation
  const phonePattern = /^[6-9]\d{9}$/; // Indian phone format, 10 digits starting with 6-9
  const locationPattern = /^[A-Za-z\s,]+$/; // Letters, spaces, and commas allowed

  const validate = () => {
    const errs = {};
    const { name, email, phone, farmSize, cropType, location, consultationType } = formData;

    // Validate Name
    if (!name.trim()) {
      errs.name = "This field is required";
    } else if (!namePattern.test(name.trim())) {
      errs.name = "Name can contain only letters and spaces";
    } else if (name.trim().length < 3) {
      errs.name = "Name must be at least 3 characters";
    }

    // Validate Email (optional but must be valid if filled)
    if (email.trim() && !emailPattern.test(email.trim())) {
      errs.email = "Please enter a valid email";
    }

    // Validate Phone
    if (!phone.trim()) {
      errs.phone = "This field is required";
    } else if (!phonePattern.test(phone.trim())) {
      errs.phone = "Phone must be 10 digits and start with 6,7,8 or 9";
    }

    // Validate Farm Size
    if (!farmSize.trim()) {
      errs.farmSize = "This field is required";
    } else if (!/\d/.test(farmSize)) {
      errs.farmSize = "Please specify farm size (e.g., '2 acres')";
    }

    // Validate Crop Type
    if (!cropType.trim()) {
      errs.cropType = "This field is required";
    } else if (cropType.trim().length < 2) {
      errs.cropType = "Crop type must be at least 2 characters";
    }

    // Validate Location
    if (!location.trim()) {
      errs.location = "This field is required";
    } else if (!locationPattern.test(location.trim())) {
      errs.location = "Location can contain only letters, spaces, and commas";
    }

    // Validate consultationType
    if (!consultationType) {
      errs.consultationType = "Please select consultation type";
    }

    // Description - optional; no validation

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For name, allow only letters and spaces
    if (name === "name" && value && !/^[A-Za-z\s]*$/.test(value)) {
      // Ignore invalid chars
      return;
    }

    // For location, allow letters, spaces, and commas
    if (name === "location" && value && !/^[A-Za-z\s,]*$/.test(value)) {
      // Ignore invalid chars
      return;
    }

    // For phone, allow only digits, max 10
    if (name === "phone" && value) {
      if (!/^\d*$/.test(value)) return; // Allow only digits
      if (value.length > 10) return; // Max 10 digits
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleRadioChange = (val) => {
    setFormData((prev) => ({ ...prev, consultationType: val }));
    setErrors((prev) => ({ ...prev, consultationType: "" }));
    setServerError("");
  };

  const handleFocus = (field) => setFocused(field);
  const handleBlur = () => setFocused(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        farmSize: formData.farmSize.trim(),
        cropType: formData.cropType.trim(),
        location: formData.location.trim(),
        consultationType: formData.consultationType,
        description: formData.description.trim(),
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/appointments`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.status === 201) {
        setShowNotice(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          farmSize: "",
          cropType: "",
          location: "",
          consultationType: "",
          description: "",
        });
        setErrors({});
      } else {
        setServerError("Unexpected response from server.");
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Failed to submit. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="consultation-section">
      <div className="background-overlay"></div>
      <div className="decoration-left"></div>
      <div className="decoration-right"></div>

      <div className="main-container">
        <div className="header-content">
          <h2 className="page-title">Book Your Consultation</h2>
          <p className="page-subtitle">
            Get expert agricultural guidance tailored to your needs
          </p>
        </div>

        <div className="form-wrapper">
          <div className="form-header">
            <h3 className="form-title">Consultation Request Form</h3>
            <p className="form-subtitle">
              Fill in your details and we'll connect with you soon
            </p>
          </div>

          <div className="form-body">
            {!token && (
              <div className="server-error" role="alert" style={{ marginBottom: "12px" }}>
                Please login to book an appointment.
              </div>
            )}
            <form onSubmit={handleSubmit} className="booking-form" noValidate>
              {serverError && (
                <div className="server-error" role="alert">
                  {serverError}
                </div>
              )}

              {/* Name & Email */}
              <div className="input-row">
                <div className={`field-group ${errors.name ? "error" : ""} ${focused === "name" ? "focused" : ""}`}>
                  <label htmlFor="name" className="field-label">
                    Full Name <span className="required-asterisk">*</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus("name")}
                      onBlur={handleBlur}
                      className="text-input name-field"
                      aria-invalid={errors.name ? "true" : "false"}
                      aria-describedby="name-error"
                    />
                  </div>
                  {errors.name && <span id="name-error" className="error-message">{errors.name}</span>}
                </div>

                <div className={`field-group ${errors.email ? "error" : ""} ${focused === "email" ? "focused" : ""}`}>
                  <label htmlFor="email" className="field-label">
                    Email <span className="optional-label">(optional)</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFocus("email")}
                      onBlur={handleBlur}
                      className="text-input email-field"
                      aria-invalid={errors.email ? "true" : "false"}
                      aria-describedby="email-error"
                    />
                  </div>
                  {errors.email && <span id="email-error" className="error-message">{errors.email}</span>}
                </div>
              </div>

              {/* Phone & Farm Size */}
              <div className="input-row">
                <div className={`field-group ${errors.phone ? "error" : ""} ${focused === "phone" ? "focused" : ""}`}>
                  <label htmlFor="phone" className="field-label">
                    Phone (10 digits) <span className="required-asterisk">*</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFocus("phone")}
                      onBlur={handleBlur}
                      className="text-input phone-field"
                      aria-invalid={errors.phone ? "true" : "false"}
                      aria-describedby="phone-error"
                    />
                  </div>
                  {errors.phone && <span id="phone-error" className="error-message">{errors.phone}</span>}
                </div>

                <div className={`field-group ${errors.farmSize ? "error" : ""} ${focused === "farmSize" ? "focused" : ""}`}>
                  <label htmlFor="farmSize" className="field-label">
                    Farm Size <span className="required-asterisk">*</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="farmSize"
                      name="farmSize"
                      type="text"
                      placeholder="e.g., 2 acres"
                      value={formData.farmSize}
                      onChange={handleChange}
                      onFocus={() => handleFocus("farmSize")}
                      onBlur={handleBlur}
                      className="text-input farm-field"
                      aria-invalid={errors.farmSize ? "true" : "false"}
                      aria-describedby="farmSize-error"
                    />
                  </div>
                  {errors.farmSize && <span id="farmSize-error" className="error-message">{errors.farmSize}</span>}
                </div>
              </div>

              {/* Crop Type & Location */}
              <div className="input-row">
                <div className={`field-group ${errors.cropType ? "error" : ""} ${focused === "cropType" ? "focused" : ""}`}>
                  <label htmlFor="cropType" className="field-label">
                    Crop / Food Type <span className="required-asterisk">*</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="cropType"
                      name="cropType"
                      type="text"
                      placeholder="eg.,wheat"
                      value={formData.cropType}
                      onChange={handleChange}
                      onFocus={() => handleFocus("cropType")}
                      onBlur={handleBlur}
                      className="text-input crop-field"
                      aria-invalid={errors.cropType ? "true" : "false"}
                      aria-describedby="cropType-error"
                    />
                  </div>
                  {errors.cropType && <span id="cropType-error" className="error-message">{errors.cropType}</span>}
                </div>

                <div className={`field-group ${errors.location ? "error" : ""} ${focused === "location" ? "focused" : ""}`}>
                  <label htmlFor="location" className="field-label">
                    Location <span className="required-asterisk">*</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="eg.,Pune,Maharashtra"
                      value={formData.location}
                      onChange={handleChange}
                      onFocus={() => handleFocus("location")}
                      onBlur={handleBlur}
                      className="text-input location-field"
                      aria-invalid={errors.location ? "true" : "false"}
                      aria-describedby="location-error"
                    />
                  </div>
                  {errors.location && <span id="location-error" className="error-message">{errors.location}</span>}
                </div>
              </div>

              {/* Consultation Type */}
              <div className="field-group">
                <label className="field-label">
                  Consultation Type <span className="required-asterisk">*</span>
                </label>
                <div className="radio-container">
                  <div
                    className={`radio-item ${formData.consultationType === "Phone Call" ? "active" : ""}`}
                    onClick={() => handleRadioChange("Phone Call")}
                    role="radio"
                    aria-checked={formData.consultationType === "Phone Call"}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRadioChange("Phone Call");
                    }}
                  >
                    <input
                      type="radio"
                      id="phone-call"
                      name="consultationType"
                      value="Phone Call"
                      checked={formData.consultationType === "Phone Call"}
                      onChange={() => handleRadioChange("Phone Call")}
                      hidden
                    />
                    <span className="custom-radio"></span>
                    <FaPhoneAlt className="radio-icon" />
                    <span className="radio-content">
                      Phone Call<br />
                      
                    </span>
                  </div>

                  <div
                    className={`radio-item ${formData.consultationType === "Field Visit" ? "active" : ""}`}
                    onClick={() => handleRadioChange("Field Visit")}
                    role="radio"
                    aria-checked={formData.consultationType === "Field Visit"}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRadioChange("Field Visit");
                    }}
                  >
                    <input
                      type="radio"
                      id="field-visit"
                      name="consultationType"
                      value="Field Visit"
                      checked={formData.consultationType === "Field Visit"}
                      onChange={() => handleRadioChange("Field Visit")}
                      hidden
                    />
                    <span className="custom-radio"></span>
                    <FaMapMarkerAlt className="radio-icon" />
                    <span className="radio-content">Field Visit</span>
                  </div>
                </div>
                {errors.consultationType && <span className="error-message">{errors.consultationType}</span>}
              </div>

              {/* Description */}
              <div className={`field-group ${focused === "description" ? "focused" : ""}`}>
                <label htmlFor="description" className="field-label">
                  Description <span className="optional-label">(optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your concerns"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  onFocus={() => handleFocus("description")}
                  onBlur={handleBlur}
                  className="text-area"
                />
              </div>

              <div className="button-section">
                <button type="submit" disabled={submitting} className={submitting ? "submit-btn submitting" : "submit-btn"}>
                  {submitting ? (
                    <>
                      <span className="loading-spinner" aria-hidden="true"></span> Processing...
                    </>
                  ) : "Book Now"}
                </button>
              </div>
            </form>

            {showNotice && (
              <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
                <div className="modal-content">
                  <button className="modal-close-x" onClick={() => setShowNotice(false)} aria-label="Close dialog">&times;</button>
                  <h2 id="modal-title">Appointment Booked Successfully!</h2>
                  <p id="modal-desc">After booking, our team will contact you within 2-3 days via WhatsApp or phone.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <LoginRequiredModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigate("/login", { state: { showSignup: false, from: loginRedirectFrom } });
        }}
        message="You need to log in before booking an appointment."
      />
    </section>
  );
}

/*
  Login required modal – shared styling reused from Shop page
*/
export function LoginRequiredModal({ show, onClose, onLogin, message = "You need to log in before proceeding." }) {
  if (!show) return null;
  return (
    <div className="login-required-overlay">
      <div className="login-required-modal">
        <h3>Login required</h3>
        <p>{message}</p>
        <div className="login-required-actions">
          <button className="login-required-back" onClick={onClose}>Back</button>
          <button className="login-required-login" onClick={onLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}
