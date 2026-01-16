import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About ZimPharmHub</h4>
            <p>Connecting pharmacy professionals with opportunities and resources in Zimbabwe.</p>
          </div>

          <div className="footer-section">
            <h4>Job Seekers</h4>
            <ul>
              <li><Link to="/jobs">Find Jobs</Link></li>
              <li><Link to="/job-alerts">Job Alerts</Link></li>
              <li><Link to="/dashboard">My Dashboard</Link></li>
              <li><Link to="/articles">Career Resources</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Tools & Services</h4>
            <ul>
              <li><Link to="/products">Browse Products</Link></li>
              <li><Link to="/forum">Community Forum</Link></li>
              <li><Link to="/events">Events Calendar</Link></li>
              <li><Link to="/messages">Messages</Link></li>
              <li><Link to="/analytics">Analytics</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>For Businesses</h4>
            <ul>
              <li><Link to="/post-job">Post a Job</Link></li>
              <li><Link to="/products">List Products</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/register">Sign Up</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Regulatory</h4>
            <ul>
              <li>
                <a 
                  href="https://mcz.org.zw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mcz-link"
                >
                  Medical Council of Zimbabwe (MCZ)
                </a>
              </li>
              <li>
                <a 
                  href="https://mcz.org.zw/search-register" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mcz-link"
                >
                  Verify Practitioners
                </a>
              </li>
              <li>
                <a 
                  href="https://pharmacycouncil.co.zw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mcz-link"
                >
                  Pharmacy Council of Zimbabwe
                </a>
              </li>
            </ul>
            <p className="regulatory-text">
              Regulated by the Medical Council of Zimbabwe (MCZ) and Pharmacy Council of Zimbabwe
            </p>
          </div>

          <div className="footer-section">
            <h4>Contact & Support</h4>
            <div className="contact-info">
              <p>
                <strong>📧 Email:</strong><br />
                <a href="mailto:support@zimpharmhub.com">support@zimpharmhub.com</a>
              </p>
              <p>
                <strong>📞 Phone:</strong><br />
                <a href="tel:+263123456789">+263 123 456 789</a>
              </p>
              <p>
                <strong>📍 Address:</strong><br />
                Harare, Zimbabwe
              </p>
            </div>
            <div className="help-links">
              <Link to="/faq">Help Center</Link>
              <Link to="/contact">Contact Support</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Stay Updated</h4>
            <p>Subscribe to our newsletter for job alerts and pharmacy updates.</p>
            <div className="newsletter-signup">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="newsletter-btn">Subscribe</button>
            </div>
            <div className="social-icons">
              <a href="https://facebook.com" aria-label="Facebook"><FaFacebook /></a>
              <a href="https://twitter.com" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Platform Stats</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Active Jobs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Registered Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">200+</span>
                <span className="stat-label">Partner Pharmacies</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">User Satisfaction</span>
              </div>
            </div>
            <div className="certifications">
              <div className="cert-badge">
                <span className="cert-icon">🏆</span>
                <span>Zimbabwe Top Health Tech 2025</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} ZimPharmHub. All rights reserved.</p>
          <p className="regulatory-notice">
            Verify practitioners with{' '}
            <a 
              href="https://mcz.org.zw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mcz-link"
            >
              Medical Council of Zimbabwe (MCZ)
            </a>
            {' '}and{' '}
            <a 
              href="https://pharmacycouncil.co.zw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mcz-link"
            >
              Pharmacy Council of Zimbabwe
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
