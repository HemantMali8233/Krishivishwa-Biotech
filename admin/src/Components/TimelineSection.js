import { useEffect, useState } from "react"
import axios from "axios"
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiSave, FiX } from "react-icons/fi"
import "./TimelineSection.css"

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = BACKEND_URL + "/api/timeline";
const UPLOAD_URL = BACKEND_URL + "/api/upload";

const initialFormState = {
  year: "",
  title: "",
  description: "",
  achievement: "",
  metric: "",
  highlight: "",
  icon: "",
  image: "",
}

const TimelineSection = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [timelineForm, setTimelineForm] = useState(initialFormState)
  const [timelineMilestones, setTimelineMilestones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMilestones = async () => {
      setLoading(true)
      try {
        const res = await axios.get(API_URL)
        setTimelineMilestones(
          res.data.map((item) => ({
            ...item,
            id: item._id,
          }))
        )
      } catch (err) {
        console.error("Failed to fetch milestones:", err)
      }
      setLoading(false)
    }
    fetchMilestones()
  }, [])

  const openTimelineModal = (milestone = null) => {
    setEditingItem(milestone)
    setTimelineForm(milestone ? { ...milestone } : initialFormState)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setTimelineForm(initialFormState)
  }

  // Save milestone (create new or update existing)
  const saveTimelineMilestone = async () => {
    try {
      if (editingItem && editingItem.id) {
        const res = await axios.put(`${API_URL}/${editingItem.id}`, timelineForm)
        setTimelineMilestones((items) =>
          items.map((item) => (item.id === editingItem.id ? { ...res.data, id: res.data._id } : item))
        )
      } else {
        const res = await axios.post(API_URL, timelineForm)
        setTimelineMilestones((items) => [...items, { ...res.data, id: res.data._id }])
      }
      closeModal()
    } catch (error) {
      console.error("Failed to save milestone:", error)
      alert("Failed to save milestone. Please check console for details.")
    }
  }

  const deleteTimelineMilestone = async (id) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) return
    try {
      await axios.delete(`${API_URL}/${id}`)
      setTimelineMilestones((items) => items.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Failed to delete milestone:", error)
      alert("Failed to delete milestone. Please check console for details.")
    }
  }

  return (
    <div className="timeline-management">
      <div className="section-header">
        <div className="section-title">
          <h2>Timeline Management - About Us Page</h2>
          <p className="section-subtitle">Showcase company milestones and journey (About Us page only)</p>
        </div>
        <div className="header-actions">
          <button type="button" className="add-btn" onClick={() => openTimelineModal()}>
            <FiPlus /> Add New Milestone
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : timelineMilestones.length > 0 ? (
        <div className="items-container grid-view">
          {timelineMilestones
            .sort((a, b) => Number.parseInt(a.year) - Number.parseInt(b.year))
            .map((milestone, index) => (
              <div key={milestone.id} className="item-card timeline-card">
                <div className="timeline-year">{milestone.year}</div>
                <div className="item-image">
                  <img src={`${BACKEND_URL}${milestone.image}`} alt={milestone.title} />
                  <div className="image-actions">
                    <button
                      type="button"
                      className="action-btn edit-action"
                      onClick={() => openTimelineModal(milestone)}
                      aria-label={`Edit milestone ${milestone.title}`}
                    >
                      <FiEdit />
                    </button>
                    <button
                      type="button"
                      className="action-btn delete-action"
                      onClick={() => deleteTimelineMilestone(milestone.id)}
                      aria-label={`Delete milestone ${milestone.title}`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="milestone-icon">{milestone.icon}</div>
                  <div className="timeline-position">Step {index + 1}</div>
                </div>
                <div className="item-content">
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                  <div className="milestone-details">
                    <div className="detail-item">
                      <span className="detail-label">Achievement:</span>
                      <span className="detail-value">{milestone.achievement}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Metric:</span>
                      <span className="detail-value">{milestone.metric}</span>
                    </div>
                  </div>
                  {milestone.highlight && (
                    <div className="milestone-highlight">
                      <strong>Key Highlight:</strong> {milestone.highlight}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <FiCalendar />
          </div>
          <h3>No timeline milestones</h3>
          <p>Add your first milestone to showcase the company journey on the About Us page.</p>
          <button type="button" className="add-btn" onClick={() => openTimelineModal()}>
            <FiPlus /> Create First Milestone
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal} style={{ cursor: "pointer" }}>
          <div
            className="modal-content"
            onClick={(e) => {
              e.stopPropagation()
            }}
            style={{ cursor: "default" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <h3 id="modal-title">{editingItem ? "Edit" : "Add New"} Timeline Milestone - About Us</h3>
              <button
                type="button"
                className="close-btn"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                {/* ...other form fields... */}
                <div className="form-group">
                  <label htmlFor="image">Upload Image</label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append("image", file);

                      try {
                        const res = await axios.post(UPLOAD_URL, formData, {
                          headers: { "Content-Type": "multipart/form-data" }
                        });
                        setTimelineForm({ ...timelineForm, image: res.data.imageUrl });
                      } catch (err) {
                        alert("Failed to upload image");
                        console.error("Image upload error:", err);
                      }
                    }}
                  />
                  {timelineForm.image && (
                    <div style={{ marginTop: "8px" }}>
                      <img src={`${BACKEND_URL}${timelineForm.image}`} alt="Preview" style={{ maxHeight: 80 }} />
                    </div>
                  )}
                </div>
                {/* ...other form fields (year, title, etc.)... */}
                <div className="form-group">
                  <label htmlFor="year">Year</label>
                  <input
                    id="year"
                    type="text"
                    value={timelineForm.year}
                    onChange={(e) => setTimelineForm({ ...timelineForm, year: e.target.value })}
                    placeholder="e.g., 2023"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="icon">Icon (Emoji)</label>
                  <input
                    id="icon"
                    type="text"
                    value={timelineForm.icon}
                    onChange={(e) => setTimelineForm({ ...timelineForm, icon: e.target.value })}
                    placeholder="e.g., 🚀"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={timelineForm.title}
                    onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                    placeholder="Enter milestone title"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <input
                    id="description"
                    type="text"
                    value={timelineForm.description}
                    onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                    placeholder="Enter milestone description"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="achievement">Achievement</label>
                  <input
                    id="achievement"
                    type="text"
                    value={timelineForm.achievement}
                    onChange={(e) => setTimelineForm({ ...timelineForm, achievement: e.target.value })}
                    placeholder="Enter achievement"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="metric">Metric</label>
                  <input
                    id="metric"
                    type="text"
                    value={timelineForm.metric}
                    onChange={(e) => setTimelineForm({ ...timelineForm, metric: e.target.value })}
                    placeholder="e.g., 50+ Farmers"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="highlight">Highlight</label>
                  <textarea
                    id="highlight"
                    value={timelineForm.highlight}
                    onChange={(e) => setTimelineForm({ ...timelineForm, highlight: e.target.value })}
                    placeholder="Enter highlight description"
                    rows="2"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={saveTimelineMilestone}
              >
                <FiSave /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimelineSection
