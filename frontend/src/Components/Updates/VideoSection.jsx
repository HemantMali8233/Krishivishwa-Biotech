"use client"
import React, { useState, useEffect } from 'react'
import './VideoSection.css'

const API_UPDATES_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/updates"

const VideoSection = () => {
  const [activeVideo, setActiveVideo] = useState(0)
  const [videoData, setVideoData] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fetch video data from backend
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_UPDATES_URL}/videos`)
        const data = await response.json()
        
        // Format the data for frontend use
        const formattedVideos = data.map(video => ({
          id: video._id,
          title: video.title,
          description: video.description,
          duration: video.duration,
          youtubeId: video.youtubeId,
          thumbnail: video.thumbnail,
          category: video.category
        }))
        
        setVideoData(formattedVideos)
        
        // Reset active video if current selection is out of bounds
        if (formattedVideos.length > 0 && activeVideo >= formattedVideos.length) {
          setActiveVideo(0)
        }
      } catch (error) {
        console.error("Failed to fetch video data:", error)
        // Keep empty array if API fails
        setVideoData([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideoData()
    
    // Refresh data every 15 minutes
    const interval = setInterval(fetchVideoData, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleVideoSelect = (index) => {
    setActiveVideo(index)
  }

  if (loading) {
    return (
      <section className="video-section">
        <div className="video-container">
          <div className="video-loading">
            <h2>Loading Videos...</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </section>
    )
  }

  if (videoData.length === 0) {
    return (
      <section className="video-section">
        <div className="video-container">
          <h2 className="section-title">Agricultural Tutorials</h2>
          <div className="video-empty-state">
            <p>No tutorial videos available at the moment.</p>
            <p>Check back later for educational content!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="video-section">
      <div className="video-container">
        <h2 className="section-title">Agricultural Tutorials</h2>
        <p className="section-subtitle">Learn from experts and improve your farming practices</p>
        
        <div className="video-content">
          <div className="main-video">
            <div className="video-player">
              <div className="video-wrapper">
                <iframe 
                  src={`https://www.youtube.com/embed/${videoData[activeVideo].youtubeId}`}
                  title={videoData[activeVideo].title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-info">
                <h3>{videoData[activeVideo].title}</h3>
                <p>{videoData[activeVideo].description}</p>
                <div className="video-meta">
                  <span className="duration">{videoData[activeVideo].duration}</span>
                  <span className="category">{videoData[activeVideo].category}</span>
                  <a 
                    href={`https://www.youtube.com/watch?v=${videoData[activeVideo].youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="watch-btn"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="video-list">
            <h3 className="video-list-title">More Videos ({videoData.length})</h3>
            <div className="video-list-container">
              {videoData.map((video, index) => (
                <div 
                  key={video.id} 
                  className={`video-item ${index === activeVideo ? 'active' : ''}`}
                  onClick={() => handleVideoSelect(index)}
                >
                  <div className="video-thumbnail">
                    <img src={video.thumbnail} alt={video.title} />
                    <span className="video-duration">{video.duration}</span>
                    <div className="play-icon">
                      <i className="fas fa-play"></i>
                    </div>
                  </div>
                  <div className="video-details">
                    <h4>{video.title}</h4>
                    <p>{video.description}</p>
                    <span className="video-category">{video.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VideoSection
