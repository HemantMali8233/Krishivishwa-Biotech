import React, { useState, useRef, useMemo, useEffect } from 'react';
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
import { getProductVariants, getEffectiveProduct, formatVariantLabel } from '../../utils/productVariants';

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
  const [variantIndex, setVariantIndex] = useState(0);
  const orderPlacedRef = useRef(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const variants = useMemo(() => getProductVariants(product), [product]);
  const displayProduct = useMemo(
    () => getEffectiveProduct(product, variantIndex),
    [product, variantIndex]
  );

  useEffect(() => {
    setVariantIndex(0);
  }, [product?._id, product?.id]);

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
    onAddToCart(displayProduct, localQuantity);
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

  const price = displayProduct.price;
  const stock = displayProduct.stock;
  const image = displayProduct.image;
  const origPrice = displayProduct.originalPrice;

  return (
    <>
      <div
        className="product-card"
        style={{ animationDelay: `${animationDelay}s` }}
      >
        <div className="product-card__image">
          <img
            src={
              image
                ? `${backendRootURL}${image}`
                : '/placeholder.svg?height=240&width=240&query=product'
            }
            alt={product.name}
            onClick={() => onProductSelect(product)}
          />
          {stock === 0 && (
            <span className="product-card__badge product-card__badge--out">
              Out of Stock
            </span>
          )}
          {stock > 0 && stock < 5 && (
            <span className="product-card__badge product-card__badge--low">
              Only {stock} left
            </span>
          )}
          {stock >= 5 && origPrice != null && Number(origPrice) > 0 && (
            <span className="product-card__badge product-card__badge--discount">
              {Math.round(
                ((Number(origPrice) - price) / Number(origPrice)) *
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
              ₹{Number(price).toLocaleString()}
            </span>
            {origPrice != null && Number(origPrice) > 0 && stock >= 5 && (
              <span className="product-card__original-price">
                ₹{Number(origPrice).toLocaleString()}
              </span>
            )}
          </div>
          <div
            className="product-card__variant-pills"
            role="group"
            aria-label="Pack size"
          >
            {variants.map((v, i) => {
              const unavailable = Number(v.stock) <= 0;
              return (
                <button
                  key={i}
                  type="button"
                  className={
                    variantIndex === i
                      ? "product-card__variant-pill product-card__variant-pill--active"
                      : "product-card__variant-pill"
                  }
                  onClick={() => !unavailable && setVariantIndex(i)}
                  disabled={unavailable}
                  aria-pressed={variantIndex === i}
                >
                  {formatVariantLabel(v)}
                </button>
              );
            })}
          </div>
          <div className="product-card__buttons">
            <button
              className="product-card__add-cart"
              onClick={handleAddToCart}
              disabled={stock === 0}
            >
              <FaShoppingCart /> Add to Cart
            </button>
            <button
              className="product-card__buy-now"
              onClick={handleBuyNow}
              disabled={stock === 0}
            >
              <FaBolt /> Buy Now
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <CheckoutFlow
          product={displayProduct}
          quantity={localQuantity}
          onClose={() => {
            if (!orderPlacedRef.current && onAddToCart) {
              onAddToCart(displayProduct, localQuantity);
            }
            orderPlacedRef.current = false;
            setShowPayment(false);
          }}
          onOrderComplete={() => {
            orderPlacedRef.current = true;
            setShowPayment(false);
          }}
        />
      )}
    </>
  );
};

export default ProductCard;
