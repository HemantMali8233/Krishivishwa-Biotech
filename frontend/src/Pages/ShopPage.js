import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNavbar } from '../contexts/NavbarContext';
import Hero from '../Components/ShopNow/Hero';
import FilterPanel from '../Components/ShopNow/FilterPanel';
import ProductGrid from '../Components/ShopNow/ProductGrid';
import ProductDetails from '../Components/ShopNow/ProductDetails';
import Cart from '../Components/ShopNow/Cart';
import ProductSections from '../Components/ShopNow/ProductSection';
import ToastNotification from '../Components/ShopNow/ToastNotification';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaRegClock, FaFilter, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { BsTrophy } from 'react-icons/bs';
import './ShopPage.css';

const backendURL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCategory = location.state?.selectedCategory;

  const [shopState, setShopState] = useState({
    maxPrice: 1000,
    selectedCategories: initialCategory ? [initialCategory] : [],
    searchQuery: '',
    sortBy: 'featured',
    viewType: 'grid',
    showMobileFilters: false,
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirectFrom, setLoginRedirectFrom] = useState('/shop');
  const [visibleCount, setVisibleCount] = useState(50);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { token } = useAuth();
  const isAuthenticated = !!token;

  const {
    showNavbar,
    hideNavbar,
    updateNavbarCart,
    enableNavbarCart,
    disableNavbarCart,
    setNavbarCartHandler,
    clearNavbarCartHandler,
  } = useNavbar();

  const SECTIONS = [
    { id: 'new', name: 'New Arrivals', icon: <FaRegClock /> },
    { id: 'best', name: 'Best Sellers', icon: <BsTrophy /> },
    { id: 'top', name: 'Top Rated', icon: <FaStar /> },
  ];

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear incoming state
  useEffect(() => {
    if (initialCategory) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  // Navbar cart handler
  useEffect(() => {
    const openCart = () => setShowCart(true);
    setNavbarCartHandler(openCart);
    return () => clearNavbarCartHandler();
  }, []);

  // Update navbar cart icon count
  useEffect(() => updateNavbarCart(cartItems), [cartItems]);

  // Show/hide navbar
  useEffect(() => {
    if (detailProduct || showCart) {
      hideNavbar();
      disableNavbarCart();
    } else {
      showNavbar();
      enableNavbarCart();
    }
    return () => {
      showNavbar();
      disableNavbarCart();
    };
  }, [detailProduct, showCart]);

  // Fetch categories & products
  useEffect(() => {
    axios.get(`${backendURL}/product-categories`)
      .then(res => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
    axios.get(`${backendURL}/products`)
      .then(res => {
        setProducts(res.data.products || []);
        setVisibleCount(50);
      })
      .catch(() => setProducts([]));
  }, []);

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (shopState.selectedCategories.length &&
            !shopState.selectedCategories.includes(p.category)) {
          return false;
        }
        if (p.price > shopState.maxPrice) return false;
        if (
          shopState.searchQuery &&
          !p.name.toLowerCase().includes(shopState.searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (shopState.sortBy) {
          case 'price-low': return a.price - b.price;
          case 'price-high': return b.price - a.price;
          case 'name': return a.name.localeCompare(b.name);
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [products, shopState]);

  const updateShop = (upd) => setShopState((s) => ({ ...s, ...upd }));

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleRequireLogin = (from = '/shop') => {
    setLoginRedirectFrom(from);
    setShowLoginModal(true);
  };

  const addToCart = (prod, qty) => {
    const q = qty || quantities[prod._id] || 1;
    const idx = cartItems.findIndex((i) => i._id === prod._id);
    if (idx >= 0) {
      const arr = [...cartItems];
      arr[idx].quantity += q;
      setCartItems(arr);
      showToast(`${q} ${prod.name} added (total ${arr[idx].quantity})`);
    } else {
      setCartItems([...cartItems, { ...prod, quantity: q }]);
      showToast(`${q} ${prod.name} added`);
    }
  };

  const updateQty = (id, q) => {
    if (q < 1) return;
    setCartItems((c) =>
      c.map((item) => (item._id === id ? { ...item, quantity: q } : item))
    );
  };

  const removeItem = (id) => {
    const removed = cartItems.find((i) => i._id === id);
    setCartItems((c) => c.filter((i) => i._id !== id));
    if (removed) showToast(`${removed.name} removed`);
  };

  const resetFilters = () => {
    setShopState({
      maxPrice: 1000,
      selectedCategories: [],
      searchQuery: '',
      sortBy: 'featured',
      viewType: 'grid',
      showMobileFilters: false,
    });
    setVisibleCount(50);
  };

  // Toggle mobile filter panel
  const toggleMobileFilters = () => {
    updateShop({ showMobileFilters: !shopState.showMobileFilters });
  };

  // Close mobile filter panel
  const closeMobileFilters = () => {
    updateShop({ showMobileFilters: false });
  };

  if (detailProduct) {
    const related = products
      .filter((p) => p.category === detailProduct.category && p._id !== detailProduct._id)
      .slice(0, 4);
    return (
      <>
        <ProductDetails
          product={detailProduct}
          relatedProducts={related}
          onBack={() => setDetailProduct(null)}
          onAddToCart={addToCart}
          onCheckout={({ product, quantity }) => {
            addToCart(product, quantity);
            setShowCart(true);
          }}
          onProductSelect={setDetailProduct}
          navigateToCategory={(cat) => {
            setDetailProduct(null);
            updateShop({ selectedCategories: [cat], searchQuery: '' });
          }}
          onRequireLogin={handleRequireLogin}
        />
        {toast.show && (
          <ToastNotification message={toast.message} onClose={() => setToast({ show: false, message: '' })} />
        )}
      </>
    );
  }

  if (showCart) {
    return (
      <>
        <Cart
          items={cartItems}
          onUpdateItem={updateQty}
          onRemoveItem={removeItem}
          onClose={() => setShowCart(false)}
          onCheckout={() => {}}
          isAuthenticated={isAuthenticated}
          onRequireLogin={handleRequireLogin}
        />
        {toast.show && (
          <ToastNotification message={toast.message} onClose={() => setToast({ show: false, message: '' })} />
        )}
        {showLoginModal && (
          <div className="login-required-overlay">
            <div className="login-required-modal">
              <h3>Login required</h3>
              <p>You need to log in before buying products.</p>
              <div className="login-required-actions">
                <button
                  className="login-required-back"
                  onClick={() => setShowLoginModal(false)}
                >
                  Back
                </button>
                <button
                  className="login-required-login"
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login', {
                      state: { showSignup: false, from: loginRedirectFrom },
                    });
                  }}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="shop-now-container">
      <Hero title="Our Products" subtitle="Discover amazing products for your needs" />
      
      {/* Mobile Controls */}
      {isMobile && (
        <div className="mobile-controls">
          <button 
            className="mobile-filter-toggle" 
            onClick={toggleMobileFilters}
            aria-label="Open Filters"
          >
            <FaFilter /> Filters
          </button>
          <button 
            className="mobile-cart-toggle" 
            onClick={() => setShowCart(true)}
            aria-label="Open Cart"
          >
            <FaShoppingCart /> Cart ({cartItems.length})
          </button>
        </div>
      )}

      {/* Mobile Filter Overlay */}
      {isMobile && shopState.showMobileFilters && (
        <div className="mobile-filter-overlay" onClick={closeMobileFilters}></div>
      )}

      <div className="shop-content-container">
        <div className="shop-layout">
          {/* Filter Panel Container */}
          <div className={`filter-panel-container ${isMobile && shopState.showMobileFilters ? 'mobile-visible' : ''}`}>
            <FilterPanel
              shopState={shopState}
              categories={categoryNames}
              onStateUpdate={updateShop}
              onReset={resetFilters}
              onClose={closeMobileFilters}
              isMobile={isMobile}
              productCounts={categoryNames.reduce((a, c) => {
                a[c] = products.filter((p) => p.category === c).length;
                return a;
              }, {})}
            />
          </div>

          <main className="shop-main-content">
            <ProductGrid
              products={filtered.slice(0, visibleCount)}
              shopState={shopState}
              quantities={quantities}
              onStateUpdate={updateShop}
              onQuantityChange={(id, v) =>
                setQuantities((q) => ({ ...q, [id]: Math.max(1, parseInt(v, 10) || 1) }))
              }
              onProductSelect={setDetailProduct}
              onAddToCart={addToCart}
              totalProducts={products.length}
              isMobile={isMobile}
              onRequireLogin={handleRequireLogin}
            />
            {visibleCount < filtered.length && (
              <button onClick={() => setVisibleCount((c) => c + 50)} className="load-more-btn">
                Load More (50)
              </button>
            )}
            <ProductSections
              sections={SECTIONS}
              products={products}
              onProductSelect={setDetailProduct}
              onAddToCart={addToCart}
              isMobile={isMobile}
              onRequireLogin={handleRequireLogin}
            />
          </main>
        </div>
      </div>

      {/* Floating Cart Button (Desktop only) */}
      {!isMobile && (
        <button 
          className="floating-cart-btn" 
          onClick={() => setShowCart(true)}
          aria-label={`Cart (${cartItems.length})`}
        >
          <FaShoppingCart />
          {cartItems.length > 0 && (
            <span className="cart-badge">{cartItems.length}</span>
          )}
        </button>
      )}

      {toast.show && (
        <ToastNotification message={toast.message} onClose={() => setToast({ show: false, message: '' })} />
      )}

      {showLoginModal && (
        <div className="login-required-overlay">
          <div className="login-required-modal">
            <h3>Login required</h3>
            <p>You need to log in before buying products.</p>
            <div className="login-required-actions">
              <button
                className="login-required-back"
                onClick={() => setShowLoginModal(false)}
              >
                Back
              </button>
              <button
                className="login-required-login"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/login', {
                    state: { showSignup: false, from: loginRedirectFrom },
                  });
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
