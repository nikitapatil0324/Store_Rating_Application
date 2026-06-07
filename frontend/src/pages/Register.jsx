import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Field validation checks for UI feedback
  const isNameValid = name.length >= 20 && name.length <= 60;
  const isAddressValid = address.length > 0 && address.length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordLengthValid = password.length >= 8 && password.length <= 16;
  const isPasswordValid = hasUppercase && hasSpecial && isPasswordLengthValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Perform full validation check
    if (!isNameValid) {
      setError('Name must be between 20 and 60 characters.');
      return;
    }
    if (!isEmailValid) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!isAddressValid) {
      setError('Address must not exceed 400 characters.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must meet all specified requirements.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/register', { name, email, address, password, role });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join the Store Rating platform</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">System Role</label>
            <select
              id="reg-role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Normal User (Customer)</option>
              <option value="store_owner">Store Owner (Store Representative)</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <div className="form-label">
              <label htmlFor="reg-name">Full Name</label>
              <span className={`char-counter ${name.length > 0 && !isNameValid ? 'error' : ''}`}>
                {name.length}/60 (Min 20 required)
              </span>
            </div>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="Min 20 characters (e.g. Alexander Nathaniel Henderson)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="e.g. name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <label htmlFor="reg-address">Physical Address</label>
              <span className={`char-counter ${address.length > 400 ? 'error' : ''}`}>
                {address.length}/400
              </span>
            </div>
            <textarea
              id="reg-address"
              className="form-input form-textarea"
              placeholder="Enter your complete mailing address (Max 400 characters)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {/* Password Validation Hints */}
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ color: isPasswordLengthValid ? 'var(--success)' : 'var(--text-muted)' }}>
                  ✓ 8-16 chars
                </span>
                <span style={{ color: hasUppercase ? 'var(--success)' : 'var(--text-muted)' }}>
                  ✓ 1 Uppercase letter
                </span>
                <span style={{ color: hasSpecial ? 'var(--success)' : 'var(--text-muted)' }}>
                  ✓ 1 Special character
                </span>
              </div>
            </div>
          </div>

          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? <div className="spinner" style={{ margin: 0, width: 18, height: 18 }}></div> : (
              <>
                <UserPlus size={18} />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-16">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" className="text-link">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
