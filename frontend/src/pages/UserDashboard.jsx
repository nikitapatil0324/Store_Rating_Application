import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Star, LogOut, Search, Settings, Store, CheckCircle, ShieldAlert } from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('stores'); // 'stores', 'settings'
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });

  // Password Update Form State
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // Rating Modal State
  const [ratingModal, setRatingModal] = useState({ open: false, storeId: null, storeName: '', rating: 0, isEdit: false });
  const [ratingError, setRatingError] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = {
        name: searchName,
        address: searchAddress,
        sortField: sort.field,
        sortOrder: sort.order
      };
      const res = await axios.get('/api/user/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stores') {
      fetchStores();
    }
  }, [activeTab, searchName, searchAddress, sort]);

  const handleSort = (field) => {
    const order = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ field, order });
  };

  // Password checks
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

  // Rating Submit handler
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setRatingError('');
    setRatingSubmitting(true);

    try {
      if (ratingModal.isEdit) {
        await axios.put(`/api/user/ratings/${ratingModal.storeId}`, { rating: ratingModal.rating });
      } else {
        await axios.post('/api/user/ratings', { storeOwnerId: ratingModal.storeId, rating: ratingModal.rating });
      }
      
      setRatingModal({ open: false, storeId: null, storeName: '', rating: 0, isEdit: false });
      fetchStores();
    } catch (err) {
      setRatingError(err.response?.data?.error || 'Failed to submit rating. Please try again.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const openRatingModal = (store, isEdit) => {
    setRatingModal({
      open: true,
      storeId: store.id,
      storeName: store.name,
      rating: isEdit ? store.user_rating : 5,
      isEdit
    });
    setRatingError('');
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Star fill="var(--primary)" size={22} color="var(--primary)" />
          <span>Store Rating Client</span>
        </div>
        <div className="nav-menu">
          <div className="nav-user-info">
            <span>Welcome, <strong>{user?.name}</strong></span>
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
            <h2>Stores & Ratings Hub</h2>
            <p>Browse registered stores, view overall community feedback, and submit your ratings.</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            Explore Stores
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setPwdError(''); setPwdSuccess(''); }}
          >
            Account Settings
          </button>
        </div>

        {/* Explore Stores Tab */}
        {activeTab === 'stores' ? (
          <div className="glass-panel" style={{ padding: '24px' }}>
            {/* Search Filters */}
            <div className="filter-bar glass-panel">
              <div className="flex-gap-8" style={{ width: '100%' }}>
                <Search size={16} color="var(--text-secondary)" />
                <input
                  type="text"
                  className="filter-input"
                  style={{ width: '100%' }}
                  placeholder="Search stores by Name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <input
                type="text"
                className="filter-input"
                placeholder="Search stores by Address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />
            </div>

            {/* Table list of stores */}
            <div className="table-container">
              {loading ? (
                <div className="spinner"></div>
              ) : stores.length === 0 ? (
                <div className="text-center" style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
                  No registered stores match your search details.
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')}>
                        Store Name {sort.field === 'name' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th onClick={() => handleSort('address')}>
                        Address {sort.field === 'address' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th onClick={() => handleSort('average_rating')}>
                        Overall Rating {sort.field === 'average_rating' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th onClick={() => handleSort('user_rating')}>
                        Your Rating {sort.field === 'user_rating' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr key={store.id}>
                        <td style={{ fontWeight: 600 }}>{store.name}</td>
                        <td>
                          <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {store.address}
                          </div>
                        </td>
                        <td>
                          <div className="rating-display">
                            <Star size={14} className="star-filled" />
                            <span>{store.average_rating > 0 ? parseFloat(store.average_rating).toFixed(1) : 'Unrated'}</span>
                          </div>
                        </td>
                        <td>
                          {store.user_rating ? (
                            <div className="rating-display" style={{ color: 'var(--success)' }}>
                              <Star size={14} fill="var(--success)" stroke="var(--success)" />
                              <span>{store.user_rating} / 5</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not rated yet</span>
                          )}
                        </td>
                        <td>
                          {store.user_rating ? (
                            <button 
                              className="logout-btn btn-secondary btn-small"
                              style={{ borderColor: 'rgba(6,182,212,0.3)', color: 'var(--secondary)' }}
                              onClick={() => openRatingModal(store, true)}
                            >
                              Modify Rating
                            </button>
                          ) : (
                            <button 
                              className="form-submit-btn btn-small"
                              style={{ width: 'auto', padding: '6px 12px' }}
                              onClick={() => openRatingModal(store, false)}
                            >
                              Submit Rating
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          /* Password settings tab */
          <div className="glass-panel" style={{ padding: '40px', maxWidth: '640px', margin: '0 auto' }}>
            <h3 className="mb-24" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} color="var(--primary)" /> Change Password
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
                <label className="form-label" htmlFor="old-pwd">Current Password</label>
                <input
                  id="old-pwd"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-pwd">New Password</label>
                <input
                  id="new-pwd"
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
                <label className="form-label" htmlFor="confirm-new-pwd">Confirm New Password</label>
                <input
                  id="confirm-new-pwd"
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

      {/* Rating Submit/Modify Modal */}
      {ratingModal.open && (
        <div className="modal-overlay" onClick={() => setRatingModal({ open: false, storeId: null, storeName: '', rating: 0, isEdit: false })}>
          <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setRatingModal({ open: false, storeId: null, storeName: '', rating: 0, isEdit: false })}>×</button>
            
            <h3 className="mb-16" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {ratingModal.isEdit ? 'Modify Store Rating' : 'Submit Store Rating'}
            </h3>
            
            <p className="mb-24" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Provide a score rating from 1 to 5 for <strong>{ratingModal.storeName}</strong>:
            </p>

            {ratingError && (
              <div className="alert alert-danger mb-16">
                <span>{ratingError}</span>
              </div>
            )}

            <form onSubmit={handleRatingSubmit}>
              <div className="form-group text-center mb-24">
                <div className="star-container">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <Star
                      key={starValue}
                      size={36}
                      className={starValue <= ratingModal.rating ? 'star star-filled' : 'star star-empty'}
                      onClick={() => setRatingModal({ ...ratingModal, rating: starValue })}
                    />
                  ))}
                </div>
                <div style={{ marginTop: '12px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--warning)' }}>
                  {ratingModal.rating} out of 5 stars
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setRatingModal({ open: false, storeId: null, storeName: '', rating: 0, isEdit: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="form-submit-btn" style={{ flex: 2 }} disabled={ratingSubmitting}>
                  {ratingSubmitting ? <div className="spinner" style={{ margin: 0, width: 18, height: 18 }}></div> : (
                    ratingModal.isEdit ? 'Save Changes' : 'Submit Score'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
