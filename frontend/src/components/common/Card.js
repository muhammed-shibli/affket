import React from 'react';
import './Common.css';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', action }) => (
  <div className={`card-header ${className}`}>
    <div className="card-header-content">{children}</div>
    {action && <div className="card-header-action">{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const StatCard = ({ title, value, icon: Icon, trend, trendUp, color = 'primary' }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-content">
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
    {Icon && (
      <div className="stat-icon">
        <Icon />
      </div>
    )}
  </div>
);
