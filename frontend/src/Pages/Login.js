import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Form } from 'react-bootstrap';
import { BsHouseDoorFill } from 'react-icons/bs';
import useAOS from '../utils/useAos';
import '../Pages/Login.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../Assets/Images/Krushiwishwa .png';
import FacebookLogo from '../Assets/Images/facebook.png';
import GoogleLogo from '../Assets/Images/google.png';
import { useAuth } from "../context/AuthContext";


const API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/auth";

const LoginSignup = () => {
  const { login } = useAuth();
  useAOS();
  const location = useLocation();
  const navigate = useNavigate();
  const showSignup = location.state?.showSignup || false;

  const [isSignup, setIsSignup] = useState(showSignup);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    identifier: '', // email or phone
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const [showMainHeading, setShowMainHeading] = useState(false);
  const [headingKey, setHeadingKey] = useState(0);

  // Validation regexes
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/; // Indian 10‑digit phone
  const nameRegex = /^[a-zA-Z\s]+$/; // Only letters and spaces allowed
  
  // Password validation regexes
  const passwordRegex = {
    minLength: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /\d/,
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
  };

  useEffect(() => {
    setShowWelcome(false);
    setShowMainHeading(false);

    const welcomeDelay = setTimeout(() => setShowWelcome(true), 500);
    const switchToMain = setTimeout(() => {
      setShowWelcome(false);
      setShowMainHeading(true);
      setHeadingKey(prev => prev + 1);
    }, 2000);

    return () => {
      clearTimeout(welcomeDelay);
      clearTimeout(switchToMain);
    };
  }, [isSignup]);

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for name field - prevent typing numbers/special chars
    if (name === 'name') {
      // Only allow letters and spaces while typing
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Enhanced name validation
  const validateName = (name) => {
    const errors = [];
    
    if (!name.trim()) {
      errors.push("Full name is required");
    } else if (name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    } else if (!nameRegex.test(name.trim())) {
      errors.push("Name must contain only letters and spaces");
    } else if (name.trim().length > 50) {
      errors.push("Name must be less than 50 characters");
    } else if (name.trim() !== name) {
      errors.push("Name cannot start or end with spaces");
    }
    
    return errors;
  };

  // Enhanced identifier validation (email OR phone)
  const validateIdentifier = (identifier) => {
    const errors = [];
    
    if (!identifier.trim()) {
      errors.push("Email or phone is required");
    } else if (emailRegex.test(identifier.trim())) {
      // valid email
    } else if (phoneRegex.test(identifier.trim())) {
      // valid phone
    } else {
      errors.push("Enter a valid email or 10‑digit phone starting with 6‑9");
    }
    
    return errors;
  };

  // Enhanced password validation
  const validatePassword = (password, isSignupMode = false) => {
    const errors = [];
    
    if (!password) {
      errors.push("Password is required");
      return errors;
    }

    // Basic validations for both login and signup
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    // Additional validations only for signup
    if (isSignupMode) {
      if (!passwordRegex.uppercase.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }
      if (!passwordRegex.lowercase.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      if (!passwordRegex.number.test(password)) {
        errors.push("Password must contain at least one number");
      }
      if (!passwordRegex.specialChar.test(password)) {
        errors.push("Password must contain at least one special character (!@#$%^&*)");
      }
    }
    
    return errors;
  };

  // Enhanced validation function
  const validate = () => {
    const newErrors = {};
    
    // Name validation (only for signup)
    if (isSignup) {
      const nameErrors = validateName(formData.name);
      if (nameErrors.length > 0) {
        newErrors.name = nameErrors[0]; // Show first error
      }
    }

    // Identifier validation
    const identifierErrors = validateIdentifier(formData.identifier);
    if (identifierErrors.length > 0) {
      newErrors.identifier = identifierErrors[0]; // Show first error
    }

    // Password validation
    const passwordErrors = validatePassword(formData.password, isSignup);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors[0]; // Show first error
    }

    // Confirm password validation (only for signup)
    if (isSignup) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    return newErrors;
  };

  // Get password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    const checks = [
      passwordRegex.minLength.test(password),
      passwordRegex.uppercase.test(password),
      passwordRegex.lowercase.test(password),
      passwordRegex.number.test(password),
      passwordRegex.specialChar.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    const strengthMap = {
      0: { label: 'Very Weak', color: '#ff4757' },
      1: { label: 'Very Weak', color: '#ff4757' },
      2: { label: 'Weak', color: '#ff6b7a' },
      3: { label: 'Fair', color: '#ffa726' },
      4: { label: 'Good', color: '#66bb6a' },
      5: { label: 'Strong', color: '#4caf50' }
    };
    
    return { strength, ...strengthMap[strength] };
  };

  // Get failed password requirements
  const getFailedPasswordRequirements = (password) => {
    if (!password) return [];
    
    const requirements = [];
    
    if (!passwordRegex.minLength.test(password)) {
      requirements.push({ text: "At least 8 characters", met: false });
    }
    if (!passwordRegex.uppercase.test(password)) {
      requirements.push({ text: "One uppercase letter", met: false });
    }
    if (!passwordRegex.lowercase.test(password)) {
      requirements.push({ text: "One lowercase letter", met: false });
    }
    if (!passwordRegex.number.test(password)) {
      requirements.push({ text: "One number", met: false });
    }
    if (!passwordRegex.specialChar.test(password)) {
      requirements.push({ text: "One special character", met: false });
    }
    
    return requirements;
  };

  // Social login handler stubs
  const handleGoogleLogin = async () => {
    alert('Google login clicked (add your Google logic here)');
  };

  const handleFacebookLogin = async () => {
    alert('Facebook login clicked (add your Facebook logic here)');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length === 0) {
      setLoading(true);
      setErrors({});
      try {
        if (isSignup) {
          const { name, identifier, password } = formData;
          // Trim name before sending to server
          const trimmedName = name.trim();
          const res = await axios.post(`${API}/register`, { 
            name: trimmedName, 
            identifier: identifier.trim(), 
            password 
          });
          login(res.data.user, res.data.token);
          navigate("/", { state: { loginSuccess: res.data.message, user: res.data.user } });
        } else {
          const { identifier, password } = formData;
          const res = await axios.post(`${API}/login`, { 
            identifier: identifier.trim(), 
            password 
          });
          login(res.data.user, res.data.token);
          navigate("/", { state: { loginSuccess: res.data.message, user: res.data.user } });
        }
        setFormData({ name: '', identifier: '', password: '', confirmPassword: '' });
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Server error. Please try again.';
        setErrors({ form: errorMessage });
      } finally {
        setLoading(false);
      }
    }
  };

  const passwordStrength = isSignup ? getPasswordStrength(formData.password) : null;
  const failedRequirements = isSignup ? getFailedPasswordRequirements(formData.password) : [];

  return (
    <div className={`login-page ${isSignup ? 'signup-mode' : ''}`}>
      <div className="overlay">
        {errors.form && (
          <div className="custom-alert alert alert-danger" role="alert">
            {errors.form}
          </div>
        )}
        <img src={Logo} alt="Logo" className="top-left-logo" />
        <Container className="d-flex align-items-center justify-content-center min-vh-100" data-aos="fade-up">
          <div className="login-box d-flex flex-row overflow-hidden rounded" data-aos="zoom-in">
            <div className="login-image d-none d-md-block position-relative">
              <Button className="gradient-glow-btn" onClick={toggleMode}>
                {isSignup ? 'Login' : 'Sign Up'}
              </Button>
            </div>
            <div className="login-form text-white p-4 p-md-5 flex-grow-1 d-flex flex-column justify-content-between">
              <div>
                <h2
                  key={headingKey}
                  className={`mb-4 text-center login-heading ${showWelcome ? 'welcome-zoom' : showMainHeading ? 'slide-in-heading' : 'invisible-heading'}`}
                >
                  {showWelcome
                    ? isSignup
                      ? 'Welcome!!'
                      : 'Welcome back!!'
                    : isSignup
                      ? 'Sign Up'
                      : 'Login'}
                </h2>
                <div className="form-inner-wrapper">
                  <Form onSubmit={handleSubmit} noValidate>
                    {isSignup && (
                      <div className="input-group">
                        <div className="input-icon">
                          <i className="fas fa-user"></i>
                          <Form.Control
                            type="text"
                            name="name"
                            placeholder=" "
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                            isInvalid={!!errors.name}
                            maxLength={50}
                          />
                          <label>Full Name</label>
                        </div>
                        {errors.name && <div className="error-msg">{errors.name}</div>}
                      </div>
                    )}
                    
                    <div className="input-group">
                      <div className="input-icon">
                        <i className="fas fa-envelope"></i>
                        <Form.Control
                          type="text"
                          name="identifier"
                          placeholder=" "
                          value={formData.identifier}
                          onChange={handleChange}
                          className="input-field"
                          isInvalid={!!errors.identifier}
                        />
                        <label>Email or Phone</label>
                      </div>
                      {errors.identifier && <div className="error-msg">{errors.identifier}</div>}
                    </div>
                    
                    <div className="input-group">
                      <div className="input-icon">
                        <i className="fas fa-lock"></i>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder=" "
                          value={formData.password}
                          onChange={handleChange}
                          className="input-field"
                          isInvalid={!!errors.password}
                        />
                        <label>Password</label>
                      </div>
                      {errors.password && <div className="error-msg">{errors.password}</div>}
                      
                      {/* Password strength indicator and failed requirements for signup */}
                      {isSignup && formData.password && (
                        <div className="password-feedback mt-2">
                          {/* Show strength bar only when password has some content */}
                          <div className="strength-bar">
                            <div 
                              className="strength-fill" 
                              style={{ 
                                width: `${(passwordStrength.strength / 5) * 100}%`,
                                backgroundColor: passwordStrength.color 
                              }}
                            ></div>
                          </div>
                          <small style={{ color: passwordStrength.color }}>
                            Password Strength: {passwordStrength.label}
                          </small>
                          
                          {/* Only show failed requirements */}
                          {failedRequirements.length > 0 && (
                            <div className="password-requirements mt-2">
                              <small className="requirements-title">Missing requirements:</small>
                              {failedRequirements.map((requirement, index) => (
                                <div key={index} className="requirement failed">
                                  <i className="fas fa-times"></i>
                                  <span>{requirement.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {isSignup && (
                      <div className="input-group">
                        <div className="input-icon">
                          <i className="fas fa-lock"></i>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder=" "
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input-field"
                            isInvalid={!!errors.confirmPassword}
                          />
                          <label>Confirm Password</label>
                        </div>
                        {errors.confirmPassword && <div className="error-msg">{errors.confirmPassword}</div>}
                      </div>
                    )}
                    
                    <Button type="submit" className="glassy-submit-btn mt-2" disabled={loading}>
                      {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                      {!loading && (isSignup ? "Create Account" : "Sign In")}
                    </Button>
                    
                    {/* <div className="separator mt-3 mb-3">
                      <span className="line"></span>
                      <span className="or-text">or continue with</span>
                      <span className="line"></span>
                    </div> */}
                    
                    {/* <div className="social-login-buttons">
                      <Button className="social-btn facebook" type="button" onClick={handleFacebookLogin}>
                        <img src={FacebookLogo} alt="Facebook" className="social-icon" />
                        <span className="social-text">Facebook</span>
                      </Button>
                      <Button className="social-btn google" type="button" onClick={handleGoogleLogin}>
                        <img src={GoogleLogo} alt="Google" className="social-icon" />
                        <span className="social-text">Google</span>
                      </Button>
                    </div> */}
                    
                    <div className="text-center text-white mt-3">
                      <span>{isSignup ? 'Already have an account?' : 'New to Krishivishwa-Biotech?'}</span>{' '}
                      <a href="#" onClick={toggleMode} className="text-info text-decoration-none">
                        {isSignup ? 'Login here' : 'Sign up now'}
                      </a>
                    </div>
                  </Form>
                </div>
              </div>
              <div className="text-center mt-4">
                <a href="/" className="back-home-btn" data-aos="fade-up">
                  <BsHouseDoorFill size={18} /> Back to Home
                </a>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default LoginSignup;
