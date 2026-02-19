import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';
import { FiFilter, FiShoppingBag, FiGrid, FiList, FiChevronDown } from 'react-icons/fi';
import { BiSearch } from 'react-icons/bi';
import { BsStars, BsSortAlphaDown, BsCurrencyDollar, BsGem } from 'react-icons/bs';

const ProductGrid = ({
  products,
  shopState,
  quantities,
  onStateUpdate,
  onQuantityChange,
  onProductSelect,
  onAddToCart,
  totalProducts,
  onRequireLogin,
}) => {
  return (
    <div className="epgrid-main-container">
      

      {/* Products Header */}
      <div className="epgrid-header-card">
        <div className="epgrid-header-content">
          <div className="epgrid-info-section">
            <h1 className="epgrid-main-title">
              <FiShoppingBag className="epgrid-title-icon" />
              <span>Our Collection</span>
            </h1>
            <p className="epgrid-products-count">
              Showing <span className="epgrid-count-highlight">{products.length}</span> of{' '}
              <span className="epgrid-count-highlight">{totalProducts}</span> products
            </p>
          </div>

          <div className="epgrid-controls-section">
            {/* Sort Dropdown */}
            <div className="epgrid-sort-wrapper">
              <select
                value={shopState.sortBy}
                onChange={(e) => onStateUpdate({ sortBy: e.target.value })}
                className="epgrid-sort-select"
              >
                <option value="featured"><BsStars /> Featured</option>
                <option value="name"><BsSortAlphaDown /> Name</option>
                <option value="price-low"><BsCurrencyDollar /> Price: Low to High</option>
                <option value="price-high"><BsGem /> Price: High to Low</option>
              </select>
              <FiChevronDown className="epgrid-sort-chevron" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="epgrid-empty-state">
          <div className="epgrid-empty-icon">
            <BiSearch />
          </div>
          <h3 className="epgrid-empty-title">No products found</h3>
          <p className="epgrid-empty-subtitle">
            Try adjusting your filters or search terms
          </p>
          <button
            className="epgrid-empty-action-btn"
            onClick={() => onStateUpdate({
              selectedCategories: [],
              maxPrice: 100000,
              searchQuery: ''
            })}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={`epgrid-products-container ${shopState.viewType === 'grid'
            ? 'epgrid-products-container--grid'
            : 'epgrid-products-container--list'
          }`}>
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id] || 1}
                onQuantityChange={onQuantityChange}
                onProductSelect={onProductSelect}
                onAddToCart={onAddToCart}
                animationDelay={index * 0.05}
                onRequireLogin={onRequireLogin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;