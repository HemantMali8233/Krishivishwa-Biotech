"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { FaEnvelope, FaPaperPlane, FaLeaf, FaSeedling, FaTractor, FaCalendarAlt, FaChartLine, FaPhone } from "react-icons/fa"
import { RiPlantFill } from "react-icons/ri"
import "./NewsletterCTA.css"

const API_UPDATES_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/updates"

const NewsletterCTA = ({ contact, setContact, onSubscribe }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactType, setContactType] = useState('email')
  
  const detectContactType = (input) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    if (emailRegex.test(input)) {
      return 'email';
    } else if (phoneRegex.test(input.replace(/[\s\-\(\)]/g, ''))) {
      return 'phone';
    }
    return contactType;
  }

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value);
    
    if (value) {
      const detected = detectContactType(value);
      setContactType(detected);
    }
  }
  
  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (!contact) {
      alert("Please enter your email address or phone number")
      return
    }

    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      
      const response = await fetch(`${API_UPDATES_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact }),
      })

      const result = await response.json()

      if (result.success) {
        alert("🎉 Thank you for subscribing!\n\nOur team will contact you soon with exclusive agricultural insights and community access.")
        setContact("")
        setContactType('email')
      } else {
        alert(result.message || "Subscription failed. Please try again.")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      alert("Something went wrong. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }

    if (onSubscribe) {
      onSubscribe(e)
    }
  }

  const getPlaceholderText = () => {
    return contactType === 'email' 
      ? "Enter your professional email" 
      : "Enter your phone number"
  }

  const getInputType = () => {
    return contactType === 'phone' ? 'tel' : 'email'
  }

  return (
    <motion.div 
      className="agri-newsletter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="agri-newsletter-container">
        <motion.div 
          className="decorative-leaf decorative-leaf-1"
          animate={{
            rotate: [0, 5, -5, 0],
            y: [0, -8, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <FaLeaf />
        </motion.div>
        
        <motion.div 
          className="decorative-leaf decorative-leaf-2"
          animate={{
            rotate: [0, -8, 5, 0],
            y: [0, 8, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <RiPlantFill />
        </motion.div>
        
        <div className="agri-newsletter-content">
          <div className="agri-newsletter-header">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {contactType === 'email' ? (
                <FaEnvelope className="agri-newsletter-icon" />
              ) : (
                <FaPhone className="agri-newsletter-icon" />
              )}
            </motion.div>
            <h3 className="agri-newsletter-title">
              <span>Agricultural</span> <span>Insights</span>
            </h3>
            <div className="agri-divider"></div>
          </div>
          
          <motion.p 
            className="agri-newsletter-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Join <strong>5,000+ agribusiness professionals</strong> receiving exclusive research, 
            seasonal forecasts, and sustainable farming strategies.
          </motion.p>

          <motion.form 
            className="agri-newsletter-form" 
            onSubmit={handleSubscribe}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="agri-form-group">
              <div className="agri-contact-input-wrapper">
                <div className="agri-input-icon">
                  {contactType === 'email' ? <FaEnvelope /> : <FaPhone />}
                </div>
                <input
                  type={getInputType()}
                  placeholder={getPlaceholderText()}
                  value={contact}
                  onChange={handleContactChange}
                  className="agri-newsletter-input"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <motion.button 
                type="submit" 
                className="agri-newsletter-btn"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { 
                  scale: 1.03,
                  backgroundColor: "#2a5233"
                } : {}}
                whileTap={!isSubmitting ? { scale: 0.97 } : {}}
              >
                <FaPaperPlane className="btn-icon" />
                <span>{isSubmitting ? "Subscribing..." : "Subscribe Now"}</span>
              </motion.button>
            </div>
            <div className="agri-contact-type-indicator">
              <span className="agri-detected-type">
                {contactType === 'email' ? '📧 Email detected' : '📱 Phone detected'}
              </span>
            </div>
          </motion.form>
          
          <motion.div 
            className="agri-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="stat-item">
              <FaTractor className="stat-icon" />
              <span>Industry-Leading Research</span>
            </div>
            <div className="stat-item">
              <FaChartLine className="stat-icon" />
              <span>Data-Driven Insights</span>
            </div>
            <div className="stat-item">
              <FaCalendarAlt className="stat-icon" />
              <span>Seasonal Reports</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default NewsletterCTA
