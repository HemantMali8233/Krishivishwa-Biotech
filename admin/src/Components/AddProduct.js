import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Components/AddProduct.css';

const AddProduct = () => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product Submitted:', form);
    navigate('/product'); 
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <label>
          Product Name:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Category:
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Fertilizer">Fertilizer</option>
            <option value="Insecticide">Insecticide</option>
            <option value="Fungicide">Fungicide</option>
          </select>
        </label>

        <label>
          Price (₹):
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Stock:
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </label>

        <div className="form-buttons">
          <button type="submit" className="submit-btn">Add Product</button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/product')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
