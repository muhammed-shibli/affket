import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Pagination, Badge, EmptyState } from '../../components/common/Table';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import './Admin.css';

const AdminOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category_id: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchOffers();
  }, [pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/offers/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
        ...filters
      });
      const response = await api.get(`/offers/admin/all?${params}`);
      if (response.data.success) {
        setOffers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOffers();
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await api.patch(`/offers/admin/${id}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success('Offer status updated');
        fetchOffers();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="default">Inactive</Badge>;
      case 'paused':
        return <Badge variant="warning">Paused</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="admin-offers">
      <div className="page-header">
        <div>
          <h1>Offers</h1>
          <p>Manage your affiliate offers</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={() => navigate('/admin/offers/new')}>
          Add Offer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h3>All Offers</h3>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <div className="filter-bar">
            <Input
              type="text"
              placeholder="Search by name or ID..."
              icon={FiSearch}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Select
              placeholder="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'paused', label: 'Paused' }
              ]}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            />
            <Select
              placeholder="Category"
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              value={filters.category_id}
              onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
            />
            <Button onClick={handleFilter}>Filter</Button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : offers.length === 0 ? (
            <EmptyState
              title="No offers found"
              description="Create your first offer to get started"
              action={
                <Button variant="primary" onClick={() => navigate('/admin/offers/new')}>
                  Add Offer
                </Button>
              }
            />
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>Offer</Th>
                    <Th>ID</Th>
                    <Th>Category</Th>
                    <Th>Type</Th>
                    <Th>Payout</Th>
                    <Th>Apps</Th>
                    <Th>Clicks</Th>
                    <Th>Conv.</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer.id}>
                      <Td>
                        <div className="offer-cell">
                          <div className="offer-logo">
                            {offer.logo ? (
                              <img src={offer.logo} alt={offer.name} />
                            ) : (
                              <span>{offer.name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="offer-name">{offer.name}</span>
                        </div>
                      </Td>
                      <Td>#{offer.id}</Td>
                      <Td>{offer.category_name}</Td>
                      <Td><Badge variant="primary">{offer.offer_type}</Badge></Td>
                      <Td className="font-semibold">${parseFloat(offer.payout_amount).toFixed(2)}</Td>
                      <Td>{offer.applications || 0}</Td>
                      <Td>{offer.total_clicks || 0}</Td>
                      <Td>{offer.total_conversions || 0}</Td>
                      <Td>{getStatusBadge(offer.status)}</Td>
                      <Td>
                        <div className="action-buttons">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/offers/${offer.id}/edit`)}
                          >
                            <FiEdit2 />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(offer.id, offer.status)}
                          >
                            {offer.status === 'active' ? <FiToggleRight className="text-success" /> : <FiToggleLeft />}
                          </Button>
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

export default AdminOffers;
