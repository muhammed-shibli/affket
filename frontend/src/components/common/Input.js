import React from 'react';
import './Common.css';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) => (
  <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
    {label && <label className="input-label">{label}</label>}
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" />}
      <input className={`input ${Icon ? 'has-icon' : ''}`} {...props} />
    </div>
    {error && <span className="input-error">{error}</span>}
  </div>
);

export const Select = ({
  label,
  error,
  options = [],
  placeholder,
  className = '',
  ...props
}) => (
  <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
    {label && <label className="input-label">{label}</label>}
    <select className="input select" {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="input-error">{error}</span>}
  </div>
);

export const Textarea = ({
  label,
  error,
  className = '',
  ...props
}) => (
  <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
    {label && <label className="input-label">{label}</label>}
    <textarea className="input textarea" {...props} />
    {error && <span className="input-error">{error}</span>}
  </div>
);

export const Checkbox = ({ label, className = '', ...props }) => (
  <label className={`checkbox-group ${className}`}>
    <input type="checkbox" className="checkbox" {...props} />
    <span className="checkbox-label">{label}</span>
  </label>
);
