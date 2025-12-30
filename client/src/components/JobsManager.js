import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './JobsManager.css';

function JobsManager() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', position: '', salaryMin: '', salaryMax: '', locationCity: '', locationProvince: '', featured: false, featuredUntil: '', expiresAt: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const res = await axios.get('/api/jobs');
        setJobs(res.data.filter(j => j.pharmacyId === user.id));
      } catch (err) {
        setError('Failed to load jobs');
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const salary = { min: form.salaryMin ? Number(form.salaryMin) : null, max: form.salaryMax ? Number(form.salaryMax) : null, currency: 'ZWL' };
      const payload = {
        title: form.title,
        description: form.description,
        position: form.position,
        salary,
        location: { city: form.locationCity, province: form.locationProvince },
        featured: !!form.featured,
        featuredUntil: form.featuredUntil || null,
        expiresAt: form.expiresAt || null
      };
      const headers = { 'Content-Type': 'application/json', 'user-id': user.id };
      const res = await axios.post('/api/jobs', payload, { headers });
      setJobs(prev => [res.data, ...prev]);
      setForm({ title: '', description: '', position: '', salaryMin: '', salaryMax: '', locationCity: '', locationProvince: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/jobs/${id}`, { headers: { 'user-id': user.id } });
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  return (
    <div className="jobs-manager">
      <h3>Post a Job</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleCreate} className="job-form">
        <div className="input-group">
          <label>Title</label>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Position</label>
          <input name="position" placeholder="Position" value={form.position} onChange={handleChange} />
        </div>

        <div style={{display:'flex', gap:8}}>
          <div className="input-group" style={{flex:1}}>
            <label>Salary min</label>
            <input name="salaryMin" placeholder="Salary min" value={form.salaryMin} onChange={handleChange} />
          </div>
          <div className="input-group" style={{flex:1}}>
            <label>Salary max</label>
            <input name="salaryMax" placeholder="Salary max" value={form.salaryMax} onChange={handleChange} />
          </div>
        </div>

        <div style={{display:'flex', gap:8}}>
          <div className="input-group" style={{flex:1}}>
            <label>City</label>
            <input name="locationCity" placeholder="City" value={form.locationCity} onChange={handleChange} />
          </div>
          <div className="input-group" style={{flex:1}}>
            <label>Province</label>
            <input name="locationProvince" placeholder="Province" value={form.locationProvince} onChange={handleChange} />
          </div>
        </div>

        <div className="input-group">
          <label>Feature this job</label>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            <input type="date" name="featuredUntil" value={form.featuredUntil} onChange={handleChange} />
            <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} style={{marginLeft:8}} />
          </div>
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Create Job</button>
        </div>
      </form>

      <h3>Your Jobs</h3>
      {loading ? <p>Loading…</p> : (
        <ul className="jobs-list">
          {jobs.length === 0 ? <li>No jobs</li> : jobs.map(j => (
            <li key={j.id} className="job-card">
              <div className="job-card-info">
                <strong>{j.title}</strong>
                <div>{j.position} — {j.locationCity || j.location?.city}</div>
                <div className="text-secondary small">{j.description}</div>
              </div>
              <div className="job-card-actions">
                <button onClick={() => handleDelete(j.id)} className="btn btn-secondary">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default JobsManager;