"use client"
import { motion } from "framer-motion"
import "./Header.css"
import { FiArrowRight } from "react-icons/fi"
import { PiNewspaperBold } from "react-icons/pi"

const NewsBanner = () => {
  return (
    <div className="news-banner-wrapper">
      <div className="news-banner-overlay"></div>
      
      <div className="news-banner-content">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="news-text-container"
        >
          <motion.h1
            className="news-main-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
             Stay <span className="news-title-emphasis">Updated</span> With Our Latest News
          </motion.h1>
          
          <motion.div 
            className="news-divider"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          
          <motion.p
            className="news-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            Discover the latest developments, innovations, and stories from our agricultural journey
          </motion.p>

          <motion.button
            className="news-cta-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="feature-icon"><PiNewspaperBold /></span>
            Read Latest News
            <FiArrowRight className="news-arrow-icon" />
          </motion.button>
        </motion.div>
      </div> 
    </div>
  )
}

export default NewsBanner
