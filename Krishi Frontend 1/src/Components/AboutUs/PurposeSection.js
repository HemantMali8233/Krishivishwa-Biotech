import React from 'react';
import './PurposeSection.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaLeaf, FaEye, FaHandHoldingHeart, FaSeedling, FaGlobeAmericas, FaLightbulb } from 'react-icons/fa';
import { GiPlantRoots, GiEarthWorm } from 'react-icons/gi';
import MissionImg from '../../Assets/Images/A.jpeg';
import VisionImg from '../../Assets/Images/B.jpeg';
import ValuesImg from '../../Assets/Images/C.jpeg';

const data = [
  {
    title: "Our Mission",
    icon: <FaLeaf className="mvv-icon" />,
    iconColor: "#4caf50",
    lightColor: "rgba(76, 175, 80, 0.1)",
    image: MissionImg,
    description: "To revolutionize sustainable agriculture by developing innovative organic biofertilizers and biopesticides that enhance soil vitality, boost crop yields, and protect ecosystems – bridging science and nature for toxin-free farming.",
    values: [
      { icon: <GiPlantRoots />, text: "Leaf growth (symbolizing organic growth)" },
      { icon: <FaSeedling />, text: "Soil Enrichment" }
    ]
  },
  {
    title: "Our Vision",
    icon: <FaEye className="mvv-icon" />,
    iconColor: "#0288d1",
    lightColor: "rgba(2, 136, 209, 0.1)",
    image: VisionImg,
    description: "To become a global leader in agricultural biotechnology, where every farm thrives through nature-compatible solutions, creating a future where productivity and environmental stewardship grow hand-in-root.",
    values: [
      { icon: <FaGlobeAmericas />, text: "Global Impact" },
      { icon: <GiEarthWorm />, text: "Ecosystem Balance" }
    ]
  },
  {
    title: "Our Values",
    icon: <FaHandHoldingHeart className="mvv-icon" />,
    iconColor: "#f57c00",
    lightColor: "rgba(245, 124, 0, 0.1)",
    image: ValuesImg,
    description: "A world where every harvest nourishes both people and planet – where advanced biotechnology and organic farming traditions unite to create regenerative abundance. We see farmlands thriving as biodiverse ecosystems, where crops flourish alongside revitalized soils and clean waterways.",
    values: [
      { icon: <FaLightbulb />, text: "Innovation" },
      { icon: <FaHandHoldingHeart />, text: "Care" }
    ]
  },
];

const MissionVisionValuesSection = () => {
  return (
    <section className="mvv-section">
      <Container>
        <div className="mvv-header text-center">
          <h6 className="text-uppercase">Our Core Principles</h6>
          <h2>
            Mission, <span className="highlight">Vision</span> & Values
          </h2>
          <div className="divider"></div>
        </div>

        <Row className="justify-content-center mt-5">
          {data.map((item, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <div className="mvv-card">
                <div className="mvv-image-wrapper">
                  <img src={item.image} alt={item.title} className="mvv-image" />
                  <div className="mvv-icon-outer">
                    <div
                      className="mvv-icon-circle"
                      style={{
                        backgroundColor: item.iconColor,
                        border: `10px solid ${item.iconColor}`
                      }}
                    >
                      {item.icon}
                    </div>
                  </div>
                </div>
                <div
                  className="mvv-content"
                  style={{
                    backgroundColor: item.lightColor,
                  }}
                >
                  <h5 style={{ color: item.iconColor }}>{item.title}</h5>
                  <p>{item.description}</p>

                  <div className="mvv-values">
                    {item.values.map((value, i) => (
                      <div key={i} className="mvv-value-item">
                        <span className="mvv-value-icon" style={{ color: item.iconColor }}>
                          {value.icon}
                        </span>
                        <span>{value.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default MissionVisionValuesSection;