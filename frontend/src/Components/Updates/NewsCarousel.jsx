"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaCalendarAlt } from "react-icons/fa"
import { FiTrendingUp } from "react-icons/fi"
import "./NewsCarousel.css"
import Loader from "../../Components/Loader"

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"
const API_UPDATES_URL = BACKEND_URL + "/api/updates"

const NewsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const [featuredStories, setFeaturedStories] = useState([])
  const [likedStories, setLikedStories] = useState(new Set())
  const [loading, setLoading] = useState(true)

  // Fetch news carousel data from backend
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_UPDATES_URL}/news`)
        const data = await response.json()

        // Format the data for frontend use
        const formattedStories = data.map(story => ({
          ...story,
          id: story._id,
          image: story.image.startsWith('http') ? story.image : `${BACKEND_URL}${story.image}`
        }))

        setFeaturedStories(formattedStories)
      } catch (error) {
        console.error("Failed to fetch news data:", error)
        // Keep empty array if API fails
        setFeaturedStories([])
      } finally {
        setLoading(false)
      }
    }

    fetchNewsData()

    // Refresh data every 10 minutes
    const interval = setInterval(fetchNewsData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Load liked stories from localStorage
  useEffect(() => {
    const savedLikes = localStorage.getItem('likedStories')
    if (savedLikes) {
      setLikedStories(new Set(JSON.parse(savedLikes)))
    }
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleLike = async (storyId) => {
    try {
      const isLiked = likedStories.has(storyId)
      const action = isLiked ? 'unlike' : 'like'

      // Call backend API to update like count
      const response = await fetch(`${API_UPDATES_URL}/news/${storyId}/like`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const result = await response.json()

        // Update local state
        setLikedStories(prev => {
          const newLiked = new Set(prev)
          if (isLiked) {
            newLiked.delete(storyId)
          } else {
            newLiked.add(storyId)
          }

          // Save to localStorage
          localStorage.setItem('likedStories', JSON.stringify([...newLiked]))
          return newLiked
        })

        // Update story likes count in local state
        setFeaturedStories(stories =>
          stories.map(story =>
            story.id === storyId || story._id === storyId
              ? { ...story, likes: result.likes }
              : story
          )
        )
      }
    } catch (error) {
      console.error("Failed to update likes:", error)
    }
  }

  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % featuredStories.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + featuredStories.length) % featuredStories.length)
  }

  // Automatic sliding every 8 seconds
  useEffect(() => {
    if (featuredStories.length === 0) return;

    // Pause auto-slide on hover
    if (isHovered) return;

    const timeout = setTimeout(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % featuredStories.length);
    }, 8000);

    return () => clearTimeout(timeout);
  }, [currentSlide, isHovered, featuredStories.length]);


  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  }

  if (loading) {
    return <Loader text="Loading news stories..." height="50vh" />
  }

  if (featuredStories.length === 0) {
    return (
      <div className="agri-carousel-container">
        <div className="agri-carousel-empty">
          <h2>No news stories available</h2>
          <p>Check back later for the latest agricultural innovations.</p>
        </div>
      </div>
    )
  }

  const currentStory = featuredStories[currentSlide]

  return (
    <div className="agri-carousel-container">
      <div className="agri-carousel-header">
        <div className="agri-header-content">
          <h2 className="agri-carousel-title">
            <span className="agri-title-icon"><FiTrendingUp/></span>
            Agricultural Innovations
          </h2>
          <p className="agri-carousel-subtitle">Discover the latest breakthroughs in farming technology</p>
        </div>
        <div className="agri-carousel-controls">
          <button onClick={prevSlide} className="agri-carousel-btn" aria-label="Previous slide">
            <FaChevronLeft />
          </button>
          <button onClick={nextSlide} className="agri-carousel-btn" aria-label="Next slide">
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div
        className="agri-carousel-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            className="agri-carousel-slide"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            <div className="agri-slide-image">
              <img
                src={currentStory.image}
                alt={currentStory.title}
                className="agri-slide-img"
              />
              <div className="agri-slide-overlay"></div>
              <div className="agri-slide-category">
                <span className="agri-category-icon">{currentStory.icon}</span>
                <span>{currentStory.category}</span>
              </div>
              <div className="agri-slide-stats">
                {currentStory.stats?.map((stat, index) => (
                  <div key={index} className="agri-stat-item">
                    <div className="agri-stat-value">{stat.value}</div>
                    <div className="agri-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="agri-slide-content">
              <div className="agri-content-wrapper">
                <h3 className="agri-slide-title">{currentStory.title}</h3>
                <p className="agri-slide-excerpt">{currentStory.excerpt}</p>

                <div className="agri-slide-features">
                  {currentStory.features?.map((feature, index) => (
                    <div key={index} className="agri-feature">
                      <span className="agri-feature-icon">{feature.icon}</span>
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>

                <div className="agri-slide-meta">
                  <span className="agri-slide-date">
                    <FaCalendarAlt /> {formatDate(currentStory.uploadDate)}
                  </span>
                  <button
                    className={`agri-like-btn ${likedStories.has(currentStory.id || currentStory._id) ? 'liked' : ''}`}
                    onClick={() => handleLike(currentStory.id || currentStory._id)}
                    aria-label={`${likedStories.has(currentStory.id || currentStory._id) ? 'Unlike' : 'Like'} this story`}
                  >
                    {likedStories.has(currentStory.id || currentStory._id) ? <FaHeart /> : <FaRegHeart />}
                    <span>{currentStory.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="agri-carousel-indicators">
        {featuredStories.map((_, index) => (
          <button
            key={index}
            className={`agri-indicator ${index === currentSlide ? "active" : ""}`}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1)
              setCurrentSlide(index)
            }}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentSlide && (
              <motion.span
                className="agri-indicator-highlight"
                layoutId="indicatorHighlight"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default NewsCarousel
