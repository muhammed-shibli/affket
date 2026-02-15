const { pool } = require('../config/database');
const { sendEmail, emailTemplates } = require('../config/email');

// Get wallet balance and transactions
const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [userId]
    );

    const [transactions] = await pool.query(`
      SELECT * FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);

    res.json({
      success: true,
      data: {
        balance: parseFloat(users[0].wallet_balance),
        transactions
      }
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet data'
    });
  }
};

// Request withdrawal
const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    // Get current balance
    const [users] = await pool.query(
      'SELECT wallet_balance, bank_account_number, upi_id FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    if (!user.bank_account_number && !user.upi_id) {
      return res.status(400).json({
        success: false,
        message: 'Please add bank details or UPI ID before withdrawing'
      });
    }

    if (parseFloat(amount) > parseFloat(user.wallet_balance)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const newBalance = parseFloat(user.wallet_balance) - parseFloat(amount);

    // Deduct from wallet
    await pool.query(
      'UPDATE users SET wallet_balance = ? WHERE id = ?',
      [newBalance, userId]
    );

    // Create transaction record
    await pool.query(`
      INSERT INTO transactions (user_id, type, amount, balance_after, description, status)
      VALUES (?, 'withdrawal', ?, ?, 'Withdrawal request', 'pending')
    `, [userId, amount, newBalance]);

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully'
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal request'
    });
  }
};

// Admin: Get all withdrawals
const getAllWithdrawals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email,
             u.bank_account_number, u.bank_name, u.ifsc_code, u.upi_id
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.type = 'withdrawal'
    `;
    const params = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [withdrawals] = await pool.query(query, params);

    res.json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawals'
    });
  }
};

// Admin: Update withdrawal status
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['paid', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get transaction details
    const [transactions] = await pool.query(`
      SELECT t.*, u.name, u.email, u.wallet_balance
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [id]);

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactions[0];

    // If rejected, refund the amount
    if (status === 'rejected') {
      const newBalance = parseFloat(transaction.wallet_balance) + parseFloat(transaction.amount);
      await pool.query(
        'UPDATE users SET wallet_balance = ? WHERE id = ?',
        [newBalance, transaction.user_id]
      );
    }

    // Update transaction status
    await pool.query(
      'UPDATE transactions SET status = ? WHERE id = ?',
      [status, id]
    );

    // Send email notification
    const template = emailTemplates.withdrawalStatusUpdate(
      transaction.name,
      transaction.amount,
      status.charAt(0).toUpperCase() + status.slice(1)
    );
    await sendEmail({
      to: transaction.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    res.json({
      success: true,
      message: `Withdrawal ${status} successfully`
    });
  } catch (error) {
    console.error('Update withdrawal status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update withdrawal status'
    });
  }
};

module.exports = {
  getWallet,
  requestWithdrawal,
  getAllWithdrawals,
  updateWithdrawalStatus
};
