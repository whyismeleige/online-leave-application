// my-leaves-page.jsx
// Full leave history page with edit/delete capabilities

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const API_URL = 'http://localhost:5000/api';

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

export default function MyLeavesPage({ user, setUser, isAdmin }) {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  const fetchLeaves = () => {
    fetch(`${API_URL}/leaves/my`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setLeaves(data.leaves || []);
      })
      .catch(error => {
        console.error('Failed to fetch leaves:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  useEffect(() => {
    fetchLeaves();
  }, []);
  
  const handleDelete = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }
    
    setDeletingId(leaveId);
    
    try {
      const response = await fetch(`${API_URL}/leaves/${leaveId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete leave');
      }
      
      alert('Leave application cancelled successfully');
      fetchLeaves();
    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const getStatusBadgeClass = (status) => {
    if (status === 'Approved') return styles.badgeApproved;
    if (status === 'Pending') return styles.badgePending;
    if (status === 'Rejected') return styles.badgeRejected;
    return styles.badge;
  };
  
  return (
    <div className={styles.page}>
      <Navbar user={user} setUser={setUser} isAdmin={isAdmin} />
      
      <main className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>My Leaves.</h1>
            <p className={styles.pageSubtitle}>All your leave applications</p>
          </div>
          
          <Link to="/apply-leave" className={`${styles.button} ${styles.buttonPrimary}`}>
            + Apply for Leave
          </Link>
        </div>
        
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : leaves.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📋</div>
            <p className={styles.emptyStateText}>You haven't applied for any leave yet.</p>
            <Link to="/apply-leave" className={`${styles.button} ${styles.buttonPrimary}`}>
              Apply for Your First Leave
            </Link>
          </div>
        ) : (
          <div>
            {leaves.map(leave => (
              <div key={leave._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{leave.leaveType} Leave</h3>
                    <p className={styles.cardMeta}>
                      {formatDate(leave.fromDate)} → {formatDate(leave.toDate)} • {leave.numberOfDays} days
                    </p>
                  </div>
                  <span className={`${styles.badge} ${getStatusBadgeClass(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
                
                <div className={styles.cardContent}>
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  {leave.adminNote && (
                    <p style={{ marginTop: '8px' }}>
                      <strong>Admin Note:</strong> {leave.adminNote}
                    </p>
                  )}
                  <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-light)' }}>
                    Applied on: {formatDate(leave.createdAt)}
                  </p>
                </div>
                
                {/* Only show edit/delete for pending leaves */}
                {leave.status === 'Pending' && (
                  <div className={styles.cardActions}>
                    <Link 
                      to={`/edit-leave/${leave._id}`}
                      className={styles.actionButton}
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(leave._id)}
                      disabled={deletingId === leave._id}
                      className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                    >
                      {deletingId === leave._id ? 'Deleting...' : '🗑️ Cancel'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}