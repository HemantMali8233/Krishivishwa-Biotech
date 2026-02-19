"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { GiPlantSeed } from "react-icons/gi"
import { FaBullhorn, FaHandshake, FaFlask, FaTractor } from "react-icons/fa"
import Header from "./Header"
import NewsletterCTA from "./NewsletterCTA"
import FeaturedTopics from "./FeaturedTopics"
import BreakingNewsMarquee from "./BreakingNewsMarquee"
import NewsCarousel from "./NewsCarousel"
import "./KrushiVishwaUpdates.css"
import VideoSection from './VideoSection'

const KrushiVishwaUpdates = () => {
  const [contact, setContact] = useState("")

  const handleSubscribe = (e) => {
    console.log("Newsletter subscription initiated")
  }

  return (
    <div className="kruvi-news-super">
      <Header />
      <BreakingNewsMarquee />
      <NewsCarousel />
      <VideoSection />
      <div className="kruvi-news-cta-container">
        <NewsletterCTA contact={contact} setContact={setContact} onSubscribe={handleSubscribe} />
        <FeaturedTopics />
      </div>
    </div>
  )
}

export default KrushiVishwaUpdates
