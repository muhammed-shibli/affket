import React, { useState, useEffect } from 'react';
import { FiSearch, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Pagination, Badge, EmptyState } from '../../components/common/Table';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import './Affiliate.css';

const BrowseOffers = () => {
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    offer_type: ''
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
      const response = await api.get(`/offers?${params}`);
      if (response.data.success) {
        setOffers(response.data.data.offers);
        setPagination(prev => ({
          ...prev,
          pages: response.data.data.pagination.pages,
          total: response.data.data.pagination.total
        }));
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

  const handleApply = async (offerId) => {
    try {
      const response = await api.post('/offers/apply', { offer_id: offerId });
      if (response.data.success) {
        toast.success('Application submitted successfully');
        fetchOffers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
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
      default:
        return <Badge variant="default">Not Applied</Badge>;
    }
  };

  const offerTypes = [
    { value: 'CPA', label: 'CPA' },
    { value: 'CPI', label: 'CPI' },
    { value: 'CPS', label: 'CPS' },
    { value: 'CPL', label: 'CPL' },
    { value: 'CPC', label: 'CPC' }
  ];

  return (
    <div className="offers-page">
      <div className="page-header">
        <h1>Browse Offers</h1>
        <p>Explore available offers and apply to promote them</p>
      </div>

      <Card>
        <CardHeader>
          <h3>Available Offers ({pagination.total})</h3>
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
              placeholder="Category"
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              value={filters.category_id}
              onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
            />
            <Select
              placeholder="Offer Type"
              options={offerTypes}
              value={filters.offer_type}
              onChange={(e) => setFilters(prev => ({ ...prev, offer_type: e.target.value }))}
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
              description="No offers match your search criteria"
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
                    <Th>Status</Th>
                    <Th>Action</Th>
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
                          <div className="offer-info">
                            <span className="offer-name">{offer.name}</span>
                          </div>
                        </div>
                      </Td>
                      <Td>#{offer.id}</Td>
                      <Td>{offer.category_name}</Td>
                      <Td><Badge variant="primary">{offer.offer_type}</Badge></Td>
                      <Td className="font-semibold">
                        ${parseFloat(offer.payout_amount).toFixed(2)}
                        {offer.payout_type === 'percentage' && '%'}
                      </Td>
                      <Td>{getStatusBadge(offer.user_status)}</Td>
                      <Td>
                        <div className="action-buttons">
                          {offer.preview_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(offer.preview_url, '_blank')}
                            >
                              <FiExternalLink />
                            </Button>
                          )}
                          {offer.user_status === 'not_applied' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApply(offer.id)}
                            >
                              Apply
                            </Button>
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

export default BrowseOffers;
