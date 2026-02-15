const { pool } = require('../config/database');

// Get all gateways
const getAllGateways = async (req, res) => {
  try {
    const { type } = req.query;

    let query = 'SELECT * FROM gateway_config WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const [gateways] = await pool.query(query, params);

    res.json({
      success: true,
      data: gateways
    });
  } catch (error) {
    console.error('Get gateways error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gateways'
    });
  }
};

// Get gateway by ID
const getGateway = async (req, res) => {
  try {
    const { id } = req.params;

    const [gateways] = await pool.query(
      'SELECT * FROM gateway_config WHERE id = ?',
      [id]
    );

    if (gateways.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gateway not found'
      });
    }

    res.json({
      success: true,
      data: gateways[0]
    });
  } catch (error) {
    console.error('Get gateway error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gateway'
    });
  }
};

// Create gateway
const createGateway = async (req, res) => {
  try {
    const { type, name, method, api_url, parameters, headers, response_example } = req.body;

    const [result] = await pool.query(`
      INSERT INTO gateway_config (type, name, method, api_url, parameters, headers, response_example, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `, [type, name, method, api_url, JSON.stringify(parameters || {}),
        JSON.stringify(headers || {}), response_example]);

    res.status(201).json({
      success: true,
      message: 'Gateway created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create gateway error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gateway'
    });
  }
};

// Update gateway
const updateGateway = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, method, api_url, parameters, headers, response_example, status } = req.body;

    await pool.query(`
      UPDATE gateway_config SET
        name = ?, method = ?, api_url = ?, parameters = ?, headers = ?,
        response_example = ?, status = ?
      WHERE id = ?
    `, [name, method, api_url, JSON.stringify(parameters || {}),
        JSON.stringify(headers || {}), response_example, status || 'active', id]);

    res.json({
      success: true,
      message: 'Gateway updated successfully'
    });
  } catch (error) {
    console.error('Update gateway error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gateway'
    });
  }
};

// Delete gateway
const deleteGateway = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM gateway_config WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Gateway deleted successfully'
    });
  } catch (error) {
    console.error('Delete gateway error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gateway'
    });
  }
};

// Toggle gateway status
const toggleGatewayStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      'UPDATE gateway_config SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Gateway status updated'
    });
  } catch (error) {
    console.error('Toggle gateway status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gateway status'
    });
  }
};

module.exports = {
  getAllGateways,
  getGateway,
  createGateway,
  updateGateway,
  deleteGateway,
  toggleGatewayStatus
};
