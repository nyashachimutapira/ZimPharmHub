import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function ProductsManager() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', category: 'Medications', price: '', stock: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data.filter(p => p.pharmacy === user.id || p.pharmacy === user.id));
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  async function uploadFiles(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('images', files[i]);
    const headers = { 'Content-Type': 'multipart/form-data' };
    const res = await axios.post('/api/uploads/images', formData, { headers });
    return res.data.urls || [];
  }

  const handleFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const urls = await uploadFiles(files);
      setImages(prev => [...prev, ...urls]);
    } catch (err) {
      setError('Failed to upload images');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: { amount: Number(form.price) || 0, currency: 'ZWL' },
        stock: Number(form.stock) || 0,
        images,
      };
      const headers = { 'Content-Type': 'application/json', 'user-id': user.id };
      const res = await axios.post('/api/products', payload, { headers });
      setProducts(prev => [res.data, ...prev]);
      setForm({ name: '', description: '', category: 'Medications', price: '', stock: '' });
      setImages([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`, { headers: { 'user-id': user.id } });
      setProducts(prev => prev.filter(p => p._id !== id && p.id !== id));
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  return (
    <div className="products-manager">
      <h3>Add Product</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleCreate} className="product-form">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <select name="category" value={form.category} onChange={handleChange}>
          <option>Medications</option>
          <option>Supplements</option>
          <option>Medical Devices</option>
          <option>Personal Care</option>
          <option>OTC</option>
        </select>
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
        <input name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

        <label>Upload images</label>
        <input type="file" multiple accept="image/*" onChange={handleFiles} />
        <div className="image-preview">
          {images.map((u, i) => (
            <img key={i} src={u} alt={`preview-${i}`} style={{ width: 80, marginRight: 8 }} />
          ))}
        </div>

        <button type="submit" className="btn btn-primary">Create Product</button>
      </form>

      <h3>Your Products</h3>
      {loading ? <p>Loading…</p> : (
        <ul>
          {products.length === 0 ? <li>No products</li> : products.map(p => (
            <li key={p._id || p.id}>
              <strong>{p.name}</strong>
              <div>{p.description}</div>
              <small>Price: {p.price?.amount || 'N/A'}</small>
              <div>
                {(p.images || []).map((img, idx) => <img key={idx} src={img} alt={p.name} style={{ width: 60 }} />)}
              </div>
              <button onClick={() => handleDelete(p._id || p.id)} className="btn btn-danger small">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductsManager;