import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdsManager() {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', link: '', type: 'general', featured: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAds() {
      if (!user) return;
      try {
        const res = await axios.get('/api/ads', { params: { pharmacyId: user.id } });
        setAds(res.data || []);
      } catch (err) {
        console.error('Failed to load ads:', err.message);
        setError('Failed to load ads');
      } finally {
        setLoading(false);
      }
    }
    loadAds();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const headers = { 'Content-Type': 'application/json', 'user-id': user.id };
      const res = await axios.post('/api/ads', form, { headers });
      setAds(prev => [res.data, ...prev]);
      setForm({ title: '', body: '', link: '', type: 'general', featured: false });
    } catch (err) {
      console.error('Failed to create ad:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create ad');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/ads/${id}`, { headers: { 'user-id': user.id } });
      setAds(prev => prev.filter(a => a._id !== id && a.id !== id));
    } catch (err) {
      console.error('Failed to delete ad:', err.message);
      setError('Failed to delete ad');
    }
  };

  return (
    <div className="ads-manager">
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleCreate} className="ad-form">
        <div>
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Body</label>
          <textarea name="body" value={form.body} onChange={handleChange} />
        </div>
        <div>
          <label>Link</label>
          <input name="link" value={form.link} onChange={handleChange} />
        </div>
        <div>
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="general">General</option>
            <option value="product">Product</option>
            <option value="pharmacy">Pharmacy</option>
          </select>
        </div>
        <div>
          <label>
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured
          </label>
        </div>
        <button type="submit" className="btn btn-primary">Create Ad</button>
      </form>

      <h3>Your Ads</h3>
      {loading ? <p>Loading…</p> : (
        <ul>
          {ads.length === 0 ? <li>No ads yet.</li> : ads.map(ad => (
            <li key={ad._id || ad.id}>
              <strong>{ad.title}</strong> — {ad.type} {ad.featured && <span>⭐</span>}
              <div>{ad.body}</div>
              <div><a href={ad.link} target="_blank" rel="noreferrer">Link</a></div>
              <button onClick={() => handleDelete(ad._id || ad.id)} className="btn btn-danger small">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdsManager;
