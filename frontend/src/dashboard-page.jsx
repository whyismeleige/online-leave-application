// dashboard-page.jsx
// Employee dashboard showing leave overview and recent history

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

export default function DashboardPage({ user, setUser, isAdmin }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
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
  }, []);
  
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const totalDaysUsed = leaves
    .filter(l => l.status === 'Approved')
    .reduce((sum, l) => sum + (l.numberOfDays || 0), 0);
  
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
  
  // Show last 5 leaves
  const recentLeaves = leaves.slice(0, 5);
  
  return (
    <div className={styles.page}>
      <Navbar user={user} setUser={setUser} isAdmin={isAdmin} />
      
      <main className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>The Ledger.</h1>
            <p className={styles.pageSubtitle}>
              {user?.name} • {user?.department}
            </p>
          </div>
          
          {/* Summary Stats */}
          <div style={{ display: 'flex', gap: '32px' }}>
            <div className={styles.statsCard}>
              <span className={styles.statsValue}>{totalDaysUsed}</span>
              <span className={styles.statsLabel}>Days Used</span>
            </div>
            <div className={styles.statsCard}>
              <span className={styles.statsValue}>{pendingCount}</span>
              <span className={styles.statsLabel}>Pending</span>
            </div>
          </div>
        </div>
        
        {/* Apply Leave Button */}
        <Link to="/apply-leave" className={`${styles.button} ${styles.buttonPrimary}`} style={{ marginBottom: '48px', display: 'inline-flex' }}>
          Apply for Leave
        </Link>
        
        {/* Recent Leave History */}
        <section>
          <h2 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '32px', 
            fontStyle: 'italic',
            marginBottom: '24px' 
          }}>
            Recent Applications
          </h2>
          
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
            </div>
          ) : recentLeaves.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📋</div>
              <p className={styles.emptyStateText}>No leave applications yet.</p>
              <Link to="/apply-leave" className={`${styles.button} ${styles.buttonPrimary}`}>
                Apply for Your First Leave
              </Link>
            </div>
          ) : (
            <>
              {recentLeaves.map(leave => (
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
                  </div>
                </div>
              ))}
              
              <Link 
                to="/my-leaves" 
                className={`${styles.button} ${styles.buttonSecondary}`}
                style={{ marginTop: '24px', display: 'inline-flex' }}
              >
                View All Leaves
              </Link>
            </>
          )}
        </section>
      </main>
    </div>
  );
}