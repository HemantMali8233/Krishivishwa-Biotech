"use client"

import { useState, useEffect } from "react"
import { FiEdit, FiImage, FiCalendar, FiPlus, FiTrash2, FiSearch, FiVideo, FiPlay, FiUpload, FiHeart, FiTrendingUp, FiMail, FiUsers } from "react-icons/fi"
import { FaBullhorn} from "react-icons/fa"
import axios from "axios"
import "./Updates.css"

const API_UPDATES_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/updates"

const Updates = () => {
  const [activeTab, setActiveTab] = useState("marquee")
  const [marqueeItems, setMarqueeItems] = useState([])
  const [cards, setCards] = useState([])
  const [videos, setVideos] = useState([])
  const [newsCarousel, setNewsCarousel] = useState([])
  const [newsletters, setNewsletters] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentMarqueeText, setCurrentMarqueeText] = useState("")
  const [editingMarqueeId, setEditingMarqueeId] = useState(null)
  const [showMarqueeModal, setShowMarqueeModal] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showNewsModal, setShowNewsModal] = useState(false)
  const [showNewsletterSettingsModal, setShowNewsletterSettingsModal] = useState(false)
  const [currentCard, setCurrentCard] = useState(null)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [currentNews, setCurrentNews] = useState(null)
  const [newsletterSettings, setNewsletterSettings] = useState({
    welcomeMessage: "Welcome to our Agricultural Community! 🌾\n\nThank you for subscribing to our newsletter. Join our WhatsApp group to stay connected with fellow farmers and get instant updates on the latest agricultural innovations, weather alerts, and market insights.\n\nClick the link below to join our exclusive WhatsApp community:",
    whatsappGroupLink: "https://chat.whatsapp.com/your-group-link-here",
    isActive: true
  })
  const [loading, setLoading] = useState(false)

  // Fetch data from backend with comprehensive error handling
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [marqueeRes, newsRes, newsletterRes, videosRes, settingsRes] = await Promise.all([
          axios.get(`${API_UPDATES_URL}/marquee`).catch(err => ({ data: [] })),
          axios.get(`${API_UPDATES_URL}/news/all`).catch(err => ({ data: [] })),
          axios.get(`${API_UPDATES_URL}/newsletters`).catch(err => ({ data: [] })),
          axios.get(`${API_UPDATES_URL}/videos/all`).catch(err => ({ data: [] })),
          axios.get(`${API_UPDATES_URL}/newsletter-settings`).catch(err => ({ data: newsletterSettings }))
        ])

        // Ensure data is always an array and has proper structure
        setMarqueeItems(Array.isArray(marqueeRes.data) ? marqueeRes.data : [])
        setNewsCarousel(Array.isArray(newsRes.data) ? newsRes.data : [])
        setNewsletters(Array.isArray(newsletterRes.data) ? newsletterRes.data.map(newsletter => ({
          _id: newsletter._id || newsletter.id || Math.random().toString(),
          contactType: newsletter.contactType || 'email',
          contactValue: newsletter.contactValue || newsletter.email || newsletter.phone || '',
          email: newsletter.email || (newsletter.contactType === 'email' ? newsletter.contactValue : ''),
          phone: newsletter.phone || (newsletter.contactType === 'phone' ? newsletter.contactValue : ''),
          status: newsletter.status || 'active',
          subscribedAt: newsletter.subscribedAt || new Date().toISOString(),
          welcomeMessageSent: newsletter.welcomeMessageSent || false
        })) : [])
        setVideos(Array.isArray(videosRes.data) ? videosRes.data : [])
        setNewsletterSettings(settingsRes.data || newsletterSettings)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        // Keep empty arrays as fallback
        setMarqueeItems([])
        setNewsCarousel([])
        setNewsletters([])
        setVideos([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper functions for contact actions
  const openEmailApp = (email, settings) => {
    if (!email) {
      alert("No email address available")
      return
    }
    const subject = encodeURIComponent("Welcome to Agricultural Community!")
    const body = encodeURIComponent(`${settings.welcomeMessage}\n\nWhatsApp Group: ${settings.whatsappGroupLink}`)
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`
    window.open(mailtoLink, '_blank')
  }

  const openWhatsApp = (phone, settings) => {
    if (!phone) {
      alert("No phone number available")
      return
    }
    const message = encodeURIComponent(`${settings.welcomeMessage}\n\nWhatsApp Group: ${settings.whatsappGroupLink}`)
    const cleanPhone = phone.replace(/[^\d]/g, '')
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${message}`
    window.open(whatsappLink, '_blank')
  }

  // MARQUEE FUNCTIONS
  const handleAddMarquee = () => {
    setCurrentMarqueeText("")
    setEditingMarqueeId(null)
    setShowMarqueeModal(true)
  }

  const handleEditMarquee = (marquee) => {
    setCurrentMarqueeText(marquee.text || "")
    setEditingMarqueeId(marquee._id || marquee.id)
    setShowMarqueeModal(true)
  }

  const handleSaveMarquee = async () => {
    try {
      setLoading(true)
      if (editingMarqueeId) {
        await axios.put(`${API_UPDATES_URL}/marquee/${editingMarqueeId}`, {
          text: currentMarqueeText
        })
      } else {
        await axios.post(`${API_UPDATES_URL}/marquee`, {
          text: currentMarqueeText
        })
      }

      const response = await axios.get(`${API_UPDATES_URL}/marquee`)
      setMarqueeItems(Array.isArray(response.data) ? response.data : [])
      setShowMarqueeModal(false)
    } catch (error) {
      console.error("Failed to save marquee:", error)
      alert("Failed to save marquee. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMarquee = async (id) => {
    if (window.confirm("Are you sure you want to delete this marquee?")) {
      try {
        setLoading(true)
        await axios.delete(`${API_UPDATES_URL}/marquee/${id}`)
        const response = await axios.get(`${API_UPDATES_URL}/marquee`)
        setMarqueeItems(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Failed to delete marquee:", error)
        alert("Failed to delete marquee. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleMarqueeStatus = async (id) => {
    try {
      setLoading(true)
      const marquee = marqueeItems.find(m => (m._id || m.id) === id)
      if (!marquee) return

      await axios.put(`${API_UPDATES_URL}/marquee/${id}`, {
        ...marquee,
        active: !marquee.active
      })

      const response = await axios.get(`${API_UPDATES_URL}/marquee`)
      setMarqueeItems(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Failed to toggle marquee status:", error)
      alert("Failed to update marquee status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // NEWS CAROUSEL FUNCTIONS
  const handleAddNews = () => {
    setCurrentNews(null)
    setShowNewsModal(true)
  }

  const handleEditNews = (news) => {
    setCurrentNews(news)
    setShowNewsModal(true)
  }

  const handleSaveNews = async (newsData) => {
    try {
      setLoading(true)
      const formData = new FormData()

      Object.keys(newsData).forEach(key => {
        if (key === 'stats' || key === 'features') {
          formData.append(key, JSON.stringify(newsData[key]))
        } else if (key === 'image' && newsData[key] instanceof File) {
          formData.append('image', newsData[key])
        } else if (key !== 'image' || (key === 'image' && typeof newsData[key] === 'string')) {
          formData.append(key, newsData[key])
        }
      })

      if (currentNews) {
        await axios.put(`${API_UPDATES_URL}/news/${currentNews._id || currentNews.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await axios.post(`${API_UPDATES_URL}/news`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      const response = await axios.get(`${API_UPDATES_URL}/news/all`)
      setNewsCarousel(Array.isArray(response.data) ? response.data : [])
      setShowNewsModal(false)
    } catch (error) {
      console.error("Failed to save news story:", error)
      alert("Failed to save news story. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNews = async (id) => {
    if (window.confirm("Are you sure you want to delete this news story?")) {
      try {
        setLoading(true)
        await axios.delete(`${API_UPDATES_URL}/news/${id}`)
        const response = await axios.get(`${API_UPDATES_URL}/news/all`)
        setNewsCarousel(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Failed to delete news story:", error)
        alert("Failed to delete news story. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  // NEWSLETTER FUNCTIONS
  const handleDeleteSubscription = async (id) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        setLoading(true)
        await axios.delete(`${API_UPDATES_URL}/newsletters/${id}`)
        const response = await axios.get(`${API_UPDATES_URL}/newsletters`)
        setNewsletters(Array.isArray(response.data) ? response.data.map(newsletter => ({
          _id: newsletter._id || newsletter.id || Math.random().toString(),
          contactType: newsletter.contactType || 'email',
          contactValue: newsletter.contactValue || newsletter.email || newsletter.phone || '',
          email: newsletter.email || (newsletter.contactType === 'email' ? newsletter.contactValue : ''),
          phone: newsletter.phone || (newsletter.contactType === 'phone' ? newsletter.contactValue : ''),
          status: newsletter.status || 'active',
          subscribedAt: newsletter.subscribedAt || new Date().toISOString(),
          welcomeMessageSent: newsletter.welcomeMessageSent || false
        })) : [])
      } catch (error) {
        console.error("Failed to delete subscription:", error)
        alert("Failed to delete subscription. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleSubscriptionStatus = async (id) => {
    try {
      setLoading(true)
      const newsletter = newsletters.find(n => (n._id || n.id) === id)
      if (!newsletter) return

      const newStatus = newsletter.status === 'active' ? 'inactive' : 'active'

      await axios.put(`${API_UPDATES_URL}/newsletters/${id}`, {
        status: newStatus
      })

      const response = await axios.get(`${API_UPDATES_URL}/newsletters`)
      setNewsletters(Array.isArray(response.data) ? response.data.map(newsletter => ({
        _id: newsletter._id || newsletter.id || Math.random().toString(),
        contactType: newsletter.contactType || 'email',
        contactValue: newsletter.contactValue || newsletter.email || newsletter.phone || '',
        email: newsletter.email || (newsletter.contactType === 'email' ? newsletter.contactValue : ''),
        phone: newsletter.phone || (newsletter.contactType === 'phone' ? newsletter.contactValue : ''),
        status: newsletter.status || 'active',
        subscribedAt: newsletter.subscribedAt || new Date().toISOString(),
        welcomeMessageSent: newsletter.welcomeMessageSent || false
      })) : [])
    } catch (error) {
      console.error("Failed to toggle subscription status:", error)
      alert("Failed to update subscription status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNewsletterSettings = async (settings) => {
    try {
      setLoading(true)
      await axios.put(`${API_UPDATES_URL}/newsletter-settings`, settings)
      const response = await axios.get(`${API_UPDATES_URL}/newsletter-settings`)
      setNewsletterSettings(response.data || settings)
      setShowNewsletterSettingsModal(false)
    } catch (error) {
      console.error("Failed to save newsletter settings:", error)
      alert("Failed to save newsletter settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // VIDEO FUNCTIONS
  const handleAddVideo = () => {
    setCurrentVideo(null)
    setShowVideoModal(true)
  }

  const handleEditVideo = (video) => {
    setCurrentVideo(video)
    setShowVideoModal(true)
  }

  const handleSaveVideo = async (videoData) => {
    try {
      setLoading(true)
      if (currentVideo) {
        await axios.put(`${API_UPDATES_URL}/videos/${currentVideo._id || currentVideo.id}`, videoData)
      } else {
        await axios.post(`${API_UPDATES_URL}/videos`, videoData)
      }

      const response = await axios.get(`${API_UPDATES_URL}/videos/all`)
      setVideos(Array.isArray(response.data) ? response.data : [])
      setShowVideoModal(false)
    } catch (error) {
      console.error("Failed to save video:", error)
      alert("Failed to save video. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVideo = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        setLoading(true)
        await axios.delete(`${API_UPDATES_URL}/videos/${id}`)
        const response = await axios.get(`${API_UPDATES_URL}/videos/all`)
        setVideos(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Failed to delete video:", error)
        alert("Failed to delete video. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  // SAFE FILTER FOR NEWSLETTERS - FIX FOR THE ERROR
  const filteredNewsletters = newsletters.filter(newsletter => {
    // Safety check to ensure newsletter and contactValue exist
    if (!newsletter || !newsletter.contactValue) {
      return false;
    }

    // Safely convert to lowercase and check if it includes search term
    try {
      const searchTermLower = (searchTerm || '').toLowerCase();
      const contactValueLower = (newsletter.contactValue || '').toLowerCase();
      return contactValueLower.includes(searchTermLower);
    } catch (error) {
      console.error("Error filtering newsletter:", error);
      return false;
    }
  });

  // Safe calculations for statistics
  const safeNewsletters = Array.isArray(newsletters) ? newsletters : [];
  const activeNewsletters = safeNewsletters.filter(n => n && n.status === 'active').length;
  const emailNewsletters = safeNewsletters.filter(n => n && n.contactType === 'email').length;
  const phoneNewsletters = safeNewsletters.filter(n => n && n.contactType === 'phone').length;

  if (loading) {
    return (
      <div className="admin-layout-container">
        <div className="admin-layout-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout-container">
      {/* Header */}
      <div className="admin-layout-header">
        <div className="admin-layout-header-content">
          <div className="admin-layout-header-left">
            <div className="header-left">
              <div className="header-icon">
                <FaBullhorn />
              </div>
              </div>
              <div>
                <h1>Updates Management</h1>
                <p>Manage marquee titles, news carousel, newsletters and videos</p>
              </div>
            </div>
            <div className="admin-layout-header-stats">
              <div className="admin-layout-stat-card">
                <span className="admin-layout-stat-number">{marqueeItems.length}</span>
                <span className="admin-layout-stat-label">Marquee Items</span>
              </div>
              <div className="admin-layout-stat-card">
                <span className="admin-layout-stat-number">{newsCarousel.length}</span>
                <span className="admin-layout-stat-label">News Stories</span>
              </div>
              <div className="admin-layout-stat-card">
                <span className="admin-layout-stat-number">{safeNewsletters.length}</span>
                <span className="admin-layout-stat-label">Subscribers</span>
              </div>
              <div className="admin-layout-stat-card">
                <span className="admin-layout-stat-number">{videos.length}</span>
                <span className="admin-layout-stat-label">Videos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-layout-tab-navigation">
          <div className="admin-layout-tab-container">
            <button
              className={`admin-layout-tab-btn ${activeTab === "marquee" ? "admin-layout-tab-btn-active" : ""}`}
              onClick={() => setActiveTab("marquee")}
            >
              <FiImage />
              <span>Marquee Titles</span>
              <div className="admin-layout-tab-badge">{marqueeItems.length}</div>
            </button>
            <button
              className={`admin-layout-tab-btn ${activeTab === "news" ? "admin-layout-tab-btn-active" : ""}`}
              onClick={() => setActiveTab("news")}
            >
              <FiTrendingUp />
              <span>News Carousel</span>
              <div className="admin-layout-tab-badge">{newsCarousel.length}</div>
            </button>
            <button
              className={`admin-layout-tab-btn ${activeTab === "newsletter" ? "admin-layout-tab-btn-active" : ""}`}
              onClick={() => setActiveTab("newsletter")}
            >
              <FiMail />
              <span>Newsletter</span>
              <div className="admin-layout-tab-badge">{safeNewsletters.length}</div>
            </button>
            <button
              className={`admin-layout-tab-btn ${activeTab === "videos" ? "admin-layout-tab-btn-active" : ""}`}
              onClick={() => setActiveTab("videos")}
            >
              <FiVideo />
              <span>Videos</span>
              <div className="admin-layout-tab-badge">{videos.length}</div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="admin-layout-content-area">
          {activeTab === "marquee" && (
            <div className="admin-layout-marquee-section">
              <div className="admin-layout-section-header">
                <div className="admin-layout-section-title">
                  <h2>Marquee Titles</h2>
                  <p className="admin-layout-section-subtitle">Manage scrolling text at the top of your page</p>
                </div>
                <button className="admin-layout-add-btn" onClick={handleAddMarquee} disabled={loading}>
                  <FiPlus /> Add Marquee
                </button>
              </div>

              {marqueeItems.length === 0 ? (
                <div className="admin-layout-empty-state">
                  <div className="admin-layout-empty-icon">
                    <FiImage />
                  </div>
                  <h3>No marquee items yet</h3>
                  <p>Add your first marquee title to display at the top of your page</p>
                  <button className="admin-layout-add-btn" onClick={handleAddMarquee} disabled={loading}>
                    <FiPlus /> Add Marquee
                  </button>
                </div>
              ) : (
                <div className="admin-layout-items-container admin-layout-grid-view">
                  {marqueeItems.map((marquee) => (
                    <div key={marquee._id || marquee.id} className="admin-layout-item-card">
                      <div className="admin-layout-item-content">
                        <div className="admin-layout-content-meta">
                          <span className={`admin-layout-status-badge ${marquee.active ? "admin-layout-status-badge-active" : ""}`}>
                            {marquee.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <h3>{marquee.text || "No text"}</h3>
                        <div className="admin-layout-card-controls">
                          <button
                            className="admin-layout-control-btn"
                            onClick={() => toggleMarqueeStatus(marquee._id || marquee.id)}
                            disabled={loading}
                          >
                            {marquee.active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            className="admin-layout-control-btn"
                            onClick={() => handleEditMarquee(marquee)}
                            disabled={loading}
                          >
                            <FiEdit /> Edit
                          </button>
                          <button
                            className="admin-layout-control-btn admin-layout-control-btn-delete"
                            onClick={() => handleDeleteMarquee(marquee._id || marquee.id)}
                            disabled={loading}
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "news" && (
            <div className="admin-layout-news-section">
              <div className="admin-layout-section-header">
                <div className="admin-layout-section-title">
                  <h2>News Carousel Management</h2>
                  <p className="admin-layout-section-subtitle">Manage featured news stories and innovations</p>
                </div>
                <button className="admin-layout-add-btn" onClick={handleAddNews} disabled={loading}>
                  <FiPlus /> Add News Story
                </button>
              </div>

              {newsCarousel.length === 0 ? (
                <div className="admin-layout-empty-state">
                  <div className="admin-layout-empty-icon">
                    <FiTrendingUp />
                  </div>
                  <h3>No news stories yet</h3>
                  <p>Add your first news story to showcase in the carousel</p>
                  <button className="admin-layout-add-btn" onClick={handleAddNews} disabled={loading}>
                    <FiPlus /> Add News Story
                  </button>
                </div>
              ) : (
                <div className="admin-layout-news-grid">
                  {newsCarousel.map((news) => (
                    <div key={news._id || news.id} className="admin-layout-news-card">
                      <div className="admin-layout-news-image">
                        <img
                          src={news.image && news.image.startsWith('http') ? news.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${news.image || ''}`}
                          alt={news.title || "News image"}
                        />
                        <div className="admin-layout-news-category">{news.category || "Uncategorized"}</div>
                      </div>
                      <div className="admin-layout-news-content">
                        <h3>{news.title || "No title"}</h3>
                        <p>{news.excerpt || "No description"}</p>
                        <div className="admin-layout-news-meta">
                          <span><FiHeart /> {news.likes || 0} likes</span>
                          <span>📅 {news.uploadDate ? new Date(news.uploadDate).toLocaleDateString() : "No date"}</span>
                        </div>
                        <div className="admin-layout-card-controls">
                          <button
                            className="admin-layout-control-btn"
                            onClick={() => handleEditNews(news)}
                            disabled={loading}
                          >
                            <FiEdit /> Edit
                          </button>
                          <button
                            className="admin-layout-control-btn admin-layout-control-btn-delete"
                            onClick={() => handleDeleteNews(news._id || news.id)}
                            disabled={loading}
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "newsletter" && (
            <div className="admin-layout-newsletter-section">
              <div className="admin-layout-section-header">
                <div className="admin-layout-section-title">
                  <h2>Newsletter Subscriptions</h2>
                  <p className="admin-layout-section-subtitle">Manage newsletter subscribers and send messages</p>
                </div>
                <button
                  className="admin-layout-add-btn"
                  onClick={() => setShowNewsletterSettingsModal(true)}
                  disabled={loading}
                >
                  <FiEdit /> Settings
                </button>
              </div>

              {/* Search Box */}
              <div className="admin-layout-newsletter-controls">
                <div className="admin-layout-search-box">
                  <FiSearch className="admin-layout-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="admin-layout-newsletter-stats">
                  <div className="admin-layout-stat-mini">
                    <FiUsers />
                    <span>Total: {safeNewsletters.length}</span>
                  </div>
                  <div className="admin-layout-stat-mini">
                    <FiMail />
                    <span>Active: {activeNewsletters}</span>
                  </div>
                  <div className="admin-layout-stat-mini">
                    <FiMail />
                    <span>Emails: {emailNewsletters}</span>
                  </div>
                  <div className="admin-layout-stat-mini">
                    <FiUsers />
                    <span>Phones: {phoneNewsletters}</span>
                  </div>
                </div>
              </div>

              {filteredNewsletters.length === 0 ? (
                <div className="admin-layout-empty-state">
                  <div className="admin-layout-empty-icon">
                    <FiMail />
                  </div>
                  <h3>No newsletter subscriptions yet</h3>
                  <p>Subscribers will appear here when they sign up through the newsletter form</p>
                </div>
              ) : (
                <div className="admin-layout-newsletter-grid">
                  {filteredNewsletters.map((newsletter) => (
                    <div key={newsletter._id || newsletter.id} className="admin-layout-newsletter-card">
                      <div className="admin-layout-newsletter-content">
                        <div className="admin-layout-content-meta">
                          <span className={`admin-layout-status-badge ${newsletter.status === 'active' ? "admin-layout-status-badge-active" : ""}`}>
                            {newsletter.status === 'active' ? "Active" : "Inactive"}
                          </span>
                          <span className="admin-layout-subscription-date">
                            📅 {newsletter.subscribedAt ? new Date(newsletter.subscribedAt).toLocaleDateString() : "No date"}
                          </span>
                          <span className="admin-layout-contact-type">
                            {newsletter.contactType === 'email' ? '📧 Email' : '📱 Phone'}
                          </span>
                        </div>
                        <h3>{newsletter.contactValue || "No contact"}</h3>
                        <p>Subscribed: {newsletter.subscribedAt ? new Date(newsletter.subscribedAt).toLocaleString() : "Unknown"}</p>

                        {/* Contact Action Buttons */}
                        <div className="admin-layout-contact-actions">
                          {newsletter.contactType === 'email' ? (
                            <button
                              className="admin-layout-contact-btn admin-layout-email-btn"
                              onClick={() => openEmailApp(newsletter.contactValue, newsletterSettings)}
                              title="Send Email"
                              disabled={loading}
                            >
                              <FiMail />
                              <span>Send Email</span>
                            </button>
                          ) : (
                            <button
                              className="admin-layout-contact-btn admin-layout-whatsapp-btn"
                              onClick={() => openWhatsApp(newsletter.contactValue, newsletterSettings)}
                              title="Send WhatsApp"
                              disabled={loading}
                            >
                              <FiUsers />
                              <span>Send WhatsApp</span>
                            </button>
                          )}
                        </div>

                        <div className="admin-layout-card-controls">
                          <button
                            className="admin-layout-control-btn"
                            onClick={() => toggleSubscriptionStatus(newsletter._id || newsletter.id)}
                            disabled={loading}
                          >
                            {newsletter.status === 'active' ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            className="admin-layout-control-btn admin-layout-control-btn-delete"
                            onClick={() => handleDeleteSubscription(newsletter._id || newsletter.id)}
                            disabled={loading}
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "videos" && (
            <div className="admin-layout-videos-section">
              <div className="admin-layout-section-header">
                <div className="admin-layout-section-title">
                  <h2>Agricultural Tutorial Videos</h2>
                  <p className="admin-layout-section-subtitle">Manage educational farming videos</p>
                </div>
                <button className="admin-layout-add-btn" onClick={handleAddVideo} disabled={loading}>
                  <FiPlus /> Add Video
                </button>
              </div>

              {videos.length === 0 ? (
                <div className="admin-layout-empty-state">
                  <div className="admin-layout-empty-icon">
                    <FiVideo />
                  </div>
                  <h3>No videos yet</h3>
                  <p>Add your first agricultural tutorial video</p>
                  <button className="admin-layout-add-btn" onClick={handleAddVideo} disabled={loading}>
                    <FiPlus /> Add Video
                  </button>
                </div>
              ) : (
                <div className="admin-layout-videos-grid">
                  {videos.map(video => (
                    <div key={video._id || video.id} className="admin-layout-video-card">
                      <div className="admin-layout-video-thumbnail">
                        <img src={video.thumbnail || ""} alt={video.title || "Video"} />
                        <span className="admin-layout-video-duration">{video.duration || "0:00"}</span>
                        <div className="admin-layout-play-icon">
                          <FiPlay />
                        </div>
                      </div>
                      <div className="admin-layout-video-content">
                        <h3>{video.title || "No title"}</h3>
                        <p>{video.description || "No description"}</p>
                        <div className="admin-layout-video-meta">
                          <span className="admin-layout-video-category">{video.category || "Uncategorized"}</span>
                        </div>
                        <div className="admin-layout-card-controls">
                          <button
                            className="admin-layout-control-btn"
                            onClick={() => handleEditVideo(video)}
                            disabled={loading}
                          >
                            <FiEdit /> Edit
                          </button>
                          <button
                            className="admin-layout-control-btn admin-layout-control-btn-delete"
                            onClick={() => handleDeleteVideo(video._id || video.id)}
                            disabled={loading}
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Marquee Modal */}
        {showMarqueeModal && (
          <div className="admin-layout-modal-overlay">
            <div className="admin-layout-modal-content">
              <div className="admin-layout-modal-header">
                <h3>{editingMarqueeId ? "Edit Marquee" : "Add Marquee"}</h3>
                <button className="admin-layout-close-btn" onClick={() => setShowMarqueeModal(false)}>×</button>
              </div>
              <div className="admin-layout-modal-body">
                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>Marquee Text</label>
                  <input
                    type="text"
                    value={currentMarqueeText}
                    onChange={(e) => setCurrentMarqueeText(e.target.value)}
                    placeholder="Enter marquee text..."
                  />
                </div>
              </div>
              <div className="admin-layout-modal-footer">
                <button className="admin-layout-cancel-btn" onClick={() => setShowMarqueeModal(false)}>
                  Cancel
                </button>
                <button className="admin-layout-save-btn" onClick={handleSaveMarquee} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Settings Modal */}
        {showNewsletterSettingsModal && (
          <NewsletterSettingsModal
            settings={newsletterSettings}
            onSave={handleSaveNewsletterSettings}
            onClose={() => setShowNewsletterSettingsModal(false)}
            loading={loading}
          />
        )}

        {/* News Modal */}
        {showNewsModal && (
          <NewsModal
            news={currentNews}
            onSave={handleSaveNews}
            onClose={() => setShowNewsModal(false)}
            loading={loading}
          />
        )}

        {/* Video Modal */}
        {showVideoModal && (
          <VideoModal
            video={currentVideo}
            onSave={handleSaveVideo}
            onClose={() => setShowVideoModal(false)}
            loading={loading}
          />
        )}
      </div>
      )
}

      // Newsletter Settings Modal Component
      const NewsletterSettingsModal = ({settings, onSave, onClose, loading}) => {
  const [formData, setFormData] = useState({
        welcomeMessage: "",
      whatsappGroupLink: "",
      isActive: true
  })

  useEffect(() => {
    if (settings) {
        setFormData({
          welcomeMessage: settings.welcomeMessage || "",
          whatsappGroupLink: settings.whatsappGroupLink || "",
          isActive: settings.isActive !== undefined ? settings.isActive : true
        })
      }
  }, [settings])

  const handleSubmit = (e) => {
        e.preventDefault()
    onSave(formData)
  }

      return (
      <div className="admin-layout-modal-overlay">
        <div className="admin-layout-modal-content admin-layout-modal-large">
          <div className="admin-layout-modal-header">
            <h3>Newsletter Settings</h3>
            <button className="admin-layout-close-btn" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="admin-layout-modal-body">
              <div className="admin-layout-form-grid">
                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>Welcome Message</label>
                  <textarea
                    value={formData.welcomeMessage}
                    onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                    placeholder="Enter the welcome message that will be sent to new subscribers..."
                    rows="6"
                    required
                  />
                  <small>This message will be sent when you click the contact buttons</small>
                </div>

                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>WhatsApp Group Link</label>
                  <input
                    type="url"
                    value={formData.whatsappGroupLink}
                    onChange={(e) => setFormData({ ...formData, whatsappGroupLink: e.target.value })}
                    placeholder="https://chat.whatsapp.com/your-group-link"
                    required
                  />
                  <small>Enter your WhatsApp group invitation link</small>
                </div>

                <div className="admin-layout-form-group">
                  <label className="admin-layout-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span className="admin-layout-checkbox-custom"></span>
                    Newsletter System Active
                  </label>
                  <small>Enable/disable newsletter subscription functionality</small>
                </div>
              </div>
            </div>
            <div className="admin-layout-modal-footer">
              <button type="button" className="admin-layout-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="admin-layout-save-btn" disabled={loading}>
                {loading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
      )
}

      // News Modal Component with Validation
      const NewsModal = ({news, onSave, onClose, loading}) => {
  const [formData, setFormData] = useState({
        title: "",
      excerpt: "",
      image: "",
      category: "",
      icon: "🚜",
      customIcon: "",
      stats: [{value: "", label: "" }, {value: "", label: "" }],
      features: [{label: "", icon: "💧" }, {label: "", icon: "🔬" }]
  })
      const [imageFile, setImageFile] = useState(null)
      const [imagePreview, setImagePreview] = useState("")
      const [isCustomIcon, setIsCustomIcon] = useState(false)
      const [titleWordCount, setTitleWordCount] = useState(0)
      const [excerptWordCount, setExcerptWordCount] = useState(0)
      const [validationErrors, setValidationErrors] = useState({ })

      const predefinedIcons = [
      {value: "🚜", label: "Tractor" },
      {value: "🌱", label: "Seedling" },
      {value: "🌾", label: "Wheat" },
      {value: "🌿", label: "Herb" },
      {value: "💧", label: "Water" },
      {value: "🔬", label: "Microscope" },
      {value: "📊", label: "Chart" },
      {value: "🌍", label: "Earth" },
      {value: "☀️", label: "Sun" },
      {value: "🍃", label: "Leaf" }
      ]

      const featureIcons = [
      {value: "💧", label: "Water" },
      {value: "🔬", label: "Microscope" },
      {value: "🌱", label: "Plant" },
      {value: "⚡", label: "Energy" },
      {value: "🛡️", label: "Protection" },
      {value: "📈", label: "Growth" },
      {value: "♻️", label: "Recycle" },
      {value: "🌍", label: "Eco" },
      {value: "✅", label: "Verified" },
      {value: "💰", label: "Money" }
      ]

  const countWords = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }

  const validateField = (field, value) => {
    const errors = {...validationErrors}

      if (field === 'title') {
      const wordCount = countWords(value)
      setTitleWordCount(wordCount)
      if (wordCount > 10) {
        errors.title = `Title cannot exceed 10 words (currently ${wordCount} words)`
      } else {
        delete errors.title
      }
    }

      if (field === 'excerpt') {
      const wordCount = countWords(value)
      setExcerptWordCount(wordCount)
      if (wordCount > 40) {
        errors.excerpt = `Description cannot exceed 40 words (currently ${wordCount} words)`
      } else {
        delete errors.excerpt
      }
    }

      setValidationErrors(errors)
  }

  useEffect(() => {
    if (news) {
      const isCustom = !predefinedIcons.some(option => option.value === news.icon)
      setFormData({
        title: news.title || "",
      excerpt: news.excerpt || "",
      image: news.image || "",
      category: news.category || "",
      icon: isCustom ? "other" : news.icon || "🚜",
      customIcon: isCustom ? news.icon : "",
      stats: news.stats || [{value: "", label: "" }, {value: "", label: "" }],
      features: news.features || [{label: "", icon: "💧" }, {label: "", icon: "🔬" }]
      })

      if (news.image) {
        const fullImageUrl = news.image.startsWith('http') ? news.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${news.image}`
      setImagePreview(fullImageUrl)
      }

      setIsCustomIcon(isCustom)
      setTitleWordCount(countWords(news.title || ""))
      setExcerptWordCount(countWords(news.excerpt || ""))
    }
  }, [news])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
      if (file) {
        setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      setFormData({...formData, image: file })
    }
  }

  const handleIconChange = (value) => {
    if (value === "other") {
        setIsCustomIcon(true)
      setFormData({...formData, icon: "other", customIcon: "" })
    } else {
        setIsCustomIcon(false)
      setFormData({...formData, icon: value, customIcon: "" })
    }
  }

  const handleInputChange = (field, value, index = null, subField = null) => {
    if (field === 'title' || field === 'excerpt') {
        validateField(field, value)
      }

    setFormData(prev => {
      if (index !== null && subField) {
        const updatedArray = [...prev[field]]
      updatedArray[index][subField] = value
      return {...prev, [field]: updatedArray }
      } else {
        return {...prev, [field]: value }
      }
    })
  }

  const handleSubmit = (e) => {
        e.preventDefault()
    
    const titleWords = countWords(formData.title)
      const excerptWords = countWords(formData.excerpt)
    
    if (titleWords > 10) {
        alert(`Title cannot exceed 10 words. Currently ${titleWords} words.`)
      return
    }
    
    if (excerptWords > 40) {
        alert(`Description cannot exceed 40 words. Currently ${excerptWords} words.`)
      return
    }

      const finalIcon = isCustomIcon ? formData.customIcon : formData.icon
      const finalData = {...formData, icon: finalIcon }

      if (imageFile) {
        finalData.image = imageFile
      } else if (news && news.image && !formData.image) {
        finalData.image = news.image
      }

      onSave(finalData)
  }

      return (
      <div className="admin-layout-modal-overlay">
        <div className="admin-layout-modal-content admin-layout-modal-large">
          <div className="admin-layout-modal-header">
            <h3>{news ? "Edit News Story" : "Add News Story"}</h3>
            <button className="admin-layout-close-btn" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="admin-layout-modal-body">
              <div className="admin-layout-form-grid">
                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>
                    Title
                    <span className={`admin-layout-word-counter ${titleWordCount > 10 ? 'error' : ''}`}>
                      ({titleWordCount}/10 words)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter news title..."
                    required
                    className={validationErrors.title ? 'error' : ''}
                  />
                  {validationErrors.title && (
                    <div className="admin-layout-error-message">{validationErrors.title}</div>
                  )}
                </div>

                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>
                    Description/Excerpt
                    <span className={`admin-layout-word-counter ${excerptWordCount > 40 ? 'error' : ''}`}>
                      ({excerptWordCount}/40 words)
                    </span>
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    placeholder="Enter news description..."
                    rows="3"
                    required
                    className={validationErrors.excerpt ? 'error' : ''}
                  />
                  {validationErrors.excerpt && (
                    <div className="admin-layout-error-message">{validationErrors.excerpt}</div>
                  )}
                </div>

                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>Upload Image</label>
                  <div className="admin-layout-image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="admin-layout-file-input"
                      id="news-image"
                    />
                    <label htmlFor="news-image" className="admin-layout-file-label">
                      <FiUpload /> Choose Image
                    </label>
                    {imagePreview && (
                      <div className="admin-layout-image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-layout-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="e.g., Technology, Sustainability"
                    required
                  />
                </div>

                <div className="admin-layout-form-group">
                  <label>Icon</label>
                  <select
                    value={isCustomIcon ? "other" : formData.icon}
                    onChange={(e) => handleIconChange(e.target.value)}
                  >
                    {predefinedIcons.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.value} {option.label}
                      </option>
                    ))}
                    <option value="other">🎯 Other (Custom Emoji)</option>
                  </select>
                </div>

                {isCustomIcon && (
                  <div className="admin-layout-form-group">
                    <label>Custom Icon (Emoji)</label>
                    <input
                      type="text"
                      value={formData.customIcon}
                      onChange={(e) => handleInputChange("customIcon", e.target.value)}
                      placeholder="Enter emoji like 🌻, 🚀, etc."
                      maxLength="2"
                      required
                    />
                    <small>Enter any emoji from your keyboard</small>
                  </div>
                )}

                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>Statistics (2 items)</label>
                  {formData.stats.map((stat, index) => (
                    <div key={index} className="admin-layout-stat-inputs">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => handleInputChange("stats", e.target.value, index, "value")}
                        placeholder="Value (e.g., 40%)"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleInputChange("stats", e.target.value, index, "label")}
                        placeholder="Label (e.g., Yield Increase)"
                      />
                    </div>
                  ))}
                </div>

                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>Features (2 items)</label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="admin-layout-feature-inputs">
                      <input
                        type="text"
                        value={feature.label}
                        onChange={(e) => handleInputChange("features", e.target.value, index, "label")}
                        placeholder="Feature label"
                      />
                      <select
                        value={feature.icon}
                        onChange={(e) => handleInputChange("features", e.target.value, index, "icon")}
                      >
                        {featureIcons.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.value} {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-layout-modal-footer">
              <button type="button" className="admin-layout-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="admin-layout-save-btn"
                disabled={Object.keys(validationErrors).length > 0 || loading}
              >
                {loading ? "Saving..." : "Save Story"}
              </button>
            </div>
          </form>
        </div>
      </div>
      )
}

      // Video Modal Component with YouTube URL Support
      const VideoModal = ({video, onSave, onClose, loading}) => {
  const [formData, setFormData] = useState({
        title: "",
      description: "",
      youtubeUrl: "",
      category: "",
      duration: ""
  })

  useEffect(() => {
    if (video) {
        setFormData({
          title: video.title || "",
          description: video.description || "",
          youtubeUrl: video.youtubeUrl || "",
          category: video.category || "",
          duration: video.duration || ""
        })
      }
  }, [video])

  const handleSubmit = (e) => {
        e.preventDefault()
    onSave(formData)
  }

      return (
      <div className="admin-layout-modal-overlay">
        <div className="admin-layout-modal-content">
          <div className="admin-layout-modal-header">
            <h3>{video ? "Edit Video" : "Add Video"}</h3>
            <button className="admin-layout-close-btn" onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="admin-layout-modal-body">
              <div className="admin-layout-form-grid">
                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-layout-form-group admin-layout-form-group-full-width">
                  <label>YouTube URL</label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <small>Enter the complete YouTube video URL</small>
                </div>
                <div className="admin-layout-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-layout-form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 12:45"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="admin-layout-modal-footer">
              <button type="button" className="admin-layout-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="admin-layout-save-btn" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
      )
}

      export default Updates
