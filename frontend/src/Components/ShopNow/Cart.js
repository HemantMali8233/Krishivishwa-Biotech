import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaChevronDown, FaChevronUp, FaTrash, FaTruck, FaStar, FaTag, FaPercent } from 'react-icons/fa';
import { FiArrowLeft, FiPackage, FiCreditCard, FiLock, FiGift, FiShoppingBag } from 'react-icons/fi';
import { RiCoupon3Line, RiSecurePaymentLine } from 'react-icons/ri';
import { MdLocalShipping, MdSecurity } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';
import CheckoutFlow from './CheckoutFlow';
import './Cart.css';

const backendRootURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Cart = ({
  items,
  onUpdateItem,
  onRemoveItem,
  onClose,
  onCheckout,
  onApplyCoupon,
  isAuthenticated = false,
  onRequireLogin,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [showCouponField, setShowCouponField] = useState(false);
  const [showCheckoutFlow, setShowCheckoutFlow] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 500 ? 0 : 99;
  const total = subtotal + shippingFee;
  const freeShippingTarget = 500;
  const remainingForFreeShipping = freeShippingTarget - subtotal;
  const shippingProgress = Math.min((subtotal / freeShippingTarget) * 100, 100);

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (onApplyCoupon) {
      onApplyCoupon(couponCode);
    }
    setCouponCode('');
    setShowCouponField(false);
  };

  const handleCheckoutComplete = (orderData) => {
    setShowCheckoutFlow(false);
    if (onCheckout) {
      onCheckout(orderData);
    }
  };

  return (
    <div className="clean-cart-page">
      {/* Clean Header */}
      <div className="clean-cart-header">
        <div className="header-container">
          <button className="clean-back-btn" onClick={onClose}>
            <FiArrowLeft />
            <span>Continue Shopping</span>
          </button>
          
          <div className="cart-title-area">
            <div className="title-with-icon">
              <FiShoppingBag className="main-cart-icon" />
              <div className="title-content">
                <h1>Shopping Cart</h1>
                <p>{items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
              </div>
            </div>
            
            {/* Shipping Progress Bar */}
            {remainingForFreeShipping > 0 ? (
              <div className="shipping-progress">
                <div className="progress-text">
                  <FaTruck className="truck-icon" />
                  <span>₹{remainingForFreeShipping.toLocaleString()} more for free shipping</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${shippingProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="free-shipping-achieved">
                <HiSparkles className="sparkle-icon" />
                <span>Free shipping activated!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="clean-cart-container">
        {items.length === 0 ? (
          <div className="clean-empty-cart">
            <div className="empty-icon-wrapper">
              <FiShoppingBag className="empty-icon" />
            </div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <button className="clean-shop-btn" onClick={onClose}>
              <FiGift />
              <span>Start Shopping</span>
            </button>
          </div>
        ) : (
          <div className="clean-cart-layout">
            {/* Products Section */}
            <div className="products-section">
              <div className="section-header">
                <FiPackage className="section-icon" />
                <h2>Order Items</h2>
                <span className="item-count">{items.length} products</span>
              </div>
              
              {isMobile ? (
                // Mobile view - list layout
                <div className="mobile-products-list">
                  {items.map((item, index) => (
                    <div key={item._id || item.id} className="mobile-product-card">
                      <div className="mobile-product-image-wrapper">
                        <img
                          src={item.image ? `${backendRootURL}${item.image}` : "https://via.placeholder.com/80"}
                          alt={item.name}
                          className="mobile-product-image"
                        />
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="mobile-discount-label">
                            <FaPercent />
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>
                      
                      <div className="mobile-product-details">
                        <h3 className="mobile-product-title">{item.name}</h3>
                        <p className="mobile-product-category">{item.category}</p>
                        
                        {item.rating && (
                          <div className="mobile-rating">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                className={i < Math.floor(item.rating) ? 'star-active' : 'star-inactive'} 
                              />
                            ))}
                            <span className="mobile-rating-text">({item.rating})</span>
                          </div>
                        )}
                        
                        <div className="mobile-price-info">
                          <span className="mobile-current-price">₹{item.price.toLocaleString()}</span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="mobile-original-price">₹{item.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        
                        <div className="mobile-quantity-control">
                          <div className="quantity-label">Quantity:</div>
                          <div className="mobile-quantity-buttons">
                            <button
                              className="qty-btn qty-minus"
                              onClick={() => onUpdateItem(item._id || item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FaChevronDown />
                            </button>
                            <span className="qty-display">{item.quantity}</span>
                            <button
                              className="qty-btn qty-plus"
                              onClick={() => onUpdateItem(item._id || item.id, item.quantity + 1)}
                            >
                              <FaChevronUp />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mobile-item-total">
                          <span>Total: ₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                        
                        <button
                          className="mobile-remove-btn"
                          onClick={() => onRemoveItem(item._id || item.id)}
                          title="Remove item"
                        >
                          <FaTrash />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop view - table layout
                <div className="products-table">
                  <div className="table-header">
                    <div className="th-product">Product</div>
                    <div className="th-price">Unit Price</div>
                    <div className="th-quantity">Quantity</div>
                    <div className="th-total">Total</div>
                    <div className="th-action">Action</div>
                  </div>
                  
                  <div className="table-body">
                    {items.map((item, index) => (
                      <div key={item._id || item.id} className="table-row" style={{ '--index': index }}>
                        <div className="td-product">
                          <div className="product-info">
                            <div className="product-image-wrapper">
                              <img
                                src={item.image ? `${backendRootURL}${item.image}` : "https://via.placeholder.com/80"}
                                alt={item.name}
                                className="product-image"
                              />
                              {item.originalPrice && item.originalPrice > item.price && (
                                <div className="discount-label">
                                  <FaPercent />
                                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                                </div>
                              )}
                            </div>
                            <div className="product-details">
                              <h3 className="product-title">{item.name}</h3>
                              <p className="product-category">{item.category}</p>
                              {item.rating && (
                                <div className="rating">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar 
                                      key={i} 
                                      className={i < Math.floor(item.rating) ? 'star-active' : 'star-inactive'} 
                                    />
                                  ))}
                                  <span className="rating-text">({item.rating})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="td-price">
                          <div className="price-info">
                            <span className="current-price">₹{item.price.toLocaleString()}</span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="original-price">₹{item.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="td-quantity">
                          <div className="quantity-control">
                            <button
                              className="qty-btn qty-minus"
                              onClick={() => onUpdateItem(item._id || item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FaChevronDown />
                            </button>
                            <span className="qty-display">{item.quantity}</span>
                            <button
                              className="qty-btn qty-plus"
                              onClick={() => onUpdateItem(item._id || item.id, item.quantity + 1)}
                            >
                              <FaChevronUp />
                            </button>
                          </div>
                        </div>
                        
                        <div className="td-total">
                          <span className="item-total">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                        
                        <div className="td-action">
                          <button
                            className="remove-btn"
                            onClick={() => onRemoveItem(item._id || item.id)}
                            title="Remove item"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="summary-section">
              <div className="section-header">
                <RiSecurePaymentLine className="section-icon" />
                <h2>Order Summary</h2>
              </div>
              
              <div className="summary-card">
                <div className="summary-details">
                  <div className="summary-row">
                    <span className="label">Subtotal</span>
                    <span className="value">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">
                      <MdLocalShipping className="shipping-icon" />
                      Shipping
                      {shippingFee === 0 && <span className="free-label">FREE</span>}
                    </span>
                    <span className={`value ${shippingFee === 0 ? 'free-shipping' : ''}`}>
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span className="label">Total</span>
                    <span className="value total-value">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  className="checkout-button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      if (onRequireLogin) {
                        onRequireLogin();
                      }
                      return;
                    }
                    setShowCheckoutFlow(true);
                  }}
                >
                  <FiLock className="checkout-icon" />
                  <span>Secure Checkout</span>
                </button>
                
                <div className="security-notice">
                  <MdSecurity className="security-icon" />
                  <span>256-bit SSL secured payments</span>
                </div>
              </div>
              
              {/* Coupon Section */}
              <div className="coupon-card">
                <div className="coupon-header">
                  <FaTag className="coupon-icon" />
                  <span>Have a discount code?</span>
                </div>
                {!showCouponField ? (
                  <button 
                    className="show-coupon-btn"
                    onClick={() => setShowCouponField(true)}
                  >
                    Apply Coupon
                  </button>
                ) : (
                  <form className="coupon-form" onSubmit={handleCouponSubmit}>
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        className="coupon-input"
                      />
                      <button type="submit" className="apply-coupon-btn">Apply</button>
                    </div>
                    <button 
                      type="button"
                      className="cancel-coupon-btn"
                      onClick={() => setShowCouponField(false)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {showCheckoutFlow && (
          <CheckoutFlow
            cartItems={items}
            onClose={() => setShowCheckoutFlow(false)}
            onOrderComplete={handleCheckoutComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Cart;