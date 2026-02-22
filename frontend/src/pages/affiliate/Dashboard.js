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
import { FiMousePointer, FiCheckCircle, FiArrowUpRight, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import api from '../../services/api';
import './Affiliate.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Demo data for chart when no real data is available
const generateDemoChartData = () => {
  const data = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString(),
      clicks: Math.floor(Math.random() * 500) + 100,
      conversions: Math.floor(Math.random() * 50) + 10,
      earnings: Math.floor(Math.random() * 5000) + 500
    });
  }
  return data;
};

const demoStats = {
  today: { clicks: 245, conversions: 18, earnings: 2450.00 },
  yesterday: { clicks: 312, conversions: 24, earnings: 3200.00 },
  mtd: { clicks: 8750, conversions: 520, earnings: 68500.00 },
  chart: generateDemoChartData()
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      if (response.data.success && response.data.data?.chart?.length > 0) {
        setStats(response.data.data);
      } else {
        setStats(demoStats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
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
          color: '#9ca3af'
        }
      }
    },
    barThickness: 12,
    borderRadius: 4
  };

  const chartData = stats?.chart ? {
    labels: stats.chart.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        data: stats.chart.map(d => d.earnings),
        backgroundColor: '#d4c4a8',
        borderRadius: 4
      }
    ]
  } : null;

  // Calculate percentage change (demo)
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
    <div className="dashboard-page dashboard-new">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <h1>Welcome back</h1>
        <p>Welcome to dashboard</p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Stats Cards */}
        <div className="dashboard-left">
          {/* Stats Cards Row 1 */}
          <div className="stats-cards-grid">
            {/* Clicks Card */}
            <div className="stat-card-new stat-card-light-green">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Clicks</span>
                <div className="stat-card-icon">
                  <FiArrowUpRight />
                </div>
              </div>
              <div className="stat-card-value">{stats?.mtd?.clicks?.toLocaleString() || 0}</div>
              <div className={`stat-card-change ${todayVsYesterday.clicks.isPositive ? 'positive' : 'negative'}`}>
                {todayVsYesterday.clicks.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                <span>{todayVsYesterday.clicks.value}% from yesterday</span>
              </div>
            </div>

            {/* Conversions Card */}
            <div className="stat-card-new stat-card-light-yellow">
              <div className="stat-card-header">
                <span className="stat-card-title">Conversions</span>
                <div className="stat-card-icon">
                  <FiArrowUpRight />
                </div>
              </div>
              <div className="stat-card-value">{stats?.mtd?.conversions?.toLocaleString() || 0}</div>
              <div className={`stat-card-change ${todayVsYesterday.conversions.isPositive ? 'positive' : 'negative'}`}>
                {todayVsYesterday.conversions.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                <span>{todayVsYesterday.conversions.value}% from yesterday</span>
              </div>
            </div>
          </div>

          {/* Stats Cards Row 2 */}
          <div className="stats-cards-grid">
            {/* Earnings Card */}
            <div className="stat-card-new stat-card-white">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Earnings</span>
                <div className="stat-card-icon">
                  <FiArrowUpRight />
                </div>
              </div>
              <div className="stat-card-value">₹{stats?.mtd?.earnings?.toLocaleString() || 0}</div>
              <div className={`stat-card-change ${todayVsYesterday.earnings.isPositive ? 'positive' : 'negative'}`}>
                {todayVsYesterday.earnings.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                <span>{todayVsYesterday.earnings.value}% from yesterday</span>
              </div>
            </div>

            {/* Today Earnings Card */}
            <div className="stat-card-new stat-card-white">
              <div className="stat-card-header">
                <span className="stat-card-title">Today's Earnings</span>
                <div className="stat-card-icon">
                  <FiArrowUpRight />
                </div>
              </div>
              <div className="stat-card-value">₹{stats?.today?.earnings?.toLocaleString() || 0}</div>
              <div className="stat-card-change positive">
                <FiCheckCircle />
                <span>Live tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div className="dashboard-right">
          <div className="earnings-chart-card">
            <div className="chart-card-header">
              <div>
                <span className="chart-title">Earnings</span>
                <div className="chart-value-row">
                  <span className="chart-main-value">₹{stats?.mtd?.earnings?.toLocaleString() || 0}</span>
                  <span className="chart-change positive">+{todayVsYesterday.earnings.value}%</span>
                </div>
              </div>
              <div className="chart-period-badge">
                14 Days
              </div>
            </div>
            <div className="chart-container-new">
              {chartData && <Bar data={chartData} options={chartOptions} />}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom">
        {/* Today Stats */}
        <div className="today-stats-card">
          <div className="today-stats-header">
            <h3>Today's Performance</h3>
            <span className="more-icon">•••</span>
          </div>
          <div className="today-stats-grid">
            <div className="today-stat-item">
              <div className="today-stat-icon clicks">
                <FiMousePointer />
              </div>
              <div className="today-stat-info">
                <span className="today-stat-label">Clicks</span>
                <span className="today-stat-value">{stats?.today?.clicks || 0}</span>
              </div>
            </div>
            <div className="today-stat-item">
              <div className="today-stat-icon conversions">
                <FiCheckCircle />
              </div>
              <div className="today-stat-info">
                <span className="today-stat-label">Conversions</span>
                <span className="today-stat-value">{stats?.today?.conversions || 0}</span>
              </div>
            </div>
            <div className="today-stat-item">
              <div className="today-stat-icon earnings">
                <BiRupee />
              </div>
              <div className="today-stat-info">
                <span className="today-stat-label">Earnings</span>
                <span className="today-stat-value">₹{stats?.today?.earnings?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Yesterday Stats */}
        <div className="yesterday-stats-card">
          <div className="yesterday-stats-header">
            <h3>Yesterday's Performance</h3>
          </div>
          <div className="yesterday-stats-table">
            <div className="yesterday-stat-row header">
              <span>Metric</span>
              <span>Value</span>
            </div>
            <div className="yesterday-stat-row">
              <span>Clicks</span>
              <span className="value">{stats?.yesterday?.clicks || 0}</span>
            </div>
            <div className="yesterday-stat-row">
              <span>Conversions</span>
              <span className="value">{stats?.yesterday?.conversions || 0}</span>
            </div>
            <div className="yesterday-stat-row">
              <span>Earnings</span>
              <span className="value earnings">₹{stats?.yesterday?.earnings?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
