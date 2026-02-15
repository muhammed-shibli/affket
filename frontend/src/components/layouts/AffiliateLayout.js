import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiBarChart2, FiFileText, FiDollarSign, FiUser,
  FiLogOut, FiMenu, FiX, FiChevronDown, FiLink, FiGrid, FiCheckCircle, FiPlusCircle
} from 'react-icons/fi';
import './Layout.css';

const BRAND_NAME = process.env.REACT_APP_BRAND_NAME || 'Affket';

const AffiliateLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    {
      label: 'Reports',
      icon: FiBarChart2,
      isOpen: reportsOpen,
      toggle: () => setReportsOpen(!reportsOpen),
      children: [
        { path: '/reports/clicks', label: 'Clicks Report' },
        { path: '/reports/conversions', label: 'Conversions Report' }
      ]
    },
    {
      label: 'Offers',
      icon: FiGrid,
      isOpen: offersOpen,
      toggle: () => setOffersOpen(!offersOpen),
      children: [
        { path: '/offers/browse', icon: FiGrid, label: 'Browse Offers' },
        { path: '/offers/approved', icon: FiCheckCircle, label: 'Approved Offers' }
      ]
    },
    { path: '/postbacks', icon: FiLink, label: 'Postbacks' },
    { path: '/wallet', icon: FiDollarSign, label: 'Wallet' },
    { path: '/profile', icon: FiUser, label: 'Profile' }
  ];

  // Add custom campaign if enabled for user
  if (user?.show_custom_campaign) {
    navItems.splice(5, 0, { path: '/custom-campaign', icon: FiPlusCircle, label: 'Custom Campaign' });
  }

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="brand">{BRAND_NAME}</div>
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
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            item.children ? (
              <div key={index} className="nav-group">
                <button className="nav-item nav-toggle" onClick={item.toggle}>
                  <item.icon className="nav-icon" />
                  <span>{item.label}</span>
                  <FiChevronDown className={`chevron ${item.isOpen ? 'open' : ''}`} />
                </button>
                {item.isOpen && (
                  <div className="nav-children">
                    {item.children.map((child, childIndex) => (
                      <NavLink
                        key={childIndex}
                        to={child.path}
                        className={({ isActive }) => `nav-item nav-child ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <item.icon className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
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

export default AffiliateLayout;
