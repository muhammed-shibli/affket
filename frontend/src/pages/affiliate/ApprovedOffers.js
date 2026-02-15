import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye } from 'react-icons/fi';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Pagination, Badge, EmptyState } from '../../components/common/Table';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import './Affiliate.css';

const ApprovedOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
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
      const response = await api.get(`/offers/approved?${params}`);
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
        <h1>Approved Offers</h1>
        <p>View your approved offers and get tracking links</p>
      </div>

      <Card>
        <CardHeader>
          <h3>My Approved Offers</h3>
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
              title="No approved offers"
              description="You don't have any approved offers yet. Browse offers and apply to get started."
              action={
                <Button onClick={() => navigate('/offers/browse')}>Browse Offers</Button>
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
                    <Th>Approved Date</Th>
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
                      <Td className="font-semibold text-success">
                        ${parseFloat(offer.payout_amount).toFixed(2)}
                        {offer.payout_type === 'percentage' && '%'}
                      </Td>
                      <Td>{new Date(offer.approved_at).toLocaleDateString()}</Td>
                      <Td>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={FiEye}
                          onClick={() => navigate(`/offers/${offer.id}`)}
                        >
                          View
                        </Button>
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

export default ApprovedOffers;
