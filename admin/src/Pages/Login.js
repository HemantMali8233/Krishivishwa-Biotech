import React, { useState } from 'react';
import './Login.css';
import sideImage from '../Assets/sideimg.jpg';
import logo from '../Assets/logo.png';
import axios from 'axios';
import {
  FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaUser,
  FaEnvelope, FaLock, FaLeaf, FaKey, FaArrowRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [isLogin] = useState(true); // Only login, no signup
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    recoveryEmail: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => {
    if (!password || password.length < 8 || password.length > 20) {
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasDigit = /\d/.test(password);
    return hasUpperCase && hasSpecialChar && hasDigit;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        if (!formData.recoveryEmail) throw new Error('Please enter your email');
        if (!validateEmail(formData.recoveryEmail)) throw new Error('Enter a valid email');
        setSuccess('Recovery link sent!');
        setIsForgotPassword(false);
        return;
      }

      if (isLogin) {
        // === LOGIN API ===
        if (!formData.email || !formData.password) throw new Error('Fill all fields');
        if (!validateEmail(formData.email)) throw new Error('Invalid email');
        if (!validatePassword(formData.password)) {
          throw new Error('Password must be 8-20 characters with at least one uppercase letter, one special character, and one digit');
        }

        const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/login`, {
          email: formData.email,
          password: formData.password
        });

        if (res.data.token) {
          // Save in sessionStorage so it expires on browser close
          sessionStorage.setItem('authToken', res.data.token);
          sessionStorage.setItem('authUser', JSON.stringify(res.data.admin));

          setSuccess('Login successful!');
          onLogin(res.data.admin, res.data.token);
          navigate('/');
        } else {
          throw new Error('Invalid server response');
        }

      } else {
        // Signup disabled - only predefined admins can access
        throw new Error('Admin signup is disabled. Please contact system administrator.');
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Signup disabled - removed toggleAuthMode

  const toggleForgotPassword = () => {
    setIsForgotPassword(f => !f);
    setError('');
    setSuccess('');
    setFormData({ ...formData, recoveryEmail: '' });
  };

  // Social login placeholders
  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      sessionStorage.setItem('authToken', 'dummy-social-token');
      sessionStorage.setItem('authUser', JSON.stringify({ username: 'GoogleUser' }));
      onLogin({ username: "GoogleUser" }, 'dummy-social-token');
      navigate('/');
    }, 1200);
  };

  const handleFacebookLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      sessionStorage.setItem('authToken', 'dummy-social-token');
      sessionStorage.setItem('authUser', JSON.stringify({ username: 'FacebookUser' }));
      onLogin({ username: "FacebookUser" }, 'dummy-social-token');
      navigate('/');
    }, 1200);
  };

  return (
    <div className="login-wrapper">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75 }}
      >
        {/* Left Side */}
        <div className="login-left">
          <img src={sideImage} alt="Leaves" className="left-image" />
          <div className="image-overlay">
            <h2>Admin Access Panel</h2>
            <p>Monitor, control, and grow your business</p>
            <div className="eco-stats">
              <div className="stat-item"><FaLeaf /> Secure Access</div>
              <div className="stat-item"><FaLeaf /> Real-time Data</div>
              <div className="stat-item"><FaLeaf /> Analytics</div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-right">
          <div className="logo-block">
            <img src={logo} alt="Logo" className="logo-img" />
            <h1>
              {isForgotPassword ? "Password Recovery"
                : isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="subtitle">
              {isForgotPassword
                ? "Enter your email to reset your password"
                : isLogin ? "Log in to your dashboard account"
                : "Create a new dashboard account"}
            </p>
          </div>


          <AnimatePresence>
            {(error || success) && (
              <motion.div
                className={`message ${error ? 'error' : 'success'}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error || success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="form-fields">
            {isForgotPassword ? (
              <>
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="recoveryEmail"
                    placeholder="Your registered email"
                    value={formData.recoveryEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : <>Send Recovery Email <FaArrowRight /></>}
                </button>
                <button type="button" className="back-to-login" onClick={toggleForgotPassword}>
                  Back to Login
                </button>
              </>
            ) : (
              <>
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Logging In..." : <>Login to Dashboard <FaArrowRight /></>}
                </button>
              </>
            )}
          </form>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
