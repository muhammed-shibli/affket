import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Badge, EmptyState } from '../../components/common/Table';
import { Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import './Admin.css';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const response = await api.get(`/wallet/admin/withdrawals${params}`);
      if (response.data.success) {
        setWithdrawals(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      const response = await api.patch(`/wallet/admin/withdrawals/${id}`, { status });
      if (response.data.success) {
        toast.success(`Withdrawal ${status}`);
        fetchWithdrawals();
      }
    } catch (error) {
      toast.error('Failed to update withdrawal');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="admin-withdrawals">
      <div className="page-header">
        <h1>Withdrawals</h1>
        <p>Manage affiliate withdrawal requests</p>
      </div>

      <Card>
        <CardHeader
          action={
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { value: '', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />
          }
        >
          <h3>Withdrawal Requests</h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : withdrawals.length === 0 ? (
            <EmptyState
              title="No withdrawals found"
              description={filter === 'pending' ? 'No pending withdrawal requests' : 'No withdrawals match your filter'}
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Affiliate</Th>
                  <Th>Amount</Th>
                  <Th>Bank Details</Th>
                  <Th>UPI</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((wd) => (
                  <tr key={wd.id}>
                    <Td>
                      <div>
                        <div className="font-semibold">{wd.user_name}</div>
                        <div className="text-sm text-muted">{wd.user_email}</div>
                      </div>
                    </Td>
                    <Td className="font-semibold text-xl">${parseFloat(wd.amount).toFixed(2)}</Td>
                    <Td>
                      {wd.bank_account_number ? (
                        <div className="text-sm">
                          <div>{wd.bank_name}</div>
                          <div className="text-muted">****{wd.bank_account_number.slice(-4)}</div>
                          <div className="text-muted">{wd.ifsc_code}</div>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </Td>
                    <Td>{wd.upi_id || '-'}</Td>
                    <Td>{getStatusBadge(wd.status)}</Td>
                    <Td>{new Date(wd.created_at).toLocaleString()}</Td>
                    <Td>
                      {wd.status === 'pending' && (
                        <div className="action-buttons">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleUpdate(wd.id, 'paid')}
                          >
                            <FiCheck /> Pay
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUpdate(wd.id, 'rejected')}
                          >
                            <FiX /> Reject
                          </Button>
                        </div>
                      )}
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

export default AdminWithdrawals;
