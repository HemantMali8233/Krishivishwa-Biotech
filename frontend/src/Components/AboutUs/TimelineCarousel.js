"use client"

import { useEffect, useState, useCallback } from "react"
import { Container, Button } from "react-bootstrap"
import axios from "axios"
import "./TimelineCarousel.css"

// === Declare all path constants ===
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"
const API_TIMELINE_URL = `${API_BASE_URL}/api/timeline`
const UPLOADS_BASE_PATH = `${API_BASE_URL}/uploads/TimelineCarousel/`
const PLACEHOLDER_IMAGE = "/placeholder.svg"

// Enhanced professional gradient backgrounds
const TIMELINE_BG_GRADIENTS = [
  "linear-gradient(135deg, rgba(240,249,255,0.9) 0%, rgba(219,234,254,0.5) 100%)",
  "linear-gradient(135deg, rgba(254,242,242,0.9) 0%, rgba(252,231,243,0.5) 100%)",
  "linear-gradient(135deg, rgba(240,253,244,0.9) 0%, rgba(220,252,231,0.5) 100%)",
  "linear-gradient(135deg, rgba(255,251,235,0.9) 0%, rgba(254,240,138,0.3) 100%)",
  "linear-gradient(135deg, rgba(245,243,255,0.9) 0%, rgba(221,214,254,0.5) 100%)",
  "linear-gradient(135deg, rgba(236,254,255,0.9) 0%, rgba(165,243,252,0.4) 100%)",
  "linear-gradient(135deg, rgba(255,228,230,0.9) 0%, rgba(254,205,211,0.4) 100%)",
  "linear-gradient(135deg, rgba(247,254,231,0.9) 0%, rgba(196,253,123,0.4) 100%)",
  "linear-gradient(135deg, rgba(254,249,195,0.9) 0%, rgba(254,240,138,0.5) 100%)",
  "linear-gradient(135deg, rgba(233,213,255,0.9) 0%, rgba(196,181,253,0.5) 100%)"
]

const TimelineCarousel = () => {
  const [centerIndex, setCenterIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [milestones, setMilestones] = useState([])

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const res = await axios.get(API_TIMELINE_URL)
        const data = res.data
          .map((item) => ({
            year: item.year,
            title: item.title,
            description: item.description,
            achievement: item.achievement,
            metric: item.metric,
            highlight: item.highlight,
            icon: item.icon,
            image: item.image,
            id: item._id,
          }))
          .sort((a, b) => Number(a.year) - Number(b.year))
        setMilestones(data)
        setCenterIndex(0)
      } catch (error) {
        console.error("Failed to fetch milestones:", error)
      }
    }
    fetchMilestones()
  }, [])

  const handleTransition = useCallback(
    (newIndex) => {
      if (isTransitioning || milestones.length === 0) return
      setIsTransitioning(true)
      setCenterIndex(newIndex)
      setTimeout(() => setIsTransitioning(false), 400)
    },
    [isTransitioning, milestones.length]
  )

  // Auto-slide effect - only if more than 1 milestone
  useEffect(() => {
    if (isPaused || milestones.length <= 1) return

    const interval = setInterval(() => {
      handleTransition((centerIndex + 1) % milestones.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [centerIndex, isPaused, handleTransition, milestones.length])

  const handlePrev = () => {
    if (milestones.length <= 1) return
    const newIndex = (centerIndex - 1 + milestones.length) % milestones.length
    handleTransition(newIndex)
  }

  const handleNext = () => {
    if (milestones.length <= 1) return
    const newIndex = (centerIndex + 1) % milestones.length
    handleTransition(newIndex)
  }

  const handleDotClick = (index) => {
    if (index !== centerIndex) {
      handleTransition(index)
    }
  }

  const getDisplayItems = () => {
    if (milestones.length === 0) return []
    
    // For 1 or 2 items, show them without duplication
    if (milestones.length <= 2) {
      return milestones.map((milestone, index) => ({
        ...milestone,
        position: index - centerIndex,
        index,
        isCenter: index === centerIndex
      }))
    }

    // For 3+ items, show center + 2 on each side (max 5 visible)
    const result = []
    const visibleCount = Math.min(5, milestones.length)
    const half = Math.floor(visibleCount / 2)
    
    for (let offset = -half; offset <= half; offset++) {
      const index = (centerIndex + offset + milestones.length) % milestones.length
      result.push({ 
        ...milestones[index], 
        position: offset, 
        index,
        isCenter: offset === 0
      })
    }
    return result
  }

  if (milestones.length === 0) {
    return (
      <div className="timeline-carousel-container">
        <div className="timeline-header">
          <h2 className="timeline-title">🌿 Our Growth Journey</h2>
          <p className="timeline-subtitle">Loading milestones...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="timeline-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="timeline-header">
        <h2 className="timeline-title">🌿 Our Growth Journey</h2>
        <p className="timeline-subtitle">Key milestones that shaped our organic revolution</p>
      </div>

      <Container fluid className="carousel-wrapper">
        {milestones.length > 1 && (
          <>
            <Button
              variant="light"
              className="nav-button nav-button-left"
              onClick={handlePrev}
              disabled={isTransitioning}
              aria-label="Previous milestone"
            >
              <span className="nav-arrow">‹</span>
            </Button>

            <Button
              variant="light"
              className="nav-button nav-button-right"
              onClick={handleNext}
              disabled={isTransitioning}
              aria-label="Next milestone"
            >
              <span className="nav-arrow">›</span>
            </Button>
          </>
        )}

        <div className="cards-container">
          {getDisplayItems().map(({ position, index, isCenter, ...milestone }) => {
            const distance = Math.abs(position)
            const direction = position > 0 ? 1 : position < 0 ? -1 : 0

            // Calculate transform based on screen size and number of items
            let translateX = 0
            if (milestones.length > 2) {
              translateX = direction * distance * 280
            } else if (milestones.length === 2) {
              translateX = position * 300
            }

            const cardStyle = {
              transform: `
                translateX(${translateX}px)
                translateY(${distance * 15}px)
                scale(${isCenter ? 1 : Math.max(0.85, 1 - distance * 0.1)})
              `,
              opacity: milestones.length <= 2 ? 1 : Math.max(0.4, 1 - distance * 0.2),
              zIndex: isCenter ? 10 : 10 - distance,
            }

            let imageUrl = PLACEHOLDER_IMAGE
            if (milestone.image) {
              imageUrl = milestone.image.startsWith("/uploads/")
                ? `${API_BASE_URL}${milestone.image}`
                : milestone.image.startsWith('http')
                ? milestone.image
                : `${UPLOADS_BASE_PATH}${milestone.image}`
            }

            return (
              <div
                key={`${milestone.year}-${index}`}
                className={`milestone-card ${isCenter ? "center" : ""} ${isTransitioning ? "transitioning" : ""}`}
                style={cardStyle}
                onClick={() => !isCenter && milestones.length > 1 && handleDotClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if ((e.key === "Enter" || e.key === " ") && !isCenter && milestones.length > 1) {
                    handleDotClick(index)
                  }
                }}
                aria-label={`Milestone: ${milestone.title} (${milestone.year})`}
              >
                <div 
                  className="card-inner"
                  style={{ background: TIMELINE_BG_GRADIENTS[index % TIMELINE_BG_GRADIENTS.length] }}
                >
                  <div className="year-badge">
                    <span className="milestone-icon">{milestone.icon}</span>
                    <div className={`year-text ${isCenter ? "center" : ""}`}>{milestone.year}</div>
                  </div>
                  
                  <div className="card-image">
                    <img src={imageUrl} alt={milestone.title} className="milestone-image" />
                    <div className="image-overlay"></div>
                    <div className="image-glow"></div>
                  </div>
                  
                  <div className="card-content">
                    <div className="title-section">
                      <h3 className={`card-title ${isCenter ? "center" : ""}`}>
                        {milestone.title}
                        <span className="title-accent"></span>
                      </h3>
                      <p className={`card-description ${isCenter ? "center" : ""}`}>{milestone.description}</p>
                    </div>
                    
                    <div className="metrics-section">
                      <div className="metric-item">
                        <div className="metric-icon-wrapper">
                          <span className={`metric-icon ${isCenter ? "center" : ""}`}>🏆</span>
                        </div>
                        <span className={`metric-text metric-underline ${isCenter ? "center" : ""}`}>
                          {milestone.achievement}
                        </span>
                      </div>
                      <div className="metric-item">
                        <div className="metric-icon-wrapper">
                          <span className={`metric-icon ${isCenter ? "center" : ""}`}>📈</span>
                        </div>
                        <span className={`metric-value metric-underline ${isCenter ? "center" : ""}`}>
                          {milestone.metric}
                        </span>
                      </div>
                    </div>
                    
                    <div className="highlight-section">
  <div className="highlight-icon">💡</div>
  <p className="highlight-text">{milestone.highlight}</p>
</div>

                    
                    <div className={`bottom-accent ${isCenter ? "center" : ""}`}></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {milestones.length > 1 && (
          <div className="progress-dots">
            {milestones.map((_, i) => (
              <button
                key={i}
                className={`progress-dot ${i === centerIndex ? "active" : ""}`}
                onClick={() => handleDotClick(i)}
                disabled={isTransitioning}
                aria-label={`Go to milestone ${i + 1}`}
              >
                <span className="dot-inner"></span>
              </button>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}

export default TimelineCarousel
