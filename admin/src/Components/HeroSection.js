"use client"

import { useState, useEffect } from "react"
import { FiPlus, FiEdit, FiTrash2, FiImage, FiGlobe, FiSave, FiX, FiUpload, FiToggleLeft, FiToggleRight, FiAlignLeft, FiAlignCenter, FiAlignRight, FiType, FiDroplet } from "react-icons/fi"
import axios from 'axios'
import "./HeroSection.css"

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

const HeroSection = () => {
  const [selectedPage, setSelectedPage] = useState("About us")
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [banners, setBanners] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [showColorPicker, setShowColorPicker] = useState({
    title: false,
    description: false
  })
  
  const pages = ["About us", "Shop", "Consultancy", "Contact us", "Gallery"]

  const [heroForm, setHeroForm] = useState({
    title: "",
    description: "",
    image: null,
    isActive: true,
    order: 0,
    // New styling options
    titleColors: [], // Array of {text: string, color: string}
    descriptionColor: "#ffffff",
    alignment: "center", // "left", "center", "right"
    titleStyle: {
      fontSize: "3.5rem",
      fontWeight: "600",
      textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
    },
    descriptionStyle: {
      fontSize: "1.2rem",
      fontWeight: "300",
      textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
    },
    useGradient: false,
    gradientColors: ["#ffffff", "#f0f0f0"],
    gradientDirection: "90deg"
  })

  // Predefined color options
  const colorOptions = [
    "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080",
    "#008000", "#800000", "#808080", "#c0c0c0", "#ffc0cb"
  ]

  // Load banners on component mount
  useEffect(() => {
    loadAllBanners()
  }, [])

  const loadAllBanners = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/banners`)
      const allBanners = response.data
      
      // Group banners by page
      const groupedBanners = {}
      pages.forEach(page => {
        groupedBanners[page] = allBanners.filter(banner => banner.pageName === page)
      })
      
      setBanners(groupedBanners)
    } catch (error) {
      console.error('Error loading banners:', error)
      alert('Failed to load banners. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const openHeroModal = (slide = null) => {
    setEditingItem(slide)
    if (slide) {
      setHeroForm({
        title: slide.title || "",
        description: slide.description || "",
        image: null,
        isActive: slide.isActive,
        order: slide.order,
        titleColors: slide.titleColors || [{text: slide.title, color: "#ffffff"}],
        descriptionColor: slide.descriptionColor || "#ffffff",
        alignment: slide.alignment || "center",
        titleStyle: slide.titleStyle || {
          fontSize: "3.5rem",
          fontWeight: "600",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
        },
        descriptionStyle: slide.descriptionStyle || {
          fontSize: "1.2rem",
          fontWeight: "300",
          textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
        },
        useGradient: slide.useGradient || false,
        gradientColors: slide.gradientColors || ["#ffffff", "#f0f0f0"],
        gradientDirection: slide.gradientDirection || "90deg"
      })
      setImagePreview(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${slide.image}`)
    } else {
      setHeroForm({
        title: "",
        description: "",
        image: null,
        isActive: true,
        order: getCurrentHeroSlides().length,
        titleColors: [],
        descriptionColor: "#ffffff",
        alignment: "center",
        titleStyle: {
          fontSize: "3.5rem",
          fontWeight: "600",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
        },
        descriptionStyle: {
          fontSize: "1.2rem",
          fontWeight: "300",
          textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
        },
        useGradient: false,
        gradientColors: ["#ffffff", "#f0f0f0"],
        gradientDirection: "90deg"
      })
      setImagePreview(null)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setHeroForm({
      title: "",
      description: "",
      image: null,
      isActive: true,
      order: 0,
      titleColors: [],
      descriptionColor: "#ffffff",
      alignment: "center",
      titleStyle: {
        fontSize: "3.5rem",
        fontWeight: "600",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
      },
      descriptionStyle: {
        fontSize: "1.2rem",
        fontWeight: "300",
        textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
      },
      useGradient: false,
      gradientColors: ["#ffffff", "#f0f0f0"],
      gradientDirection: "90deg"
    })
    setImagePreview(null)
    setShowColorPicker({title: false, description: false})
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      setHeroForm(prev => ({ ...prev, image: file }))
      
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  // Handle title color changes
  const handleTitleChange = (value) => {
    setHeroForm(prev => ({
      ...prev,
      title: value,
      titleColors: value ? [{text: value, color: "#ffffff"}] : []
    }))
  }

  // Split title into words for individual coloring
  const splitTitleIntoWords = () => {
    if (!heroForm.title) return []
    const words = heroForm.title.split(' ')
    return words.map((word, index) => ({
      text: word,
      color: heroForm.titleColors[index]?.color || "#ffffff",
      index
    }))
  }

  // Update individual word color
  const updateWordColor = (wordIndex, color) => {
    const words = heroForm.title.split(' ')
    const newTitleColors = words.map((word, index) => ({
      text: word,
      color: index === wordIndex ? color : (heroForm.titleColors[index]?.color || "#ffffff")
    }))
    setHeroForm(prev => ({ ...prev, titleColors: newTitleColors }))
  }

  const saveHeroSlide = async () => {
    try {
      if (!heroForm.title.trim() || !heroForm.description.trim()) {
        alert('Please fill in all required fields')
        return
      }

      if (!editingItem && !heroForm.image) {
        alert('Please select an image')
        return
      }

      setLoading(true)

      const formData = new FormData()
      formData.append('title', heroForm.title)
      formData.append('description', heroForm.description)
      formData.append('pageName', selectedPage)
      formData.append('isActive', heroForm.isActive)
      formData.append('order', heroForm.order)
      
      // Add styling data
      formData.append('titleColors', JSON.stringify(heroForm.titleColors))
      formData.append('descriptionColor', heroForm.descriptionColor)
      formData.append('alignment', heroForm.alignment)
      formData.append('titleStyle', JSON.stringify(heroForm.titleStyle))
      formData.append('descriptionStyle', JSON.stringify(heroForm.descriptionStyle))
      formData.append('useGradient', heroForm.useGradient)
      formData.append('gradientColors', JSON.stringify(heroForm.gradientColors))
      formData.append('gradientDirection', heroForm.gradientDirection)
      
      if (heroForm.image) {
        formData.append('image', heroForm.image)
      }

      if (editingItem) {
        await axios.put(`${API_BASE_URL}/banners/${editingItem._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        await axios.post(`${API_BASE_URL}/banners`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      await loadAllBanners()
      closeModal()
    } catch (error) {
      console.error('Error saving banner:', error)
      alert(`Failed to save banner: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteHeroSlide = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return
    }

    try {
      setLoading(true)
      await axios.delete(`${API_BASE_URL}/banners/${id}`)
      await loadAllBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert(`Failed to delete banner: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleBannerStatus = async (id) => {
    try {
      setLoading(true)
      await axios.put(`${API_BASE_URL}/banners/${id}/toggle`)
      await loadAllBanners()
    } catch (error) {
      console.error('Error toggling banner status:', error)
      alert(`Failed to toggle banner status: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentHeroSlides = () => banners[selectedPage] || []

  const getServerImageUrl = (imagePath) => {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imagePath}`
  }

  const getTotalSlides = (page) => {
    const adminBanners = banners[page]?.length || 0
    return adminBanners > 0 ? adminBanners + 1 : 1 // +1 for static banner if admin banners exist
  }

  return (
    <div className="hero-management">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}

      <div className="page-selector">
        <div className="page-selector-header">
          <div className="selector-title">
            <FiGlobe />
            <h3>Select Page to Manage Hero Banners</h3>
          </div>
          <div className="current-page-stats">
            <span className="page-stat">
              {getCurrentHeroSlides().length} hero slides for {selectedPage}
            </span>
          </div>
        </div>
        
        <div className="page-cards">
          {pages.map((page) => (
            <div
              key={page}
              className={`page-card ${selectedPage === page ? "active" : ""}`}
              onClick={() => setSelectedPage(page)}
            >
              <div className="page-card-header">
                <h4>{page}</h4>
                <div className="page-status">
                  {(banners[page]?.length || 0) > 0 ? (
                    <span className="status-dot active" title="Carousel Mode"></span>
                  ) : (
                    <span className="status-dot inactive" title="Static Banner Mode"></span>
                  )}
                </div>
              </div>
              <div className="page-card-stats">
                <div className="stat-item">
                  <span className="stat-value">{getTotalSlides(page)}</span>
                  <span className="stat-name">Total Slides</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">
          <h2>Hero Section Management - {selectedPage}</h2>
          <p className="section-subtitle">
            {getCurrentHeroSlides().length > 0 ? 
              `Managing carousel with ${getCurrentHeroSlides().length + 1} slides (1 static + ${getCurrentHeroSlides().length} admin)` :
              `Static banner mode - add banners to enable carousel`
            }
          </p>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={() => openHeroModal()}>
            <FiPlus /> Add New Banner
          </button>
        </div>
      </div>

      {getCurrentHeroSlides().length > 0 ? (
        <div className="items-container grid-view">
          {getCurrentHeroSlides().map((slide, index) => (
            <div key={slide._id} className="item-card hero-card">
              <div className="item-image">
                <img 
                  src={getServerImageUrl(slide.image)} 
                  alt={slide.title}
                  onError={(e) => {
                    e.target.src = '/placeholder.svg'
                  }}
                />
                <div className="image-actions">
                  <button className="action-btn edit-action" onClick={() => openHeroModal(slide)}>
                    <FiEdit />
                  </button>
                  <button 
                    className="action-btn toggle-action" 
                    onClick={() => toggleBannerStatus(slide._id)}
                    title={slide.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {slide.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                  <button className="action-btn delete-action" onClick={() => deleteHeroSlide(slide._id)}>
                    <FiTrash2 />
                  </button>
                </div>
                <div className="slide-number">#{index + 2}</div>
              </div>
              <div className="item-content">
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
                <div className="content-meta">
                  <span className="alignment-badge">{slide.alignment || 'center'} aligned</span>
                  <span className={`status-badge ${slide.isActive ? 'active' : 'inactive'}`}>
                    {slide.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <FiImage />
          </div>
          <h3>Static Banner Mode for {selectedPage}</h3>
          <p>Currently showing the static {selectedPage.toLowerCase()} banner. Add banners to enable carousel mode with smooth transitions.</p>
          <div className="mode-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">🎠</span>
              <span>Auto-rotating carousel</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✨</span>
              <span>Smooth animations</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📱</span>
              <span>Touch/swipe support</span>
            </div>
          </div>
          <button className="add-btn" onClick={() => openHeroModal()}>
            <FiPlus /> Create First Banner
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content enhanced-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingItem ? "Edit" : "Add New"} Hero Banner - {selectedPage}
              </h3>
              <button className="close-btn" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                {/* Basic Fields */}
                <div className="form-group full-width">
                  <label>Banner Title *</label>
                  <input
                    type="text"
                    value={heroForm.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter banner title"
                    maxLength={200}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Banner Description *</label>
                  <textarea
                    value={heroForm.description}
                    onChange={(e) => setHeroForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter banner description"
                    rows="3"
                    maxLength={500}
                  />
                </div>

                {/* Image Upload */}
                <div className="form-group full-width">
                  <label>Banner Image * (Max 5MB)</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                      id="banner-image"
                    />
                    <label htmlFor="banner-image" className="file-label">
                      <FiUpload />
                      {heroForm.image ? heroForm.image.name : 'Choose image file'}
                    </label>
                  </div>
                  
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>

                {/* Content Alignment */}
                <div className="form-group full-width">
                  <label><FiType /> Content Alignment</label>
                  <div className="alignment-controls">
                    <button
                      type="button"
                      className={`alignment-btn ${heroForm.alignment === 'left' ? 'active' : ''}`}
                      onClick={() => setHeroForm(prev => ({ ...prev, alignment: 'left' }))}
                    >
                      <FiAlignLeft /> Left
                    </button>
                    <button
                      type="button"
                      className={`alignment-btn ${heroForm.alignment === 'center' ? 'active' : ''}`}
                      onClick={() => setHeroForm(prev => ({ ...prev, alignment: 'center' }))}
                    >
                      <FiAlignCenter /> Center
                    </button>
                    <button
                      type="button"
                      className={`alignment-btn ${heroForm.alignment === 'right' ? 'active' : ''}`}
                      onClick={() => setHeroForm(prev => ({ ...prev, alignment: 'right' }))}
                    >
                      <FiAlignRight /> Right
                    </button>
                  </div>
                </div>

                {/* Title Color Customization */}
                <div className="form-group full-width">
                  <label><FiDroplet /> Title Colors (Individual Words)</label>
                  <div className="word-color-controls">
                    {splitTitleIntoWords().map((word, index) => (
                      <div key={index} className="word-color-item">
                        <span className="word-text">"{word.text}"</span>
                        <div className="color-picker-container">
                          <input
                            type="color"
                            value={word.color}
                            onChange={(e) => updateWordColor(word.index, e.target.value)}
                            className="color-picker"
                          />
                          <div className="color-options">
                            {colorOptions.map((color) => (
                              <div
                                key={color}
                                className="color-option"
                                style={{ backgroundColor: color }}
                                onClick={() => updateWordColor(word.index, color)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gradient Options */}
                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={heroForm.useGradient}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, useGradient: e.target.checked }))}
                    />
                    Use Gradient Colors for Title
                  </label>
                  
                  {heroForm.useGradient && (
                    <div className="gradient-controls">
                      <div className="gradient-colors">
                        <input
                          type="color"
                          value={heroForm.gradientColors[0]}
                          onChange={(e) => setHeroForm(prev => ({
                            ...prev,
                            gradientColors: [e.target.value, prev.gradientColors[1]]
                          }))}
                          className="color-picker"
                        />
                        <input
                          type="color"
                          value={heroForm.gradientColors[1]}
                          onChange={(e) => setHeroForm(prev => ({
                            ...prev,
                            gradientColors: [prev.gradientColors[0], e.target.value]
                          }))}
                          className="color-picker"
                        />
                      </div>
                      <select
                        value={heroForm.gradientDirection}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, gradientDirection: e.target.value }))}
                        className="gradient-direction"
                      >
                        <option value="90deg">Horizontal →</option>
                        <option value="0deg">Vertical ↓</option>
                        <option value="45deg">Diagonal ↘</option>
                        <option value="135deg">Diagonal ↙</option>
                        <option value="radial-circle">Radial</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Description Color */}
                <div className="form-group full-width">
                  <label><FiDroplet /> Description Color</label>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      value={heroForm.descriptionColor}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, descriptionColor: e.target.value }))}
                      className="color-picker"
                    />
                    <div className="color-options">
                      {colorOptions.map((color) => (
                        <div
                          key={color}
                          className="color-option"
                          style={{ backgroundColor: color }}
                          onClick={() => setHeroForm(prev => ({ ...prev, descriptionColor: color }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Font Styling */}
                <div className="form-group">
                  <label>Title Font Size</label>
                  <select
                    value={heroForm.titleStyle.fontSize}
                    onChange={(e) => setHeroForm(prev => ({
                      ...prev,
                      titleStyle: { ...prev.titleStyle, fontSize: e.target.value }
                    }))}
                  >
                    <option value="2rem">Small (2rem)</option>
                    <option value="2.5rem">Medium (2.5rem)</option>
                    <option value="3rem">Large (3rem)</option>
                    <option value="3.5rem">Extra Large (3.5rem)</option>
                    <option value="4rem">Huge (4rem)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Title Font Weight</label>
                  <select
                    value={heroForm.titleStyle.fontWeight}
                    onChange={(e) => setHeroForm(prev => ({
                      ...prev,
                      titleStyle: { ...prev.titleStyle, fontWeight: e.target.value }
                    }))}
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description Font Size</label>
                  <select
                    value={heroForm.descriptionStyle.fontSize}
                    onChange={(e) => setHeroForm(prev => ({
                      ...prev,
                      descriptionStyle: { ...prev.descriptionStyle, fontSize: e.target.value }
                    }))}
                  >
                    <option value="0.9rem">Small (0.9rem)</option>
                    <option value="1rem">Medium (1rem)</option>
                    <option value="1.1rem">Large (1.1rem)</option>
                    <option value="1.2rem">Extra Large (1.2rem)</option>
                    <option value="1.4rem">Huge (1.4rem)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={heroForm.isActive}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    Active Banner
                  </label>
                </div>
              </div>

              {/* Preview Section */}
              <div className="preview-section">
                <h4>Preview</h4>
                <div className="banner-preview" style={{ textAlign: heroForm.alignment }}>
                  <div className="preview-title" style={{
                    fontSize: heroForm.titleStyle.fontSize,
                    fontWeight: heroForm.titleStyle.fontWeight,
                    textShadow: heroForm.titleStyle.textShadow,
                    background: heroForm.useGradient 
                      ? `linear-gradient(${heroForm.gradientDirection}, ${heroForm.gradientColors[0]}, ${heroForm.gradientColors[1]})`
                      : 'none',
                    WebkitBackgroundClip: heroForm.useGradient ? 'text' : 'initial',
                    WebkitTextFillColor: heroForm.useGradient ? 'transparent' : 'initial'
                  }}>
                    {heroForm.useGradient ? (
                      heroForm.title
                    ) : (
                      heroForm.titleColors.map((wordObj, index) => (
                        <span key={index} style={{ color: wordObj.color }}>
                          {wordObj.text}{index < heroForm.titleColors.length - 1 ? ' ' : ''}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="preview-description" style={{
                    fontSize: heroForm.descriptionStyle.fontSize,
                    fontWeight: heroForm.descriptionStyle.fontWeight,
                    color: heroForm.descriptionColor,
                    textShadow: heroForm.descriptionStyle.textShadow
                  }}>
                    {heroForm.description}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal} disabled={loading}>
                Cancel
              </button>
              <button className="save-btn" onClick={saveHeroSlide} disabled={loading}>
                <FiSave /> {loading ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HeroSection
