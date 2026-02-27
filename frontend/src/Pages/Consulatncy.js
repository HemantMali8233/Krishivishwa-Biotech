
import React from "react"
import "./Consultancy.css"
import useAOS from "../utils/useAos"
// import Expert from '../Assets/Images/Expert.jpg';
// import Result from '../Assets/Images/Result.jpg';
// import Support from '../Assets/Images/Support.jpg';
import Hero from '../Consultancy/Consultancy_hero'
import Service from '../Consultancy/Consultancy_Service'
import Booking from '../Consultancy/Consultancy_Booking'
import Us from '../Consultancy/Consultancy_Us'
import Contact from '../Consultancy/Consultancy_Contact'

const ConsultancyPage = () => {
  useAOS()

  return (
    <div className="consultancy-page">
      <Hero />
      <Service />
      <Booking />
      <Us />
      <Contact/>
    </div>
  )
}

export default ConsultancyPage
