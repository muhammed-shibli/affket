import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiCreditCard, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import './Affiliate.css';

const Profile = () => {
  const { user, updateProfile, updateBankDetails } = useAuth();
  const [showBankModal, setShowBankModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    company_name: user?.company_name || ''
  });

  const [bankForm, setBankForm] = useState({
    bank_account_number: user?.bank_account_number || '',
    bank_name: user?.bank_name || '',
    ifsc_code: user?.ifsc_code || '',
    upi_id: user?.upi_id || ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBankUpdate = async () => {
    setSaving(true);
    try {
      const result = await updateBankDetails(bankForm);
      if (result.success) {
        toast.success('Bank details updated successfully');
        setShowBankModal(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update bank details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="profile-grid">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <h3>Personal Information</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <Input
                label="Full Name"
                icon={FiUser}
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
              />

              <Input
                label="Email"
                icon={FiMail}
                value={user?.email || ''}
                disabled
              />

              <Input
                label="Mobile Number"
                icon={FiPhone}
                value={profileForm.mobile}
                onChange={(e) => setProfileForm(prev => ({ ...prev, mobile: e.target.value }))}
              />

              <Input
                label="Company / Channel Name"
                icon={FiBriefcase}
                value={profileForm.company_name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, company_name: e.target.value }))}
              />

              <Button type="submit" variant="primary" loading={saving}>
                Save Changes
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader
            action={
              <Button
                variant="outline"
                size="sm"
                icon={FiEdit2}
                onClick={() => setShowBankModal(true)}
              >
                Edit
              </Button>
            }
          >
            <h3>Bank & Payment Details</h3>
          </CardHeader>
          <CardBody>
            <div className="bank-details">
              <div className="detail-item">
                <span className="detail-label">Bank Name</span>
                <span className="detail-value">{user?.bank_name || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Number</span>
                <span className="detail-value">
                  {user?.bank_account_number
                    ? `****${user.bank_account_number.slice(-4)}`
                    : 'Not set'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">IFSC Code</span>
                <span className="detail-value">{user?.ifsc_code || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">UPI ID</span>
                <span className="detail-value">{user?.upi_id || 'Not set'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <h3>Account Status</h3>
          </CardHeader>
          <CardBody>
            <div className="status-info">
              <div className="status-item">
                <span className="status-label">Status</span>
                <span className={`status-badge ${user?.status}`}>{user?.status}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Member Since</span>
                <span>{new Date(user?.created_at).toLocaleDateString()}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Wallet Balance</span>
                <span className="text-success font-semibold">₹{parseFloat(user?.wallet_balance || 0).toFixed(2)}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bank Details Modal */}
      <Modal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        title="Update Bank Details"
        size="md"
      >
        <div className="bank-form">
          <Input
            label="Bank Name"
            placeholder="e.g., State Bank of India"
            value={bankForm.bank_name}
            onChange={(e) => setBankForm(prev => ({ ...prev, bank_name: e.target.value }))}
          />

          <Input
            label="Account Number"
            placeholder="Enter account number"
            value={bankForm.bank_account_number}
            onChange={(e) => setBankForm(prev => ({ ...prev, bank_account_number: e.target.value }))}
          />

          <Input
            label="IFSC Code"
            placeholder="e.g., SBIN0001234"
            value={bankForm.ifsc_code}
            onChange={(e) => setBankForm(prev => ({ ...prev, ifsc_code: e.target.value.toUpperCase() }))}
          />

          <Input
            label="UPI ID"
            placeholder="e.g., yourname@upi"
            value={bankForm.upi_id}
            onChange={(e) => setBankForm(prev => ({ ...prev, upi_id: e.target.value }))}
          />
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowBankModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleBankUpdate} loading={saving}>Save</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Profile;
