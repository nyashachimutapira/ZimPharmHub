import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PostJobPage.css';

function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    position: '',
    description: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'ZWL',
    locationCity: '',
    locationProvince: '',
    requirements: [],
    responsibilities: [],
    newRequirement: '',
    newResponsibility: '',
    employmentType: 'Full-time',
    featured: false,
    featuredUntil: '',
    featureDays: '',
    expiresAt: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="post-job-container">
        <h1>Post a Job</h1>
        <p>Please <Link to="/login">login</Link> to post a job.</p>
      </div>
    );
  }

  if (user?.userType !== 'pharmacy') {
    return (
      <div className="post-job-container">
        <h1>Post a Job</h1>
        <p>Only pharmacy accounts can post jobs. If this is your business, please <Link to="/register">create a pharmacy account</Link> or contact support.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const addRequirement = () => {
    if (!form.newRequirement.trim()) return;
    setForm(prev => ({ ...prev, requirements: [...prev.requirements, prev.newRequirement.trim()], newRequirement: '' }));
  };

  const removeRequirement = (idx) => {
    setForm(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== idx) }));
  };

  const addResponsibility = () => {
    if (!form.newResponsibility.trim()) return;
    setForm(prev => ({ ...prev, responsibilities: [...prev.responsibilities, prev.newResponsibility.trim()], newResponsibility: '' }));
  };

  const removeResponsibility = (idx) => {
    setForm(prev => ({ ...prev, responsibilities: prev.responsibilities.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    const min = form.salaryMin ? Number(form.salaryMin) : null;
    const max = form.salaryMax ? Number(form.salaryMax) : null;
    if (min !== null && max !== null && min > max) {
      setError('Salary minimum cannot be greater than salary maximum.');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      position: form.position,
      salary: { min, max, currency: form.currency },
      location: { city: form.locationCity, province: form.locationProvince },
      requirements: form.requirements,
      responsibilities: form.responsibilities,
      employmentType: form.employmentType,
      // Do not mark featured until payment completes
      featured: false,
      featuredUntil: null,
      expiresAt: form.expiresAt || null
    };

    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json', 'user-id': user.id };
      const res = await axios.post('/api/jobs', payload, { headers });

      // If user requested feature promotion, start Stripe Checkout flow
      if (form.featured && Number(form.featureDays) > 0) {
        const checkoutResp = await axios.post('/api/payments/create-feature-checkout', { jobId: res.data.id, days: Number(form.featureDays), userId: user.id });
        if (checkoutResp.data?.url) {
          // Redirect to Stripe Checkout
          window.location.href = checkoutResp.data.url;
          return;
        }
      }

      // Otherwise go to job page
      navigate(`/jobs/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <h1>Post a Job</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="post-job-layout">
        <form className="post-job-form" onSubmit={handleSubmit}>
          <label>
            Title *
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>

          <label>
            Position
            <input name="position" value={form.position} onChange={handleChange} />
          </label>

          <label>
            Employment type
            <select name="employmentType" value={form.employmentType} onChange={handleChange}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Temporary</option>
              <option>Internship</option>
            </select>
          </label>

          <label>
            Salary min
            <input name="salaryMin" type="number" value={form.salaryMin} onChange={handleChange} />
          </label>

          <label>
            Salary max
            <input name="salaryMax" type="number" value={form.salaryMax} onChange={handleChange} />
          </label>

          <label>
            Currency
            <select name="currency" value={form.currency} onChange={handleChange}>
              <option value="ZWL">ZWL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>

          <label>
            City
            <input name="locationCity" value={form.locationCity} onChange={handleChange} />
          </label>

          <label>
            Province
            <input name="locationProvince" value={form.locationProvince} onChange={handleChange} />
          </label>

          <label>
            Description *
            <textarea name="description" value={form.description} onChange={handleChange} rows={6} required />
          </label>

          <label>
            Requirements
            <div className="chips-input">
              <div className="chips-list">
                {form.requirements.map((r, i) => (
                  <span key={i} className="chip">{r} <button type="button" onClick={() => removeRequirement(i)} className="chip-remove">×</button></span>
                ))}
              </div>
              <div className="chips-control">
                <input name="newRequirement" value={form.newRequirement} onChange={handleChange} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }} placeholder="Type requirement and press Enter" />
                <button type="button" onClick={addRequirement} className="btn">Add</button>
              </div>
            </div>
          </label>

          <label>
            Responsibilities
            <div className="chips-input">
              <div className="chips-list">
                {form.responsibilities.map((r, i) => (
                  <span key={i} className="chip">{r} <button type="button" onClick={() => removeResponsibility(i)} className="chip-remove">×</button></span>
                ))}
              </div>
              <div className="chips-control">
                <input name="newResponsibility" value={form.newResponsibility} onChange={handleChange} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addResponsibility(); } }} placeholder="Type responsibility and press Enter" />
                <button type="button" onClick={addResponsibility} className="btn">Add</button>
              </div>
            </div>
          </label>

          <label>
            Feature this job (promote)
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              <input type="number" min={1} max={365} name="featureDays" value={form.featureDays || ''} onChange={handleChange} placeholder="Days" style={{width:80}} />
            </div>
            <small>Select number of days to feature. Payment will be taken through Stripe.</small>
          </label>

          <label>
            Expire on (optional)
            <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} />
            <small>Job will be auto-closed after this date</small>
          </label>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Posting…' : 'Post Job'}</button>
          </div>
        </form>

        <aside className="post-job-preview">
          <h3>Preview</h3>
          <div className="job-preview-card">
            <h2>{form.title || 'Job title'}</h2>
            <div className="meta">
              <span>{form.position || 'Position'}</span>
              <span>{form.employmentType}</span>
            </div>
            <div className="location">📍 {form.locationCity || 'City'}, {form.locationProvince || 'Province'}</div>
            <div className="salary">💰 {form.salaryMin || '—'} - {form.salaryMax || '—'} {form.currency}</div>
            <p className="desc">{form.description || 'Job description'}</p>

            {form.requirements && form.requirements.length > 0 && (
              <div>
                <h4>Requirements</h4>
                <ul>
                  {form.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {form.responsibilities && form.responsibilities.length > 0 && (
              <div>
                <h4>Responsibilities</h4>
                <ul>
                  {form.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            <div className="posted-by">Posted by: {user.firstName || user.id} {user.lastName ? user.lastName : ''}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PostJobPage;
