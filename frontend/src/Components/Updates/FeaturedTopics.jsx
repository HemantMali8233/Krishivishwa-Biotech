"use client"
import { motion } from "framer-motion"
import {
  GiWheat,
  GiPlantWatering,
  GiPlantSeed,
  GiFarmer
} from "react-icons/gi"
import "./FeaturedTopics.css"

const FeaturedTopics = () => {
  const cards = [
    {
      id: 1,
      icon: GiWheat,
      title: "Crop Management",
      desc: "Advanced techniques for higher yields"
    },
    {
      id: 2,
      icon: GiPlantWatering,
      title: "Smart Irrigation",
      desc: "Water-efficient farming systems"
    },
    {
      id: 3,
      icon: GiPlantSeed,
      title: "Seed Technology",
      desc: "Next-gen hybrid varieties"
    },
    {
      id: 4,
      icon: GiFarmer,
      title: "Farm Automation",
      desc: "Robotics for modern agriculture"
    },
  ]

  return (
    <div className="agro-cards-container">
      <div className="agro-cards-grid">
        {cards.map((card) => (
          <motion.div 
            key={card.id}
            className="agro-card"
            whileHover={{ 
              y: -8,
              boxShadow: "0 12px 24px rgba(46, 125, 50, 0.15)"
            }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="card-icon">
              <card.icon size={28} />
            </div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <div className="card-hover-indicator" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default FeaturedTopics