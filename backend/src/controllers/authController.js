const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

const signup = async (req, res) => {
  try {
    const { name, email, mobile, company_name, password } = req.body;

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, mobile, company_name, password, status, role)
       VALUES (?, ?, ?, ?, ?, 'pending', 'affiliate')`,
      [name, email, mobile, company_name, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is under review. You will receive an email once approved.',
      data: {
        id: result.insertId,
        name,
        email,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check account status
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is under review. Please wait for admin approval.'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been rejected. Please contact support.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Return user data without password
    const { password: _, ...userData } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        ...tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const [users] = await pool.query(
      'SELECT id, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0 || users[0].status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const tokens = generateTokens(decoded.userId);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, mobile, company_name, status, role, wallet_balance,
              bank_account_number, bank_name, ifsc_code, upi_id, features, show_custom_campaign, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, mobile, company_name } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, mobile = ?, company_name = ? WHERE id = ?',
      [name, mobile, company_name, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

const updateBankDetails = async (req, res) => {
  try {
    const { bank_account_number, bank_name, ifsc_code, upi_id } = req.body;

    await pool.query(
      `UPDATE users SET
        bank_account_number = ?,
        bank_name = ?,
        ifsc_code = ?,
        upi_id = ?
       WHERE id = ?`,
      [bank_account_number, bank_name, ifsc_code, upi_id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Bank details updated successfully'
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bank details'
    });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  updateBankDetails
};
