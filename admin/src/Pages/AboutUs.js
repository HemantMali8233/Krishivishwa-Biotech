"use client"

import { useState, useRef } from "react"
import { FiPlus, FiEdit3, FiTrash2, FiSave, FiX, FiImage, FiSettings, FiHome, FiClock, FiUpload } from "react-icons/fi"
import "./AboutUs.css"

const AdminLayout = () => {
  // Hero Section State
  const [heroSlides, setHeroSlides] = useState([
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "Sustainable Agriculture Solutions",
      description: "Pioneering organic farming with our eco-friendly biofertilizers and biopesticides",
    },
    {
      id: "2",
      image: "https://i.pinimg.com/736x/f3/dd/07/f3dd0799069f084e4dd768c1152f666a.jpg",
      title: "Nature-Inspired Innovation",
      description: "Harnessing nature's wisdom to create effective, non-toxic crop protection",
    },
    {
      id: "3",
      image: "https://i.pinimg.com/736x/04/ed/c7/04edc7e1b30c3c3895731bd6e2eb7d45.jpg",
      title: "Our Organic Promise",
      description: "Committed to soil health and sustainable farming practices",
    },
  ])

  // Timeline State
  const [timelineMilestones, setTimelineMilestones] = useState([
    {
      id: "1",
      year: "2015",
      title: "Idea Formed",
      description: "Dream to go organic",
      achievement: "Market Research Completed",
      metric: "50+ Farmers Interviewed",
      highlight: "Identified key pain points in traditional farming",
      icon: "💡",
      image: "https://i.pinimg.com/1200x/90/55/0a/90550a05f85e1e092ce5b2f61eade42b.jpg",
    },
  ])

  // UI State
  const [activeTab, setActiveTab] = useState("hero")
  const [editingHero, setEditingHero] = useState(null)
  const [editingTimeline, setEditingTimeline] = useState(null)
  const [showAddHero, setShowAddHero] = useState(false)
  const [showAddTimeline, setShowAddTimeline] = useState(false)

  // Form States
  const [heroForm, setHeroForm] = useState({})
  const [timelineForm, setTimelineForm] = useState({})

  // File input refs
  const heroFileInputRef = useRef(null)
  const timelineFileInputRef = useRef(null)

  const handleImageUpload = (file, type) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result
        if (type === "hero") {
          setHeroForm((prev) => ({ ...prev, image: imageUrl }))
        } else {
          setTimelineForm((prev) => ({ ...prev, image: imageUrl }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Hero Section Functions
  const handleAddHero = () => {
    setHeroForm({})
    setShowAddHero(true)
  }

  const handleEditHero = (slide) => {
    setHeroForm(slide)
    setEditingHero(slide.id)
  }

  const handleSaveHero = () => {
    if (editingHero) {
      setHeroSlides((prev) => prev.map((slide) => (slide.id === editingHero ? { ...slide, ...heroForm } : slide)))
      setEditingHero(null)
    } else {
      const newSlide = {
        id: Date.now().toString(),
        image: heroForm.image || "",
        title: heroForm.title || "",
        description: heroForm.description || "",
      }
      setHeroSlides((prev) => [...prev, newSlide])
      setShowAddHero(false)
    }
    setHeroForm({})
  }

  const handleDeleteHero = (id) => {
    setHeroSlides((prev) => prev.filter((slide) => slide.id !== id))
  }

  // Timeline Functions
  const handleAddTimeline = () => {
    setTimelineForm({})
    setShowAddTimeline(true)
  }

  const handleEditTimeline = (milestone) => {
    setTimelineForm(milestone)
    setEditingTimeline(milestone.id)
  }

  const handleSaveTimeline = () => {
    if (editingTimeline) {
      setTimelineMilestones((prev) =>
        prev.map((milestone) => (milestone.id === editingTimeline ? { ...milestone, ...timelineForm } : milestone)),
      )
      setEditingTimeline(null)
    } else {
      const newMilestone = {
        id: Date.now().toString(),
        year: timelineForm.year || "",
        title: timelineForm.title || "",
        description: timelineForm.description || "",
        achievement: timelineForm.achievement || "",
        metric: timelineForm.metric || "",
        highlight: timelineForm.highlight || "",
        icon: timelineForm.icon || "📅",
        image: timelineForm.image || "",
      }
      setTimelineMilestones((prev) => [...prev, newMilestone])
      setShowAddTimeline(false)
    }
    setTimelineForm({})
  }

  const handleDeleteTimeline = (id) => {
    setTimelineMilestones((prev) => prev.filter((milestone) => milestone.id !== id))
  }

  const cancelEdit = () => {
    setEditingHero(null)
    setEditingTimeline(null)
    setShowAddHero(false)
    setShowAddTimeline(false)
    setHeroForm({})
    setTimelineForm({})
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <FiSettings />
            </div>
            <div>
              <h1>Content Management</h1>
              <p>Manage your website's hero section and timeline content</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{heroSlides.length}</span>
              <span className="stat-label">Hero Slides</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{timelineMilestones.length}</span>
              <span className="stat-label">Milestones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button className={`tab-button ${activeTab === "hero" ? "active" : ""}`} onClick={() => setActiveTab("hero")}>
          <FiHome /> Hero Section
        </button>
        <button
          className={`tab-button ${activeTab === "timeline" ? "active" : ""}`}
          onClick={() => setActiveTab("timeline")}
        >
          <FiClock /> Timeline
        </button>
      </div>

      {/* Content Area */}
      <div className="admin-content">
        {activeTab === "hero" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Hero Section Management</h2>
              <button className="add-button" onClick={handleAddHero}>
                <FiPlus /> Add New Slide
              </button>
            </div>

            {/* Hero Slides List */}
            <div className="items-grid">
              {heroSlides.map((slide) => (
                <div key={slide.id} className="item-card">
                  {editingHero === slide.id ? (
                    <div className="edit-form">
                      <div className="form-group">
                        <label>Image</label>
                        <div className="image-upload-container">
                          {heroForm.image && (
                            <div className="image-preview">
                              <img src={heroForm.image || "/placeholder.svg"} alt="Preview" />
                            </div>
                          )}
                          <input
                            ref={heroFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file, "hero")
                            }}
                            style={{ display: "none" }}
                          />
                          <button
                            type="button"
                            className="upload-button"
                            onClick={() => heroFileInputRef.current?.click()}
                          >
                            <FiUpload /> {heroForm.image ? "Change Image" : "Upload Image"}
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={heroForm.title || ""}
                          onChange={(e) => setHeroForm((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter slide title"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={heroForm.description || ""}
                          onChange={(e) => setHeroForm((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter slide description"
                          rows={3}
                        />
                      </div>
                      <div className="form-actions">
                        <button className="save-button" onClick={handleSaveHero}>
                          <FiSave /> Save
                        </button>
                        <button className="cancel-button" onClick={cancelEdit}>
                          <FiX /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="item-image">
                        <img src={slide.image || "/placeholder.svg"} alt={slide.title} />
                        <div className="image-overlay">
                          <FiImage />
                        </div>
                      </div>
                      <div className="item-content">
                        <h3>{slide.title}</h3>
                        <p>{slide.description}</p>
                      </div>
                      <div className="item-actions">
                        <button className="edit-button" onClick={() => handleEditHero(slide)}>
                          <FiEdit3 />
                        </button>
                        <button className="delete-button" onClick={() => handleDeleteHero(slide.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add New Hero Form */}
              {showAddHero && (
                <div className="item-card add-form">
                  <div className="edit-form">
                    <h3>Add New Hero Slide</h3>
                    <div className="form-group">
                      <label>Image</label>
                      <div className="image-upload-container">
                        {heroForm.image && (
                          <div className="image-preview">
                            <img src={heroForm.image || "/placeholder.svg"} alt="Preview" />
                          </div>
                        )}
                        <input
                          ref={heroFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, "hero")
                          }}
                          style={{ display: "none" }}
                        />
                        <button
                          type="button"
                          className="upload-button"
                          onClick={() => heroFileInputRef.current?.click()}
                        >
                          <FiUpload /> {heroForm.image ? "Change Image" : "Upload Image"}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={heroForm.title || ""}
                        onChange={(e) => setHeroForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter slide title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={heroForm.description || ""}
                        onChange={(e) => setHeroForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter slide description"
                        rows={3}
                      />
                    </div>
                    <div className="form-actions">
                      <button className="save-button" onClick={handleSaveHero}>
                        <FiSave /> Add Slide
                      </button>
                      <button className="cancel-button" onClick={cancelEdit}>
                        <FiX /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Timeline Management</h2>
              <button className="add-button" onClick={handleAddTimeline}>
                <FiPlus /> Add New Milestone
              </button>
            </div>

            {/* Timeline Milestones List */}
            <div className="items-grid">
              {timelineMilestones.map((milestone) => (
                <div key={milestone.id} className="item-card timeline-card">
                  {editingTimeline === milestone.id ? (
                    <div className="edit-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Year</label>
                          <input
                            type="text"
                            value={timelineForm.year || ""}
                            onChange={(e) => setTimelineForm((prev) => ({ ...prev, year: e.target.value }))}
                            placeholder="2024"
                          />
                        </div>
                        <div className="form-group">
                          <label>Icon</label>
                          <input
                            type="text"
                            value={timelineForm.icon || ""}
                            onChange={(e) => setTimelineForm((prev) => ({ ...prev, icon: e.target.value }))}
                            placeholder="💡"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={timelineForm.title || ""}
                          onChange={(e) => setTimelineForm((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Milestone title"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          value={timelineForm.description || ""}
                          onChange={(e) => setTimelineForm((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description"
                        />
                      </div>
                      <div className="form-group">
                        <label>Achievement</label>
                        <input
                          type="text"
                          value={timelineForm.achievement || ""}
                          onChange={(e) => setTimelineForm((prev) => ({ ...prev, achievement: e.target.value }))}
                          placeholder="Key achievement"
                        />
                      </div>
                      <div className="form-group">
                        <label>Metric</label>
                        <input
                          type="text"
                          value={timelineForm.metric || ""}
                          onChange={(e) => setTimelineForm((prev) => ({ ...prev, metric: e.target.value }))}
                          placeholder="Important metric"
                        />
                      </div>
                      <div className="form-group">
                        <label>Highlight</label>
                        <textarea
                          value={timelineForm.highlight || ""}
                          onChange={(e) => setTimelineForm((prev) => ({ ...prev, highlight: e.target.value }))}
                          placeholder="Key highlight or impact"
                          rows={2}
                        />
                      </div>
                      <div className="form-group">
                        <label>Image</label>
                        <div className="image-upload-container">
                          {timelineForm.image && (
                            <div className="image-preview">
                              <img src={timelineForm.image || "/placeholder.svg"} alt="Preview" />
                            </div>
                          )}
                          <input
                            ref={timelineFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file, "timeline")
                            }}
                            style={{ display: "none" }}
                          />
                          <button
                            type="button"
                            className="upload-button"
                            onClick={() => timelineFileInputRef.current?.click()}
                          >
                            <FiUpload /> {timelineForm.image ? "Change Image" : "Upload Image"}
                          </button>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button className="save-button" onClick={handleSaveTimeline}>
                          <FiSave /> Save
                        </button>
                        <button className="cancel-button" onClick={cancelEdit}>
                          <FiX /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="timeline-header">
                        <div className="year-badge">
                          <span className="milestone-icon">{milestone.icon}</span>
                          <span className="year-text">{milestone.year}</span>
                        </div>
                      </div>
                      <div className="item-image">
                        <img src={milestone.image || "/placeholder.svg"} alt={milestone.title} />
                      </div>
                      <div className="item-content">
                        <h3>{milestone.title}</h3>
                        <p>{milestone.description}</p>
                        <div className="milestone-details">
                          <div className="detail-item">
                            <strong>Achievement:</strong> {milestone.achievement}
                          </div>
                          <div className="detail-item">
                            <strong>Metric:</strong> {milestone.metric}
                          </div>
                          <div className="detail-item">
                            <strong>Highlight:</strong> {milestone.highlight}
                          </div>
                        </div>
                      </div>
                      <div className="item-actions">
                        <button className="edit-button" onClick={() => handleEditTimeline(milestone)}>
                          <FiEdit3 />
                        </button>
                        <button className="delete-button" onClick={() => handleDeleteTimeline(milestone.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add New Timeline Form */}
              {showAddTimeline && (
                <div className="item-card add-form timeline-card">
                  <div className="edit-form">
                    <h3>Add New Milestone</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Year</label>
                        <input
                          type="text"
                          value={timelineForm.year || ""}
                          onChange={(e) => setTimelineForm((prev) => ({ ...prev, year: e.target.value }))}
                          placeholder="2024"
                        />
                      </div>
                      <div className="form-group">
                        <label>Icon</label>
                        <input
                          type="text"
                          value={timelineForm.icon || ""}
                          onChange={(e) => setTimelineForm((prev) => ({ ...prev, icon: e.target.value }))}
                          placeholder="💡"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={timelineForm.title || ""}
                        onChange={(e) => setTimelineForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Milestone title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        type="text"
                        value={timelineForm.description || ""}
                        onChange={(e) => setTimelineForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description"
                      />
                    </div>
                    <div className="form-group">
                      <label>Achievement</label>
                      <input
                        type="text"
                        value={timelineForm.achievement || ""}
                        onChange={(e) => setTimelineForm((prev) => ({ ...prev, achievement: e.target.value }))}
                        placeholder="Key achievement"
                      />
                    </div>
                    <div className="form-group">
                      <label>Metric</label>
                      <input
                        type="text"
                        value={timelineForm.metric || ""}
                        onChange={(e) => setTimelineForm((prev) => ({ ...prev, metric: e.target.value }))}
                        placeholder="Important metric"
                      />
                    </div>
                    <div className="form-group">
                      <label>Highlight</label>
                      <textarea
                        value={timelineForm.highlight || ""}
                        onChange={(e) => setTimelineForm((prev) => ({ ...prev, highlight: e.target.value }))}
                        placeholder="Key highlight or impact"
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Image</label>
                      <div className="image-upload-container">
                        {timelineForm.image && (
                          <div className="image-preview">
                            <img src={timelineForm.image || "/placeholder.svg"} alt="Preview" />
                          </div>
                        )}
                        <input
                          ref={timelineFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, "timeline")
                          }}
                          style={{ display: "none" }}
                        />
                        <button
                          type="button"
                          className="upload-button"
                          onClick={() => timelineFileInputRef.current?.click()}
                        >
                          <FiUpload /> {timelineForm.image ? "Change Image" : "Upload Image"}
                        </button>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="save-button" onClick={handleSaveTimeline}>
                        <FiSave /> Add Milestone
                      </button>
                      <button className="cancel-button" onClick={cancelEdit}>
                        <FiX /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminLayout
