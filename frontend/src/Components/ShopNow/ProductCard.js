import React, { useState } from 'react';
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaShoppingCart,
  FaEye,
  FaBolt
} from 'react-icons/fa';
import './ProductCard.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckoutFlow from './CheckoutFlow';

const backendRootURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProductCard = ({
  product,
  quantity,
  onQuantityChange,
  onProductSelect,
  onAddToCart,
  animationDelay,
  onRequireLogin,
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(quantity || 1);
  const { user } = useAuth();
  const navigate = useNavigate();

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar key={i} className="product-card__star product-card__star--filled" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt key={i} className="product-card__star product-card__star--filled" />
        );
      } else {
        stars.push(<FaRegStar key={i} className="product-card__star" />);
      }
    }
    return stars;
  };

  const handleQuantityChange = (value) => {
    const newQuantity = localQuantity + value;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setLocalQuantity(newQuantity);
      if (onQuantityChange) {
        onQuantityChange(product.id, newQuantity);
      }
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, localQuantity);
  };

  const handleBuyNow = () => {
    if (!user) {
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    setShowPayment(true);
  };

  return (
    <>
      <div
        className="product-card"
        style={{ animationDelay: `${animationDelay}s` }}
      >
        <div className="product-card__image">
          <img
            src={
              product.image
                ? `${backendRootURL}${product.image}`
                : '/placeholder.svg?height=240&width=240&query=product'
            }
            alt={product.name}
            onClick={() => onProductSelect(product)}
          />
          {product.stock === 0 && (
            <span className="product-card__badge product-card__badge--out">
              Out of Stock
            </span>
          )}
          {product.stock > 0 && product.stock < 5 && (
            <span className="product-card__badge product-card__badge--low">
              Only {product.stock} left
            </span>
          )}
          {product.stock >= 5 && product.originalPrice && (
            <span className="product-card__badge product-card__badge--discount">
              {Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) *
                  100
              )}
              % off
            </span>
          )}
          <button
            className="product-card__quick-view"
            onClick={() => onProductSelect(product)}
          >
            <FaEye /> View
          </button>
        </div>

        <div className="product-card__content">
          <span className="product-card__category">{product.category}</span>
          <h3>{product.name}</h3>
          <div className="product-card__rating">
            {renderStars(product.rating || 0)}
            <span>{(product.rating || 0).toFixed(1)}</span>
          </div>
          <div className="product-card__price">
            <span className="product-card__current-price">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.stock >= 5 && (
              <span className="product-card__original-price">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="product-card__buttons">
            <button
              className="product-card__add-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <FaShoppingCart /> Add to Cart
            </button>
            <button
              className="product-card__buy-now"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              <FaBolt /> Buy Now
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <CheckoutFlow
          product={product}
          quantity={localQuantity}
          onClose={() => setShowPayment(false)}
          onOrderComplete={() => setShowPayment(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
