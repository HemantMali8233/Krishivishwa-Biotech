"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import './Gallery.css';
import GalleryBanner from "../Components/GalleryBanner.jsx"
 
const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = BACKEND_URL + "/api";

const Icons = {
  LayoutGrid: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),

  Folder: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),

  ZoomIn: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),

  X: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),

  ArrowLeftCircle: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8L8 12L12 16" />
      <path d="M16 12H8" />
    </svg>
  ),

  ArrowRightCircle: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16L16 12L12 8" />
      <path d="M8 12H16" />
    </svg>
  ),

  Download: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),

  Share2: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),

  Search: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),

  Loader: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  ),

  CheckCircle: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M9 11l3 3L22 4" />
    </svg>
  )
};

export default function Gallery() {
  const [categories, setCategories] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [carouselWord, setCarouselWord] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState({
    isDownloading: false,
    success: false,
    error: null
  });
  const galleryRef = useRef(null);

  const words = ["Innovations", "Discoveries", "Breakthroughs", "Solutions", "Technologies", "Harvests"];

  function getCategoryId(item) {
    if (!item) return "";
    if (item.categoryId) {
      if (typeof item.categoryId === "string") return item.categoryId;
      if (typeof item.categoryId === "object") return item.categoryId._id || "";
    }
    return "";
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [catRes, itemRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/gallery-items`),
        ]);
        setCategories([
          { id: "all", name: "All Gallery", color: "#4a90e2", icon: Icons.LayoutGrid },
          ...catRes.data.map(cat => ({ ...cat, id: cat._id, icon: null }))
        ]);
        setGalleryItems(itemRes.data);
      } catch (error) {
        console.error("Failed to fetch gallery data:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCarouselWord(w => (w + 1) % words.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredImages = useCallback(() => {
    let filtered = activeCategory === "all" ? galleryItems : galleryItems.filter(item => getCategoryId(item) === activeCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        (item.title?.toLowerCase().includes(query)) ||
        (item.description?.toLowerCase().includes(query))
      );
    }
    switch (sortBy) {
      case "newest": return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
      case "oldest": return [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
      case "alphabetical": return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      default: return filtered;
    }
  }, [galleryItems, activeCategory, searchQuery, sortBy]);

  const openLightbox = i => {
    setCurrentImage(i);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const navigate = direction => {
    const total = filteredImages().length;
    setCurrentImage(currIndex => {
      let newIndex = direction === "prev" ? currIndex - 1 : currIndex + 1;
      if (newIndex < 0) newIndex = total - 1;
      else if (newIndex >= total) newIndex = 0;

      if (galleryRef.current) {
        const cards = galleryRef.current.querySelectorAll(".gallery-card");
        if (cards[newIndex]) {
          cards[newIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }

      return newIndex;
    });
  };

  // Enhanced download function with better error handling and CORS support
  const downloadImage = async () => {
    const currentItem = filteredImages()[currentImage];
    if (!currentItem) {
      setDownloadStatus({
        isDownloading: false,
        success: false,
        error: "No image selected"
      });
      return;
    }

    setDownloadStatus({
      isDownloading: true,
      success: false,
      error: null
    });

    try {
      const imageUrl = BACKEND_URL + currentItem.imageUrl;
      
      // Get file extension from URL or default to jpg
      const getFileExtension = (url) => {
        const parts = url.split('.');
        const ext = parts[parts.length - 1].toLowerCase();
        // Common image extensions
        const validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        return validExts.includes(ext) ? ext : 'jpg';
      };

      const fileExtension = getFileExtension(currentItem.imageUrl);
      
      // Generate clean filename
      const cleanTitle = (currentItem.title || "gallery_image")
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 50); // Limit length

      const fileName = `${cleanTitle}.${fileExtension}`;

      // Try to fetch the image as blob first (handles CORS better)
      try {
        const response = await fetch(imageUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        
        // Create object URL from blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL
        window.URL.revokeObjectURL(blobUrl);

        // Success
        setDownloadStatus({
          isDownloading: false,
          success: true,
          error: null
        });

        // Reset success message after 3 seconds
        setTimeout(() => {
          setDownloadStatus(prev => ({ ...prev, success: false }));
        }, 3000);

      } catch (fetchError) {
        // Fallback: direct download link (may not work with CORS)
        console.warn('Blob download failed, trying direct link:', fetchError);
        
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = fileName;
        link.target = '_blank'; // Open in new tab if download fails
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Success (even though we can't guarantee it worked)
        setDownloadStatus({
          isDownloading: false,
          success: true,
          error: null
        });

        setTimeout(() => {
          setDownloadStatus(prev => ({ ...prev, success: false }));
        }, 3000);
      }

    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus({
        isDownloading: false,
        success: false,
        error: error.message || "Download failed. Please try again."
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, error: null }));
      }, 5000);
    }
  };

  const shareImage = async () => {
    const currentItem = filteredImages()[currentImage];
    if (!currentItem) return;
    try {
      await navigator.share({
        title: currentItem.title,
        text: currentItem.description,
        url: window.location.href,
      });
    } catch {
      // Fallback for browsers that don't support Web Share API
      const shareText = `${currentItem.title}\n${currentItem.description}\n${window.location.href}`;
      
      // Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Link copied to clipboard!");
      } catch {
        // Fallback alert
        alert(shareText);
      }
    }
  };

  // Dynamic current category name for heading
  const currentCategory =
    activeCategory === "all"
      ? "All Categories"
      : (categories.find(cat => cat.id === activeCategory)?.name || "Category");

  return (
    <div className="gallery-page">
      {/* Hero */}
      <GalleryBanner/>

      {/* Categories */}
      <div className="horizontal-filters-container" style={{ justifyContent: "center", overflowX: "auto" }}>
        <div className="horizontal-filters">
          {categories.map(cat => {
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                className={`filter-btn-horizontal ${isActive ? "active" : ""}`}
                aria-pressed={isActive}
                style={{
                  backgroundColor: isActive ? `${cat.color}33` : "#fff",
                  color: isActive ? cat.color : "#333",
                  borderColor: cat.color,
                }}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.id === "all" && cat.icon ? <cat.icon className="filter-icon" /> : null}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="gallery-controls">
        <div className="controls-left">
          <div className="controls-title-row">
            {/* Chevron/Arrow icon before heading */}
            <span className="controls-symbol">
              <svg width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="#2c8600" strokeWidth="2.3"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 5l8 7-8 7" />
              </svg>
            </span>
            <h2 className="controls-title">{currentCategory?.toUpperCase()}</h2>
          </div>
        </div>

        <div className="controls-right">
          {/* Search input first */}
          <div className="search-container">
            <Icons.Search className="search-icon" />
            <input
              aria-label="Search gallery"
              className="search-input"
              placeholder="Search gallery..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Then Sort dropdown */}
          <div className="sort-select-wrapper">
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
            <span className="sort-select-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#20903b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16l-6.5 9.5v5.5l-3 2v-7.5z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      {/* Divider below heading */}
      <div className="controls-divider"></div>

      {/* Gallery grid */}
      <div className="gallery-main-layout">
        <div className="gallery-grid" ref={galleryRef}>
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="gallery-card-skeleton" />
            ))
          ) : filteredImages().length === 0 ? (
            <div className="no-results">
              <h3>No images found</h3>
              <p>Try adjusting your filters or search</p>
            </div>
          ) : (
            filteredImages().map((item, i) => {
              const category = categories.find(c => c.id === getCategoryId(item));
              return (
                <div
                  key={item._id}
                  className={`gallery-card ${hoveredCard === item._id ? "hovered" : ""}`}
                  style={{
                    backgroundColor: (category?.color)
                      ? `${category.color}20` // faint (≈ 12% opacity)
                      : "rgba(0, 0, 0, 0.03)",
                    border: category?.color
                      ? `1px solid ${category.color}40` // faint tinted border
                      : "1px solid rgba(0, 0, 0, 0.05)"
                  }}
                  onMouseEnter={() => setHoveredCard(item._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => openLightbox(i)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details of ${item.title}`}
                >

                  <div className="card-image-wrapper">
                    <img
                      src={BACKEND_URL + item.imageUrl}
                      alt={item.title}
                      className="card-image"
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                  <div className="gallery-card-content">
                    <span className="category-tag" style={{ backgroundColor: category?.color || '#666' }}>
                      {category?.name || 'Unknown'}
                    </span>
                    <p className="card-description">{item.description}</p>
                    <div className="card-footer">
                      <span>{item.date ? new Date(item.date).toLocaleDateString() : ''}</span>
                      <button className="view-button" aria-label={`View ${item.title} in detail`}>
                        <Icons.ZoomIn className="view-icon" /> View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Full old-style lightbox */}
      {lightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
          <div className="lightbox-backdrop" onClick={closeLightbox}></div>
          <div className="lightbox-content">
            <button className="close-btn" onClick={closeLightbox} aria-label="Close image viewer">
              <Icons.X className="close-icon" />
            </button>

            <div className="lightbox-image-container">
              <button className="nav-btn prev-btn" onClick={(e) => { e.stopPropagation(); navigate("prev"); }}>
                <Icons.ArrowLeftCircle className="nav-icon" />
              </button>

              <img
                src={BACKEND_URL + filteredImages()[currentImage].imageUrl}
                alt={filteredImages()[currentImage].title}
                className="lightbox-image"
              />

              {/* Thumbnails moved inside image container for overlay */}
              <div className="thumbnail-container">
                {filteredImages().map((img, idx) => (
                  <img
                    key={img._id}
                    src={BACKEND_URL + img.imageUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`thumbnail ${idx === currentImage ? 'active' : ''}`}
                    onClick={() => setCurrentImage(idx)}
                  />
                ))}
              </div>

              <button className="nav-btn next-btn" onClick={(e) => { e.stopPropagation(); navigate("next"); }}>
                <Icons.ArrowRightCircle className="nav-icon" />
              </button>
            </div>

            {/* Info panel */}
            <div className="lightbox-info">
              <h2 className="lightbox-title">{filteredImages()[currentImage].title}</h2>
              <div className="image-meta">
                <span className="image-date">
                  {filteredImages()[currentImage].date ? new Date(filteredImages()[currentImage].date).toLocaleDateString() : ''}
                </span>
                <span className="image-count">
                  {currentImage + 1} of {filteredImages().length}
                </span>
                <span
                  className="image-category-tag"
                  style={{ backgroundColor: categories.find(c => c.id === getCategoryId(filteredImages()[currentImage]))?.color || '#666' }}
                >
                  {categories.find(c => c.id === getCategoryId(filteredImages()[currentImage]))?.name}
                </span>
              </div>
              <p className="lightbox-description">{filteredImages()[currentImage].description}</p>
              <div className="lightbox-actions">
                <button 
                  className={`action-btn download-btn ${downloadStatus.isDownloading ? 'downloading' : ''} ${downloadStatus.success ? 'success' : ''}`}
                  onClick={downloadImage}
                  disabled={downloadStatus.isDownloading}
                  title={downloadStatus.error || (downloadStatus.success ? 'Downloaded successfully!' : 'Download image')}
                >
                  {downloadStatus.isDownloading ? (
                    <>
                      <Icons.Loader className="action-icon spinning" /> Downloading...
                    </>
                  ) : downloadStatus.success ? (
                    <>
                      <Icons.CheckCircle className="action-icon" /> Downloaded
                    </>
                  ) : (
                    <>
                      <Icons.Download className="action-icon" /> Download
                    </>
                  )}
                </button>
                <button className="action-btn share-btn" onClick={shareImage}>
                  <Icons.Share2 className="action-icon" /> Share
                </button>
              </div>
              
              {/* Download status messages */}
              {downloadStatus.error && (
                <div className="download-error">
                  <span>⚠️ {downloadStatus.error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}