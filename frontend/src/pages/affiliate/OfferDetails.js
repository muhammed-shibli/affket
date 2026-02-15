import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCopy, FiPlus, FiExternalLink, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Badge, EmptyState } from '../../components/common/Table';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import './Affiliate.css';

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPostbackModal, setShowPostbackModal] = useState(false);
  const [postbackForm, setPostbackForm] = useState({
    goal_id: '',
    postback_url: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOffer();
  }, [id]);

  const fetchOffer = async () => {
    try {
      const response = await api.get(`/offers/${id}`);
      if (response.data.success) {
        setOffer(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch offer details');
      navigate('/offers/approved');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleAddPostback = async () => {
    if (!postbackForm.postback_url) {
      toast.error('Postback URL is required');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/postbacks', {
        offer_id: id,
        goal_id: postbackForm.goal_id || null,
        postback_url: postbackForm.postback_url
      });

      if (response.data.success) {
        toast.success('Postback added successfully');
        setShowPostbackModal(false);
        setPostbackForm({ goal_id: '', postback_url: '' });
        fetchOffer();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add postback');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePostback = async (postbackId) => {
    if (!window.confirm('Are you sure you want to delete this postback?')) return;

    try {
      const response = await api.delete(`/postbacks/${postbackId}`);
      if (response.data.success) {
        toast.success('Postback deleted');
        fetchOffer();
      }
    } catch (error) {
      toast.error('Failed to delete postback');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!offer) {
    return (
      <EmptyState
        title="Offer not found"
        action={<Button onClick={() => navigate('/offers/approved')}>Back to Offers</Button>}
      />
    );
  }

  const urlTokens = [
    { token: '{click_id}', desc: 'Unique click identifier' },
    { token: '{camp_id}', desc: 'Campaign/Offer ID' },
    { token: '{click_ip}', desc: 'User IP address' },
    { token: '{payout}', desc: 'Conversion payout' },
    { token: '{p1}', desc: 'Custom parameter 1' },
    { token: '{p2}', desc: 'Custom parameter 2' },
    { token: '{p3}', desc: 'Custom parameter 3' },
    { token: '{p4}', desc: 'Custom parameter 4' },
    { token: '{p5}', desc: 'Custom parameter 5' },
    { token: '{p6}', desc: 'Custom parameter 6' }
  ];

  return (
    <div className="offer-details-page">
      <Button variant="ghost" onClick={() => navigate(-1)} className="back-btn">
        <FiArrowLeft /> Back
      </Button>

      {/* Offer Info */}
      <Card className="offer-info-card">
        <CardBody>
          <div className="offer-header">
            <div className="offer-logo-large">
              {offer.logo ? (
                <img src={offer.logo} alt={offer.name} />
              ) : (
                <span>{offer.name.charAt(0)}</span>
              )}
            </div>
            <div className="offer-header-info">
              <h1>{offer.name}</h1>
              <div className="offer-meta">
                <Badge variant="primary">{offer.offer_type}</Badge>
                <span>ID: #{offer.id}</span>
                <span>{offer.category_name}</span>
              </div>
            </div>
            <div className="offer-payout-box">
              <span className="payout-label">Payout</span>
              <span className="payout-value">
                ${parseFloat(offer.payout_amount).toFixed(2)}
                {offer.payout_type === 'percentage' && '%'}
              </span>
              <span className="payout-type">{offer.payout_type}</span>
            </div>
          </div>

          {offer.description && (
            <div className="offer-description">
              <h4>Description</h4>
              <p>{offer.description}</p>
            </div>
          )}

          {offer.preview_url && (
            <div className="offer-preview">
              <Button
                variant="outline"
                icon={FiExternalLink}
                onClick={() => window.open(offer.preview_url, '_blank')}
              >
                Preview Offer
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tracking Link */}
      <Card>
        <CardHeader>
          <h3>Tracking Link</h3>
        </CardHeader>
        <CardBody>
          <div className="tracking-link-box">
            <code>{offer.tracking_link}</code>
            <Button
              variant="outline"
              size="sm"
              icon={FiCopy}
              onClick={() => copyToClipboard(offer.tracking_link)}
            >
              Copy
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <h3>Goals / Events</h3>
        </CardHeader>
        <CardBody>
          {offer.goals?.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Event Name</Th>
                  <Th>Objective</Th>
                  <Th>Payout</Th>
                  <Th>Payout Type</Th>
                  <Th>Remaining Caps</Th>
                </tr>
              </thead>
              <tbody>
                {offer.goals.map((goal) => (
                  <tr key={goal.id}>
                    <Td className="font-semibold">{goal.event_name}</Td>
                    <Td>{goal.objective || '-'}</Td>
                    <Td className="text-success">${parseFloat(goal.payout_amount).toFixed(2)}</Td>
                    <Td>{goal.payout_type}</Td>
                    <Td>{goal.remaining_cap > 0 ? goal.remaining_cap : 'Unlimited'}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No goals defined for this offer</p>
          )}
        </CardBody>
      </Card>

      {/* Postbacks */}
      <Card>
        <CardHeader
          action={
            <Button
              variant="primary"
              size="sm"
              icon={FiPlus}
              onClick={() => setShowPostbackModal(true)}
            >
              Add Postback
            </Button>
          }
        >
          <h3>Postbacks</h3>
        </CardHeader>
        <CardBody>
          {offer.postbacks?.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Goal/Event</Th>
                  <Th>Postback URL</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {offer.postbacks.map((pb) => (
                  <tr key={pb.id}>
                    <Td>{pb.event_name || 'All Events'}</Td>
                    <Td>
                      <code className="postback-url">{pb.postback_url}</code>
                    </Td>
                    <Td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePostback(pb.id)}
                      >
                        <FiTrash2 />
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              title="No postbacks"
              description="Add a postback to receive conversion notifications"
            />
          )}
        </CardBody>
      </Card>

      {/* Add Postback Modal */}
      <Modal
        isOpen={showPostbackModal}
        onClose={() => setShowPostbackModal(false)}
        title="Add Postback"
        size="lg"
      >
        <div className="postback-form">
          <Select
            label="Goal/Event (Optional)"
            placeholder="All Events"
            options={offer.goals?.map(g => ({ value: g.id, label: g.event_name })) || []}
            value={postbackForm.goal_id}
            onChange={(e) => setPostbackForm(prev => ({ ...prev, goal_id: e.target.value }))}
          />

          <Input
            label="Postback URL"
            placeholder="https://your-domain.com/postback?click_id={click_id}"
            value={postbackForm.postback_url}
            onChange={(e) => setPostbackForm(prev => ({ ...prev, postback_url: e.target.value }))}
          />

          <div className="postback-example">
            <h4>Example:</h4>
            <code>https://your-domain.com/postback?click_id={'{click_id}'}&payout={'{payout}'}</code>
          </div>

          <div className="url-tokens">
            <h4>Available URL Tokens:</h4>
            <div className="tokens-grid">
              {urlTokens.map((t) => (
                <div key={t.token} className="token-item" onClick={() => copyToClipboard(t.token)}>
                  <code>{t.token}</code>
                  <span>{t.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowPostbackModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddPostback} loading={saving}>Save Postback</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default OfferDetails;
