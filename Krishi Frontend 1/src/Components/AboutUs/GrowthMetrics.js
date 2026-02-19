"use client"

import { Container, Row, Col, Card } from "react-bootstrap"
import { useState, useEffect, useRef } from "react"
import "../AboutUs/GrowthMetrics.css"

const GrowthMetric = () => {
  const [counters, setCounters] = useState({})
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  const metrics = [
    {
      id: 1,
      title: "User Growth",
      value: 150,
      suffix: "%",
      description: "Monthly active users",
      icon: "fas fa-users",
      trend: "up",
      duration: 2000,
    },
    {
      id: 2,
      title: "Revenue",
      value: 2.4,
      prefix: "",
      suffix: "M",
      description: "Annual recurring revenue",
      icon: "fas fa-chart-line",
      trend: "up",
      duration: 2500,
    },
    {
      id: 3,
      title: "Conversion Rate",
      value: 12.5,
      suffix: "%",
      description: "Lead to customer conversion",
      icon: "fas fa-exchange-alt",
      trend: "up",
      duration: 2200,
    },
    {
      id: 4,
      title: "Customer Retention",
      value: 94,
      suffix: "%",
      description: "Customer satisfaction rate",
      icon: "fas fa-heart",
      trend: "up",
      duration: 1800,
    },
  ]

  // Intersection Observer to trigger animation when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  // Counter animation function
  const animateCounter = (targetValue, duration, metricId, hasDecimals = false) => {
    let startTime = null
    const startValue = 0

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart

      setCounters((prev) => ({
        ...prev,
        [metricId]: hasDecimals ? currentValue.toFixed(1) : Math.floor(currentValue),
      }))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  // Start counters when section becomes visible
  useEffect(() => {
    if (isVisible) {
      metrics.forEach((metric) => {
        const hasDecimals = metric.value % 1 !== 0
        animateCounter(metric.value, metric.duration, metric.id, hasDecimals)
      })
    }
  }, [isVisible])

  const formatCounterValue = (metric) => {
    const counterValue = counters[metric.id] || 0
    const prefix = metric.prefix || ""
    const suffix = metric.suffix || ""
    return `${prefix}${counterValue}${suffix}`
  }

  return (
    <section className="growth-metric-section" ref={sectionRef}>
      <Container>
        <Row className="text-center mb-4">
          <Col>
            <h2 className="section-title">Our Growth Metrics</h2>
            <p className="section-subtitle">Driving success through measurable results</p>
          </Col>
        </Row>
        <Row className="g-4">
          {metrics.map((metric) => (
            <Col key={metric.id} xs={12} sm={6} lg={3}>
              <Card className="metric-card h-100">
                <Card.Body className="text-center">
                  <div className="metric-icon-wrapper">
                    <i className={`${metric.icon} fa-2x`}></i>
                  </div>
                  <div className="metric-value">{formatCounterValue(metric)}</div>
                  <h5 className="metric-title">{metric.title}</h5>
                  <p className="metric-description">{metric.description}</p>
                  <div className={`trend-indicator trend-${metric.trend}`}>
                    <i className="fas fa-arrow-up"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default GrowthMetric