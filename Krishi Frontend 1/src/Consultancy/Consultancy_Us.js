"use client";
import { useEffect, useState, useRef, cloneElement } from "react";
import "./Consultancy_Us.css";
import { FaUsers, FaStar, FaHandshake, FaInfoCircle, FaTimes } from "react-icons/fa";
import Image1 from '../Assets/Images/Consult-image1.jpg';
import Image2 from '../Assets/Images/Consult-image2.jpg';

const Consultancy_Us = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [countVisible, setCountVisible] = useState(false);
  const statsRef = useRef(null);

  const features = [
    {
      id: 0,
      icon: <FaUsers />,
      title: "Expert Team",
      description:
        "Certified agricultural experts with 10+ years of field experience and proven track record in sustainable farming practices.",
      stats: "50+ Certified Experts"
    },
    {
      id: 1,
      icon: <FaStar />,
      title: "Proven Results",
      description:
        "Helped 5000+ farmers increase yield by 30–50% using sustainable and tech-supported farming.",
      stats: "5000+ Success Stories"
    },
    {
      id: 2,
      icon: <FaHandshake />,
      title: "Comprehensive Support",
      description:
        "From soil health to post-harvest guidance — we offer full-circle consultancy support.",
      stats: "24/7 Support Access"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCountVisible(true);
      },
      { threshold: 0.6 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const useCountUp = (max, visible, duration = 3000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      if (!visible) return;
      let start = 0;
      const step = Math.ceil(max / (duration / 30));
      const interval = setInterval(() => {
        start += step;
        if (start >= max) {
          setCount(max);
          clearInterval(interval);
        } else {
          setCount(start);
        }
      }, 30);
      return () => clearInterval(interval);
    }, [visible, max]);
    return count;
  };

  const countFarmers = useCountUp(5000, countVisible);
  const countYield = useCountUp(50, countVisible);
  const countYears = useCountUp(10, countVisible);

  return (
    <section className="consultancy-us">
      <div className="section-container">
        {/* Header */}
        <div className="section-header" data-aos="fade-up">
          <h2 className="section-title">
            Why Choose Krishivishwa?
          </h2>
          <p className="section-subtitle">
            Professional agricultural consulting with proven expertise and results
          </p>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Feature Card */}
          <div className="content-side">
            <div className="carousel-wrapper">
              {features.map((feature, index) => {
                const position =
                  index === activeFeature
                    ? "active"
                    : index === (activeFeature + 1) % features.length
                      ? "next"
                      : index === (activeFeature - 1 + features.length) % features.length
                        ? "prev"
                        : "hidden";

                return (
                  <div
                    key={feature.id}
                    className={`content-card ${position} ${
                      index === 0
                        ? "theme-yellow"
                        : index === 1
                          ? "theme-blue"
                          : "theme-orange"
                    }`}
                  >
                    <div className="feature-header">
                      <div className="consultancy-feature-icon-container">
                        {cloneElement(feature.icon, { className: "consultancy-feature-icon" })}
                      </div>
                      <div className="feature-meta">
                        <h3 className="feature-title">{feature.title}</h3>
                        <div className="feature-stats">
                          <span className="stats-check">✓</span>
                          <span className="stats-text">{feature.stats}</span>
                        </div>
                      </div>
                    </div>
                    <p className="feature-description">{feature.description}</p>
                    <div className="progress-dots">
                      {features.map((_, i) => (
                        <button
                          key={i}
                          className={`progress-dot ${activeFeature === i ? "active" : ""}`}
                          onClick={() => setActiveFeature(i)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Images Container */}
          <div className="images-container">
            <div className="main-image-wrapper">
              <img src={Image1} alt='farmer consultation' className="main-image" />
            </div>
            <div className="secondary-image-wrapper">
              <img src={Image2} alt='happy farmer' className="secondary-image" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bottom-stats" ref={statsRef}>
          <div className="stat-group">
            <div className="stat-number">{countFarmers}+</div>
            <div className="stat-label">Farmers Helped</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-group">
            <div className="stat-number">{countYield}%</div>
            <div className="stat-label">Avg. Yield Increase</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-group">
            <div className="stat-number">{countYears}+</div>
            <div className="stat-label">Years of Experience</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consultancy_Us;
