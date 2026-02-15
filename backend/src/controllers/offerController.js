const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all offers (for affiliates - browse offers)
const getAllOffers = async (req, res) => {
  try {
    const { category_id, offer_type, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = `
      SELECT o.*, c.name as category_name,
             COALESCE(uo.status, 'not_applied') as user_status
      FROM offers o
      LEFT JOIN categories c ON o.category_id = c.id
      LEFT JOIN user_offers uo ON o.id = uo.offer_id AND uo.user_id = ?
      WHERE o.status = 'active'
    `;
    const params = [userId];

    if (category_id) {
      query += ' AND o.category_id = ?';
      params.push(category_id);
    }

    if (offer_type) {
      query += ' AND o.offer_type = ?';
      params.push(offer_type);
    }

    if (search) {
      query += ' AND (o.name LIKE ? OR o.id = ?)';
      params.push(`%${search}%`, search);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [offers] = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM offers o WHERE o.status = 'active'
    `;
    const countParams = [];

    if (category_id) {
      countQuery += ' AND o.category_id = ?';
      countParams.push(category_id);
    }

    if (offer_type) {
      countQuery += ' AND o.offer_type = ?';
      countParams.push(offer_type);
    }

    if (search) {
      countQuery += ' AND (o.name LIKE ? OR o.id = ?)';
      countParams.push(`%${search}%`, search);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        offers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch offers'
    });
  }
};

// Get approved offers for affiliate
const getApprovedOffers = async (req, res) => {
  try {
    const { category_id, offer_type, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = `
      SELECT o.*, c.name as category_name, uo.tracking_link, uo.approved_at
      FROM offers o
      LEFT JOIN categories c ON o.category_id = c.id
      INNER JOIN user_offers uo ON o.id = uo.offer_id AND uo.user_id = ? AND uo.status = 'approved'
      WHERE o.status = 'active'
    `;
    const params = [userId];

    if (category_id) {
      query += ' AND o.category_id = ?';
      params.push(category_id);
    }

    if (offer_type) {
      query += ' AND o.offer_type = ?';
      params.push(offer_type);
    }

    if (search) {
      query += ' AND (o.name LIKE ? OR o.id = ?)';
      params.push(`%${search}%`, search);
    }

    query += ' ORDER BY uo.approved_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [offers] = await pool.query(query, params);

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    console.error('Get approved offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved offers'
    });
  }
};

// Get single offer details
const getOfferDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [offers] = await pool.query(`
      SELECT o.*, c.name as category_name, uo.status as user_status, uo.tracking_link
      FROM offers o
      LEFT JOIN categories c ON o.category_id = c.id
      LEFT JOIN user_offers uo ON o.id = uo.offer_id AND uo.user_id = ?
      WHERE o.id = ?
    `, [userId, id]);

    if (offers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Get goals
    const [goals] = await pool.query(`
      SELECT * FROM offer_goals WHERE offer_id = ? AND status = 'active'
    `, [id]);

    // Get postbacks for this user and offer
    const [postbacks] = await pool.query(`
      SELECT p.*, og.event_name
      FROM postbacks p
      LEFT JOIN offer_goals og ON p.goal_id = og.id
      WHERE p.user_id = ? AND p.offer_id = ?
    `, [userId, id]);

    const offer = offers[0];
    offer.goals = goals;
    offer.postbacks = postbacks;

    // Generate tracking link if approved and not exists
    if (offer.user_status === 'approved' && !offer.tracking_link) {
      offer.tracking_link = `${process.env.TRACKING_DOMAIN}/track/${offer.id}/${userId}?click_id={click_id}&p1={p1}&p2={p2}&p3={p3}&p4={p4}&p5={p5}&p6={p6}`;
    }

    res.json({
      success: true,
      data: offer
    });
  } catch (error) {
    console.error('Get offer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch offer details'
    });
  }
};

// Apply for offer
const applyForOffer = async (req, res) => {
  try {
    const { offer_id } = req.body;
    const userId = req.user.id;

    // Check if already applied
    const [existing] = await pool.query(
      'SELECT id FROM user_offers WHERE user_id = ? AND offer_id = ?',
      [userId, offer_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already applied for this offer'
      });
    }

    // Create application
    await pool.query(
      'INSERT INTO user_offers (user_id, offer_id, status) VALUES (?, ?, ?)',
      [userId, offer_id, 'pending']
    );

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply for offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply for offer'
    });
  }
};

// Admin: Get all offers
const adminGetAllOffers = async (req, res) => {
  try {
    const { status, category_id, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, c.name as category_name,
             (SELECT COUNT(*) FROM user_offers WHERE offer_id = o.id) as applications,
             (SELECT COUNT(*) FROM clicks WHERE offer_id = o.id) as total_clicks,
             (SELECT COUNT(*) FROM conversions WHERE offer_id = o.id) as total_conversions
      FROM offers o
      LEFT JOIN categories c ON o.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (category_id) {
      query += ' AND o.category_id = ?';
      params.push(category_id);
    }

    if (search) {
      query += ' AND (o.name LIKE ? OR o.id = ?)';
      params.push(`%${search}%`, search);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [offers] = await pool.query(query, params);

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    console.error('Admin get offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch offers'
    });
  }
};

// Admin: Create offer
const createOffer = async (req, res) => {
  try {
    const {
      name,
      description,
      category_id,
      offer_type,
      payout_type,
      payout_amount,
      preview_url,
      tracking_url,
      daily_cap,
      total_cap,
      countries,
      devices,
      goals
    } = req.body;

    const logo = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(`
      INSERT INTO offers (name, description, logo, category_id, offer_type, payout_type,
                         payout_amount, preview_url, tracking_url, daily_cap, total_cap,
                         countries, devices, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [name, description, logo, category_id, offer_type, payout_type, payout_amount,
        preview_url, tracking_url, daily_cap || 0, total_cap || 0,
        JSON.stringify(countries || []), JSON.stringify(devices || [])]);

    const offerId = result.insertId;

    // Add goals
    if (goals && Array.isArray(goals)) {
      for (const goal of goals) {
        await pool.query(`
          INSERT INTO offer_goals (offer_id, event_name, objective, payout_amount, payout_type, daily_cap, remaining_cap)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [offerId, goal.event_name, goal.objective, goal.payout_amount, goal.payout_type || 'fixed',
            goal.daily_cap || 0, goal.daily_cap || 0]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: { id: offerId }
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create offer'
    });
  }
};

// Admin: Update offer
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category_id,
      offer_type,
      payout_type,
      payout_amount,
      preview_url,
      tracking_url,
      daily_cap,
      total_cap,
      countries,
      devices,
      status,
      goals
    } = req.body;

    let updateQuery = `
      UPDATE offers SET
        name = ?, description = ?, category_id = ?, offer_type = ?,
        payout_type = ?, payout_amount = ?, preview_url = ?, tracking_url = ?,
        daily_cap = ?, total_cap = ?, countries = ?, devices = ?, status = ?
      WHERE id = ?
    `;

    const params = [name, description, category_id, offer_type, payout_type, payout_amount,
                    preview_url, tracking_url, daily_cap || 0, total_cap || 0,
                    JSON.stringify(countries || []), JSON.stringify(devices || []), status, id];

    if (req.file) {
      updateQuery = `
        UPDATE offers SET
          name = ?, description = ?, logo = ?, category_id = ?, offer_type = ?,
          payout_type = ?, payout_amount = ?, preview_url = ?, tracking_url = ?,
          daily_cap = ?, total_cap = ?, countries = ?, devices = ?, status = ?
        WHERE id = ?
      `;
      params.splice(2, 0, `/uploads/${req.file.filename}`);
    }

    await pool.query(updateQuery, params);

    // Update goals if provided
    if (goals && Array.isArray(goals)) {
      // Delete existing goals
      await pool.query('DELETE FROM offer_goals WHERE offer_id = ?', [id]);

      // Add new goals
      for (const goal of goals) {
        await pool.query(`
          INSERT INTO offer_goals (offer_id, event_name, objective, payout_amount, payout_type, daily_cap, remaining_cap)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id, goal.event_name, goal.objective, goal.payout_amount, goal.payout_type || 'fixed',
            goal.daily_cap || 0, goal.daily_cap || 0]);
      }
    }

    res.json({
      success: true,
      message: 'Offer updated successfully'
    });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update offer'
    });
  }
};

// Admin: Toggle offer status
const toggleOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query('UPDATE offers SET status = ? WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: 'Offer status updated'
    });
  } catch (error) {
    console.error('Toggle offer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update offer status'
    });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE status = ? ORDER BY name',
      ['active']
    );

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Admin: Manage categories
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const [result] = await pool.query(
      'INSERT INTO categories (name) VALUES (?)',
      [name]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, name }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

module.exports = {
  getAllOffers,
  getApprovedOffers,
  getOfferDetails,
  applyForOffer,
  adminGetAllOffers,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  getCategories,
  createCategory
};
