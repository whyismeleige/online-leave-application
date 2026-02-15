// edit-leave-page.jsx
// Edit an existing pending leave application

import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export default function EditLeavePage({ user, setUser, isAdmin }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetch(`${API_URL}/leaves/${id}`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Leave not found');
        return res.json();
      })
      .then(data => {
        const leave = data.leave;
        
        // Cannot edit if not Pending
        if (leave.status !== 'Pending') {
          alert('Only pending leave applications can be edited');
          navigate('/my-leaves');
          return;
        }
        
        // Pre-populate form with existing data
        setFormData({
          leaveType: leave.leaveType,
          fromDate: leave.fromDate.split('T')[0],
          toDate: leave.toDate.split('T')[0],
          reason: leave.reason
        });
      })
      .catch(error => {
        alert(error.message || 'Failed to load leave details');
        navigate('/my-leaves');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, navigate]);
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(formData.toDate) < new Date(formData.fromDate)) {
      alert('End date cannot be before start date');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/leaves/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update leave application');
      }
      
      alert('Leave application updated successfully!');
      navigate('/my-leaves');
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar user={user} setUser={setUser} isAdmin={isAdmin} />
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.page}>
      <Navbar user={user} setUser={setUser} isAdmin={isAdmin} />
      
      <main className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Edit Leave.</h1>
            <p className={styles.pageSubtitle}>Update your leave request</p>
          </div>
          
          <Link to="/my-leaves" className={`${styles.button} ${styles.buttonOutline}`}>
            ← Back to My Leaves
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
                disabled={submitting}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                {submitting ? 'Updating...' : 'Update Application'}
              </button>
              
              <Link to="/my-leaves" className={`${styles.button} ${styles.buttonOutline}`}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}