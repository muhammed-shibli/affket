import React, { useState, useEffect } from 'react';
import { FiArrowDownCircle, FiArrowUpCircle } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody, StatCard } from '../../components/common/Card';
import { Table, Th, Td, Badge, EmptyState } from '../../components/common/Table';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import './Affiliate.css';

const Wallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await api.get('/wallet');
      if (response.data.success) {
        setWallet(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!user.bank_account_number && !user.upi_id) {
      toast.error('Please add bank details before withdrawing');
      return;
    }

    setWithdrawing(true);
    try {
      const response = await api.post('/wallet/withdraw', { amount });
      if (response.data.success) {
        toast.success('Withdrawal request submitted');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchWallet();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'credit':
        return <FiArrowDownCircle className="text-success" />;
      case 'withdrawal':
      case 'debit':
        return <FiArrowUpCircle className="text-error" />;
      default:
        return <BiRupee />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <div className="page-header">
        <h1>Wallet</h1>
        <p>Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Card */}
      <div className="wallet-balance-section">
        <Card className="balance-card">
          <CardBody>
            <div className="balance-content">
              <div className="balance-info">
                <span className="balance-label">Available Balance</span>
                <span className="balance-value">₹{wallet.balance.toFixed(2)}</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowWithdrawModal(true)}
                disabled={wallet.balance <= 0}
              >
                Withdraw
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bank Details Notice */}
      {!user.bank_account_number && !user.upi_id && (
        <div className="notice-card warning">
          <p>Please add your bank details or UPI ID in your profile before requesting a withdrawal.</p>
        </div>
      )}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <h3>Transaction History</h3>
        </CardHeader>
        <CardBody>
          {wallet.transactions.length === 0 ? (
            <EmptyState
              icon={BiRupee}
              title="No transactions"
              description="Your transaction history will appear here"
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Description</Th>
                  <Th>Amount</Th>
                  <Th>Balance After</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <Td>
                      <div className="tx-type">
                        {getTypeIcon(tx.type)}
                        <span className="capitalize">{tx.type}</span>
                      </div>
                    </Td>
                    <Td>{tx.description}</Td>
                    <Td className={tx.type === 'credit' ? 'text-success' : 'text-error'}>
                      {tx.type === 'credit' ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                    </Td>
                    <Td>₹{parseFloat(tx.balance_after).toFixed(2)}</Td>
                    <Td>{getStatusBadge(tx.status)}</Td>
                    <Td>{new Date(tx.created_at).toLocaleString()}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Request Withdrawal"
        size="sm"
      >
        <div className="withdraw-form">
          <div className="withdraw-balance">
            <span>Available Balance:</span>
            <strong>₹{wallet.balance.toFixed(2)}</strong>
          </div>

          <Input
            label="Amount to Withdraw"
            type="number"
            min="1"
            max={wallet.balance}
            placeholder="Enter amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />

          {user.bank_account_number && (
            <div className="bank-info">
              <h4>Bank Details</h4>
              <p>{user.bank_name} - ****{user.bank_account_number.slice(-4)}</p>
            </div>
          )}

          {user.upi_id && (
            <div className="bank-info">
              <h4>UPI ID</h4>
              <p>{user.upi_id}</p>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleWithdraw}
            loading={withdrawing}
            disabled={!withdrawAmount || parseFloat(withdrawAmount) > wallet.balance}
          >
            Submit Request
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Wallet;
