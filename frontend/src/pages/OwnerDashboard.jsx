import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Star, LogOut, Settings, MessageSquareCode, CheckCircle, ShieldAlert } from 'lucide-react';

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'settings'
  const [data, setData] = useState({ averageRating: '0.0', ratings: [] });
  const [loading, setLoading] = useState(false);

  // Sorting
  const [sort, setSort] = useState({ field: 'created_at', order: 'desc' });

  // Password Update Form State
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/owner/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching store owner dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchData();
    }
  }, [activeTab]);

  const handleSort = (field) => {
    const order = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ field, order });
  };

  // Sort ratings list in client side based on selection
  const sortedRatings = [...data.ratings].sort((a, b) => {
    let valA = a[sort.field];
    let valB = b[sort.field];

    if (sort.field === 'created_at') {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return sort.order === 'asc' ? -1 : 1;
    if (valA > valB) return sort.order === 'asc' ? 1 : -1;
    return 0;
  });

  // Password safety checks
  const hasUppercase = /[A-Z]/.test(passwordForm.newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword);
  const isPasswordLengthValid = passwordForm.newPassword.length >= 8 && passwordForm.newPassword.length <= 16;
  const isPasswordValid = hasUppercase && hasSpecial && isPasswordLengthValid;

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setPwdError('New password does not meet safety constraints.');
      return;
    }

    setPwdSubmitting(true);
    try {
      await axios.put('/api/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setPwdSuccess('Password updated successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPwdError(err.response?.data?.error || 'Failed to update password. Check your current password.');
    } finally {
      setPwdSubmitting(false);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Star fill="var(--primary)" size={22} color="var(--primary)" />
          <span>Store Owner Portal</span>
        </div>
        <div className="nav-menu">
          <div className="nav-user-info">
            <span>Store: <strong>{user?.name}</strong></span>
            <span className="nav-user-badge">{user?.role}</span>
          </div>
          <button onClick={logout} className="logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>Store Analytics</h2>
            <p>Track store overall ratings, monitor latest reviews, and update login settings.</p>
          </div>
        </div>

        {/* Store metrics card */}
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="glass-panel stat-card" style={{ justifyContent: 'center', padding: '32px' }}>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', width: 64, height: 64 }}>
              <Star fill="var(--warning)" size={32} />
            </div>
            <div className="stat-info" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1rem' }}>Store Average Rating</h3>
              <div className="stat-number" style={{ fontSize: '3rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                <span>{data.averageRating}</span>
                <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>/ 5.0</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                Calculated from {data.ratings.length} customer submission(s)
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            Raters Feedback
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setPwdError(''); setPwdSuccess(''); }}
          >
            Store Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' ? (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 className="mb-24" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
              <MessageSquareCode size={20} color="var(--primary)" /> Customer Ratings Feed
            </h3>

            <div className="table-container">
              {loading ? (
                <div className="spinner"></div>
              ) : sortedRatings.length === 0 ? (
                <div className="text-center" style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
                  No customer ratings have been submitted for your store yet.
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')}>
                        Customer Name {sort.field === 'name' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th onClick={() => handleSort('email')}>
                        Email {sort.field === 'email' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th onClick={() => handleSort('address')}>
                        Address {sort.field === 'address' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th onClick={() => handleSort('rating')}>
                        Score Rating {sort.field === 'rating' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th onClick={() => handleSort('created_at')}>
                        Submitted Date {sort.field === 'created_at' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRatings.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{row.name}</td>
                        <td>{row.email}</td>
                        <td>
                          <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.address}
                          </div>
                        </td>
                        <td>
                          <div className="rating-display" style={{ color: 'var(--warning)' }}>
                            <Star size={14} fill="var(--warning)" />
                            <span>{row.rating} / 5</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {new Date(row.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          /* Store Settings Tab (Password update) */
          <div className="glass-panel" style={{ padding: '40px', maxWidth: '640px', margin: '0 auto' }}>
            <h3 className="mb-24" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} color="var(--primary)" /> Update Credentials
            </h3>

            {pwdError && (
              <div className="alert alert-danger">
                <ShieldAlert size={16} />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="alert alert-success">
                <CheckCircle size={16} />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label className="form-label" htmlFor="owner-old-pwd">Current Password</label>
                <input
                  id="owner-old-pwd"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="owner-new-pwd">New Password</label>
                <input
                  id="owner-new-pwd"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: isPasswordLengthValid ? 'var(--success)' : 'var(--text-muted)' }}>✓ 8-16 chars</span>
                    <span style={{ color: hasUppercase ? 'var(--success)' : 'var(--text-muted)' }}>✓ 1 Uppercase</span>
                    <span style={{ color: hasSpecial ? 'var(--success)' : 'var(--text-muted)' }}>✓ 1 Special char</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="owner-confirm-new-pwd">Confirm New Password</label>
                <input
                  id="owner-confirm-new-pwd"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="form-submit-btn" 
                disabled={pwdSubmitting}
              >
                {pwdSubmitting ? <div className="spinner" style={{ margin: 0, width: 18, height: 18 }}></div> : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
