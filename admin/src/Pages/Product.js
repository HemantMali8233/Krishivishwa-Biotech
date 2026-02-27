"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  AiOutlineSearch,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineTags,
  AiOutlineStar,
  AiOutlineFire,
  AiOutlineThunderbolt,
} from "react-icons/ai";
import { FiBox, FiSettings, FiRefreshCw, FiPackage } from "react-icons/fi";
import { BsGrid3X3Gap } from "react-icons/bs";

import "./Product.css";

const PRODUCT_SECTIONS = [
  { id: "new-arrivals", name: "New Arrivals", icon: AiOutlineThunderbolt, color: "#10b981" },
  { id: "best-sellers", name: "Best Sellers", icon: AiOutlineFire, color: "#f59e0b" },
  { id: "top-rated", name: "Top Rated", icon: AiOutlineStar, color: "#8b5cf6" },
];

const backendBaseURL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";
const backendRootURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const initialProductState = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  use: "",
  benefits: "",
  applicationMethod: "",
  image: null,
  sections: [],
  featured: false,
  originalPrice: "",
  rating: 0,
};

const initialCategoryState = {
  name: "",
  color: "#10b981",
};

const EnhancedAdminPanel = () => {
  // States
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories] = useState(0);

  const [activeTab, setActiveTab] = useState("products");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formProduct, setFormProduct] = useState(initialProductState);
  const [formCategory, setFormCategory] = useState(initialCategoryState);
  const [viewItem, setViewItem] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const productsPerPage = 8;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Fetch data effects
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, selectedSection]);

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let params = { page: currentPage, limit: productsPerPage };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedSection) params.section = selectedSection;

      const { data } = await axios.get(`${backendBaseURL}/products`, { params });
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
    } catch {
      showNotification("Failed to load products", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${backendBaseURL}/product-categories`);
      setCategories(data.categories || []);
      setTotalCategories(data.total || 0);
    } catch {
      showNotification("Failed to load categories", "error");
    }
  };

  // Notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
  };
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Product modal open
  const openProductModal = (product = null) => {
    setIsEditMode(!!product);
    setEditingId(product?._id || product?.id || null);
    setFormProduct(
      product
        ? {
          name: product.name || "",
          category: product.category || "",
          price: product.price || "",
          stock: product.stock || "",
          description: product.description || "",
          use: product.use || "",
          benefits: product.benefits || "",
          applicationMethod: product.applicationMethod || "",
          image: product.image || null,
          sections: product.sections || [],
          featured: product.featured || false,
          originalPrice: product.originalPrice || "",
          rating: product.rating || 0,
        }
        : initialProductState
    );
    setIsProductModalOpen(true);
  };

  // Product submit handler
  const handleProductSubmit = async () => {
    if (!formProduct.name || !formProduct.category || !formProduct.price || !formProduct.stock) {
      showNotification("Please fill in all required fields", "error");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", formProduct.name);
      formData.append("category", formProduct.category);
      formData.append("price", formProduct.price);
      formData.append("stock", formProduct.stock);
      formData.append("description", formProduct.description);
      formData.append("use", formProduct.use);
      formData.append("benefits", formProduct.benefits);
      formData.append("applicationMethod", formProduct.applicationMethod);
      formData.append("sections", formProduct.sections.join(","));
      formData.append("featured", formProduct.featured);
      formData.append("originalPrice", formProduct.originalPrice);
      formData.append("rating", formProduct.rating);
      if (formProduct.image instanceof File) {
        formData.append("image", formProduct.image);
      }
      if (isEditMode && editingId) {
        await axios.put(`${backendBaseURL}/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showNotification("Product updated successfully!");
      } else {
        await axios.post(`${backendBaseURL}/products`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showNotification("Product added successfully!");
      }
      setIsProductModalOpen(false);
      setFormProduct(initialProductState);
      fetchProducts();
    } catch {
      showNotification("Error saving product", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setIsLoading(true);
    try {
      await axios.delete(`${backendBaseURL}/products/${id}`);
      showNotification("Product deleted successfully");
      fetchProducts();
    } catch {
      showNotification("Failed to delete product", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Category modal open
  const openCategoryModal = (category = null) => {
    setIsEditMode(!!category);
    setEditingId(category?.id || category?._id || null);
    setFormCategory(category ? { name: category.name, color: category.color || "#10b981" } : initialCategoryState);
    setIsCategoryModalOpen(true);
  };

  // Category submit
  const handleCategorySubmit = async () => {
    if (!formCategory.name) {
      showNotification("Please enter category name", "error");
      return;
    }
    setIsLoading(true);
    try {
      if (isEditMode && editingId) {
        await axios.put(`${backendBaseURL}/product-categories/${editingId}`, formCategory);
        showNotification("Category updated successfully!");
      } else {
        await axios.post(`${backendBaseURL}/product-categories`, formCategory);
        showNotification("Category added successfully!");
      }
      setIsCategoryModalOpen(false);
      setFormCategory(initialCategoryState);
      fetchCategories();
    } catch {
      showNotification("Error saving category", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setIsLoading(true);
    try {
      await axios.delete(`${backendBaseURL}/product-categories/${id}`);
      showNotification("Category deleted successfully");
      fetchCategories();
    } catch {
      showNotification("Failed to delete category", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // View modal
  const openViewModal = (item, type) => {
    setViewItem({
      ...item,
      type,
    });
    setIsViewModalOpen(true);
  };

  // Pagination change
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSection("");
    setCurrentPage(1);
  };

  // Section toggle for product form
  const handleSectionToggle = (sectionId) => {
    const updatedSections = formProduct.sections.includes(sectionId)
      ? formProduct.sections.filter((s) => s !== sectionId)
      : [...formProduct.sections, sectionId];
    setFormProduct((prev) => ({ ...prev, sections: updatedSections }));
  };

  return (
    <div className="enhanced-admin-container">
      {notification.show && (
        <div className={`admin-notification admin-notification--${notification.type}`}>
          {notification.message}
          <button className="admin-notification-close" onClick={() => setNotification((prev) => ({ ...prev, show: false }))}>
            ×
          </button>
        </div>
      )}

      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <div className="header-left">
              <div className="header-icon">
                <FiPackage />
              </div>
            </div>
            <div>
              <h1>Product Management</h1>
              <p>Complete product & category management</p>
            </div>
          </div>
          <div className="admin-header-actions">
            <div className="admin-search">
              <AiOutlineSearch className="admin-search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
          <FiBox /> Products ({totalProducts})
        </button>
        <button className={`admin-tab ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
          <AiOutlineTags /> Categories ({totalCategories})
        </button>
        <button className={`admin-tab ${activeTab === "sections" ? "active" : ""}`} onClick={() => setActiveTab("sections")}>
          <BsGrid3X3Gap /> Sections ({PRODUCT_SECTIONS.length})
        </button>
      </div>

      <div className="admin-filters-bar">
        <div className="admin-filters">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="admin-filter-select">
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="admin-filter-select">
            <option value="">All Sections</option>
            {PRODUCT_SECTIONS.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>

          <button onClick={resetFilters} className="admin-reset-btn">
            <FiRefreshCw /> Reset
          </button>
        </div>

        <div className="admin-actions">
          {activeTab === "products" && (
            <button className="admin-add-btn" onClick={() => openProductModal()}>
              <AiOutlinePlus /> Add Product
            </button>
          )}
          {activeTab === "categories" && (
            <button className="admin-add-btn" onClick={() => openCategoryModal()}>
              <AiOutlinePlus /> Add Category
            </button>
          )}
        </div>
      </div>

      <div className="admin-content">
        {activeTab === "products" && (
          <div className="admin-products-section">
            <div className="admin-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">📦</div>
                <div className="admin-stat-content">
                  <h3>Total Products</h3>
                  <p>{totalProducts}</p>
                  <span>Active inventory</span>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">⚠️</div>
                <div className="admin-stat-content">
                  <h3>Low Stock</h3>
                  <p>{products.filter((p) => p.stock < 10).length}</p>
                  <span>Below 10 units</span>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">🏷️</div>
                <div className="admin-stat-content">
                  <h3>Categories</h3>
                  <p>{totalCategories}</p>
                  <span>Product categories</span>
                </div>
              </div>
            </div>

            <div className="admin-table-container">
              {isLoading ? (
                <div className="admin-loading">
                  <div className="admin-spinner"></div>
                  <p>Loading products...</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Sections</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="admin-empty">
                          <div className="admin-empty-content">
                            <img src="/empty-shelves.png" alt="No products" />
                            <h3>No products found</h3>
                            <p>Add your first product to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id || product.id}>
                          <td className="admin-product-cell">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {/* You can optionally add product image here */}
                              <div>
                                <h4>{product.name}</h4>
                                <p>{product.description?.substring(0, 50)}...</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className="admin-category-badge"
                              style={{
                                background: categories.find((c) => c.name === product.category)?.color || "#10b981",
                                color: "white",
                              }}
                            >
                              {product.category}
                            </span>
                          </td>
                          <td className="admin-price">₹{product.price?.toLocaleString()}</td>
                          <td>
                            <div className="admin-stock">
                              <span className={product.stock < 10 ? "low" : "normal"}>{product.stock}</span>
                            </div>
                          </td>
                          <td>
                            <div className="admin-sections">
                              {product.sections?.map((sectionId) => {
                                const section = PRODUCT_SECTIONS.find((s) => s.id === sectionId);
                                if (!section) return null;
                                return (
                                  <span key={sectionId} className="admin-section-badge" style={{ backgroundColor: section.color }}>
                                    {section.name}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td>
                            <span className={`admin-status ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
                              {product.stock > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </td>
                          <td className="admin-actions-cell">
                            <button
                              className="admin-action-btn view"
                              onClick={() => openViewModal(product, "product")}
                              title="View"
                            >
                              <AiOutlineEye />
                            </button>
                            <button
                              className="admin-action-btn edit"
                              onClick={() => openProductModal(product)}
                              title="Edit"
                            >
                              <AiOutlineEdit />
                            </button>
                            <button
                              className="admin-action-btn delete"
                              onClick={() => handleDeleteProduct(product._id || product.id)}
                              title="Delete"
                            >
                              <AiOutlineDelete />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="admin-categories-section">
            <div className="admin-categories-grid">
              {categories.map((category) => (
                <div
                  key={category._id || category.id}
                  className="admin-category-card"
                  style={{
                    background: `${category.color}20`, // 20% opacity
                    borderLeft: `4px solid ${category.color}`,
                  }}
                >
                  <div className="admin-category-header">
                    <div className="admin-category-actions">
                      <button className="admin-action-btn edit" onClick={() => openCategoryModal(category)}>
                        <AiOutlineEdit />
                      </button>
                      <button className="admin-action-btn delete" onClick={() => handleDeleteCategory(category._id || category.id)}>
                        <AiOutlineDelete />
                      </button>
                    </div>
                  </div>
                  <h3>{category.name}</h3>
                  <div className="admin-category-stats">
                    <span>{products.filter((p) => p.category === category.name).length} products</span>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="admin-empty-categories">
                  <img src="/empty-categories.png" alt="No categories" />
                  <h3>No categories yet</h3>
                  <p>Create your first category to organize products</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "sections" && (
          <div className="admin-sections-overview">
            <div className="admin-sections-grid">
              {PRODUCT_SECTIONS.map((section) => {
                const sectionProducts = products.filter((p) => p.sections?.includes(section.id));
                const IconComponent = section.icon;
                return (
                  <div key={section.id} className="admin-section-card">
                    <div className="admin-section-header">
                      <div className="admin-section-icon" style={{ backgroundColor: section.color }}>
                        <IconComponent />
                      </div>
                      <h3>{section.name}</h3>
                    </div>
                    <div className="admin-section-stats">
                      <p>{sectionProducts.length} products</p>
                      <div className="admin-section-products">
                        {sectionProducts.slice(0, 3).map((product) => (
                          <span key={product._id || product.id} className="admin-section-product-name">
                            {product.name} |
                          </span>
                        ))}
                        {sectionProducts.length > 3 && (
                          <span className="admin-section-more">+{sectionProducts.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {activeTab === "products" && totalPages > 1 && (
        <div className="admin-pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="admin-page-btn">
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`admin-page-btn ${currentPage === pageNum ? "active" : ""}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="admin-page-btn">
            Next
          </button>
        </div>
      )}

      {isProductModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="admin-modal admin-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isEditMode ? "Edit Product" : "Add New Product"}</h3>
              <button className="admin-modal-close" onClick={() => setIsProductModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-container">
                <div className="admin-form-section">
                  <h4 className="admin-form-section-title">
                    <FiBox className="admin-form-section-icon" />
                    Basic Information
                  </h4>
                  <div className="admin-form-row">
                    <div className="admin-form-group admin-form-group-full">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        value={formProduct.name}
                        onChange={(e) => setFormProduct((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter product name"
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Category *</label>
                      <select
                        value={formProduct.category}
                        onChange={(e) => setFormProduct((prev) => ({ ...prev, category: e.target.value }))}
                        className="admin-form-select"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat._id || cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label>Rating</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formProduct.rating}
                        onChange={(e) =>
                          setFormProduct((prev) => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))
                        }
                        placeholder="0.0"
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h4 className="admin-form-section-title">
                    <AiOutlineTags className="admin-form-section-icon" />
                    Pricing & Inventory
                  </h4>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        step="5"
                        value={formProduct.price}
                        onChange={(e) => setFormProduct((prev) => ({ ...prev, price: e.target.value }))}
                        placeholder="1"
                        className="admin-form-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Original Price (₹)</label>
                      <input
                        type="number"
                        min="1"
                        step="5"
                        value={formProduct.originalPrice}
                        onChange={(e) => setFormProduct((prev) => ({ ...prev, originalPrice: e.target.value }))}
                        placeholder="1"
                        className="admin-form-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Stock *</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formProduct.stock}
                        onChange={(e) => setFormProduct((prev) => ({ ...prev, stock: e.target.value }))}
                        placeholder="0"
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h4 className="admin-form-section-title">
                    <AiOutlineEdit className="admin-form-section-icon" />
                    Product Details
                  </h4>
                  <div className="admin-form-row">
                    <div className="admin-form-group admin-form-group-full">
                      <label>Description</label>
                      <textarea
                        value={formProduct.description}
                        onChange={(e) => setFormProduct((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Product description"
                        rows={3}
                        className="admin-form-textarea"
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Use</label>
                      <textarea
                        value={formProduct.use}
                        onChange={(e) => setFormProduct((prev) => ({ ...prev, use: e.target.value }))}
                        placeholder="How the product is used"
                        rows={3}
                        className="admin-form-textarea"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Benefits</label>
                      <textarea
                        value={formProduct.benefits}
                        onChange={(e) => setFormProduct((prev) => ({ ...prev, benefits: e.target.value }))}
                        placeholder="Benefits after using the product"
                        rows={3}
                        className="admin-form-textarea"
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group admin-form-group-full">
                      <label>Application Method</label>
                      <input
                        type="text"
                        value={formProduct.applicationMethod}
                        onChange={(e) => setFormProduct((prev) => ({ ...prev, applicationMethod: e.target.value }))}
                        placeholder="Application instructions"
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h4 className="admin-form-section-title">
                    <BsGrid3X3Gap className="admin-form-section-icon" />
                    Product Sections
                  </h4>
                  <div className="admin-form-row">
                    <div className="admin-form-group admin-form-group-full">
                      <label>Select sections where this product should appear</label>
                      <div className="admin-sections-selector">
                        {PRODUCT_SECTIONS.map((section) => {
                          const IconComponent = section.icon;
                          const isSelected = formProduct.sections.includes(section.id);
                          return (
                            <button
                              key={section.id}
                              type="button"
                              className={`admin-section-option ${isSelected ? "selected" : ""}`}
                              onClick={() => handleSectionToggle(section.id)}
                              style={{
                                borderColor: isSelected ? section.color : "#e5e7eb",
                                backgroundColor: isSelected ? `${section.color}20` : "transparent",
                              }}
                            >
                              <IconComponent style={{ color: section.color }} />
                              <span>{section.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h4 className="admin-form-section-title">
                    <AiOutlineEye className="admin-form-section-icon" />
                    Product Image
                  </h4>
                  <div className="admin-form-row">
                    <div className="admin-form-group admin-form-group-full">
                      <label>Upload Image</label>
                      <div className="admin-file-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormProduct((prev) => ({ ...prev, image: e.target.files[0] }))}
                          className="admin-file-input"
                          id="product-image"
                        />
                        <label htmlFor="product-image" className="admin-file-label">
                          <AiOutlinePlus />
                          Choose Image
                        </label>
                        {formProduct.image && !(formProduct.image instanceof File) && (
                          <img
                            src={`${backendRootURL}${formProduct.image}`}
                            alt="Current"
                            style={{ maxHeight: 80, marginTop: 10, borderRadius: 4 }}
                          />
                        )}
                        {formProduct.image instanceof File && (
                          <span className="admin-file-name">{formProduct.image.name || "Image selected"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="admin-cancel-btn">
                    Cancel
                  </button>
                  <button onClick={handleProductSubmit} className="admin-submit-btn" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="admin-spinner-small"></div>
                        {isEditMode ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>{isEditMode ? "Update Product" : "Add Product"}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="admin-category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isEditMode ? "Edit Category" : "Create New Category"}</h3>
              <button
                className="admin-modal-close"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setFormCategory(initialCategoryState);
                }}
              >
                ×
              </button>
            </div>

            <div className="admin-category-form">
              <div className="admin-form-group">
                <label className="admin-form-label">Category Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Bio-Fertilizers"
                  value={formCategory.name}
                  onChange={(e) => setFormCategory({ ...formCategory, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Category Color</label>
                <div className="admin-color-picker">
                  <input
                    type="color"
                    value={formCategory.color}
                    onChange={(e) => setFormCategory({ ...formCategory, color: e.target.value })}
                  />
                  <span className="admin-color-value">{formCategory.color}</span>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  className="admin-cancel-btn"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setFormCategory(initialCategoryState);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="admin-submit-btn"
                  onClick={handleCategorySubmit}
                  disabled={!formCategory.name || isLoading}
                >
                  {isLoading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update Category" : "Create Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && viewItem && (
        <div className="admin-modal-overlay" onClick={() => setIsViewModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>View {viewItem.type === "product" ? "Product" : "Category"}</h3>
              <button className="admin-modal-close" onClick={() => setIsViewModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              {viewItem.type === "product" ? (
                <div className="admin-view-content">
                  <div className="admin-view-image">
                    <img
                      src={viewItem.image ? `${backendRootURL}${viewItem.image}` : "/placeholder.svg?height=200&width=200&query=product"}
                      alt={viewItem.name}
                      style={{
                        width: "220px",
                        height: "220px",
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  <div className="admin-view-details">
                    <h4>{viewItem.name}</h4>
                    <p>
                      <strong>Category:</strong> {viewItem.category}
                    </p>
                    <p>
                      <strong>Price:</strong> ₹{viewItem.price?.toLocaleString()}
                    </p>
                    {viewItem.originalPrice && (
                      <p>
                        <strong>Original Price:</strong> ₹{viewItem.originalPrice?.toLocaleString()}
                      </p>
                    )}
                    <p>
                      <strong>Stock:</strong> {viewItem.stock}
                    </p>
                    <p>
                      <strong>Rating:</strong> {viewItem.rating || 0}/5
                    </p>
                    <p>
                      <strong>Description:</strong> {viewItem.description || "N/A"}
                    </p>
                    <p>
                      <strong>Use:</strong> {viewItem.use || "N/A"}
                    </p>
                    <p>
                      <strong>Benefits:</strong> {viewItem.benefits || "N/A"}
                    </p>
                    <p>
                      <strong>Application Method:</strong> {viewItem.applicationMethod || "N/A"}
                    </p>
                    {viewItem.sections && viewItem.sections.length > 0 && (
                      <div>
                        <strong>Sections:</strong>
                        <div className="admin-view-sections">
                          {viewItem.sections.map((sectionId) => {
                            const section = PRODUCT_SECTIONS.find((s) => s.id === sectionId);
                            return section ? (
                              <span
                                key={sectionId}
                                className="admin-section-badge"
                                style={{ backgroundColor: section.color }}
                              >
                                {section.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="admin-view-content">
                  <div className="admin-view-category">
                    <div className="admin-category-icon-large">{viewItem.icon || "📁"}</div>
                    <h4>{viewItem.name}</h4>
                    <p>{viewItem.description || "No description available"}</p>
                    <div className="admin-category-products-count">
                      <strong>{products.filter((p) => p.category === viewItem.name).length} products</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAdminPanel;
