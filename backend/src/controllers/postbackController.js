const { pool } = require('../config/database');

// Get postbacks for an offer
const getPostbacks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { offer_id } = req.query;

    let query = `
      SELECT p.*, og.event_name as goal_name
      FROM postbacks p
      LEFT JOIN offer_goals og ON p.goal_id = og.id
      WHERE p.user_id = ?
    `;
    const params = [userId];

    if (offer_id) {
      query += ' AND p.offer_id = ?';
      params.push(offer_id);
    }

    query += ' ORDER BY p.created_at DESC';

    const [postbacks] = await pool.query(query, params);

    res.json({
      success: true,
      data: postbacks
    });
  } catch (error) {
    console.error('Get postbacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch postbacks'
    });
  }
};

// Get all postbacks for affiliate (with offer details)
const getAllPostbacks = async (req, res) => {
  try {
    const userId = req.user.id;

    const [postbacks] = await pool.query(`
      SELECT p.*, o.name as offer_name, og.event_name as goal_name
      FROM postbacks p
      LEFT JOIN offers o ON p.offer_id = o.id
      LEFT JOIN offer_goals og ON p.goal_id = og.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: postbacks
    });
  } catch (error) {
    console.error('Get all postbacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch postbacks'
    });
  }
};

// Create postback
const createPostback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { offer_id, goal_id, postback_url } = req.body;

    // Verify user has access to this offer
    const [userOffer] = await pool.query(
      'SELECT id FROM user_offers WHERE user_id = ? AND offer_id = ? AND status = ?',
      [userId, offer_id, 'approved']
    );

    if (userOffer.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this offer'
      });
    }

    // Create postback
    const [result] = await pool.query(`
      INSERT INTO postbacks (user_id, offer_id, goal_id, postback_url, status)
      VALUES (?, ?, ?, ?, 'active')
    `, [userId, offer_id, goal_id || null, postback_url]);

    res.status(201).json({
      success: true,
      message: 'Postback created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create postback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create postback'
    });
  }
};

// Update postback
const updatePostback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { goal_id, postback_url, status } = req.body;

    // Verify ownership
    const [postbacks] = await pool.query(
      'SELECT id FROM postbacks WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (postbacks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Postback not found'
      });
    }

    await pool.query(
      'UPDATE postbacks SET goal_id = ?, postback_url = ?, status = ? WHERE id = ?',
      [goal_id || null, postback_url, status || 'active', id]
    );

    res.json({
      success: true,
      message: 'Postback updated successfully'
    });
  } catch (error) {
    console.error('Update postback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update postback'
    });
  }
};

// Delete postback
const deletePostback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership
    const [postbacks] = await pool.query(
      'SELECT id FROM postbacks WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (postbacks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Postback not found'
      });
    }

    await pool.query('DELETE FROM postbacks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Postback deleted successfully'
    });
  } catch (error) {
    console.error('Delete postback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete postback'
    });
  }
};

// Get postback logs
const getPostbackLogs = async (req, res) => {
  try {
    const { postback_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT pl.*, p.postback_url
      FROM postback_logs pl
      JOIN postbacks p ON pl.postback_id = p.id
      WHERE p.user_id = ?
    `;
    const params = [req.user.id];

    if (postback_id) {
      query += ' AND pl.postback_id = ?';
      params.push(postback_id);
    }

    query += ' ORDER BY pl.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await pool.query(query, params);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get postback logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch postback logs'
    });
  }
};

module.exports = {
  getPostbacks,
  getAllPostbacks,
  createPostback,
  updatePostback,
  deletePostback,
  getPostbackLogs
};
