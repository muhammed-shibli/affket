import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Badge, EmptyState } from '../../components/common/Table';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import './Admin.css';

const AdminGateways = () => {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');

  const [form, setForm] = useState({
    type: 'payment',
    name: '',
    method: 'POST',
    api_url: '',
    parameters: '',
    headers: '',
    response_example: ''
  });

  useEffect(() => {
    fetchGateways();
  }, [activeTab]);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/gateways?type=${activeTab}`);
      if (response.data.success) {
        setGateways(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch gateways:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      type: activeTab,
      name: '',
      method: 'POST',
      api_url: '',
      parameters: '',
      headers: '',
      response_example: ''
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setForm(prev => ({ ...prev, type: activeTab }));
    setShowModal(true);
  };

  const openEditModal = (gateway) => {
    setEditingId(gateway.id);
    setForm({
      type: gateway.type,
      name: gateway.name,
      method: gateway.method,
      api_url: gateway.api_url,
      parameters: gateway.parameters ? JSON.stringify(gateway.parameters, null, 2) : '',
      headers: gateway.headers ? JSON.stringify(gateway.headers, null, 2) : '',
      response_example: gateway.response_example || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.api_url) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      let parameters = {};
      let headers = {};

      try {
        if (form.parameters) parameters = JSON.parse(form.parameters);
        if (form.headers) headers = JSON.parse(form.headers);
      } catch (e) {
        toast.error('Invalid JSON in parameters or headers');
        setSaving(false);
        return;
      }

      const data = {
        ...form,
        parameters,
        headers
      };

      let response;
      if (editingId) {
        response = await api.put(`/gateways/${editingId}`, data);
      } else {
        response = await api.post('/gateways', data);
      }

      if (response.data.success) {
        toast.success(editingId ? 'Gateway updated' : 'Gateway created');
        setShowModal(false);
        resetForm();
        fetchGateways();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save gateway');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gateway?')) return;

    try {
      const response = await api.delete(`/gateways/${id}`);
      if (response.data.success) {
        toast.success('Gateway deleted');
        fetchGateways();
      }
    } catch (error) {
      toast.error('Failed to delete gateway');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await api.patch(`/gateways/${id}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success('Status updated');
        fetchGateways();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="admin-gateways">
      <div className="page-header">
        <h1>Gateways</h1>
        <p>Manage payment and SMS gateway configurations</p>
      </div>

      {/* Tabs */}
      <div className="gateway-tabs">
        <button
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment Gateway
        </button>
        <button
          className={`tab ${activeTab === 'sms' ? 'active' : ''}`}
          onClick={() => setActiveTab('sms')}
        >
          SMS Alert
        </button>
      </div>

      <Card>
        <CardHeader
          action={
            <Button variant="primary" size="sm" icon={FiPlus} onClick={openAddModal}>
              Add Gateway
            </Button>
          }
        >
          <h3>{activeTab === 'payment' ? 'Payment Gateways' : 'SMS Gateways'}</h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : gateways.length === 0 ? (
            <EmptyState
              title={`No ${activeTab} gateways`}
              description={`Add a ${activeTab} gateway to get started`}
              action={
                <Button variant="primary" onClick={openAddModal}>
                  Add Gateway
                </Button>
              }
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Method</Th>
                  <Th>API URL</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {gateways.map((gw) => (
                  <tr key={gw.id}>
                    <Td className="font-semibold">{gw.name}</Td>
                    <Td>
                      <Badge variant={gw.method === 'POST' ? 'success' : 'primary'}>{gw.method}</Badge>
                    </Td>
                    <Td>
                      <code className="text-sm truncate" style={{ maxWidth: '300px', display: 'block' }}>
                        {gw.api_url}
                      </code>
                    </Td>
                    <Td>
                      <Badge variant={gw.status === 'active' ? 'success' : 'default'}>
                        {gw.status}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="action-buttons">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(gw)}>
                          <FiEdit2 />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(gw.id, gw.status)}
                        >
                          {gw.status === 'active' ? <FiToggleRight className="text-success" /> : <FiToggleLeft />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(gw.id)}>
                          <FiTrash2 />
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

      {/* Gateway Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Gateway' : 'Add Gateway'}
        size="lg"
      >
        <div className="gateway-form">
          <Input
            label="Gateway Name *"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Stripe, Twilio"
          />

          <Select
            label="HTTP Method"
            value={form.method}
            onChange={(e) => setForm(prev => ({ ...prev, method: e.target.value }))}
            options={[
              { value: 'POST', label: 'POST' },
              { value: 'GET', label: 'GET' }
            ]}
          />

          <Input
            label="API URL *"
            value={form.api_url}
            onChange={(e) => setForm(prev => ({ ...prev, api_url: e.target.value }))}
            placeholder="https://api.example.com/endpoint"
          />

          <Textarea
            label="Parameters/Payload (JSON)"
            value={form.parameters}
            onChange={(e) => setForm(prev => ({ ...prev, parameters: e.target.value }))}
            placeholder='{"key": "value", "amount": "{amount}"}'
          />

          <Textarea
            label="Headers (JSON)"
            value={form.headers}
            onChange={(e) => setForm(prev => ({ ...prev, headers: e.target.value }))}
            placeholder='{"Authorization": "Bearer {api_key}"}'
          />

          <Textarea
            label="Response Example"
            value={form.response_example}
            onChange={(e) => setForm(prev => ({ ...prev, response_example: e.target.value }))}
            placeholder='{"success": true, "transaction_id": "..."}'
          />
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AdminGateways;
