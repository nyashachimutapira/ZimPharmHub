import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      // In development, show the token. In production, remove this
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
        setStep('reset');
      } else {
        setMessage('Please check your email for reset instructions.');
      }
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error requesting password reset');
      setMessage('');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', {
        token: resetToken,
        newPassword,
      });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error resetting password');
      setMessage('');
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="container">
        <div className="forgot-password-container">
          <h1>Reset Password</h1>
          
          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="forgot-password-form">
              <p>Enter your email address and we'll send you instructions to reset your password.</p>
              
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              
              <button type="submit" className="btn-submit">
                Send Reset Link
              </button>
              
              <p className="back-to-login">
                Remember your password? <Link to="/login">Back to Login</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="forgot-password-form">
              <p>Enter your new password.</p>
              
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="token">Reset Token</label>
                <input
                  type="text"
                  id="token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                  placeholder="Enter reset token from email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                />
              </div>
              
              <button type="submit" className="btn-submit">
                Reset Password
              </button>
              
              <p className="back-to-login">
                <Link to="/login">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

