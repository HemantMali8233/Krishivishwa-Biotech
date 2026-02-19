import React, { useEffect, useRef, useState } from 'react';
import './Facts.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const factsData = [
  {
    icon: "bi-calendar3",
    number: 19,
    suffix: "+",
    label: "YEARS REVOLUTIONIZING MICROBIALS",
  },
  {
    icon: "bi-cart3",
    number: 11,
    suffix: "",
    label: "PATENTED INNOVATIONS",
  },
  {
    icon: "bi-person",
    number: 50,
    suffix: "k+",
    label: "SATISFIED FARMERS",
  },
  {
    icon: "bi-journal-text",
    number: 3,
    suffix: "",
    label: "PATENTS IN PROCESS",
  },
  {
    icon: "bi-hand-thumbs-up",
    number: 50,
    suffix: "+",
    label: "INNOVATIVE MICROBIAL SOLUTIONS",
  },
  {
    icon: "bi-globe",
    number: 5000,
    suffix: "+",
    label: "Product Sold",
  },
];

// ✅ Updated to accept and apply `id`
export default function Facts({ id }) {
  const [counters, setCounters] = useState(Array(factsData.length).fill(0));
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const animateCounters = () => {
    factsData.forEach((fact, i) => {
      let count = 0;
      const increment = fact.number / 50;

      const counter = setInterval(() => {
        count += increment;
        if (count >= fact.number) {
          count = fact.number;
          clearInterval(counter);
        }

        setCounters(prev => {
          const updated = [...prev];
          updated[i] = Math.floor(count);
          return updated;
        });
      }, 30);
    });
  };

  return (
    <div id={id} className="facts-section" ref={sectionRef}>
      <p className="facts-title">OUR FACTS</p>
      <h2 className="facts-heading">
        Making a positive impact today for the <br />
        Sustainable Tomorrow
      </h2>

      <div className="facts-grid">
        {factsData.map((fact, index) => (
          <div className="fact-card" key={index}>
            <div className="icon-container">
              <i className={`bi ${fact.icon}`}></i>
            </div>
            <div className="fact-info">
              <h3 className="fact-number">{counters[index]}{fact.suffix}</h3>
              <p className="fact-label">{fact.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
