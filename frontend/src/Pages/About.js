import React from 'react';
import FounderSection from '../Components/AboutUs/FounderSection';
import Testimonials from '../Components/AboutUs/Testimonials';
import GrowthMetrics from '../Components/AboutUs/GrowthMetrics'
import TimelineCarousel from '../Components/AboutUs/TimelineCarousel'
import PurposeSection from '../Components/AboutUs/PurposeSection'
import HeroSection from '../Components/AboutUs/HeroSection.jsx'

const AboutUs = () => {
  return (
    <>
      <HeroSection />
      <FounderSection />
      <PurposeSection />
      <TimelineCarousel />
      <Testimonials />
      <GrowthMetrics />
    </>
  );
};

export default AboutUs;
