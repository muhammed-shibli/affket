const { pool } = require('../config/database');
const { sendEmail, emailTemplates } = require('../config/email');

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.*,
             (SELECT COUNT(*) FROM clicks WHERE user_id = u.id) as total_clicks,
             (SELECT COUNT(*) FROM conversions WHERE user_id = u.id) as total_conversions,
             (SELECT COALESCE(SUM(payout), 0) FROM conversions WHERE user_id = u.id) as total_earnings,
             (SELECT COUNT(*) FROM user_offers WHERE user_id = u.id AND status = 'approved') as approved_offers
      FROM users u
      WHERE u.role = 'affiliate'
    `;
    const params = [];

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.company_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await pool.query(query, params);

    // Remove passwords
    const safeUsers = users.map(({ password, ...user }) => user);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role = ?';
    const countParams = ['affiliate'];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR company_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        users: safeUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Admin: Get user details
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(`
      SELECT u.*,
             (SELECT COUNT(*) FROM clicks WHERE user_id = u.id) as total_clicks,
             (SELECT COUNT(*) FROM conversions WHERE user_id = u.id) as total_conversions,
             (SELECT COALESCE(SUM(payout), 0) FROM conversions WHERE user_id = u.id) as total_earnings
      FROM users u
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password, ...user } = users[0];

    // Get user's offer applications
    const [applications] = await pool.query(`
      SELECT uo.*, o.name as offer_name, o.payout_amount
      FROM user_offers uo
      JOIN offers o ON uo.offer_id = o.id
      WHERE uo.user_id = ?
      ORDER BY uo.applied_at DESC
    `, [id]);

    // Get user's recent transactions
    const [transactions] = await pool.query(`
      SELECT * FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [id]);

    user.applications = applications;
    user.transactions = transactions;

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
};

// Admin: Approve/Reject user
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get user details for email
    const [users] = await pool.query(
      'SELECT name, email, status as old_status FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Update status
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

    // Send email notification
    if (status === 'approved' && user.old_status === 'pending') {
      const template = emailTemplates.accountApproved(user.name);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
    } else if (status === 'rejected') {
      const template = emailTemplates.accountRejected(user.name, reason);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
    }

    res.json({
      success: true,
      message: `User ${status} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Admin: Update user features
const updateUserFeatures = async (req, res) => {
  try {
    const { id } = req.params;
    const { features, show_custom_campaign } = req.body;

    await pool.query(
      'UPDATE users SET features = ?, show_custom_campaign = ? WHERE id = ?',
      [JSON.stringify(features), show_custom_campaign ? 1 : 0, id]
    );

    res.json({
      success: true,
      message: 'User features updated successfully'
    });
  } catch (error) {
    console.error('Update user features error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user features'
    });
  }
};

// Admin: Get pending offer applications
const getPendingApplications = async (req, res) => {
  try {
    const [applications] = await pool.query(`
      SELECT uo.*, u.name as user_name, u.email as user_email, u.company_name,
             o.name as offer_name, o.payout_amount
      FROM user_offers uo
      JOIN users u ON uo.user_id = u.id
      JOIN offers o ON uo.offer_id = o.id
      WHERE uo.status = 'pending'
      ORDER BY uo.applied_at DESC
    `);

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending applications'
    });
  }
};

// Admin: Approve/Reject offer application
const updateOfferApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get application details
    const [applications] = await pool.query(`
      SELECT uo.*, u.id as user_id
      FROM user_offers uo
      JOIN users u ON uo.user_id = u.id
      WHERE uo.id = ?
    `, [id]);

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const app = applications[0];

    // Generate tracking link if approved
    let trackingLink = null;
    if (status === 'approved') {
      trackingLink = `${process.env.TRACKING_DOMAIN}/track/${app.offer_id}/${app.user_id}?click_id={click_id}&p1={p1}&p2={p2}&p3={p3}&p4={p4}&p5={p5}&p6={p6}`;
    }

    await pool.query(
      'UPDATE user_offers SET status = ?, tracking_link = ?, approved_at = NOW() WHERE id = ?',
      [status, trackingLink, id]
    );

    res.json({
      success: true,
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  updateUserFeatures,
  getPendingApplications,
  updateOfferApplication
};
