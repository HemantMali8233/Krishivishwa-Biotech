"use client"

import { useState, useEffect } from "react"
import { FiEdit, FiImage, FiCalendar } from "react-icons/fi"
import HeroSection from "../Components/HeroSection"
import TimelineSection from "../Components/TimelineSection"
import axios from "axios"
import "./Content.css"

const API_TIMELINE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/timeline"

const Content = () => {
  const [activeTab, setActiveTab] = useState("hero")
  const [totalSlides, setTotalSlides] = useState(0)
  const [totalMilestones, setTotalMilestones] = useState(0)

  // To get total milestones dynamically from backend
  useEffect(() => {
    const fetchMilestonesCount = async () => {
      try {
        const res = await axios.get(API_TIMELINE_URL)
        setTotalMilestones(res.data.length)
      } catch (err) {
        console.error("Failed to fetch milestones count:", err)
      }
    }
    fetchMilestonesCount()
  }, [])

  // To get total slides from HeroSection dynamically:
  // This requires HeroSection to expose count via props or context.
  // For demonstration, let's assume HeroSection accepts an onCountChange callback prop.

  return (
    <div className="admin-layout">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <FiEdit />
            </div>
            <div>
              <h1>Content Management System</h1>
              <p>Manage your website content with ease</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{totalSlides}</span>
              <span className="stat-label">Total Slides</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{totalMilestones}</span>
              <span className="stat-label">Total Milestones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <div className="tab-container">
          <button
            className={`tab-btn ${activeTab === "hero" ? "active" : ""}`}
            onClick={() => setActiveTab("hero")}
          >
            <FiImage />
            <span>Hero Section</span>
            <div className="tab-badge">{totalSlides}</div>
          </button>
          <button
            className={`tab-btn ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <FiCalendar />
            <span>Timeline</span>
            <div className="tab-badge">{totalMilestones}</div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        {activeTab === "hero" && (
          <HeroSection onCountChange={setTotalSlides} />
        )}
        {activeTab === "timeline" && (
          <TimelineSection onTotalCountChange={setTotalMilestones} />
        )}
      </div>
    </div>
  )
}

export default Content
