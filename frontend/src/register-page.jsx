// register-page.jsx
// User registration page

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const API_URL = 'http://localhost:5000/api';

export default function RegisterPage({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setUser(data.user);
      alert('Account created successfully!');
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
            <span className={styles.authFormLabel}>Create Account</span>
            <h2 className={styles.authFormTitle}>Join our team.</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="John Doe"
              />
            </div>
            
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
                placeholder="Create a strong password"
                minLength="6"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="department" className={styles.label}>Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Engineering, Sales, HR, etc."
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`${styles.button} ${styles.buttonPrimary}`}
              style={{ width: '100%' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className={styles.authFormFooter}>
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}