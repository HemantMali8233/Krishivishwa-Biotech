"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./Gallery.css";

// Always returns category _id as string
const getCategoryId = (item) => item?.categoryId?._id || item?.categoryId || "";

const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";
const BACKEND_ORIGIN = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminGallery = () => {
  const [categories, setCategories] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeTab, setActiveTab] = useState("categories");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewItem, setViewItem] = useState(null);

  const [categoryForm, setCategoryForm] = useState({ name: "", color: "#4a6fa5" });
  const [itemForm, setItemForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    imageFile: null,
    imageUrl: "",
    date: "",
  });

  // Load categories and items
  const fetchAll = async () => {
    try {
      const [cats, items] = await Promise.all([
        axios.get(`${BASE_URL}/categories`),
        axios.get(`${BASE_URL}/gallery-items`)
      ]);
      setCategories(cats.data);
      setGalleryItems(items.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load data from backend");
    }
  };
  useEffect(() => { fetchAll(); }, []);

  // Icons from your original UI
  const Icons = {
    Plus: () => (<svg width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>),
    Edit: () => (
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2
          2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12
          15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    Delete: () => (
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3,6 5,6 21,6" />
        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,
          2,0,0,1-2-2V6m3,0V4a2,
          2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
      </svg>
    ),
    Search: () => (<svg width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </svg>),
    Image: () => (<svg width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18"
        rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21,15 16,10 5,21"></polyline>
    </svg>),
    X: () => (<svg width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>),
    Folder: () => (<svg width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2
        2H4a2 2 0 0 1-2-2V5a2 2
        0 0 1 2-2h5l2 3h9a2 2
        0 0 1 2 2z"></path>
    </svg>),
    EyeIcon: () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),


  };

  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  // --- Category CRUD ---
  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) return;
    await axios.post(`${BASE_URL}/categories`, categoryForm);
    setCategoryForm({ name: "", color: "#4a6fa5" });
    setShowCategoryModal(false);
    showNotification("Category added successfully!"); // <-- add this
    fetchAll();
  };
  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, color: cat.color });
    setShowCategoryModal(true);
  };
  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) return;
    await axios.put(`${BASE_URL}/categories/${editingCategory._id}`, categoryForm);
    setCategoryForm({ name: "", color: "#4a6fa5" });
    setEditingCategory(null);
    setShowCategoryModal(false);
    showNotification("Category updated successfully!"); // <-- add this
    fetchAll();
  };
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category and all its items?")) return;
    await axios.delete(`${BASE_URL}/categories/${id}`);
    showNotification("Category deleted successfully!"); // <-- add this
    fetchAll();
  };

  // --- Image upload helper ---
  const uploadImageIfNeeded = async () => {
    let imageUrl = itemForm.imageUrl;
    if (itemForm.imageFile) {
      const formData = new FormData();
      formData.append("image", itemForm.imageFile);
      const res = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      imageUrl = res.data.imageUrl;
    }
    return imageUrl;
  };

  // --- Item CRUD ---
  const handleCreateItem = async () => {
    if (!itemForm.title.trim() || !itemForm.categoryId) return;
    const imageUrl = await uploadImageIfNeeded();
    await axios.post(`${BASE_URL}/gallery-items`, { ...itemForm, imageUrl });
    setItemForm({ title: "", description: "", categoryId: "", imageFile: null, imageUrl: "", date: "" });
    setShowItemModal(false);
    showNotification("Gallery item added successfully!"); // <-- add this
    fetchAll();
  };
  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      title: item.title,
      description: item.description,
      categoryId: getCategoryId(item),
      imageFile: null,
      imageUrl: item.imageUrl,
      date: item.date || "",
    });
    setShowItemModal(true);
  };
  const handleUpdateItem = async () => {
    if (!editingItem || !itemForm.title.trim()) return;
    const imageUrl = await uploadImageIfNeeded();
    await axios.put(`${BASE_URL}/gallery-items/${editingItem._id}`, { ...itemForm, imageUrl });
    setItemForm({ title: "", description: "", categoryId: "", imageFile: null, imageUrl: "", date: "" });
    setEditingItem(null);
    setShowItemModal(false);
    showNotification("Gallery item updated successfully!"); // <-- add this
    fetchAll();
  };
  const handleDeleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await axios.delete(`${BASE_URL}/gallery-items/${id}`);
    showNotification("Gallery item deleted successfully!"); // <-- add this
    fetchAll();
  };

  // --- Image preview ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = event => setItemForm(prev => ({ ...prev, imageUrl: event.target.result }));
      reader.readAsDataURL(file);
    }
  };

  // --- Filtering & counts ---
  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || String(getCategoryId(item)) === String(filterCategory);
    return matchesSearch && matchesCategory;
  });

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  return (
    <div className="admin-gallery">
      {notification.show && (
        <div className={`gallery__notification gallery__notification--${notification.type}`}>
          {notification.message}
          <button
            className="gallery__notification-close"
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
          >
            ×
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="gallery-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon"><Icons.Folder /></div>
            <div>
              <h1>Gallery Management</h1>
              <p>Organize and manage your digital collections</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card"><span className="stat-number">{categories.length}</span><span className="stat-label">Categories</span></div>
            <div className="stat-card"><span className="stat-number">{galleryItems.length}</span><span className="stat-label">Total Items</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <button className={`tab-btn ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>Categories</button>
        <button className={`tab-btn ${activeTab === "items" ? "active" : ""}`} onClick={() => setActiveTab("items")}>Gallery Items</button>
      </div>

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="categories-section">
          <div className="section-header">
            <h2>Manage Categories</h2>
            <button className="create-btn" onClick={() => setShowCategoryModal(true)}>
              <Icons.Plus />Create Category
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="gallery-empty-state">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                alt="No categories found"
                className="gallery-empty-icon"
              />
              <div className="gallery-empty-text">
                <strong>No categories found.</strong>
                <p className="gallery-empty-tip">
                  Try adding a new category to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((cat, i) => {
                const rgb = hexToRgb(cat.color);
                const bgColor = rgb
                  ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`
                  : "rgba(99, 102, 241, 0.08)";
                const borderColor = rgb
                  ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
                  : "rgba(99, 102, 241, 0.2)";
                const currItemCount = galleryItems.filter(
                  (item) => String(getCategoryId(item)) === String(cat._id)
                ).length;
                return (
                  <div
                    key={cat._id}
                    className="category-card"
                    style={{
                      backgroundColor: bgColor,
                      borderColor: borderColor,
                      animationDelay: `${i * 100}ms`,
                    }}
                  >
                    <div
                      className="category-header"
                      style={{ backgroundColor: `${cat.color}10` }}
                    >
                      <div
                        className="category-color"
                        style={{ backgroundColor: cat.color }}
                      ></div>
                      <h3>{cat.name}</h3>
                      <div className="category-actions">
                        <button onClick={() => handleEditCategory(cat)}>
                          <Icons.Edit />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat._id)}>
                          <Icons.Delete />
                        </button>
                      </div>
                    </div>
                    <div className="category-stats">
                      <span className="item-count">{currItemCount} items</span>
                      <button
                        className="manage-items-btn"
                        onClick={() => {
                          setActiveTab("items");
                          setFilterCategory(cat._id);
                        }}
                      >
                        Manage Items
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


    {/* Items Tab */}
{activeTab === "items" && (
  <div className="items-section">
    <div className="section-header">
      <h2>Gallery Items</h2>
      <div className="header-actions">
        <div className="search-container">
          <Icons.Search />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <button className="create-btn" onClick={() => setShowItemModal(true)}>
          <Icons.Plus /> Add Item
        </button>
      </div>
    </div>

    {filteredItems.length === 0 ? (
      <div className="gallery-empty-state">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
          alt="No items found"
          className="gallery-empty-icon"
        />
        <div className="gallery-empty-text">
          <strong>No gallery items found.</strong>
          <p className="gallery-empty-tip">
            Try adding a new item to display here.
          </p>
        </div>
      </div>
    ) : (
      <div className="items-grid">
        {filteredItems.map((item, i) => {
          const cat = categories.find(c => String(c._id) === String(getCategoryId(item)));
          return (
            <div
              key={item._id}
              className="item-card"
              style={{
                animationDelay: `${i * 100}ms`,
                backgroundColor: cat?.color
                  ? `${cat.color}20`
                  : "rgba(0,0,0,0.03)",
                borderColor: cat?.color
                  ? `${cat.color}40`
                  : "rgba(0,0,0,0.05)"
              }}
            >
              <div className="item-image">
                <img
                  src={item.imageUrl ? `${BACKEND_ORIGIN}${item.imageUrl}` : "/placeholder.svg"}
                  alt={item.title}
                />
                <div className="item-overlay">
                  <button onClick={() => setViewItem(item)}><Icons.EyeIcon /></button>
                  <button onClick={() => handleEditItem(item)}><Icons.Edit /></button>
                  <button onClick={() => handleDeleteItem(item._id)}><Icons.Delete /></button>
                </div>
              </div>
              <div className="item-content">
                <div className="item-category" style={{ backgroundColor: cat?.color }}>
                  {cat?.name}
                </div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <span className="item-date">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
)}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingCategory ? "Edit Category" : "Create Category"}</h3>
              <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null); setCategoryForm({ name: "", color: "#4a6fa5" }); }}>
                <Icons.X />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Enter category name" />
              </div>
              <div className="form-group">
                <label>Category Color</label>
                <div className="color-input-group">
                  <input type="color" value={categoryForm.color} onChange={e => setCategoryForm({ ...categoryForm, color: e.target.value })} />
                  <input type="text" value={categoryForm.color} onChange={e => setCategoryForm({ ...categoryForm, color: e.target.value })} placeholder="#4a6fa5" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}>Cancel</button>
              <button className="btn-primary" onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                {editingCategory ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>{editingItem ? "Edit Gallery Item" : "Add Gallery Item"}</h3>
              <button onClick={() => { setShowItemModal(false); setEditingItem(null); setItemForm({ title: "", description: "", categoryId: "", imageFile: null, imageUrl: "", date: "" }); }}>
                <Icons.X />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={itemForm.title} onChange={e => setItemForm({ ...itemForm, title: e.target.value })} placeholder="Enter item title" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={itemForm.categoryId} onChange={e => setItemForm({ ...itemForm, categoryId: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={itemForm.date} onChange={e => setItemForm({ ...itemForm, date: e.target.value })} max={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Enter item description" rows="3" />
              </div>
              <div className="form-group">
                <label>Image</label>
                <div className="image-upload">
                  <input type="file" accept="image/*" onChange={handleImageUpload} id="image-upload" />
                  <label htmlFor="image-upload" className="upload-label"><Icons.Image /> Choose Image</label>
                  {itemForm.imageUrl && (
                    <div className="image-preview">
                      {/* FIXED: prepend BACKEND_ORIGIN if existing image */}
                      <img src={itemForm.imageFile ? itemForm.imageUrl : `${BACKEND_ORIGIN}${itemForm.imageUrl}`} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowItemModal(false); setEditingItem(null); }}>Cancel</button>
              <button className="btn-primary" onClick={editingItem ? handleUpdateItem : handleCreateItem}>
                {editingItem ? "Update" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="view-details-title">
          <div className="modal view-details-modal">
            <header className="view-details-header">
              <h2 id="view-details-title">View Details</h2>
              <button aria-label="Close details" onClick={() => setViewItem(null)}>
                <Icons.X style={{ width: 24, height: 24 }} />
              </button>
            </header>
            <div className="view-details-content">
              <img
                src={viewItem.imageUrl ? `${BACKEND_ORIGIN}${viewItem.imageUrl}` : "/placeholder.svg"}
                alt={viewItem.title}
                className="view-details-image"
              />
              <h3 className="view-details-title">{viewItem.title}</h3>
              <div className="view-details-meta">
                <span className="view-details-category" style={{ backgroundColor: categories.find(c => String(c._id) === String(getCategoryId(viewItem)))?.color || '#666' }}>
                  {categories.find(c => String(c._id) === String(getCategoryId(viewItem)))?.name || 'Unknown'}
                </span>
                <time className="view-details-date" dateTime={viewItem.date}>
                  {viewItem.date ? new Date(viewItem.date).toLocaleDateString() : ''}
                </time>
              </div>
              <p className="view-details-description">{viewItem.description}</p>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default AdminGallery;
