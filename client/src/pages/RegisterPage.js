import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './AuthPage.css';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaUser, FaBuilding } from 'react-icons/fa';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'job_seeker',
    agreeTerms: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // If already logged in, redirect
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    else if (formData.firstName.trim().length < 2) errors.firstName = 'First name must be at least 2 characters';
    
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    else if (formData.lastName.trim().length < 2) errors.lastName = 'Last name must be at least 2 characters';
    
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) errors.email = 'Invalid email format';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase and one lowercase letter';
    }

    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords don't match";

    if (!formData.agreeTerms) errors.agreeTerms = 'You must agree to the terms and conditions';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const postData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        userType: formData.userType,
      };

      const response = await axios.post('/api/auth/register', postData);
      // use AuthContext login to manage storage + state
      login(response.data, true);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" role="main">
        <h1>Join ZimPharmHub</h1>
        <p>Create your account and start your journey</p>

        {error && (
          <div className="alert alert-danger" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.firstName}
                aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                required
                placeholder="John"
                autoComplete="given-name"
              />
              {fieldErrors.firstName && (
                <small id="firstName-error" className="field-error">
                  {fieldErrors.firstName}
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.lastName}
                aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
                required
                placeholder="Doe"
                autoComplete="family-name"
              />
              {fieldErrors.lastName && (
                <small id="lastName-error" className="field-error">
                  {fieldErrors.lastName}
                </small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              required
              placeholder="john.doe@example.com"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <small id="email-error" className="field-error">
                {fieldErrors.email}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                required
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.password && (
              <small id="password-error" className="field-error">
                {fieldErrors.password}
              </small>
            )}
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Must be at least 6 characters with uppercase and lowercase letters
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                required
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirmPassword((s) => !s)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <small id="confirmPassword-error" className="field-error">
                {fieldErrors.confirmPassword}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <div className="user-type-selector">
              <label className={`user-type-option ${formData.userType === 'job_seeker' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="job_seeker"
                  checked={formData.userType === 'job_seeker'}
                  onChange={handleChange}
                />
                <FaUser className="user-type-icon" />
                <span>Job Seeker</span>
              </label>
              <label className={`user-type-option ${formData.userType === 'pharmacy' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="pharmacy"
                  checked={formData.userType === 'pharmacy'}
                  onChange={handleChange}
                />
                <FaBuilding className="user-type-icon" />
                <span>Pharmacy Owner</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="remember-me">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.agreeTerms}
              />
              <span>
                I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and{' '}
                <Link to="/privacy" target="_blank">Privacy Policy</Link>
              </span>
            </label>
            {fieldErrors.agreeTerms && (
              <small className="field-error" style={{ display: 'block', marginTop: '8px' }}>
                {fieldErrors.agreeTerms}
              </small>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} aria-busy={loading}>
            {loading ? (
              <>
                <LoadingSpinner inline size="small" />
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
