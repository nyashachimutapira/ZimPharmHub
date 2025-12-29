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
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/jobs">Find Jobs</Link></li>
              <li><Link to="/products">Browse Products</Link></li>
              <li><Link to="/forum">Community Forum</Link></li>
              <li><Link to="/articles">Resources</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>For Businesses</h4>
            <ul>
              <li><Link to="/jobs">Post a Job</Link></li>
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
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaLinkedin /></a>
              <a href="#"><FaInstagram /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} ZimPharmHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
