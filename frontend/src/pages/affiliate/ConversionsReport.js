import React, { useState, useEffect } from 'react';
import { FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Pagination, Badge, EmptyState } from '../../components/common/Table';
import { Input, Checkbox } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import './Affiliate.css';

const allColumns = [
  { key: 'click_id', label: 'Click ID', default: true },
  { key: 'offer_name', label: 'Offer Name', default: true },
  { key: 'event_name', label: 'Event/Goal', default: true },
  { key: 'payout', label: 'Payout', default: true },
  { key: 'offer_id', label: 'Offer ID', default: true },
  { key: 'ip', label: 'IP', default: true },
  { key: 'created_at', label: 'Date', default: true },
  { key: 'p1', label: 'P1', default: false },
  { key: 'p2', label: 'P2', default: false },
  { key: 'p3', label: 'P3', default: false },
  { key: 'p4', label: 'P4', default: false },
  { key: 'p5', label: 'P5', default: false },
  { key: 'p6', label: 'P6', default: false },
  { key: 'city', label: 'City', default: false },
  { key: 'country', label: 'Country', default: false },
  { key: 'state', label: 'State', default: false },
  { key: 'os', label: 'OS', default: false },
  { key: 'browser', label: 'Browser', default: false }
];

const ConversionsReport = () => {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: ''
  });
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.filter(c => c.default).map(c => c.key)
  );

  useEffect(() => {
    fetchConversions();
  }, [pagination.page]);

  const fetchConversions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 50,
        ...filters
      });
      const response = await api.get(`/reports/conversions?${params}`);
      if (response.data.success) {
        setConversions(response.data.data.conversions);
        setPagination(prev => ({
          ...prev,
          pages: response.data.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch conversions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchConversions();
  };

  const toggleColumn = (key) => {
    setVisibleColumns(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="report-page">
      <div className="page-header">
        <h1>Conversions Report</h1>
        <p>View all your conversion data</p>
      </div>

      <Card>
        <CardHeader
          action={
            <Button variant="outline" size="sm" icon={FiFilter} onClick={() => setShowColumnModal(true)}>
              Columns
            </Button>
          }
        >
          <h3>Conversion Data</h3>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <div className="filter-bar">
            <Input
              type="date"
              label="Start Date"
              value={filters.start_date}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
            />
            <Input
              type="date"
              label="End Date"
              value={filters.end_date}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
            />
            <div className="filter-actions">
              <Button onClick={handleFilter}>Apply Filter</Button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : conversions.length === 0 ? (
            <EmptyState
              title="No conversions found"
              description="No conversion data available for the selected period"
            />
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                      <Th key={col.key}>{col.label}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((conv, index) => (
                    <tr key={index}>
                      {visibleColumns.includes('click_id') && <Td><code className="click-id">{conv.click_id}</code></Td>}
                      {visibleColumns.includes('offer_name') && <Td>{conv.offer_name}</Td>}
                      {visibleColumns.includes('event_name') && <Td><Badge variant="success">{conv.event_name}</Badge></Td>}
                      {visibleColumns.includes('payout') && <Td className="text-success font-semibold">${parseFloat(conv.payout).toFixed(2)}</Td>}
                      {visibleColumns.includes('offer_id') && <Td>{conv.offer_id}</Td>}
                      {visibleColumns.includes('ip') && <Td>{conv.ip}</Td>}
                      {visibleColumns.includes('created_at') && <Td>{formatDate(conv.created_at)}</Td>}
                      {visibleColumns.includes('p1') && <Td>{conv.p1}</Td>}
                      {visibleColumns.includes('p2') && <Td>{conv.p2}</Td>}
                      {visibleColumns.includes('p3') && <Td>{conv.p3}</Td>}
                      {visibleColumns.includes('p4') && <Td>{conv.p4}</Td>}
                      {visibleColumns.includes('p5') && <Td>{conv.p5}</Td>}
                      {visibleColumns.includes('p6') && <Td>{conv.p6}</Td>}
                      {visibleColumns.includes('city') && <Td>{conv.city}</Td>}
                      {visibleColumns.includes('country') && <Td>{conv.country}</Td>}
                      {visibleColumns.includes('state') && <Td>{conv.state}</Td>}
                      {visibleColumns.includes('os') && <Td>{conv.os}</Td>}
                      {visibleColumns.includes('browser') && <Td>{conv.browser}</Td>}
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

      {/* Column Selection Modal */}
      <Modal
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        title="Select Columns"
        size="sm"
      >
        <div className="column-selection">
          {allColumns.map(col => (
            <Checkbox
              key={col.key}
              label={col.label}
              checked={visibleColumns.includes(col.key)}
              onChange={() => toggleColumn(col.key)}
            />
          ))}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowColumnModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ConversionsReport;
