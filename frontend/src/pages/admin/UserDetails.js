import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiDollarSign, FiMousePointer, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody, StatCard } from '../../components/common/Card';
import { Table, Th, Td, Badge, EmptyState } from '../../components/common/Table';
import { Select, Checkbox } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import './Admin.css';

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [features, setFeatures] = useState({
    show_custom_campaign: false
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      if (response.data.success) {
        setUser(response.data.data);
        setFeatures({
          show_custom_campaign: response.data.data.show_custom_campaign
        });
      }
    } catch (error) {
      toast.error('Failed to fetch user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      const response = await api.patch(`/users/${id}/status`, { status });
      if (response.data.success) {
        toast.success(`User ${status}`);
        fetchUser();
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleFeaturesUpdate = async () => {
    try {
      const response = await api.patch(`/users/${id}/features`, features);
      if (response.data.success) {
        toast.success('User features updated');
        setShowFeaturesModal(false);
        fetchUser();
      }
    } catch (error) {
      toast.error('Failed to update features');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="error">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        action={<Button onClick={() => navigate('/admin/users')}>Back to Users</Button>}
      />
    );
  }

  return (
    <div className="admin-user-details">
      <Button variant="ghost" onClick={() => navigate(-1)} className="back-btn">
        <FiArrowLeft /> Back
      </Button>

      {/* User Header */}
      <Card className="user-header-card">
        <CardBody>
          <div className="user-header">
            <div className="user-avatar-large">{user.name.charAt(0)}</div>
            <div className="user-header-info">
              <h1>{user.name}</h1>
              <p className="text-muted">{user.email}</p>
              <div className="user-meta">
                <span>{user.company_name}</span>
                <span>{user.mobile}</span>
                {getStatusBadge(user.status)}
              </div>
            </div>
            <div className="user-actions">
              {user.status === 'pending' && (
                <>
                  <Button variant="success" onClick={() => handleStatusUpdate('approved')}>
                    <FiCheck /> Approve
                  </Button>
                  <Button variant="danger" onClick={() => handleStatusUpdate('rejected')}>
                    <FiX /> Reject
                  </Button>
                </>
              )}
              {user.status === 'approved' && (
                <Button variant="outline" onClick={() => handleStatusUpdate('suspended')}>
                  Suspend
                </Button>
              )}
              {user.status === 'suspended' && (
                <Button variant="success" onClick={() => handleStatusUpdate('approved')}>
                  Activate
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowFeaturesModal(true)}>
                Manage Features
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-4">
        <StatCard
          title="Total Clicks"
          value={user.total_clicks || 0}
          icon={FiMousePointer}
          color="primary"
        />
        <StatCard
          title="Conversions"
          value={user.total_conversions || 0}
          icon={FiCheckCircle}
          color="success"
        />
        <StatCard
          title="Total Earnings"
          value={`$${parseFloat(user.total_earnings || 0).toFixed(2)}`}
          icon={FiDollarSign}
          color="warning"
        />
        <StatCard
          title="Wallet Balance"
          value={`$${parseFloat(user.wallet_balance || 0).toFixed(2)}`}
          icon={FiDollarSign}
          color="success"
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-2">
        {/* User Info */}
        <Card>
          <CardHeader>
            <h3>User Information</h3>
          </CardHeader>
          <CardBody>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mobile</span>
                <span className="info-value">{user.mobile}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Company</span>
                <span className="info-value">{user.company_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Joined</span>
                <span className="info-value">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <h3>Bank Details</h3>
          </CardHeader>
          <CardBody>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Bank Name</span>
                <span className="info-value">{user.bank_name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Number</span>
                <span className="info-value">{user.bank_account_number || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">IFSC Code</span>
                <span className="info-value">{user.ifsc_code || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">UPI ID</span>
                <span className="info-value">{user.upi_id || 'Not set'}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Offer Applications */}
      <Card>
        <CardHeader>
          <h3>Offer Applications</h3>
        </CardHeader>
        <CardBody>
          {user.applications?.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Offer</Th>
                  <Th>Payout</Th>
                  <Th>Status</Th>
                  <Th>Applied At</Th>
                </tr>
              </thead>
              <tbody>
                {user.applications.map((app) => (
                  <tr key={app.id}>
                    <Td className="font-semibold">{app.offer_name}</Td>
                    <Td>${parseFloat(app.payout_amount).toFixed(2)}</Td>
                    <Td>{getStatusBadge(app.status)}</Td>
                    <Td>{new Date(app.applied_at).toLocaleString()}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center p-4">No applications</p>
          )}
        </CardBody>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <h3>Recent Transactions</h3>
        </CardHeader>
        <CardBody>
          {user.transactions?.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Description</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {user.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <Td className="capitalize">{tx.type}</Td>
                    <Td>{tx.description}</Td>
                    <Td className={tx.type === 'credit' ? 'text-success' : 'text-error'}>
                      {tx.type === 'credit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                    </Td>
                    <Td>
                      <Badge variant={tx.status === 'paid' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'}>
                        {tx.status}
                      </Badge>
                    </Td>
                    <Td>{new Date(tx.created_at).toLocaleString()}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center p-4">No transactions</p>
          )}
        </CardBody>
      </Card>

      {/* Features Modal */}
      <Modal
        isOpen={showFeaturesModal}
        onClose={() => setShowFeaturesModal(false)}
        title="Manage User Features"
        size="sm"
      >
        <div className="features-form">
          <p className="text-muted mb-4">Select which features this user can access:</p>
          <Checkbox
            label="Show Custom Campaign option"
            checked={features.show_custom_campaign}
            onChange={(e) => setFeatures(prev => ({ ...prev, show_custom_campaign: e.target.checked }))}
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowFeaturesModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleFeaturesUpdate}>Save</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AdminUserDetails;
