import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdsCarousel.css';

function AdsCarousel() {
  const [ads, setAds] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/api/ads', { params: { featured: true } });
        setAds(res.data || []);
      } catch (err) {
        console.error('Failed to load ads:', err.message);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (ads.length ? (c + 1) % ads.length : 0)), 5000);
    return () => clearInterval(t);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const ad = ads[current];

  return (
    <div className="ads-carousel">
      <div className="ads-slide">
        {ad.images && ad.images.length > 0 && (
          <img src={ad.images[0]} alt={ad.title} className="ads-image" />
        )}
        <div className="ads-content">
          <h3>{ad.title}</h3>
          <p>{ad.body}</p>
          {ad.link && <a href={ad.link} target="_blank" rel="noreferrer">Learn more</a>}
        </div>
      </div>
      <div className="ads-indicators">
        {ads.map((_, i) => (
          <button key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  );
}

export default AdsCarousel;