import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FiUsers, FiGrid, FiMousePointer, FiCheckCircle, FiDollarSign, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import { Card, CardHeader, CardBody, StatCard } from '../../components/common/Card';
import { Table, Th, Td, Badge } from '../../components/common/Table';
import './Admin.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const chartData = stats?.chart ? {
    labels: stats.chart.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Clicks',
        data: stats.chart.map(d => d.clicks),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      },
      {
        label: 'Conversions',
        data: stats.chart.map(d => d.conversions),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3
      },
      {
        label: 'Earnings ($)',
        data: stats.chart.map(d => d.earnings),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3
      }
    ]
  } : null;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of your affiliate network</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-4">
        <StatCard
          title="Total Affiliates"
          value={stats?.users?.total || 0}
          icon={FiUsers}
          color="primary"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.users?.pending || 0}
          icon={FiClock}
          color="warning"
        />
        <StatCard
          title="Active Offers"
          value={stats?.offers?.active || 0}
          icon={FiGrid}
          color="success"
        />
        <StatCard
          title="Pending Withdrawals"
          value={`$${(stats?.pendingWithdrawals?.total || 0).toFixed(2)}`}
          icon={FiDollarSign}
          color="error"
        />
      </div>

      {/* Today Stats */}
      <div className="stats-section">
        <h3 className="section-title">Today's Performance</h3>
        <div className="grid grid-3">
          <StatCard
            title="Clicks"
            value={stats?.today?.clicks || 0}
            icon={FiMousePointer}
            color="primary"
          />
          <StatCard
            title="Conversions"
            value={stats?.today?.conversions || 0}
            icon={FiCheckCircle}
            color="success"
          />
          <StatCard
            title="Earnings"
            value={`$${(stats?.today?.earnings || 0).toFixed(2)}`}
            icon={FiDollarSign}
            color="warning"
          />
        </div>
      </div>

      {/* Chart */}
      <Card className="chart-card">
        <CardHeader>
          <h3>30 Day Performance</h3>
        </CardHeader>
        <CardBody>
          <div className="chart-container">
            {chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="empty-state">
                <p>No data available</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Top Lists */}
      <div className="grid grid-2 mt-4">
        {/* Top Affiliates */}
        <Card>
          <CardHeader>
            <h3>Top Affiliates (Today)</h3>
          </CardHeader>
          <CardBody>
            {stats?.topAffiliates?.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Affiliate</Th>
                    <Th>Clicks</Th>
                    <Th>Conv.</Th>
                    <Th>Earnings</Th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topAffiliates.slice(0, 5).map((aff) => (
                    <tr key={aff.id}>
                      <Td>
                        <div>
                          <div className="font-semibold">{aff.name}</div>
                          <div className="text-sm text-muted">{aff.company_name}</div>
                        </div>
                      </Td>
                      <Td>{aff.clicks}</Td>
                      <Td>{aff.conversions}</Td>
                      <Td className="text-success">${parseFloat(aff.earnings).toFixed(2)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted text-center p-4">No data</p>
            )}
          </CardBody>
        </Card>

        {/* Top Offers */}
        <Card>
          <CardHeader>
            <h3>Top Offers (Today)</h3>
          </CardHeader>
          <CardBody>
            {stats?.topOffers?.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Offer</Th>
                    <Th>Clicks</Th>
                    <Th>Conv.</Th>
                    <Th>Earnings</Th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topOffers.slice(0, 5).map((offer) => (
                    <tr key={offer.id}>
                      <Td>
                        <div>
                          <div className="font-semibold">{offer.name}</div>
                          <div className="text-sm text-muted">#{offer.id}</div>
                        </div>
                      </Td>
                      <Td>{offer.clicks}</Td>
                      <Td>{offer.conversions}</Td>
                      <Td className="text-success">${parseFloat(offer.earnings).toFixed(2)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted text-center p-4">No data</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats mt-4">
        <Card>
          <CardBody>
            <div className="quick-stats-grid">
              <div className="quick-stat">
                <span className="quick-stat-value">{stats?.pendingApplications || 0}</span>
                <span className="quick-stat-label">Pending Applications</span>
              </div>
              <div className="quick-stat">
                <span className="quick-stat-value">{stats?.pendingWithdrawals?.count || 0}</span>
                <span className="quick-stat-label">Pending Withdrawals</span>
              </div>
              <div className="quick-stat">
                <span className="quick-stat-value">${(stats?.mtd?.earnings || 0).toFixed(2)}</span>
                <span className="quick-stat-label">MTD Earnings</span>
              </div>
              <div className="quick-stat">
                <span className="quick-stat-value">{stats?.mtd?.conversions || 0}</span>
                <span className="quick-stat-label">MTD Conversions</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
