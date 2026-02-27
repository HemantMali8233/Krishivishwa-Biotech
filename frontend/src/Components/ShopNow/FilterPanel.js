import React from 'react';
import { 
  FiFilter, 
  FiX, 
  FiSearch, 
  FiTag, 
  FiRefreshCw 
} from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";
import './FilterPanel.css';

const FilterPanel = ({ 
  shopState, 
  categories, 
  onStateUpdate, 
  onReset, 
  productCounts 
}) => {
  // Handle category checkbox logic
  const handleCategoryChange = (category, checked) => {
    const newCategories = checked 
      ? [...shopState.selectedCategories, category] 
      : shopState.selectedCategories.filter(cat => cat !== category);
    
    onStateUpdate({ selectedCategories: newCategories });
  };

  return (
    <div className={`efilter-panel ${shopState.showMobileFilters ? 'efilter-panel--mobile-open' : ''}`}>
      <div className="efilter-content-card">

        {/* Header */}
        <div className="efilter-header">
          <div className="efilter-title-section">
            <div className="efilter-icon">
              <FiFilter className="efilter-icon-svg" />
            </div>
            <h2 className="efilter-title">Filters</h2>
          </div>
          <button 
            className="efilter-close-btn"
            onClick={() => onStateUpdate({ showMobileFilters: false })}
          >
            <FiX className="efilter-close-icon" />
          </button>
        </div>

        {/* Search Section */}
        <div className="efilter-section">
          <h3 className="efilter-section-title">Search Products</h3>
          <div className="efilter-search-wrapper">
            <div className="efilter-search-icon">
              <FiSearch className="efilter-search-icon-svg" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={shopState.searchQuery}
              onChange={(e) => onStateUpdate({ searchQuery: e.target.value })}
              className="efilter-search-input"
            />
          </div>
        </div>

        {/* Price Range Section */}
        <div className="efilter-section">
          <h3 className="efilter-section-title">Price Range</h3>
          <div className="efilter-price-container">
            <div className="efilter-price-display">
              <span className="efilter-price-label">Max Price:</span>
              <span className="efilter-price-value">
                <FaRupeeSign className="efilter-dollar-icon" />
                {shopState.maxPrice.toLocaleString()}
              </span>
            </div>
            <div className="efilter-slider-wrapper">
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={shopState.maxPrice}
                onChange={(e) => onStateUpdate({ maxPrice: parseInt(e.target.value) })}
                className="efilter-price-slider"
              />
              <div className="efilter-slider-track"></div>
            </div>
            <div className="efilter-price-range-labels">
              <span>₹0</span>
              <span>₹1,000</span>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="efilter-section">
          <h3 className="efilter-section-title">
            <FiTag className="efilter-category-icon" />
            Categories
          </h3>
          <div className="efilter-categories-list">
            {categories && categories.length > 0 ? (
              categories.map(category => (
                <label key={category} className="efilter-category-item">
                  <input
                    type="checkbox"
                    checked={shopState.selectedCategories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="efilter-category-checkbox"
                  />
                  <div className="efilter-category-content">
                    <span className="efilter-category-name">{category}</span>
                    <span className="efilter-category-count">
                      {productCounts[category] || 0}
                    </span>
                  </div>
                </label>
              ))
            ) : (
              <p className="efilter-no-categories">No categories available</p>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <button onClick={onReset} className="efilter-reset-btn">
          <FiRefreshCw className="efilter-reset-icon" />
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
