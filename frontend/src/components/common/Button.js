import React from 'react';
import './Common.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  ...props
}) => (
  <button
    className={`btn btn-${variant} btn-${size} ${loading ? 'loading' : ''} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <span className="btn-spinner" />
    ) : (
      <>
        {Icon && <Icon className="btn-icon" />}
        {children}
      </>
    )}
  </button>
);

export const IconButton = ({ icon: Icon, variant = 'ghost', size = 'md', ...props }) => (
  <button className={`icon-btn icon-btn-${variant} icon-btn-${size}`} {...props}>
    <Icon />
  </button>
);
