import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { validatePassword } from '../../services/authService';
import '../../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    errors: []
  });
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordStrength(validation);
    }
    
    if (name === 'confirmPassword' || name === 'password') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.errors[0]);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    
    if (result.success) {
      navigate('/events');
    }
    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    if (formData.password.length === 0) return '#e0e0e0';
    if (passwordStrength.isValid) return '#4CAF50';
    if (formData.password.length >= 8) return '#FF9800';
    return '#f44336';
  };

  const getPasswordStrengthText = () => {
    if (formData.password.length === 0) return 'Enter a password';
    if (passwordStrength.isValid) return 'Strong password! ✓';
    if (formData.password.length >= 8) return 'Weak - add uppercase, number & special character';
    return 'Too short - minimum 8 characters';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the Saudi sports community</p>
        
        {(error || passwordError) && (
          <div className="error-message">{error || passwordError}</div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a strong password"
            />
            <div className="password-strength">
              <div 
                className="strength-bar" 
                style={{ 
                  width: formData.password.length > 0 ? '100%' : '0%',
                  backgroundColor: getPasswordStrengthColor()
                }}
              ></div>
              <small style={{ color: getPasswordStrengthColor() }}>
                {getPasswordStrengthText()}
              </small>
            </div>
            <ul className="password-requirements">
              <li className={formData.password.length >= 8 ? 'valid' : ''}>✓ Minimum 8 characters</li>
              <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>✓ One uppercase letter</li>
              <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>✓ One lowercase letter</li>
              <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>✓ One number</li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}>✓ One special character</li>
            </ul>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;