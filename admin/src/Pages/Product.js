"use client";

import { useState, useEffect, Fragment, useMemo } from "react";
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
  AiOutlineDown,
  AiOutlineUp,
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

const QUANTITY_UNITS = ["ml", "L", "kg", "g", "Pack"];

const defaultVariantRow = () => ({
  quantityValue: "",
  quantityUnit: "ml",
  price: "",
  originalPrice: "",
  stock: "",
  image: null,
});

const initialProductState = {
  name: "",
  category: "",
  description: "",
  use: "",
  benefits: "",
  applicationMethod: "",
  variants: [defaultVariantRow()],
  sections: [],
  featured: false,
  rating: 0,
};

const formatVariantLabel = (v) => {
  if (v == null || v.quantityValue === "" || v.quantityValue == null) return "";
  return `${v.quantityValue} ${v.quantityUnit || ""}`.trim();
};

const variantQuantitySortKey = (v) => {
  const n = Number(v.quantityValue) || 0;
  const u = String(v.quantityUnit || "ml");
  if (u === "L") return n * 1000;
  if (u === "ml") return n;
  if (u === "kg") return n * 1000000;
  if (u === "g") return n * 1000;
  return n;
};

const sortVariantsByQuantityDesc = (list) => {
  if (!list?.length) return [];
  return [...list].sort((a, b) => variantQuantitySortKey(b) - variantQuantitySortKey(a));
};

/** Inline message when MRP is filled but lower than selling price (null if OK). */
const variantPricingError = (row) => {
  if (!row) return null;
  const rawSale = row.price;
  if (rawSale === "" || rawSale == null || Number.isNaN(Number(rawSale))) return null;
  const sale = Number(rawSale);
  if (!Number.isFinite(sale) || sale < 0) return null;
  const rawMrp = row.originalPrice;
  if (rawMrp === "" || rawMrp == null || String(rawMrp).trim() === "") return null;
  if (Number.isNaN(Number(rawMrp))) return null;
  const mrp = Number(rawMrp);
  if (!Number.isFinite(mrp)) return null;
  if (mrp >= 0 && mrp < sale) {
    return `MRP must be at least ₹${sale.toLocaleString("en-IN")} (cannot be lower than selling price).`;
  }
  return null;
};

const variantsForTableRow = (product) => {
  if (product?.variants?.length) return sortVariantsByQuantityDesc(product.variants);
  return [
    {
      quantityValue: 1,
      quantityUnit: "Pack",
      price: product.price,
      stock: product.stock,
      image: product.image,
      originalPrice: product.originalPrice,
    },
  ];
};

const tableSizeCell = (p) => formatVariantLabel(variantsForTableRow(p)[0]) || "—";

const tablePrimaryPriceCell = (p) => {
  const v0 = variantsForTableRow(p)[0];
  return `₹${Number(v0?.price != null ? v0.price : p?.price ?? 0).toLocaleString()}`;
};

/** Stock shown on main row: first (largest) size only — not sum of all variants (`product.stock` is total). */
const tablePrimaryStockCell = (p) => {
  const v0 = variantsForTableRow(p)[0];
  if (!v0) return Number(p?.stock ?? 0);
  return Number(v0.stock != null ? v0.stock : p?.stock ?? 0);
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
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [viewVariantIndex, setViewVariantIndex] = useState(0);
  const [viewSizesOpen, setViewSizesOpen] = useState(false);

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
    if (product) {
      let variants =
        product.variants?.length > 0
          ? product.variants.map((v) => ({
              quantityValue: v.quantityValue ?? "",
              quantityUnit: v.quantityUnit || "ml",
              price: v.price ?? "",
              originalPrice: v.originalPrice ?? "",
              stock: v.stock ?? "",
              image: v.image || null,
            }))
          : [
              {
                quantityValue: 1,
                quantityUnit: "Pack",
                price: product.price ?? "",
                originalPrice: product.originalPrice ?? "",
                stock: product.stock ?? "",
                image: product.image || null,
              },
            ];
      variants = sortVariantsByQuantityDesc(variants);
      setFormProduct({
        name: product.name || "",
        category: product.category || "",
        description: product.description || "",
        use: product.use || "",
        benefits: product.benefits || "",
        applicationMethod: product.applicationMethod || "",
        variants,
        sections: product.sections || [],
        featured: product.featured || false,
        rating: product.rating || 0,
      });
    } else {
      setFormProduct({ ...initialProductState, variants: [defaultVariantRow()] });
    }
    setIsProductModalOpen(true);
  };

  // Product submit handler
  const handleProductSubmit = async () => {
    if (!formProduct.name || !formProduct.category) {
      showNotification("Please fill in all required fields", "error");
      return;
    }
    const rows = sortVariantsByQuantityDesc((formProduct.variants || []).map((r) => ({ ...r })));
    if (!rows.length) {
      showNotification("Add at least one size / quantity row", "error");
      return;
    }
    if ((formProduct.variants || []).some((v) => variantPricingError(v))) {
      return;
    }
    for (let i = 0; i < rows.length; i++) {
      const v = rows[i];
      if (v.quantityValue === "" || v.quantityValue == null || Number(v.quantityValue) <= 0) {
        showNotification(`Row ${i + 1}: enter a valid quantity amount`, "error");
        return;
      }
      if (!v.quantityUnit) {
        showNotification(`Row ${i + 1}: select a unit`, "error");
        return;
      }
      if (v.price === "" || Number(v.price) < 0) {
        showNotification(`Row ${i + 1}: enter a valid price`, "error");
        return;
      }
      if (v.stock === "" || Number(v.stock) < 0) {
        showNotification(`Row ${i + 1}: enter stock`, "error");
        return;
      }
      if (!(v.image instanceof File) && !v.image) {
        showNotification(`Row ${i + 1}: upload an image for this size`, "error");
        return;
      }
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", formProduct.name);
      formData.append("category", formProduct.category);
      formData.append("description", formProduct.description);
      formData.append("use", formProduct.use);
      formData.append("benefits", formProduct.benefits);
      formData.append("applicationMethod", formProduct.applicationMethod);
      formData.append("sections", formProduct.sections.join(","));
      formData.append("featured", formProduct.featured);
      formData.append("rating", formProduct.rating);

      const variantPayload = rows.map((v) => {
        const row = {
          quantityValue: Number(v.quantityValue),
          quantityUnit: v.quantityUnit,
          price: Number(v.price),
          stock: Number(v.stock),
          image: v.image instanceof File ? "" : v.image || "",
        };
        if (v.originalPrice !== "" && v.originalPrice != null && !Number.isNaN(Number(v.originalPrice))) {
          row.originalPrice = Number(v.originalPrice);
        }
        return row;
      });
      formData.append("variants", JSON.stringify(variantPayload));

      rows.forEach((v, i) => {
        if (v.image instanceof File) {
          formData.append(`variantImage_${i}`, v.image);
        }
      });

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
      setFormProduct({ ...initialProductState, variants: [defaultVariantRow()] });
      fetchProducts();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error saving product";
      showNotification(typeof msg === "string" ? msg : "Error saving product", "error");
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

  // View modal — optional focusedVariant shows only that size’s details
  const openViewModal = (item, type, opts = {}) => {
    setViewItem({
      ...item,
      type,
      ...(type === "product" ? { focusedVariant: opts.focusedVariant ?? null } : {}),
    });
    setViewVariantIndex(0);
    setViewSizesOpen(false);
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

  const updateVariantRow = (index, patch) => {
    setFormProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  };

  const addVariantRow = () => {
    setFormProduct((prev) => ({
      ...prev,
      variants: [...prev.variants, defaultVariantRow()],
    }));
  };

  const removeVariantRow = (index) => {
    setFormProduct((prev) => {
      if (prev.variants.length <= 1) return prev;
      return { ...prev, variants: prev.variants.filter((_, i) => i !== index) };
    });
  };

  const hasVariantPricingErrors = useMemo(
    () => (formProduct.variants || []).some((v) => variantPricingError(v)),
    [formProduct.variants]
  );

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
                  <p>
                    {
                      products.filter((p) =>
                        variantsForTableRow(p).some((v) => Number(v.stock) < 10)
                      ).length
                    }
                  </p>
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
                      <th>Size</th>
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
                        <td colSpan="8" className="admin-empty">
                          <div className="admin-empty-content">
                            <img src="/empty-shelves.png" alt="No products" />
                            <h3>No products found</h3>
                            <p>Add your first product to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => {
                        const pid = product._id || product.id;
                        const isExpanded = expandedProductId === pid;
                        const variants = variantsForTableRow(product);
                        const hasMultipleSizes = variants.length > 1;
                        const remainingVariants = hasMultipleSizes ? variants.slice(1) : [];
                        const primaryRowStock = tablePrimaryStockCell(product);
                        return (
                          <Fragment key={pid}>
                            <tr>
                              <td className="admin-product-cell">
                                <div className="admin-product-cell-inner">
                                  {hasMultipleSizes ? (
                                    <button
                                      type="button"
                                      className="admin-row-expand-btn"
                                      onClick={() => {
                                        setExpandedProductId(isExpanded ? null : pid);
                                      }}
                                      title={isExpanded ? "Hide other sizes" : "Show other sizes"}
                                      aria-expanded={isExpanded}
                                    >
                                      {isExpanded ? <AiOutlineUp /> : <AiOutlineDown />}
                                    </button>
                                  ) : (
                                    <span className="admin-row-expand-placeholder" aria-hidden />
                                  )}
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
                              <td className="admin-size-cell">{tableSizeCell(product)}</td>
                              <td className="admin-price">{tablePrimaryPriceCell(product)}</td>
                              <td>
                                <div className="admin-stock">
                                  <span
                                    className={primaryRowStock < 10 ? "low" : "normal"}
                                  >
                                    {primaryRowStock}
                                  </span>
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
                                <span
                                  className={`admin-status ${primaryRowStock > 0 ? "in-stock" : "out-stock"}`}
                                >
                                  {primaryRowStock > 0 ? "In Stock" : "Out of Stock"}
                                </span>
                              </td>
                              <td className="admin-actions-cell">
                                <div className="admin-actions-inner">
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
                                    onClick={() => handleDeleteProduct(pid)}
                                    title="Delete"
                                  >
                                    <AiOutlineDelete />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded &&
                              remainingVariants.map((v, subIdx) => (
                                <tr key={`${pid}-size-${subIdx}`} className="admin-table-variant-subrow">
                                  <td className="admin-product-cell">
                                    <div className="admin-product-cell-inner">
                                      <span className="admin-row-expand-placeholder" aria-hidden />
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
                                  <td className="admin-size-cell">{formatVariantLabel(v)}</td>
                                  <td className="admin-price">₹{Number(v.price).toLocaleString()}</td>
                                  <td>
                                    <div className="admin-stock">
                                      <span className={Number(v.stock) < 10 ? "low" : "normal"}>{v.stock}</span>
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
                                    <span className={`admin-status ${Number(v.stock) > 0 ? "in-stock" : "out-stock"}`}>
                                      {Number(v.stock) > 0 ? "In Stock" : "Out of Stock"}
                                    </span>
                                  </td>
                                  <td className="admin-actions-cell">
                                    <div className="admin-actions-inner">
                                      <button
                                        className="admin-action-btn view"
                                        onClick={() => openViewModal(product, "product", { focusedVariant: v })}
                                        title="View this size"
                                      >
                                        <AiOutlineEye />
                                      </button>
                                      <button
                                        className="admin-action-btn edit"
                                        onClick={() => openProductModal(product)}
                                        title="Edit product"
                                      >
                                        <AiOutlineEdit />
                                      </button>
                                      <button
                                        className="admin-action-btn delete"
                                        onClick={() => handleDeleteProduct(pid)}
                                        title="Delete product"
                                      >
                                        <AiOutlineDelete />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </Fragment>
                        );
                      })
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
                      <label>Rating (use arrows)</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formProduct.rating}
                        onChange={(e) =>
                          setFormProduct((prev) => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))
                        }
                        onKeyDown={(e) => {
                          if (["ArrowUp", "ArrowDown", "Tab", "Escape"].includes(e.key)) return;
                          e.preventDefault();
                        }}
                        onPaste={(e) => e.preventDefault()}
                        placeholder="0.0"
                        className="admin-form-input admin-rating-arrows-only"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h4 className="admin-form-section-title">
                    <AiOutlineTags className="admin-form-section-icon" />
                    Pricing & Inventory
                  </h4>
                  <p className="admin-variant-hint">
                    Add each pack size: amount, unit (ml / L / kg…), sale price, optional MRP, stock, and image.
                    Sizes are stored with the largest quantity first.
                  </p>
                  {(formProduct.variants || []).map((row, idx) => {
                    const variantPricingErr = variantPricingError(row);
                    return (
                    <div
                      key={idx}
                      className={`admin-variant-block${variantPricingErr ? " admin-variant-block--has-error" : ""}`}
                    >
                      <div className="admin-variant-block-header">
                        <span>Size {idx + 1}</span>
                        {formProduct.variants.length > 1 && (
                          <button type="button" className="admin-variant-remove" onClick={() => removeVariantRow(idx)}>
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="admin-form-row admin-variant-row">
                        <div className="admin-form-group">
                          <label>Qty amount *</label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={row.quantityValue}
                            onChange={(e) => updateVariantRow(idx, { quantityValue: e.target.value })}
                            placeholder="e.g. 100"
                            className="admin-form-input"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Unit *</label>
                          <select
                            value={row.quantityUnit}
                            onChange={(e) => updateVariantRow(idx, { quantityUnit: e.target.value })}
                            className="admin-form-select"
                          >
                            {QUANTITY_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-form-group">
                          <label>Price (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={row.price}
                            onChange={(e) => updateVariantRow(idx, { price: e.target.value })}
                            className={`admin-form-input ${variantPricingErr ? "admin-form-input--error" : ""}`}
                            aria-invalid={variantPricingErr ? true : undefined}
                            aria-describedby={variantPricingErr ? `variant-pricing-err-${idx}` : undefined}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Original price / MRP (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={row.originalPrice}
                            onChange={(e) => updateVariantRow(idx, { originalPrice: e.target.value })}
                            placeholder="Optional"
                            className={`admin-form-input ${variantPricingErr ? "admin-form-input--error" : ""}`}
                            aria-invalid={variantPricingErr ? true : undefined}
                            aria-describedby={variantPricingErr ? `variant-pricing-err-${idx}` : undefined}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Stock *</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={row.stock}
                            onChange={(e) => updateVariantRow(idx, { stock: e.target.value })}
                            className="admin-form-input"
                          />
                        </div>
                      </div>
                      {variantPricingErr ? (
                        <p className="admin-variant-field-error" id={`variant-pricing-err-${idx}`} role="alert">
                          {variantPricingErr}
                        </p>
                      ) : null}
                      <div className="admin-form-row">
                        <div className="admin-form-group admin-form-group-full">
                          <label>Image for this size *</label>
                          <div className="admin-file-upload">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                updateVariantRow(idx, { image: e.target.files?.[0] || null })
                              }
                              className="admin-file-input"
                              id={`variant-image-${idx}`}
                            />
                            <label htmlFor={`variant-image-${idx}`} className="admin-file-label">
                              <AiOutlinePlus />
                              Choose Image
                            </label>
                            {row.image && !(row.image instanceof File) && (
                              <img
                                src={`${backendRootURL}${row.image}`}
                                alt=""
                                style={{ maxHeight: 72, marginTop: 8, borderRadius: 4 }}
                              />
                            )}
                            {row.image instanceof File && (
                              <span className="admin-file-name">{row.image.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                  <button type="button" className="admin-add-variant-btn" onClick={addVariantRow}>
                    <AiOutlinePlus /> Add sub quantity product
                  </button>
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

                <div className="admin-form-actions">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="admin-cancel-btn">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProductSubmit}
                    className="admin-submit-btn"
                    disabled={isLoading || hasVariantPricingErrors}
                    title={
                      hasVariantPricingErrors
                        ? "Fix MRP vs selling price on each highlighted size row"
                        : undefined
                    }
                  >
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
              <h3>
                {viewItem.type === "product"
                  ? viewItem.focusedVariant
                    ? `View ${viewItem.name} (${formatVariantLabel(viewItem.focusedVariant)})`
                    : "View Product"
                  : "View Category"}
              </h3>
              <button className="admin-modal-close" onClick={() => setIsViewModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              {viewItem.type === "product" ? (() => {
                const viewVariantsList = sortVariantsByQuantityDesc(
                  viewItem.variants?.length > 0
                    ? viewItem.variants
                    : [
                        {
                          quantityValue: 1,
                          quantityUnit: "Pack",
                          price: viewItem.price,
                          stock: viewItem.stock,
                          image: viewItem.image,
                          originalPrice: viewItem.originalPrice,
                        },
                      ]
                );
                const focused = viewItem.focusedVariant;
                const idx = Math.min(
                  Math.max(0, viewVariantIndex),
                  Math.max(0, viewVariantsList.length - 1)
                );
                const vv = focused || viewVariantsList[idx];
                const multi = !focused && viewVariantsList.length > 1;
                return (
                  <div className="admin-view-content">
                    <div className="admin-view-image">
                      <img
                        src={
                          vv?.image
                            ? `${backendRootURL}${vv.image}`
                            : "/placeholder.svg?height=200&width=200&query=product"
                        }
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
                        <strong>Price ({formatVariantLabel(vv)}):</strong> ₹{Number(vv?.price).toLocaleString()}
                      </p>
                      {vv?.originalPrice != null && Number(vv.originalPrice) > 0 && (
                        <p>
                          <strong>MRP ({formatVariantLabel(vv)}):</strong> ₹{Number(vv.originalPrice).toLocaleString()}
                        </p>
                      )}
                      <p>
                        <strong>Stock ({formatVariantLabel(vv)}):</strong> {vv?.stock}
                      </p>
                      <p>
                        <strong>Rating:</strong> {viewItem.rating || 0}/5
                      </p>
                      {multi && (
                        <>
                          <button
                            type="button"
                            className="admin-view-sizes-toggle"
                            onClick={() => setViewSizesOpen((o) => !o)}
                          >
                            {viewSizesOpen ? <AiOutlineUp /> : <AiOutlineDown />}
                            Other sizes &amp; pricing
                          </button>
                          {viewSizesOpen && (
                            <div className="admin-view-sizes-panel">
                              <label className="admin-expand-label">Select size</label>
                              <select
                                className="admin-form-select"
                                value={idx}
                                onChange={(e) => setViewVariantIndex(Number(e.target.value))}
                              >
                                {viewVariantsList.map((v, i) => (
                                  <option key={i} value={i}>
                                    {formatVariantLabel(v)} — ₹{Number(v.price).toLocaleString()}
                                    {v.originalPrice != null && Number(v.originalPrice) > 0
                                      ? ` · MRP ₹${Number(v.originalPrice).toLocaleString()}`
                                      : ""}{" "}
                                    · Stock {v.stock}
                                  </option>
                                ))}
                              </select>
                              <p className="admin-view-sizes-note">
                                Image and price above update for the selected size.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      {!focused ? (
                        <>
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
                        </>
                      ) : (
                        <p className="admin-view-focused-note">
                          Open the full product view from the main row to see description, use, benefits, and application.
                        </p>
                      )}
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
                );
              })() : (
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
