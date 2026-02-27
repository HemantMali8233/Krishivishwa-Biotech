import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import Banner from '../Assets/Images/Banner.jpeg';
import FarmingVideo from '../Assets/Images/FarmingVideo.mp4';
import Button from 'react-bootstrap/Button';
import { FiSearch } from "react-icons/fi";
import { BsCartPlus } from "react-icons/bs";
import Story from '../Components/Story';
import './Home.css';
import useAOS from '../utils/useAos';
import Facts from '../Components/Facts.js';
import WriteToUs from '../Components/WriteToUs.js';
import ImageSlider from '../Components/ImageSlider.js';

function Home() {
    const [playVideo, setPlayVideo] = useState(false);
    const videoRef = useRef(null);
    const [contentFadeIn, setContentFadeIn] = useState(false);

    const location = useLocation();
    const [alertMsg, setAlertMsg] = useState(null);

    const navigate = useNavigate(); // ✅ Initialize navigation

    // ✅ Init AOS
    useAOS();

    // ✅ Slow down video speed
    useEffect(() => {
        if (playVideo && videoRef.current) {
            videoRef.current.playbackRate = 0.5;
        }
    }, [playVideo]);

    // ✅ Check for login/signup success message
    useEffect(() => {
        if (location.state?.loginSuccess) {
            setAlertMsg(location.state.loginSuccess);

            // Clear state so it doesn't re-trigger when navigating back
            navigate(location.pathname, { replace: true, state: {} });

            // Hide alert after 5 seconds
            const timer = setTimeout(() => setAlertMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [location, navigate]);

    // ✅ Safety: ensure any alert auto-hides after 5s even if state changes
    useEffect(() => {
        if (!alertMsg) return;
        const t = setTimeout(() => setAlertMsg(null), 5000);
        return () => clearTimeout(t);
    }, [alertMsg]);

    const handleVideoEnd = () => {
        setPlayVideo(false);
        setTimeout(() => {
            setContentFadeIn(true);
            setTimeout(() => setContentFadeIn(false), 1000);
        }, 100);
    };

    return (
        <>
            {/* ✅ Show alert only if msg exists */}
            {alertMsg && (
                <div className="custom-alert alert alert-success" role="alert">
                    {alertMsg}
                </div>
            )}

            <div className="hero-section" style={{ backgroundImage: !playVideo ? `url(${Banner})` : 'none' }}>
                {playVideo && (
                    <div className="hero-video-wrapper">
                        <div className="video-overlay"></div>
                        <video
                            className="hero-video"
                            src={FarmingVideo}
                            autoPlay
                            muted
                            ref={videoRef}
                            onEnded={handleVideoEnd}
                        />
                    </div>
                )}

                <div className={`overlay-content ${contentFadeIn ? 'fade-in' : ''}`}>
                    <p
                        className="tagline interactive-tagline"
                        onClick={() => setPlayVideo(true)}
                        data-aos="fade-up"
                    >
                        Better Farming By Every Farmer
                    </p>

                    <h1 className="hero-heading" data-aos="fade-up" data-aos-delay="100">
                        <span className="heading-line">Empowering Organic Farming</span>
                        <span className="and-line">And</span>
                        <span className="heading-line">Sustainable Agriculture</span>
                    </h1>

                    <p className="description" data-aos="fade-up" data-aos-delay="200">
                        Organic farming with Krushiwishwa Biotech products can improve crop yields and soil health, driving sustainable growth for farmers.
                    </p>

                    <div className="button-group" data-aos="fade-up" data-aos-delay="300">
                        {/* ✅ Explore More -> Gallery */}
                        <Button
                            className="hero-btn discover-btn me-3"
                            onClick={() => navigate('/gallery')}
                        >
                            <span className="btn-hover-icon"><FiSearch /></span>
                            <span className="btn-text">Explore more</span>
                        </Button>

                        {/* ✅ Shop Now -> Shop */}
                        <Button
                            className="hero-btn shop-btn"
                            onClick={() => navigate('/shop')}
                        >
                            <span className="btn-hover-icon"><BsCartPlus /></span>
                            <span className="btn-text">Shop Now</span>
                        </Button>
                    </div>
                </div>
            </div>

            <Story id="our-story" />
            <ImageSlider />
            <Facts id="facts" />
            <WriteToUs />
        </>
    );
}

export default Home;
