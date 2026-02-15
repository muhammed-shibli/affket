import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Pagination, Badge, EmptyState } from '../../components/common/Table';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import './Admin.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
        ...filters
      });
      const response = await api.get(`/users?${params}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(prev => ({
          ...prev,
          pages: response.data.data.pagination.pages,
          total: response.data.data.pagination.total
        }));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await api.patch(`/users/${id}/status`, { status });
      if (response.data.success) {
        toast.success(`User ${status}`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user status');
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

  return (
    <div className="admin-users">
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage affiliate users</p>
      </div>

      <Card>
        <CardHeader>
          <h3>All Affiliates ({pagination.total})</h3>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <div className="filter-bar">
            <Input
              type="text"
              placeholder="Search by name, email..."
              icon={FiSearch}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Select
              placeholder="Status"
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'suspended', label: 'Suspended' }
              ]}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            />
            <Button onClick={handleFilter}>Filter</Button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="No affiliate users match your search criteria"
            />
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>User</Th>
                    <Th>Company</Th>
                    <Th>Status</Th>
                    <Th>Offers</Th>
                    <Th>Clicks</Th>
                    <Th>Conv.</Th>
                    <Th>Earnings</Th>
                    <Th>Joined</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <Td>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted">{user.email}</div>
                        </div>
                      </Td>
                      <Td>{user.company_name}</Td>
                      <Td>{getStatusBadge(user.status)}</Td>
                      <Td>{user.approved_offers || 0}</Td>
                      <Td>{user.total_clicks || 0}</Td>
                      <Td>{user.total_conversions || 0}</Td>
                      <Td className="text-success">${parseFloat(user.total_earnings || 0).toFixed(2)}</Td>
                      <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                      <Td>
                        <div className="action-buttons">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            <FiEye />
                          </Button>
                          {user.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(user.id, 'approved')}
                                className="text-success"
                              >
                                <FiCheck />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(user.id, 'rejected')}
                                className="text-error"
                              >
                                <FiX />
                              </Button>
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminUsers;
