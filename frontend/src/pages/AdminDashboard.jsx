import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, Store, Star, LogOut, Search, Plus, 
  ArrowUpDown, Eye, CheckCircle, ShieldAlert 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('stores'); // 'stores', 'users', 'add-user'
  
  // Lists & Filtering
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });

  // Add User Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Selected User for Modal
  const [selectedUser, setSelectedUser] = useState(null);

  // Load Admin Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    }
  };

  // Load Listings (users or stores)
  const fetchListings = async () => {
    setLoading(true);
    try {
      const typeParam = activeTab === 'stores' ? 'stores' : 'users';
      const params = {
        type: typeParam,
        name: filters.name,
        email: filters.email,
        address: filters.address,
        role: filters.role,
        sortField: sort.field,
        sortOrder: sort.order
      };
      const res = await axios.get('/api/admin/listings', { params });
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching admin listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab !== 'add-user') {
      fetchListings();
    }
  }, [activeTab, filters, sort]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSort = (field) => {
    const order = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ field, order });
  };

  // User form validations
  const isNameValid = formData.name.length >= 20 && formData.name.length <= 60;
  const isAddressValid = formData.address.length > 0 && formData.address.length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const isPasswordLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const isPasswordValid = hasUppercase && hasSpecial && isPasswordLengthValid;

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isNameValid) {
      setFormError('Name must be between 20 and 60 characters.');
      return;
    }
    if (!isEmailValid) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!isAddressValid) {
      setFormError('Address must not exceed 400 characters.');
      return;
    }
    if (!isPasswordValid) {
      setFormError('Password must meet the length and format constraints.');
      return;
    }

    setFormSubmitting(true);
    try {
      await axios.post('/api/admin/users', formData);
      setFormSuccess(`${formData.role === 'store_owner' ? 'Store' : 'User'} created successfully!`);
      setFormData({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchStats();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create user. Verify email uniqueness.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Star fill="var(--primary)" size={22} color="var(--primary)" />
          <span>Store Rating Panel</span>
        </div>
        <div className="nav-menu">
          <div className="nav-user-info">
            <span>Logged in as: <strong>{user?.name}</strong></span>
            <span className="nav-user-badge">{user?.role}</span>
          </div>
          <button onClick={logout} className="logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Dashboard Panel */}
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>Welcome Back, {user?.name.split(' ')[0]}!</h2>
            <p>Monitor platform statistics, manage users, and approve store owners.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="glass-panel stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <div className="stat-number">{stats.totalUsers}</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon">
              <Store size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Stores</h3>
              <div className="stat-number">{stats.totalStores}</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-info">
              <h3>Submitted Ratings</h3>
              <div className="stat-number">{stats.totalRatings}</div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stores'); setFilters({ name: '', email: '', address: '', role: '' }); }}
          >
            Registered Stores
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); setFilters({ name: '', email: '', address: '', role: '' }); }}
          >
            System Users
          </button>
          <button 
            className={`tab-btn ${activeTab === 'add-user' ? 'active' : ''}`}
            onClick={() => { setActiveTab('add-user'); setFormError(''); setFormSuccess(''); }}
          >
            Create User / Store
          </button>
        </div>

        {/* TABS CONTENT */}
        {activeTab !== 'add-user' ? (
          <div className="glass-panel" style={{ padding: '24px' }}>
            {/* Filter Bar */}
            <div className="filter-bar glass-panel">
              <div className="flex-gap-8" style={{ width: '100%' }}>
                <Search size={16} color="var(--text-secondary)" />
                <input
                  type="text"
                  name="name"
                  className="filter-input"
                  style={{ width: '100%' }}
                  placeholder="Filter by Name..."
                  value={filters.name}
                  onChange={handleFilterChange}
                />
              </div>

              <input
                type="text"
                name="email"
                className="filter-input"
                placeholder="Filter by Email..."
                value={filters.email}
                onChange={handleFilterChange}
              />

              <input
                type="text"
                name="address"
                className="filter-input"
                placeholder="Filter by Address..."
                value={filters.address}
                onChange={handleFilterChange}
              />

              {activeTab === 'users' && (
                <select
                  name="role"
                  className="form-select"
                  style={{ padding: '10px 14px' }}
                  value={filters.role}
                  onChange={handleFilterChange}
                >
                  <option value="">All Roles</option>
                  <option value="user">Normal Users</option>
                  <option value="admin">Administrators</option>
                </select>
              )}
            </div>

            {/* Table */}
            <div className="table-container">
              {loading ? (
                <div className="spinner"></div>
              ) : listings.length === 0 ? (
                <div className="text-center" style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
                  No records found matching the search criteria.
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')}>
                        Name {sort.field === 'name' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th onClick={() => handleSort('email')}>
                        Email {sort.field === 'email' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th onClick={() => handleSort('address')}>
                        Address {sort.field === 'address' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                      </th>
                      {activeTab === 'stores' ? (
                        <th onClick={() => handleSort('average_rating')}>
                          Overall Rating {sort.field === 'average_rating' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                      ) : (
                        <th onClick={() => handleSort('role')}>
                          Role {sort.field === 'role' && <span className="sort-indicator">{sort.order === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                      )}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>{item.email}</td>
                        <td>
                          <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.address}
                          </div>
                        </td>
                        <td>
                          {activeTab === 'stores' ? (
                            <div className="rating-display">
                              <Star size={14} className="star-filled" />
                              <span>{item.average_rating > 0 ? parseFloat(item.average_rating).toFixed(1) : 'Unrated'}</span>
                            </div>
                          ) : (
                            <span className={`role-badge role-${item.role}`}>
                              {item.role === 'admin' ? 'Administrator' : 'Normal User'}
                            </span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="logout-btn btn-secondary btn-small"
                            style={{ borderColor: 'rgba(99,102,241,0.3)', color: 'var(--primary)' }}
                            onClick={() => setSelectedUser(item)}
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          /* Add User tab */
          <div className="glass-panel" style={{ padding: '40px', maxWidth: '640px', margin: '0 auto' }}>
            <h3 className="mb-24" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} color="var(--primary)" /> Add User / Store
            </h3>

            {formError && (
              <div className="alert alert-danger">
                <ShieldAlert size={16} />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="alert alert-success">
                <CheckCircle size={16} />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-role">System Role</label>
                <select
                  id="admin-role"
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">Normal User (Customer)</option>
                  <option value="store_owner">Store Owner (Store Representative)</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <div className="form-label">
                  <label htmlFor="admin-name">{formData.role === 'store_owner' ? 'Store Name' : 'Full Name'}</label>
                  <span className={`char-counter ${formData.name.length > 0 && !isNameValid ? 'error' : ''}`}>
                    {formData.name.length}/60 (Min 20 required)
                  </span>
                </div>
                <input
                  id="admin-name"
                  type="text"
                  className="form-input"
                  placeholder="Min 20 characters required"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin-email">Email Address</label>
                <input
                  id="admin-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. office@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label">
                  <label htmlFor="admin-address">Physical Address</label>
                  <span className={`char-counter ${formData.address.length > 400 ? 'error' : ''}`}>
                    {formData.address.length}/400
                  </span>
                </div>
                <textarea
                  id="admin-address"
                  className="form-input form-textarea"
                  placeholder="Street details (Max 400 characters)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin-password">Assigned Password</label>
                <input
                  id="admin-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <button 
                type="submit" 
                className="form-submit-btn" 
                disabled={formSubmitting}
              >
                {formSubmitting ? <div className="spinner" style={{ margin: 0, width: 18, height: 18 }}></div> : (
                  <>
                    <Plus size={18} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            <h3 className="mb-16" style={{ fontWeight: 700, fontSize: '1.25rem' }}>Account Profile Details</h3>
            
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <span className={`role-badge role-${selectedUser.role}`}>
                {selectedUser.role === 'admin' ? 'Administrator' : selectedUser.role === 'store_owner' ? 'Store Owner' : 'Normal User'}
              </span>
            </div>

            <div className="details-grid">
              <span className="details-label">Name:</span>
              <span>{selectedUser.name}</span>

              <span className="details-label">Email:</span>
              <span>{selectedUser.email}</span>

              <span className="details-label">Address:</span>
              <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{selectedUser.address}</span>

              {selectedUser.role === 'store_owner' && (
                <>
                  <span className="details-label">Rating:</span>
                  <div className="rating-display" style={{ color: 'var(--warning)' }}>
                    <Star size={16} fill="var(--warning)" />
                    <span>{selectedUser.average_rating > 0 ? parseFloat(selectedUser.average_rating).toFixed(1) : 'Unrated'}</span>
                  </div>
                </>
              )}
            </div>

            <button 
              className="form-submit-btn btn-secondary mt-24"
              style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => setSelectedUser(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
