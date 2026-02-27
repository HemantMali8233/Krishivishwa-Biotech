"use client"
import { FaBolt, FaFire, FaStar, FaTint, FaRobot, FaSeedling } from "react-icons/fa"
import { useEffect, useRef, useState } from "react"
import "./BreakingNewsMarquee.css"

const API_UPDATES_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/updates"

const BreakingNewsMarquee = () => {
  const [isHovered, setIsHovered] = useState(false)
  const [breakingNews, setBreakingNews] = useState([])
  const [loading, setLoading] = useState(true)
  const marqueeRef = useRef(null)
  const containerRef = useRef(null)

  // Fetch marquee data from backend
  useEffect(() => {
    const fetchMarqueeData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_UPDATES_URL}/marquee`)
        const data = await response.json()
        
        // Filter only active marquees and format them
        const activeMarquees = data
          .filter(item => item.active)
          .map((item, index) => ({
            text: item.text,
            icon: getRandomIcon(index),
            id: item._id
          }))
        
        setBreakingNews(activeMarquees)
      } catch (error) {
        console.error("Failed to fetch marquee data:", error)
        // Fallback data
        setBreakingNews([
          { text: "Welcome to Agricultural Updates", icon: <FaSeedling className="news-icon" />, id: 1 }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMarqueeData()
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchMarqueeData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Function to get random icons for variety
  const getRandomIcon = (index) => {
    const icons = [
      <FaSeedling className="news-icon" />,
      <FaRobot className="news-icon" />,
      <FaStar className="news-icon" />,
      <FaTint className="news-icon" />,
      <FaFire className="news-icon" />
    ]
    return icons[index % icons.length]
  }

  useEffect(() => {
    if (marqueeRef.current && containerRef.current && breakingNews.length > 0) {
      const containerWidth = containerRef.current.offsetWidth
      const marqueeWidth = marqueeRef.current.scrollWidth / 2
      const duration = Math.max(20, marqueeWidth / 30) // Dynamic duration based on content length

      marqueeRef.current.style.animationDuration = `${duration}s`
    }
  }, [breakingNews])

  if (loading) {
    return (
      <div className="bn-container loading">
        <div className="bn-label">
          <FaBolt className="bn-label-icon" />
          <span>LOADING...</span>
        </div>
      </div>
    )
  }

  if (breakingNews.length === 0) {
    return null // Don't show anything if no active marquees
  }

  return (
    <div 
      className="bn-container"
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bn-label">
        <FaBolt className="bn-label-icon" />
        <span>LATEST UPDATES</span>
        <div className="bn-label-underline"></div>
      </div>
      
      <div className="bn-marquee-wrapper">
        <div 
          className={`bn-marquee-track ${isHovered ? 'paused' : ''}`}
          ref={marqueeRef}
        >
          {[...breakingNews, ...breakingNews].map((news, index) => (
            <div key={`${news.id}-${index}`} className="bn-item">
              {news.icon}
              <span>{news.text}</span>
              <div className="bn-separator">
                <div className="bn-dot"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bn-gradient-overlay left"></div>
      <div className="bn-gradient-overlay right"></div>
    </div>
  )
}

export default BreakingNewsMarquee
