import React from 'react';
import './Common.css';

export const Table = ({ children, className = '' }) => (
  <div className={`table-container ${className}`}>
    <table className="table">{children}</table>
  </div>
);

export const Th = ({ children, ...props }) => (
  <th className="table-th" {...props}>{children}</th>
);

export const Td = ({ children, ...props }) => (
  <td className="table-td" {...props}>{children}</td>
);

export const Badge = ({ children, variant = 'default' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

export const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  const getPages = () => {
    const items = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);

    if (start > 1) {
      items.push(1);
      if (start > 2) items.push('...');
    }

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (end < pages) {
      if (end < pages - 1) items.push('...');
      items.push(pages);
    }

    return items;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      {getPages().map((p, i) => (
        p === '...' ? (
          <span key={i} className="pagination-ellipsis">...</span>
        ) : (
          <button
            key={i}
            className={`pagination-btn ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      ))}
      <button
        className="pagination-btn"
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    {Icon && <Icon className="empty-icon" />}
    <h3 className="empty-title">{title}</h3>
    {description && <p className="empty-description">{description}</p>}
    {action}
  </div>
);
