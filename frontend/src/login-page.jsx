// login-page.jsx
// User login page

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const API_URL = 'http://localhost:5000/api';

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setUser(data.user);
      alert(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.authPage}>
      {/* Brand Panel */}
      <div className={styles.authBrandPanel}>
        <div className={styles.authBrandIcon}>O_</div>
        
        <div>
          <h1 className={styles.authBrandTitle}>
            Prioritize your <br /> presence.
          </h1>
          <p className={styles.authBrandDescription}>
            Access the OFF_SITE portal to manage leave requests and view team availability.
          </p>
        </div>
        
        <div className={styles.authBrandFooter}>
          © 2026 OFF_SITE SYSTEMS
        </div>
      </div>
      
      {/* Form Panel */}
      <div className={styles.authFormPanel}>
        <div className={styles.authFormContainer}>
          <div className={styles.authFormHeader}>
            <span className={styles.authFormLabel}>Sign In</span>
            <h2 className={styles.authFormTitle}>Welcome back.</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="you@company.com"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter your password"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`${styles.button} ${styles.buttonPrimary}`}
              style={{ width: '100%' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className={styles.authFormFooter}>
            Don't have an account? <Link to="/register">Create one here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}