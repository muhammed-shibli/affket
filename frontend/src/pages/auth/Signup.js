import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiLock } from 'react-icons/fi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import './Auth.css';

const BRAND_NAME = process.env.REACT_APP_BRAND_NAME || 'Affket';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    company_name: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number';
    }

    if (!formData.company_name || formData.company_name.length < 2) {
      newErrors.company_name = 'Company/Channel name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await signup(formData);
      if (result.success) {
        toast.success(result.message);
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-lg">
        <div className="auth-header">
          <h1 className="auth-brand">{BRAND_NAME}</h1>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join our affiliate network</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-grid">
            <Input
              label="Full Name"
              type="text"
              name="name"
              icon={FiUser}
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              icon={FiMail}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Mobile Number"
              type="tel"
              name="mobile"
              icon={FiPhone}
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleChange}
              error={errors.mobile}
            />

            <Input
              label="Company / Channel Name"
              type="text"
              name="company_name"
              icon={FiBriefcase}
              placeholder="Enter company or channel name"
              value={formData.company_name}
              onChange={handleChange}
              error={errors.company_name}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              icon={FiLock}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirm_password"
              icon={FiLock}
              placeholder="Confirm your password"
              value={formData.confirm_password}
              onChange={handleChange}
              error={errors.confirm_password}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="auth-btn"
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <p className="auth-notice">
          By signing up, you agree to our terms of service. Your account will be reviewed before approval.
        </p>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
