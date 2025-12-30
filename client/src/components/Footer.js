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
