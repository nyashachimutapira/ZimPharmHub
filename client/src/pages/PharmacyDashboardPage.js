import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdsManager from '../components/AdsManager';
import JobsManager from '../components/JobsManager';
import ProductsManager from '../components/ProductsManager';
import './DashboardPage.css';

function PharmacyDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const jobsResp = await axios.get('/api/jobs');
        // Filter jobs by pharmacyId
        setJobs(jobsResp.data.filter(j => j.pharmacyId === user.id));

        const productsResp = await axios.get('/api/products');
        setProducts(productsResp.data.filter(p => p.pharmacy === user.id || p.pharmacy === user.id));
      } catch (err) {
        console.error('Failed to load dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (!user) return <p>Please login to access the dashboard.</p>;

  return (
    <div className="dashboard-container">
      <h1>Pharmacy Dashboard</h1>

      <section>
        <JobsManager />
      </section>

      <section>
        <ProductsManager />
      </section>

      <section>
        <h2>Advertisements</h2>
        <AdsManager />
      </section>
    </div>
  );
}

export default PharmacyDashboardPage;
