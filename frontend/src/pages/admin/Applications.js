import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Badge, EmptyState } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import './Admin.css';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/users/applications');
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      const response = await api.patch(`/users/applications/${id}`, { status });
      if (response.data.success) {
        toast.success(`Application ${status}`);
        fetchApplications();
      }
    } catch (error) {
      toast.error('Failed to update application');
    }
  };

  return (
    <div className="admin-applications">
      <div className="page-header">
        <h1>Offer Applications</h1>
        <p>Review and approve affiliate offer applications</p>
      </div>

      <Card>
        <CardHeader>
          <h3>Pending Applications ({applications.length})</h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : applications.length === 0 ? (
            <EmptyState
              title="No pending applications"
              description="All applications have been processed"
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Affiliate</Th>
                  <Th>Company</Th>
                  <Th>Offer</Th>
                  <Th>Payout</Th>
                  <Th>Applied At</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <Td>
                      <div>
                        <div className="font-semibold">{app.user_name}</div>
                        <div className="text-sm text-muted">{app.user_email}</div>
                      </div>
                    </Td>
                    <Td>{app.company_name}</Td>
                    <Td>
                      <div>
                        <div className="font-semibold">{app.offer_name}</div>
                        <div className="text-sm text-muted">#{app.offer_id}</div>
                      </div>
                    </Td>
                    <Td className="text-success font-semibold">
                      ₹{parseFloat(app.payout_amount).toFixed(2)}
                    </Td>
                    <Td>{new Date(app.applied_at).toLocaleString()}</Td>
                    <Td>
                      <div className="action-buttons">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleUpdate(app.id, 'approved')}
                        >
                          <FiCheck /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUpdate(app.id, 'rejected')}
                        >
                          <FiX /> Reject
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminApplications;
