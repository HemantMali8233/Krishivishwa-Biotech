import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { FaStar, FaRegClock, FaArrowRight, FaArrowUp } from 'react-icons/fa';
import { BsTrophy } from 'react-icons/bs';
import '../ShopNow/ProductSection.css';

const ProductSections = ({
  products = [],
  onProductSelect,
  onAddToCart,
  onViewAll,
  isMobile = false,
  onRequireLogin,
}) => {
  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState(new Set());

  // Define your sections configuration
  const sectionConfig = [
    {
      id: "best-sellers",
      title: "Best Sellers",
      icon: <BsTrophy className="ps-section-icon" />,
      bgColor: "ps-section-best-sellers",
    },
    {
      id: "top-rated",
      title: "Top Rated",
      icon: <FaStar className="ps-section-icon" />,
      bgColor: "ps-section-top-rated",
    },
    {
      id: "new-arrivals",
      title: "New Arrivals",
      icon: <FaRegClock className="ps-section-icon" />,
      bgColor: "ps-section-new-arrivals",
    }
  ];

  // Toggle section expansion
  const toggleSectionExpansion = (sectionId) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);

    // Call onViewAll if provided (for analytics/tracking)
    if (onViewAll) {
      onViewAll(sectionId);
    }
  };

  const renderSection = ({ id, title, icon, bgColor }) => {
    // Filter products for this specific section
    const allSectionProducts = products.filter(product => 
      product.sections?.includes(id)
    );

    if (allSectionProducts.length === 0) return null;

    const isExpanded = expandedSections.has(id);
    const initialProducts = allSectionProducts.slice(0, 4);
    const remainingProducts = allSectionProducts.slice(4);
    const hasMoreProducts = remainingProducts.length > 0;

    return (
      <div className={`ps-product-section ${bgColor || ''}`} key={id}>
        <div className="ps-section-header">
          <div className="ps-section-header-left">
            <div className="ps-icon-container">{icon}</div>
            <h2 className="ps-section-title">{title}</h2>
            <span className="ps-product-count">({allSectionProducts.length})</span>
          </div>
          {hasMoreProducts && !isMobile && (
            <button
              className={`ps-view-all-btn ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleSectionExpansion(id)}
              aria-label={isExpanded ? `View less ${title}` : `View all ${title}`}
            >
              {isExpanded ? (
                <>View Less <FaArrowUp /></>
              ) : (
                <>View All ({remainingProducts.length} more) <FaArrowRight /></>
              )}
            </button>
          )}
        </div>

        {/* Initial 4 products */}
        <div className="ps-product-grid">
          {initialProducts.map((product, index) => (
            <ProductCard
              key={product._id || product.id || index}
              product={product}
              quantity={1}
              onQuantityChange={() => {}}
              onProductSelect={onProductSelect}
              onAddToCart={onAddToCart}
              animationDelay={index * 0.1}
              onRequireLogin={onRequireLogin}
            />
          ))}
        </div>

        {/* Expanded products section */}
        {isExpanded && remainingProducts.length > 0 && (
          <div className="ps-expanded-section">
            <div className="ps-expanded-divider">
              <span className="ps-expanded-text">Showing all {title}</span>
            </div>
            <div className="ps-product-grid ps-expanded-grid">
              {remainingProducts.map((product, index) => (
                <ProductCard
                  key={product._id || product.id || `expanded-${index}`}
                  product={product}
                  quantity={1}
                  onQuantityChange={() => {}}
                  onProductSelect={onProductSelect}
                  onAddToCart={onAddToCart}
                  animationDelay={(index + 4) * 0.1}
                  onRequireLogin={onRequireLogin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mobile View All Button */}
        {hasMoreProducts && isMobile && (
          <div className="ps-mobile-view-all">
            <button
              className={`ps-mobile-view-all-btn ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleSectionExpansion(id)}
              aria-label={isExpanded ? `View less ${title}` : `View all ${title}`}
            >
              {isExpanded ? (
                <>Show Less <FaArrowUp /></>
              ) : (
                <>Show All {remainingProducts.length} More <FaArrowRight /></>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ps-product-sections-container">
      {sectionConfig.map((section) => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProductSections;
