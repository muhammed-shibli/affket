import React from 'react';
import { Card, CardBody } from '../../components/common/Card';
import './Affiliate.css';

const CustomCampaign = () => {
  return (
    <div className="custom-campaign-page">
      <div className="page-header">
        <h1>Custom Campaign</h1>
        <p>Create and manage your custom campaigns</p>
      </div>

      <Card>
        <CardBody>
          <div className="coming-soon">
            <h2>Coming Soon</h2>
            <p>Custom campaign feature will be available soon. Stay tuned!</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CustomCampaign;
