import React, { useState, useRef } from 'react';
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaShoppingCart,
  FaHeart,
  FaShareAlt,
  FaArrowLeft,
  FaTruck,
  FaShieldAlt,
  FaLeaf,
  FaCheckCircle,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaHome,
  FaMoneyBillWave,
  FaCreditCard,
  FaChevronLeft,
  FaChevronRight,
  FaCopy,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaTelegram
} from 'react-icons/fa';
import { GiReturnArrow } from 'react-icons/gi';
import ProductCard from './ProductCard';
import './ProductDetails.css';
import CheckoutFlow from './CheckoutFlow';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const backendRootURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProductDetails = ({
  product,
  relatedProducts = [],
  onBack,
  onAddToCart,
  onCheckout,
  onProductSelect,
  navigateToCategory,
  onRequireLogin,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const carouselRef = useRef(null);

  // Checkout Flow states
  const [showCheckoutFlow, setShowCheckoutFlow] = useState(false);

  // Share functionality states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [showShareMessage, setShowShareMessage] = useState(false);

  const [activeTab, setActiveTab] = useState('description');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle window resize for mobile detection
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabContents = {
    description: product?.description || "No description available.",
    use: product?.use || "No usage information available.",
    benefits: product?.benefits || "No benefits information available.",
    application: product?.applicationMethod || "No application method provided."
  };

  if (!product) {
    return (
      <div className="product-details-container">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Back to Products
        </button>
        <div className="error-message">Product not found</div>
      </div>
    );
  }

  const productImages = product.images || [product.image || ''];

  // Share functionality
  const generateShareData = () => {
    const productUrl = window.location.href;
    const productName = product.name || product.title || 'Check out this product';
    const productPrice = `₹${(product.price || 0).toLocaleString()}`;
    const shareText = `${productName} - ${productPrice}`;
    const shareDescription = product.description ? 
      product.description.substring(0, 100) + '...' : 
      'Amazing product at great price!';

    return {
      title: productName,
      text: `${shareText}\n${shareDescription}`,
      url: productUrl
    };
  };

  const handleShare = async () => {
    const shareData = generateShareData();

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showTemporaryMessage('Product shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          // If sharing fails, show share options modal
          setShowShareModal(true);
        }
      }
    } else {
      // Fallback: show share options modal
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async () => {
    const shareData = generateShareData();
    const textToCopy = `${shareData.text}\n${shareData.url}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      showTemporaryMessage('Link copied to clipboard!');
      setShowShareModal(false);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showTemporaryMessage('Link copied to clipboard!');
      setShowShareModal(false);
    }
  };

  const shareToSocialMedia = (platform) => {
    const shareData = generateShareData();
    const encodedText = encodeURIComponent(shareData.text);
    const encodedUrl = encodeURIComponent(shareData.url);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareModal(false);
    showTemporaryMessage(`Shared to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`);
  };

  const showTemporaryMessage = (message) => {
    setShareMessage(message);
    setShowShareMessage(true);
    setTimeout(() => {
      setShowShareMessage(false);
    }, 3000);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<FaStar key={i} className="star filled" />);
      else if (i === fullStars + 1 && hasHalfStar) stars.push(<FaStarHalfAlt key={i} className="star filled" />);
      else stars.push(<FaRegStar key={i} className="star" />);
    }
    return stars;
  };

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity);
  };

  const handleBuyNowClick = () => {
    if (!user) {
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    setShowCheckoutFlow(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckoutFlow(false);
  };

  const handleOrderComplete = (orderData) => {
    console.log('Order completed:', orderData);
    if (onCheckout) {
      onCheckout({
        product,
        quantity,
        orderData
      });
    }
    setShowCheckoutFlow(false);
  };

  const handleCarouselNav = (direction) => {
    const container = carouselRef.current;
    if (!container) return;

    const cardWidth = isMobile ? 280 : 320;
    const gap = isMobile ? 16 : 24;
    const scrollAmount = (cardWidth + gap) * (direction === 'next' ? 1 : -1);

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });

    if (direction === 'next' && currentSlide < relatedProducts.length - (isMobile ? 2 : 4)) {
      setCurrentSlide(currentSlide + 1);
    } else if (direction === 'prev' && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const totalPrice = (product.price * quantity).toLocaleString();
  const isOutOfStock = product.stock !== undefined ? product.stock < 5 : false;

  return (
    <div className="product-details-container">
      <button className="back-button" onClick={onBack}>
        <FaArrowLeft /> Back to Products
      </button>

      {/* Share Success Message */}
      {showShareMessage && (
        <div className="share-message">
          <FaCheckCircle /> {shareMessage}
        </div>
      )}

      <div className="product-details-grid">
        {/* Product Images */}
        <div className="product-images">
          {productImages.length > 1 && (
            <div className="thumbnail-container">
              {productImages.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={img ? `${backendRootURL}${img}` : 'https://via.placeholder.com/100?text=No+Image'}
                    alt={`${product.name || product.title} thumbnail ${index}`}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "contain",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="main-image">
            <img
              src={productImages[selectedImage] ? `${backendRootURL}${productImages[selectedImage]}` : 'https://via.placeholder.com/500x500?text=No+Image'}
              alt={product.name || product.title || 'Product Image'}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=Product+Image'; }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "fill",
                borderRadius: "8px",
                display: "block",
                margin: "0 auto"
              }}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-header">
            <h1>{product.name || product.title || 'Untitled Product'}</h1>
            <div className="product-actions">
              <button className="share-btn" onClick={handleShare}>
                <FaShareAlt /> Share
              </button>
            </div>
          </div>

          <div className="rating-container">
            <div className="stars">
              {renderStars(product.rating || 0)}
            </div>
            <span className="rating-value">{(product.rating || 0).toFixed(1)}</span>
            
          </div>

          <div className="price-container">
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
            )}
            <span className="current-price">₹{(product.price || 0).toLocaleString()}</span>
            {product.originalPrice && product.price && (
              <span className="discount-percent">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <div className="quantity-total">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => handleQuantityChange(-1)}>-</button>
                <span>{quantity}</span>
                <button onClick={() => handleQuantityChange(1)}>+</button>
              </div>
            </div>
            <div className="total-price">
              Total: ₹{totalPrice}
            </div>
          </div>

          <div className={`stock ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
            {isOutOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <FaCheckCircle /> In Stock
              </>
            )}
          </div>

          <div className="pd-tabs-nav">
            {[
              { key: 'description', label: 'Description' },
              { key: 'use', label: 'Use' },
              { key: 'benefits', label: 'Benefits' },
              { key: 'application', label: 'Application Method' }
            ].map(tab => (
              <button
                key={tab.key}
                className={`pd-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="pd-tab-content">
            {tabContents[activeTab]}
          </div>

          {product.features && product.features.length > 0 && (
            <div className="features">
              <h3>Features</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>
                    <FaLeaf /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="action-buttons">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
            >
              <FaShoppingCart /> Add to Cart
            </button>
            <button
              className="buy-now-btn"
              onClick={handleBuyNowClick}
              disabled={isOutOfStock}
            >
              Buy Now
            </button>
          </div>

          <div className="product-policies">
            <div className="policy">
              <FaTruck />
              <span>Free delivery on orders over ₹500</span>
            </div>
            <div className="policy">
              <GiReturnArrow />
              <span>7-day easy returns</span>
            </div>
            <div className="policy">
              <FaShieldAlt />
              <span>1-year warranty</span>
            </div>
          </div>
        </div>
      </div>

     { /* ... other code ... */ }

{/* Related Products Section */}
{relatedProducts.length > 0 && (
  <div className="related-products-section">
    <div className="section-header">
      <h2 className="section-title">Recommended For You</h2>
      <p className="section-subtitle">More products from {product.category}</p>
    </div>

    {isMobile ? (
      <>
        {/* Mobile Grid */}
        <div className="mobile-grid">
          <div className="related-products-grid">
            {relatedProducts.slice(0, 6).map((relatedProduct) => (
              <div key={relatedProduct._id || relatedProduct.id} className="related-product-wrapper">
                <ProductCard
                  product={relatedProduct}
                  onProductSelect={onProductSelect}
                  onAddToCart={onAddToCart}
                  showQuickView={false}
                  showWishlist={true}
                  onRequireLogin={onRequireLogin}
                />
              </div>
            ))}
          </div>
          {relatedProducts.length > 6 && (
            <div className="mobile-view-more">
              <button
                className="mobile-view-more-btn"
                onClick={() => navigateToCategory(product.category)}
              >
                View All {relatedProducts.length - 6} More
              </button>
            </div>
          )}
        </div>
      </>
    ) : (
      <>
        {/* Desktop: Do NOT show related products list or carousel */}

        {/* But show "View All in <category>" button */}
        <div className="view-all-container">
          <button
            className="view-all-btn"
            onClick={() => navigateToCategory(product.category)}
          >
            View All in {product.category}
          </button>
        </div>
      </>
    )}
  </div>
)}

{ /* ... other code ... */ }

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share this product</h3>
              <button className="share-modal-close" onClick={() => setShowShareModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="share-modal-content">
              <div className="share-product-info">
                <img 
                  src={product.image ? `${backendRootURL}${product.image}` : 'https://via.placeholder.com/60x60?text=Product'}
                  alt={product.name || product.title}
                  className="share-product-image"
                />
                <div className="share-product-details">
                  <h4>{product.name || product.title}</h4>
                  <p>₹{(product.price || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="share-options">
                <button className="share-option copy-link" onClick={copyToClipboard}>
                  <FaCopy />
                  <span>Copy Link</span>
                </button>
                
                <button className="share-option facebook" onClick={() => shareToSocialMedia('facebook')}>
                  <FaFacebook />
                  <span>Facebook</span>
                </button>
                
                <button className="share-option twitter" onClick={() => shareToSocialMedia('twitter')}>
                  <FaTwitter />
                  <span>Twitter</span>
                </button>
                
                <button className="share-option whatsapp" onClick={() => shareToSocialMedia('whatsapp')}>
                  <FaWhatsapp />
                  <span>WhatsApp</span>
                </button>
                
                <button className="share-option telegram" onClick={() => shareToSocialMedia('telegram')}>
                  <FaTelegram />
                  <span>Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Flow Component */}
      {showCheckoutFlow && (
        <CheckoutFlow
          product={product}
          quantity={quantity}
          onClose={handleCloseCheckout}
          onOrderComplete={handleOrderComplete}
        />
      )}
    </div>
  );
};

export default ProductDetails;
