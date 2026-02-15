import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiGrid, FiUsers, FiDollarSign, FiSettings,
  FiLogOut, FiMenu, FiX, FiFileText, FiMessageSquare
} from 'react-icons/fi';
import './Layout.css';

const BRAND_NAME = process.env.REACT_APP_BRAND_NAME || 'Affket';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard', end: true },
    { path: '/admin/offers', icon: FiGrid, label: 'Offers' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/applications', icon: FiFileText, label: 'Applications' },
    { path: '/admin/withdrawals', icon: FiDollarSign, label: 'Withdrawals' },
    { path: '/admin/gateways', icon: FiSettings, label: 'Gateways' }
  ];

  return (
    <div className="layout admin-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="brand">{BRAND_NAME} <span className="admin-badge">Admin</span></div>
        <div className="header-user">
          <span className="user-name">{user?.name?.charAt(0)}</span>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">{BRAND_NAME}</div>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar admin">{user?.name?.charAt(0)}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
