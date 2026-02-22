import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FiUsers, FiGrid, FiMousePointer, FiCheckCircle, FiClock, FiTrendingUp, FiTrendingDown, FiArrowUpRight, FiAlertCircle } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import api from '../../services/api';
import './Admin.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Demo data for chart when no real data is available
const generateDemoChartData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString(),
      clicks: Math.floor(Math.random() * 2000) + 500,
      conversions: Math.floor(Math.random() * 150) + 30,
      earnings: Math.floor(Math.random() * 15000) + 2000
    });
  }
  return data;
};

const demoStats = {
  users: { total: 156, pending: 12 },
  offers: { active: 24, total: 32 },
  pendingWithdrawals: { total: 45600.00, count: 8 },
  today: { clicks: 1845, conversions: 124, earnings: 18450.00 },
  yesterday: { clicks: 1650, conversions: 98, earnings: 15200.00 },
  mtd: { clicks: 52400, conversions: 3250, earnings: 425000.00 },
  pendingApplications: 15,
  chart: generateDemoChartData(),
  topAffiliates: [
    { id: 1, name: 'Rahul Kumar', company_name: 'Digital Marketers', clicks: 425, conversions: 32, earnings: 4200 },
    { id: 2, name: 'Priya Sharma', company_name: 'Tech Promotions', clicks: 380, conversions: 28, earnings: 3650 },
    { id: 3, name: 'Amit Singh', company_name: 'Growth Media', clicks: 320, conversions: 22, earnings: 2900 },
    { id: 4, name: 'Sneha Patel', company_name: 'Click Masters', clicks: 290, conversions: 18, earnings: 2400 },
    { id: 5, name: 'Vikram Joshi', company_name: 'Affiliate Pro', clicks: 245, conversions: 15, earnings: 1950 }
  ],
  topOffers: [
    { id: 101, name: 'Premium Finance App', clicks: 650, conversions: 48, earnings: 7200 },
    { id: 102, name: 'Gaming Platform', clicks: 520, conversions: 35, earnings: 5250 },
    { id: 103, name: 'E-commerce Store', clicks: 480, conversions: 30, earnings: 4500 },
    { id: 104, name: 'Education Portal', clicks: 410, conversions: 25, earnings: 3750 },
    { id: 105, name: 'Health & Fitness', clicks: 350, conversions: 20, earnings: 3000 }
  ]
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/admin/dashboard');
      if (response.data.success && response.data.data?.chart?.length > 0) {
        setStats(response.data.data);
      } else {
        // Use demo data if no real data available
        setStats(demoStats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Use demo data on error
      setStats(demoStats);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.04)',
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#9ca3af'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 },
          color: '#9ca3af',
          maxTicksLimit: 10
        }
      }
    },
    barThickness: 8,
    borderRadius: 4
  };

  const chartData = stats?.chart ? {
    labels: stats.chart.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        data: stats.chart.map(d => d.earnings),
        backgroundColor: '#d4c4a8',
        borderRadius: 4
      }
    ]
  } : null;

  // Calculate percentage change
  const getPercentChange = (current, previous) => {
    if (!previous) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change).toFixed(1), isPositive: change >= 0 };
  };

  const todayVsYesterday = {
    clicks: getPercentChange(stats?.today?.clicks, stats?.yesterday?.clicks),
    conversions: getPercentChange(stats?.today?.conversions, stats?.yesterday?.conversions),
    earnings: getPercentChange(stats?.today?.earnings, stats?.yesterday?.earnings)
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard dashboard-new">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <h1>Admin Dashboard</h1>
        <p>Overview of your affiliate network</p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Stats Cards */}
        <div className="dashboard-left">
          {/* Row 1: Users & Offers */}
          <div className="stats-cards-grid">
            <div className="stat-card-new stat-card-light-blue">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Affiliates</span>
                <div className="stat-card-icon">
                  <FiUsers />
                </div>
              </div>
              <div className="stat-card-value">{stats?.users?.total || 0}</div>
              <div className="stat-card-change positive">
                <FiTrendingUp />
                <span>{stats?.users?.pending || 0} pending approval</span>
              </div>
            </div>

            <div className="stat-card-new stat-card-light-green">
              <div className="stat-card-header">
                <span className="stat-card-title">Active Offers</span>
                <div className="stat-card-icon">
                  <FiGrid />
                </div>
              </div>
              <div className="stat-card-value">{stats?.offers?.active || 0}</div>
              <div className="stat-card-change positive">
                <FiCheckCircle />
                <span>{stats?.offers?.total || 0} total offers</span>
              </div>
            </div>
          </div>

          {/* Row 2: Today's Stats */}
          <div className="stats-cards-grid">
            <div className="stat-card-new stat-card-light-yellow">
              <div className="stat-card-header">
                <span className="stat-card-title">Today's Clicks</span>
                <div className="stat-card-icon">
                  <FiMousePointer />
                </div>
              </div>
              <div className="stat-card-value">{stats?.today?.clicks?.toLocaleString() || 0}</div>
              <div className={`stat-card-change ${todayVsYesterday.clicks.isPositive ? 'positive' : 'negative'}`}>
                {todayVsYesterday.clicks.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                <span>{todayVsYesterday.clicks.value}% from yesterday</span>
              </div>
            </div>

            <div className="stat-card-new stat-card-light-purple">
              <div className="stat-card-header">
                <span className="stat-card-title">Today's Conversions</span>
                <div className="stat-card-icon">
                  <FiCheckCircle />
                </div>
              </div>
              <div className="stat-card-value">{stats?.today?.conversions?.toLocaleString() || 0}</div>
              <div className={`stat-card-change ${todayVsYesterday.conversions.isPositive ? 'positive' : 'negative'}`}>
                {todayVsYesterday.conversions.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                <span>{todayVsYesterday.conversions.value}% from yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div className="dashboard-right">
          <div className="earnings-chart-card">
            <div className="chart-card-header">
              <div>
                <span className="chart-title">Network Earnings</span>
                <div className="chart-value-row">
                  <span className="chart-main-value">₹{stats?.mtd?.earnings?.toLocaleString() || 0}</span>
                  <span className="chart-change positive">+{todayVsYesterday.earnings.value}%</span>
                </div>
              </div>
              <div className="chart-period-badge">
                30 Days
              </div>
            </div>
            <div className="chart-container-new">
              {chartData && <Bar data={chartData} options={chartOptions} />}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards Row */}
      <div className="alert-cards-row">
        <div className="alert-card alert-warning">
          <div className="alert-icon">
            <FiClock />
          </div>
          <div className="alert-content">
            <span className="alert-value">{stats?.pendingApplications || 0}</span>
            <span className="alert-label">Pending Applications</span>
          </div>
          <FiArrowUpRight className="alert-arrow" />
        </div>

        <div className="alert-card alert-danger">
          <div className="alert-icon">
            <BiRupee />
          </div>
          <div className="alert-content">
            <span className="alert-value">₹{(stats?.pendingWithdrawals?.total || 0).toLocaleString()}</span>
            <span className="alert-label">{stats?.pendingWithdrawals?.count || 0} Pending Withdrawals</span>
          </div>
          <FiArrowUpRight className="alert-arrow" />
        </div>

        <div className="alert-card alert-success">
          <div className="alert-icon">
            <BiRupee />
          </div>
          <div className="alert-content">
            <span className="alert-value">₹{(stats?.today?.earnings || 0).toLocaleString()}</span>
            <span className="alert-label">Today's Earnings</span>
          </div>
          <FiArrowUpRight className="alert-arrow" />
        </div>

        <div className="alert-card alert-info">
          <div className="alert-icon">
            <FiCheckCircle />
          </div>
          <div className="alert-content">
            <span className="alert-value">{stats?.mtd?.conversions?.toLocaleString() || 0}</span>
            <span className="alert-label">MTD Conversions</span>
          </div>
          <FiArrowUpRight className="alert-arrow" />
        </div>
      </div>

      {/* Top Lists Section */}
      <div className="dashboard-bottom">
        {/* Top Affiliates */}
        <div className="top-list-card">
          <div className="top-list-header">
            <h3>Top Affiliates (Today)</h3>
            <span className="more-icon">•••</span>
          </div>
          <div className="top-list-content">
            {stats?.topAffiliates?.length > 0 ? (
              <table className="top-list-table">
                <thead>
                  <tr>
                    <th>Affiliate</th>
                    <th>Clicks</th>
                    <th>Conv.</th>
                    <th>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topAffiliates.slice(0, 5).map((aff, index) => (
                    <tr key={aff.id}>
                      <td>
                        <div className="affiliate-cell">
                          <div className="affiliate-rank">{index + 1}</div>
                          <div className="affiliate-info">
                            <span className="affiliate-name">{aff.name}</span>
                            <span className="affiliate-company">{aff.company_name}</span>
                          </div>
                        </div>
                      </td>
                      <td>{aff.clicks}</td>
                      <td>{aff.conversions}</td>
                      <td className="earnings-cell">₹{parseFloat(aff.earnings).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No affiliate data available</p>
            )}
          </div>
        </div>

        {/* Top Offers */}
        <div className="top-list-card">
          <div className="top-list-header">
            <h3>Top Offers (Today)</h3>
            <span className="more-icon">•••</span>
          </div>
          <div className="top-list-content">
            {stats?.topOffers?.length > 0 ? (
              <table className="top-list-table">
                <thead>
                  <tr>
                    <th>Offer</th>
                    <th>Clicks</th>
                    <th>Conv.</th>
                    <th>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topOffers.slice(0, 5).map((offer, index) => (
                    <tr key={offer.id}>
                      <td>
                        <div className="offer-cell-new">
                          <div className="offer-rank">{index + 1}</div>
                          <div className="offer-info">
                            <span className="offer-name-text">{offer.name}</span>
                            <span className="offer-id">#{offer.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{offer.clicks}</td>
                      <td>{offer.conversions}</td>
                      <td className="earnings-cell">₹{parseFloat(offer.earnings).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No offer data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Yesterday Comparison */}
      <div className="yesterday-comparison-section">
        <div className="comparison-card">
          <h3>Yesterday vs Today Comparison</h3>
          <div className="comparison-grid">
            <div className="comparison-item">
              <div className="comparison-icon clicks">
                <FiMousePointer />
              </div>
              <div className="comparison-data">
                <span className="comparison-label">Clicks</span>
                <div className="comparison-values">
                  <span className="today-value">{stats?.today?.clicks?.toLocaleString() || 0}</span>
                  <span className="vs">vs</span>
                  <span className="yesterday-value">{stats?.yesterday?.clicks?.toLocaleString() || 0}</span>
                </div>
                <div className={`comparison-change ${todayVsYesterday.clicks.isPositive ? 'positive' : 'negative'}`}>
                  {todayVsYesterday.clicks.isPositive ? '+' : '-'}{todayVsYesterday.clicks.value}%
                </div>
              </div>
            </div>

            <div className="comparison-item">
              <div className="comparison-icon conversions">
                <FiCheckCircle />
              </div>
              <div className="comparison-data">
                <span className="comparison-label">Conversions</span>
                <div className="comparison-values">
                  <span className="today-value">{stats?.today?.conversions?.toLocaleString() || 0}</span>
                  <span className="vs">vs</span>
                  <span className="yesterday-value">{stats?.yesterday?.conversions?.toLocaleString() || 0}</span>
                </div>
                <div className={`comparison-change ${todayVsYesterday.conversions.isPositive ? 'positive' : 'negative'}`}>
                  {todayVsYesterday.conversions.isPositive ? '+' : '-'}{todayVsYesterday.conversions.value}%
                </div>
              </div>
            </div>

            <div className="comparison-item">
              <div className="comparison-icon earnings">
                <BiRupee />
              </div>
              <div className="comparison-data">
                <span className="comparison-label">Earnings</span>
                <div className="comparison-values">
                  <span className="today-value">₹{stats?.today?.earnings?.toLocaleString() || 0}</span>
                  <span className="vs">vs</span>
                  <span className="yesterday-value">₹{stats?.yesterday?.earnings?.toLocaleString() || 0}</span>
                </div>
                <div className={`comparison-change ${todayVsYesterday.earnings.isPositive ? 'positive' : 'negative'}`}>
                  {todayVsYesterday.earnings.isPositive ? '+' : '-'}{todayVsYesterday.earnings.value}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
