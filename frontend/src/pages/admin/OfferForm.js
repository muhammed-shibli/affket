import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import './Admin.css';

// All Indian States and Union Territories
const INDIAN_STATES = [
  { value: 'AN', label: 'Andaman and Nicobar Islands' },
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'AR', label: 'Arunachal Pradesh' },
  { value: 'AS', label: 'Assam' },
  { value: 'BR', label: 'Bihar' },
  { value: 'CH', label: 'Chandigarh' },
  { value: 'CT', label: 'Chhattisgarh' },
  { value: 'DN', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'DL', label: 'Delhi' },
  { value: 'GA', label: 'Goa' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'HR', label: 'Haryana' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'JK', label: 'Jammu and Kashmir' },
  { value: 'JH', label: 'Jharkhand' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'KL', label: 'Kerala' },
  { value: 'LA', label: 'Ladakh' },
  { value: 'LD', label: 'Lakshadweep' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MN', label: 'Manipur' },
  { value: 'ML', label: 'Meghalaya' },
  { value: 'MZ', label: 'Mizoram' },
  { value: 'NL', label: 'Nagaland' },
  { value: 'OR', label: 'Odisha' },
  { value: 'PY', label: 'Puducherry' },
  { value: 'PB', label: 'Punjab' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'SK', label: 'Sikkim' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'TG', label: 'Telangana' },
  { value: 'TR', label: 'Tripura' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UK', label: 'Uttarakhand' },
  { value: 'WB', label: 'West Bengal' }
];

const AdminOfferForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    offer_type: 'CPA',
    payout_type: 'fixed',
    payout_amount: '',
    preview_url: '',
    tracking_url: '',
    daily_cap: '',
    total_cap: '',
    status: 'active',
    target_states: INDIAN_STATES.map(s => s.value) // All states selected by default
  });

  const [goals, setGoals] = useState([
    { event_name: '', objective: '', payout_amount: '', payout_type: 'fixed', daily_cap: '' }
  ]);

  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchOffer();
    }
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.multi-select-container')) {
        setShowStateDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const fetchOffer = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/offers/${id}`);
      if (response.data.success) {
        const offer = response.data.data;
        setForm({
          name: offer.name,
          description: offer.description || '',
          category_id: offer.category_id || '',
          offer_type: offer.offer_type,
          payout_type: offer.payout_type,
          payout_amount: offer.payout_amount,
          preview_url: offer.preview_url || '',
          tracking_url: offer.tracking_url || '',
          daily_cap: offer.daily_cap || '',
          total_cap: offer.total_cap || '',
          status: offer.status,
          target_states: offer.target_states ? JSON.parse(offer.target_states) : INDIAN_STATES.map(s => s.value)
        });
        if (offer.goals?.length > 0) {
          setGoals(offer.goals.map(g => ({
            event_name: g.event_name,
            objective: g.objective || '',
            payout_amount: g.payout_amount,
            payout_type: g.payout_type,
            daily_cap: g.daily_cap || ''
          })));
        }
      }
    } catch (error) {
      toast.error('Failed to fetch offer');
      navigate('/admin/offers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (index, field, value) => {
    setGoals(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addGoal = () => {
    setGoals(prev => [...prev, { event_name: '', objective: '', payout_amount: '', payout_type: 'fixed', daily_cap: '' }]);
  };

  const removeGoal = (index) => {
    if (goals.length > 1) {
      setGoals(prev => prev.filter((_, i) => i !== index));
    }
  };

  // State selection handlers
  const toggleState = (stateValue) => {
    setForm(prev => {
      const currentStates = prev.target_states || [];
      if (currentStates.includes(stateValue)) {
        return { ...prev, target_states: currentStates.filter(s => s !== stateValue) };
      } else {
        return { ...prev, target_states: [...currentStates, stateValue] };
      }
    });
  };

  const selectAllStates = () => {
    setForm(prev => ({ ...prev, target_states: INDIAN_STATES.map(s => s.value) }));
  };

  const clearAllStates = () => {
    setForm(prev => ({ ...prev, target_states: [] }));
  };

  const getSelectedStatesLabel = () => {
    const count = form.target_states?.length || 0;
    if (count === 0) return 'Select target states';
    if (count === INDIAN_STATES.length) return 'All States Selected';
    if (count === 1) {
      const state = INDIAN_STATES.find(s => s.value === form.target_states[0]);
      return state?.label || '1 State Selected';
    }
    return `${count} States Selected`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category_id || !form.payout_amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'target_states') {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });
      formData.append('goals', JSON.stringify(goals.filter(g => g.event_name)));

      if (logo) {
        formData.append('logo', logo);
      }

      let response;
      if (isEdit) {
        response = await api.put(`/offers/admin/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/offers/admin/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        toast.success(isEdit ? 'Offer updated' : 'Offer created');
        navigate('/admin/offers');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  const offerTypes = [
    { value: 'CPA', label: 'CPA - Cost Per Action' },
    { value: 'CPI', label: 'CPI - Cost Per Install' },
    { value: 'CPS', label: 'CPS - Cost Per Sale' },
    { value: 'CPL', label: 'CPL - Cost Per Lead' },
    { value: 'CPC', label: 'CPC - Cost Per Click' }
  ];

  const payoutTypes = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'dynamic', label: 'Dynamic' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="admin-offer-form">
      <Button variant="ghost" onClick={() => navigate(-1)} className="back-btn">
        <FiArrowLeft /> Back
      </Button>

      <div className="page-header">
        <h1>{isEdit ? 'Edit Offer' : 'Create New Offer'}</h1>
        <p>{isEdit ? 'Update offer details' : 'Add a new offer to your network'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h3>Basic Information</h3>
            </CardHeader>
            <CardBody>
              <div className="form-fields">
                <Input
                  label="Offer Name *"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter offer name"
                />

                <Textarea
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter offer description"
                />

                <Select
                  label="Category *"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  placeholder="Select category"
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                />

                <Select
                  label="Offer Type *"
                  name="offer_type"
                  value={form.offer_type}
                  onChange={handleChange}
                  options={offerTypes}
                />

                <div className="input-row">
                  <Select
                    label="Payout Type"
                    name="payout_type"
                    value={form.payout_type}
                    onChange={handleChange}
                    options={payoutTypes}
                  />

                  <Input
                    label="Payout Amount *"
                    name="payout_amount"
                    type="number"
                    step="0.01"
                    value={form.payout_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                {/* Target States Multi-Select */}
                <div className="input-group">
                  <label className="input-label">Target States</label>
                  <div className="multi-select-container">
                    <div
                      className="multi-select-trigger"
                      onClick={() => setShowStateDropdown(!showStateDropdown)}
                    >
                      <span className={form.target_states?.length === 0 ? 'placeholder' : ''}>
                        {getSelectedStatesLabel()}
                      </span>
                      <span className="multi-select-arrow">▼</span>
                    </div>

                    {showStateDropdown && (
                      <div className="multi-select-dropdown">
                        <div className="multi-select-actions">
                          <button type="button" onClick={selectAllStates} className="select-action-btn">
                            <FiCheck /> Select All
                          </button>
                          <button type="button" onClick={clearAllStates} className="select-action-btn clear">
                            <FiX /> Clear All
                          </button>
                        </div>
                        <div className="multi-select-options">
                          {INDIAN_STATES.map(state => (
                            <label key={state.value} className="multi-select-option">
                              <input
                                type="checkbox"
                                checked={form.target_states?.includes(state.value)}
                                onChange={() => toggleState(state.value)}
                              />
                              <span className="checkmark"></span>
                              <span className="option-label">{state.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="input-hint">Select states where this offer should be available</span>
                </div>

                <Input
                  label="Preview URL"
                  name="preview_url"
                  value={form.preview_url}
                  onChange={handleChange}
                  placeholder="https://example.com/preview"
                />

                <Input
                  label="Tracking URL"
                  name="tracking_url"
                  value={form.tracking_url}
                  onChange={handleChange}
                  placeholder="https://tracking.example.com/..."
                />

                <div className="input-row">
                  <Input
                    label="Daily Cap"
                    name="daily_cap"
                    type="number"
                    value={form.daily_cap}
                    onChange={handleChange}
                    placeholder="0 = unlimited"
                  />

                  <Input
                    label="Total Cap"
                    name="total_cap"
                    type="number"
                    value={form.total_cap}
                    onChange={handleChange}
                    placeholder="0 = unlimited"
                  />
                </div>

                <Select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'paused', label: 'Paused' }
                  ]}
                />

                <div className="file-input">
                  <label className="input-label">Offer Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogo(e.target.files[0])}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader
              action={
                <Button variant="outline" size="sm" icon={FiPlus} onClick={addGoal}>
                  Add Goal
                </Button>
              }
            >
              <h3>Goals / Events</h3>
            </CardHeader>
            <CardBody>
              <div className="goals-list">
                {goals.map((goal, index) => (
                  <div key={index} className="goal-item">
                    <div className="goal-header">
                      <span>Goal {index + 1}</span>
                      {goals.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeGoal(index)}>
                          <FiTrash2 />
                        </Button>
                      )}
                    </div>
                    <div className="goal-fields">
                      <Input
                        label="Event Name"
                        value={goal.event_name}
                        onChange={(e) => handleGoalChange(index, 'event_name', e.target.value)}
                        placeholder="e.g., Install, Registration"
                      />
                      <Input
                        label="Objective"
                        value={goal.objective}
                        onChange={(e) => handleGoalChange(index, 'objective', e.target.value)}
                        placeholder="e.g., Complete registration"
                      />
                      <div className="input-row">
                        <Input
                          label="Payout"
                          type="number"
                          step="0.01"
                          value={goal.payout_amount}
                          onChange={(e) => handleGoalChange(index, 'payout_amount', e.target.value)}
                          placeholder="0.00"
                        />
                        <Select
                          label="Type"
                          value={goal.payout_type}
                          onChange={(e) => handleGoalChange(index, 'payout_type', e.target.value)}
                          options={[
                            { value: 'fixed', label: 'Fixed' },
                            { value: 'percentage', label: 'Percentage' }
                          ]}
                        />
                        <Input
                          label="Daily Cap"
                          type="number"
                          value={goal.daily_cap}
                          onChange={(e) => handleGoalChange(index, 'daily_cap', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            {isEdit ? 'Update Offer' : 'Create Offer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminOfferForm;
