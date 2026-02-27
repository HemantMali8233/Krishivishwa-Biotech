"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion } from "framer-motion"
import { Carousel } from 'react-bootstrap'
import "./GalleryBanner.css"
import { FiArrowRight } from "react-icons/fi"
import { PiImageSquareBold } from "react-icons/pi"
import axios from 'axios'
import Loader from "./Loader"

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

const GalleryBanner = () => {
  const [adminBanners, setAdminBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Use ref to track if component is mounted and prevent duplicate calls
  const isMounted = useRef(true)
  const hasLoaded = useRef(false)

  // Memoize the loadBanners function to prevent recreating it on every render
  const loadBanners = useCallback(async () => {
    // Prevent duplicate calls
    if (hasLoaded.current || !isMounted.current) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      hasLoaded.current = true
      
      const response = await axios.get(`${API_BASE_URL}/banners/page/Gallery`, {
        // Add timeout to prevent hanging requests
        timeout: 10000,
        // Add headers to prevent caching issues
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (isMounted.current) {
        setAdminBanners(response.data || [])
      }
    } catch (err) {
      console.error('Error loading banners:', err)
      if (isMounted.current) {
        setError(err.message)
        setAdminBanners([])
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, []) // Empty dependency array since we don't depend on any props or state

  useEffect(() => {
    isMounted.current = true
    
    // Only load if we haven't loaded before
    if (!hasLoaded.current) {
      loadBanners()
    }

    // Cleanup function
    return () => {
      isMounted.current = false
    }
  }, [loadBanners]) // Only depend on the memoized loadBanners function

  // Memoize the static banner to prevent unnecessary re-renders
  const StaticBanner = useMemo(() => (
    <div className="gl-banner-wrapper">
      <div className="gl-banner-overlay"></div>
      
      <div className="gl-banner-content">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="gl-text-container"
        >
          <motion.h1
            className="gl-main-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
             Our <span className="gl-title-emphasis">Agricultural</span> Journey in Photos
          </motion.h1>
          
          <motion.div 
            className="gl-divider"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          
          <motion.p
            className="gl-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            Explore our visual story of innovation, growth, and sustainable farming practices
          </motion.p>

          <motion.button
            className="gl-cta-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="feature-icon"><PiImageSquareBold /></span>
            View Gallery
            <FiArrowRight className="gl-arrow-icon" />
          </motion.button>
        </motion.div>
      </div> 
    </div>
  ), []) // Empty dependency array since this never changes

  // Memoize the AdminBannerSlide component
  const AdminBannerSlide = useCallback(({ banner }) => {
    const getServerImageUrl = (imagePath) => {
      if (!imagePath) return '';
      
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      return imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`;
    }

    // Render title with individual word colors or gradient
    const renderTitle = () => {
      if (banner.useGradient) {
        const gradientStyle = {
          background: banner.gradientDirection && banner.gradientDirection.includes('radial') 
            ? `radial-gradient(circle, ${banner.gradientColors?.[0] || '#ffffff'}, ${banner.gradientColors?.[1] || '#f0f0f0'})`
            : `linear-gradient(${banner.gradientDirection || '90deg'}, ${banner.gradientColors?.[0] || '#ffffff'}, ${banner.gradientColors?.[1] || '#f0f0f0'})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        };
        
        return (
          <h1 className="admin-banner-title" style={{
            ...gradientStyle,
            fontSize: banner.titleStyle?.fontSize || '3.5rem',
            fontWeight: banner.titleStyle?.fontWeight || '600',
            textShadow: banner.useGradient ? 'none' : (banner.titleStyle?.textShadow || '2px 2px 4px rgba(0,0,0,0.5)')
          }}>
            {banner.title}
          </h1>
        );
      } else {
        // Individual word colors
        return (
          <h1 className="admin-banner-title" style={{
            fontSize: banner.titleStyle?.fontSize || '3.5rem',
            fontWeight: banner.titleStyle?.fontWeight || '600',
            textShadow: banner.titleStyle?.textShadow || '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            {banner.titleColors && banner.titleColors.length > 0 ? (
              banner.titleColors.map((wordObj, index) => (
                <span key={index} style={{ color: wordObj.color || '#ffffff' }}>
                  {wordObj.text}{index < banner.titleColors.length - 1 ? ' ' : ''}
                </span>
              ))
            ) : (
              <span style={{ color: '#ffffff' }}>{banner.title}</span>
            )}
          </h1>
        );
      }
    };

    const getAlignmentClass = (alignment) => {
      switch(alignment) {
        case 'left': return 'text-left justify-start';
        case 'right': return 'text-right justify-end';
        case 'center': 
        default: return 'text-center justify-center';
      }
    }

    const alignmentClass = getAlignmentClass(banner.alignment || 'center');

    return (
      <div className={`admin-banner-slide ${alignmentClass}`}>
        <div 
          className="admin-banner-background"
          style={{ 
            backgroundImage: `url(${getServerImageUrl(banner.image)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className={`admin-banner-content content-${banner.alignment || 'center'}`}>
          <div className="admin-banner-text">
            {renderTitle()}
            
            <div className="admin-banner-divider" />
            
            <p className="admin-banner-description" style={{
              color: banner.descriptionColor || '#ffffff',
              fontSize: banner.descriptionStyle?.fontSize || '1.2rem',
              fontWeight: banner.descriptionStyle?.fontWeight || '300',
              textShadow: banner.descriptionStyle?.textShadow || '1px 1px 2px rgba(0,0,0,0.3)',
              textAlign: banner.alignment || 'center',
              marginLeft: banner.alignment === 'right' ? 'auto' : (banner.alignment === 'center' ? 'auto' : '0'),
              marginRight: banner.alignment === 'left' ? 'auto' : (banner.alignment === 'center' ? 'auto' : '0'),
              maxWidth: '600px'
            }}>
              {banner.description}
            </p>
          </div>
        </div>
      </div>
    )
  }, []) // Empty dependency since it only depends on props

  // Memoize the slides array to prevent unnecessary recalculations
  const allSlides = useMemo(() => {
    if (adminBanners.length === 0) return null;
    
    return [
      { id: 'static', type: 'static' },
      ...adminBanners.map(banner => ({ id: banner._id, type: 'admin', banner }))
    ];
  }, [adminBanners])

  if (loading) {
    return <Loader text="Loading Gallery..." height="70vh" />
  }

  // Show error state
  if (error) {
    console.warn('Gallery Banner Error:', error)
    return StaticBanner // Fallback to static banner on error
  }

  // If no admin banners, show static banner
  if (adminBanners.length === 0 || !allSlides) {
    return StaticBanner
  }

  // If admin banners exist, show carousel
  return (
    <div className="dynamic-carousel-wrapper">
      <Carousel
        interval={5000}
        controls={true}
        indicators={true}
        touch={true}
        className="hero-carousel"
        // Add these props to prevent unnecessary re-renders
        slide={true}
        fade={false}
      >
        {allSlides.map((slide) => (
          <Carousel.Item key={slide.id}>
            {slide.type === 'static' ? (
              StaticBanner
            ) : (
              <AdminBannerSlide banner={slide.banner} />
            )}
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  )
}

export default GalleryBanner
