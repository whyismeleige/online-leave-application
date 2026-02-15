// apply-leave-page.jsx
// Form for employees to submit a new leave application

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const API_URL = 'http://localhost:5000/api';
const LEAVE_TYPES = ['Casual', 'Sick', 'Paid', 'Other'];

function Navbar({ user, setUser, isAdmin }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      alert('Logged out successfully');
      navigate('/');
    } catch (error) {
      alert('Logout failed');
    }
  };
  
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <Link to="/" className={styles.brand}>
          <div className={styles.brandIcon}>O_</div>
          <span className={styles.brandText}>OFF SITE</span>
        </Link>
        
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link to="/my-leaves" className={styles.navLink}>My Leaves</Link>
          {isAdmin && (
            <Link to="/admin" className={`${styles.navLink} ${styles.navLinkAdmin}`}>
              Admin Panel
            </Link>
          )}
        </div>
        
        <div className={styles.navActions}>
          <span className={styles.userName}>{user?.name}</span>
          <button onClick={handleLogout} className={`${styles.button} ${styles.buttonOutline}`}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function ApplyLeavePage({ user, setUser, isAdmin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.leaveType) {
      alert('Please select a leave type');
      return;
    }
    
    if (new Date(formData.toDate) < new Date(formData.fromDate)) {
      alert('End date cannot be before start date');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit leave application');
      }
      
      alert('Leave application submitted successfully!');
      navigate('/my-leaves');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.page}>
      <Navbar user={user} setUser={setUser} isAdmin={isAdmin} />
      
      <main className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Apply for Leave.</h1>
            <p className={styles.pageSubtitle}>Submit a new leave request</p>
          </div>
          
          <Link to="/dashboard" className={`${styles.button} ${styles.buttonOutline}`}>
            ← Back to Dashboard
          </Link>
        </div>
        
        <div style={{ maxWidth: '600px' }}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="leaveType" className={styles.label}>Leave Type</label>
              <select
                id="leaveType"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
                className={styles.select}
              >
                <option value="">Select leave type...</option>
                {LEAVE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="fromDate" className={styles.label}>Start Date</label>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="toDate" className={styles.label}>End Date</label>
              <input
                type="date"
                id="toDate"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="reason" className={styles.label}>Reason for Leave</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                className={styles.textarea}
                placeholder="Please provide a brief reason for your leave request..."
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button 
                type="submit" 
                disabled={loading}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
              
              <Link to="/dashboard" className={`${styles.button} ${styles.buttonOutline}`}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}