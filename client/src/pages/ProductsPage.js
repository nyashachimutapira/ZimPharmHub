import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductsPage.css';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', search: '' });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      const response = await axios.get(`/api/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products-page">
      <div className="container">
        <h1>Pharmacy Products</h1>
        
        <div className="filters">
          <input
            type="text"
            placeholder="Search products..."
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All Categories</option>
            <option value="Medications">Medications</option>
            <option value="Supplements">Supplements</option>
            <option value="Medical Devices">Medical Devices</option>
          </select>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image"></div>
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-pharmacy">{product.pharmacy?.name}</p>
                <p className="product-price">ZWL {product.price?.amount}</p>
                <button className="btn btn-secondary">View Details</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
