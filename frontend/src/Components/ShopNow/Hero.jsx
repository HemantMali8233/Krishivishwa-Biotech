"use client"
import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Carousel } from 'react-bootstrap'
import "./Hero.css"
import { FiArrowRight, FiShoppingBag } from "react-icons/fi"
import farmerbg from '../../Assets/Images/farmerbg.png'
import axios from 'axios'
import Loader from "../Loader"

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

const ShopHero = () => {
  const [adminBanners, setAdminBanners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/banners/page/Shop`)
      setAdminBanners(response.data)
    } catch (err) {
      console.error('Error loading banners:', err)
      setAdminBanners([])
    } finally {
      setLoading(false)
    }
  }

  // FIXED: Static Banner Component with proper key and reduced animations
  const StaticBanner = () => (
    <div className="shop-hero-wrapper">
      <div className="shop-hero-overlay"></div>

      <div className="shop-hero-content">
        <div className="shop-text-container static-banner-text">
          <h1 className="shop-main-title static-title">
            Elevate Your <span className="shop-title-emphasis">Essentials</span>
          </h1>

          <div className="shop-divider static-divider" />

          <p className="shop-subtitle static-subtitle">
            Curated collection of premium products for the discerning customer
          </p>

          <button className="shop-cta-button static-button">
            <FiShoppingBag className="shop-cart-icon" />
            Shop Now
            <FiArrowRight className="shop-arrow-icon" />
          </button>
        </div>
       
        <div className="shop-image-container static-image">
          <img src={farmerbg} className="farmer-bg" alt="Premium products" />
        </div>
      </div>
    </div>
  )

  // DYNAMIC Admin Banner Slide Component
  const AdminBannerSlide = ({ banner }) => {
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

    // Get alignment classes
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
  }

  if (loading) {
    return <Loader text="Loading Banner..." height="70vh" />
  }

  // If no admin banners, show static banner
  if (adminBanners.length === 0) {
    return <StaticBanner />
  }

  // If admin banners exist, show carousel
  const allSlides = [
    { id: 'static', type: 'static' },
    ...adminBanners.map(banner => ({ id: banner._id, type: 'admin', banner }))
  ]

  return (
    <div className="dynamic-carousel-wrapper">
      <Carousel
        interval={5000}
        controls={true}
        indicators={true}
        touch={true}
        className="hero-carousel"
        fade={false}
      >
        {allSlides.map((slide) => (
          <Carousel.Item key={slide.id}>
            {slide.type === 'static' ? (
              <StaticBanner />
            ) : (
              <AdminBannerSlide banner={slide.banner} />
            )}
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  )
}

export default ShopHero
