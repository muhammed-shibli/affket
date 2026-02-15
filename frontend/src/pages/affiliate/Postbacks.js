import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLink, FiTrash2, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Badge, EmptyState } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import './Affiliate.css';

const Postbacks = () => {
  const navigate = useNavigate();
  const [postbacks, setPostbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostbacks();
  }, []);

  const fetchPostbacks = async () => {
    try {
      const response = await api.get('/postbacks');
      if (response.data.success) {
        setPostbacks(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch postbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this postback?')) return;

    try {
      const response = await api.delete(`/postbacks/${id}`);
      if (response.data.success) {
        toast.success('Postback deleted');
        fetchPostbacks();
      }
    } catch (error) {
      toast.error('Failed to delete postback');
    }
  };

  return (
    <div className="postbacks-page">
      <div className="page-header">
        <h1>Postbacks</h1>
        <p>Manage your postback URLs for conversion tracking</p>
      </div>

      <Card>
        <CardHeader>
          <h3>All Postbacks</h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : postbacks.length === 0 ? (
            <EmptyState
              icon={FiLink}
              title="No postbacks"
              description="You haven't added any postbacks yet. Go to an approved offer to add postbacks."
              action={
                <Button onClick={() => navigate('/offers/approved')}>View Approved Offers</Button>
              }
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Offer</Th>
                  <Th>Goal/Event</Th>
                  <Th>Postback URL</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {postbacks.map((pb) => (
                  <tr key={pb.id}>
                    <Td className="font-semibold">{pb.offer_name}</Td>
                    <Td>{pb.goal_name || 'All Events'}</Td>
                    <Td>
                      <code className="postback-url truncate" style={{ maxWidth: '300px', display: 'block' }}>
                        {pb.postback_url}
                      </code>
                    </Td>
                    <Td>
                      <Badge variant={pb.status === 'active' ? 'success' : 'default'}>
                        {pb.status}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="action-buttons">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/offers/${pb.offer_id}`)}
                        >
                          <FiEye />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(pb.id)}
                        >
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
    </div>
  );
};

export default Postbacks;
