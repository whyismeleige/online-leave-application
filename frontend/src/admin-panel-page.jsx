// admin-panel-page.jsx
// Admin panel for managing all leave applications and users

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const API_URL = 'http://localhost:5000/api';
const TABS = ['All Leaves', 'Pending', 'Approved', 'Rejected', 'Users'];

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

export default function AdminPanelPage({ user, setUser, isAdmin }) {
  const [activeTab, setActiveTab] = useState('All Leaves');
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionId, setActionId] = useState(null);
  
  // Fetch all leaves on mount
  useEffect(() => {
    fetch(`${API_URL}/leaves`, {
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
        setLoadingLeaves(false);
      });
  }, []);
  
  // Fetch users when Users tab is selected
  useEffect(() => {
    if (activeTab !== 'Users' || users.length > 0) return;
    
    setLoadingUsers(true);
    fetch(`${API_URL}/users`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
      })
      .catch(error => {
        console.error('Failed to fetch users:', error);
      })
      .finally(() => {
        setLoadingUsers(false);
      });
  }, [activeTab, users.length]);
  
  const handleStatusUpdate = async (leaveId, status) => {
    const adminNote = status === 'Rejected' 
      ? window.prompt('Optional: Enter a reason for rejection') || ''
      : '';
    
    setActionId(leaveId);
    
    try {
      const response = await fetch(`${API_URL}/leaves/${leaveId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status, adminNote })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update leave status');
      }
      
      alert(`Leave ${status.toLowerCase()} successfully`);
      
      // Update local state
      setLeaves(prev => 
        prev.map(l => 
          l._id === leaveId 
            ? { ...l, status, adminNote } 
            : l
        )
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setActionId(null);
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
  
  // Filter leaves based on active tab
  const filteredLeaves = activeTab === 'All Leaves'
    ? leaves
    : leaves.filter(l => l.status === activeTab);
  
  return (
    <div className={styles.page}>
      <Navbar user={user} setUser={setUser} isAdmin={isAdmin} />
      
      <main className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Admin Panel.</h1>
            <p className={styles.pageSubtitle}>Manage leave applications & users</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'Users' ? (
          // Users Tab
          loadingUsers ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
            </div>
          ) : users.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>👥</div>
              <p className={styles.emptyStateText}>No users found.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.department}</td>
                    <td>
                      <span className={`${styles.badge} ${
                        u.role === 'admin' ? styles.badgePending : styles.badgeApproved
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          // Leaves Tabs
          loadingLeaves ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📋</div>
              <p className={styles.emptyStateText}>
                {activeTab === 'All Leaves' 
                  ? 'No leave applications found.' 
                  : `No ${activeTab.toLowerCase()} leave applications.`
                }
              </p>
            </div>
          ) : (
            <div>
              {filteredLeaves.map(leave => (
                <div key={leave._id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>{leave.leaveType} Leave</h3>
                      <p className={styles.cardMeta}>
                        {leave.employee?.name} ({leave.employee?.department}) • 
                        {formatDate(leave.fromDate)} → {formatDate(leave.toDate)} • 
                        {leave.numberOfDays} days
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
                  
                  {/* Action buttons for pending leaves */}
                  {leave.status === 'Pending' && (
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                        disabled={actionId === leave._id}
                        className={styles.actionButton}
                      >
                        {actionId === leave._id ? 'Processing...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                        disabled={actionId === leave._id}
                        className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                      >
                        {actionId === leave._id ? 'Processing...' : '✗ Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}