// home-page.jsx
// Public landing page showcasing the application

import { Link } from 'react-router-dom';
import styles from './styles.module.css';

const API_URL = 'http://localhost:5000/api';

function Navbar({ user, isAuthenticated, setUser }) {
  const isAdmin = user?.role === 'admin';
  
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      alert('Logged out successfully');
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
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
              <Link to="/my-leaves" className={styles.navLink}>My Leaves</Link>
              {isAdmin && (
                <Link to="/admin" className={`${styles.navLink} ${styles.navLinkAdmin}`}>
                  Admin Panel
                </Link>
              )}
            </>
          )}
        </div>
        
        <div className={styles.navActions}>
          {isAuthenticated ? (
            <>
              <span className={styles.userName}>{user?.name}</span>
              <button onClick={handleLogout} className={`${styles.button} ${styles.buttonOutline}`}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.buttonLink}>Sign In</Link>
              <Link to="/register" className={`${styles.button} ${styles.buttonPrimary}`}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function HomePage({ user, isAuthenticated }) {
  return (
    <div className={styles.page}>
      <Navbar user={user} isAuthenticated={isAuthenticated} />
      
      <main style={{ paddingTop: '80px' }}>
        <div className={styles.hero}>
          <span className={styles.heroLabel}>/// WORK-LIFE SYNC</span>
          
          <h1 className={styles.heroTitle}>
            Rest is not <br />
            <span className={styles.heroTitleItalic}>idleness.</span>
          </h1>
          
          <p className={styles.heroDescription}>
            A modern system to manage absence, sabbaticals, and sick leave.
            Because a well-rested team is a high-performing team.
          </p>
          
          <div className={styles.heroActions}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`${styles.button} ${styles.buttonPrimary}`}>
                  View Dashboard
                </Link>
                <Link to="/apply-leave" className={`${styles.button} ${styles.buttonSecondary}`}>
                  Apply for Leave
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Get Started
                </Link>
                <Link to="/login" className={`${styles.button} ${styles.buttonSecondary}`}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Features Section */}
        <section style={{ 
          maxWidth: '1200px', 
          margin: '80px auto', 
          padding: '0 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px'
        }}>
          <div className={styles.card}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px' }}>
              Simple Application
            </h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
              Submit leave requests in seconds with our streamlined form. No complexity, no confusion.
            </p>
          </div>
          
          <div className={styles.card}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px' }}>
              Real-time Tracking
            </h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
              Monitor your leave applications with live status updates. Know exactly where you stand.
            </p>
          </div>
          
          <div className={styles.card}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px' }}>
              Admin Control
            </h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
              Managers can approve or reject requests efficiently with comprehensive oversight tools.
            </p>
          </div>
        </section>
      </main>
      
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '40px 32px',
        textAlign: 'center',
        color: 'var(--color-text-light)',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)'
      }}>
        © 2026 OFF SITE SYSTEMS
      </footer>
    </div>
  );
}