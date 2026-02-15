const { pool } = require('../config/database');

// Get affiliate dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mtdStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's stats
    const [todayClicks] = await pool.query(
      'SELECT COUNT(*) as count FROM clicks WHERE user_id = ? AND DATE(created_at) = CURDATE()',
      [userId]
    );

    const [todayConversions] = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(payout), 0) as earnings FROM conversions WHERE user_id = ? AND DATE(created_at) = CURDATE()',
      [userId]
    );

    // Yesterday's stats
    const [yesterdayClicks] = await pool.query(
      'SELECT COUNT(*) as count FROM clicks WHERE user_id = ? AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)',
      [userId]
    );

    const [yesterdayConversions] = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(payout), 0) as earnings FROM conversions WHERE user_id = ? AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)',
      [userId]
    );

    // MTD stats
    const [mtdClicks] = await pool.query(
      'SELECT COUNT(*) as count FROM clicks WHERE user_id = ? AND created_at >= ?',
      [userId, mtdStart]
    );

    const [mtdConversions] = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(payout), 0) as earnings FROM conversions WHERE user_id = ? AND created_at >= ?',
      [userId, mtdStart]
    );

    // Chart data - daily for current month
    const [chartData] = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as clicks,
        0 as conversions,
        0 as earnings
      FROM clicks
      WHERE user_id = ? AND created_at >= ?
      GROUP BY DATE(created_at)
      UNION ALL
      SELECT
        DATE(created_at) as date,
        0 as clicks,
        COUNT(*) as conversions,
        COALESCE(SUM(payout), 0) as earnings
      FROM conversions
      WHERE user_id = ? AND created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [userId, mtdStart, userId, mtdStart]);

    // Process chart data
    const chartMap = {};
    chartData.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      if (!chartMap[dateStr]) {
        chartMap[dateStr] = { date: dateStr, clicks: 0, conversions: 0, earnings: 0 };
      }
      chartMap[dateStr].clicks += row.clicks;
      chartMap[dateStr].conversions += row.conversions;
      chartMap[dateStr].earnings += parseFloat(row.earnings);
    });

    const chartArray = Object.values(chartMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        today: {
          clicks: todayClicks[0].count,
          conversions: todayConversions[0].count,
          earnings: parseFloat(todayConversions[0].earnings)
        },
        yesterday: {
          clicks: yesterdayClicks[0].count,
          conversions: yesterdayConversions[0].count,
          earnings: parseFloat(yesterdayConversions[0].earnings)
        },
        mtd: {
          clicks: mtdClicks[0].count,
          conversions: mtdConversions[0].count,
          earnings: parseFloat(mtdConversions[0].earnings)
        },
        chart: chartArray
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};

// Get clicks report
const getClicksReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      start_date,
      end_date,
      offer_id,
      page = 1,
      limit = 50,
      columns
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, o.name as offer_name
      FROM clicks c
      LEFT JOIN offers o ON c.offer_id = o.id
      WHERE c.user_id = ?
    `;
    const params = [userId];

    if (start_date) {
      query += ' AND DATE(c.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(c.created_at) <= ?';
      params.push(end_date);
    }

    if (offer_id) {
      query += ' AND c.offer_id = ?';
      params.push(offer_id);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [clicks] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM clicks WHERE user_id = ?';
    const countParams = [userId];

    if (start_date) {
      countQuery += ' AND DATE(created_at) >= ?';
      countParams.push(start_date);
    }

    if (end_date) {
      countQuery += ' AND DATE(created_at) <= ?';
      countParams.push(end_date);
    }

    if (offer_id) {
      countQuery += ' AND offer_id = ?';
      countParams.push(offer_id);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        clicks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Clicks report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clicks report'
    });
  }
};

// Get conversions report
const getConversionsReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      start_date,
      end_date,
      offer_id,
      page = 1,
      limit = 50
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT cv.*, o.name as offer_name, c.ip, c.p1, c.p2, c.p3, c.p4, c.p5, c.p6,
             c.city, c.country, c.state, c.os, c.browser
      FROM conversions cv
      LEFT JOIN offers o ON cv.offer_id = o.id
      LEFT JOIN clicks c ON cv.click_id = c.click_id
      WHERE cv.user_id = ?
    `;
    const params = [userId];

    if (start_date) {
      query += ' AND DATE(cv.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(cv.created_at) <= ?';
      params.push(end_date);
    }

    if (offer_id) {
      query += ' AND cv.offer_id = ?';
      params.push(offer_id);
    }

    query += ' ORDER BY cv.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [conversions] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM conversions WHERE user_id = ?';
    const countParams = [userId];

    if (start_date) {
      countQuery += ' AND DATE(created_at) >= ?';
      countParams.push(start_date);
    }

    if (end_date) {
      countQuery += ' AND DATE(created_at) <= ?';
      countParams.push(end_date);
    }

    if (offer_id) {
      countQuery += ' AND offer_id = ?';
      countParams.push(offer_id);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        conversions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Conversions report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversions report'
    });
  }
};

// Admin dashboard stats
const getAdminDashboardStats = async (req, res) => {
  try {
    // Total users
    const [totalUsers] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['affiliate']
    );

    const [pendingUsers] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = ? AND status = ?',
      ['affiliate', 'pending']
    );

    const [approvedUsers] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = ? AND status = ?',
      ['affiliate', 'approved']
    );

    // Total offers
    const [totalOffers] = await pool.query('SELECT COUNT(*) as count FROM offers');
    const [activeOffers] = await pool.query(
      'SELECT COUNT(*) as count FROM offers WHERE status = ?',
      ['active']
    );

    // Today's stats
    const [todayClicks] = await pool.query(
      'SELECT COUNT(*) as count FROM clicks WHERE DATE(created_at) = CURDATE()'
    );

    const [todayConversions] = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(payout), 0) as earnings FROM conversions WHERE DATE(created_at) = CURDATE()'
    );

    // MTD stats
    const mtdStart = new Date();
    mtdStart.setDate(1);
    mtdStart.setHours(0, 0, 0, 0);

    const [mtdClicks] = await pool.query(
      'SELECT COUNT(*) as count FROM clicks WHERE created_at >= ?',
      [mtdStart]
    );

    const [mtdConversions] = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(payout), 0) as earnings FROM conversions WHERE created_at >= ?',
      [mtdStart]
    );

    // Pending withdrawals
    const [pendingWithdrawals] = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = ? AND status = ?',
      ['withdrawal', 'pending']
    );

    // Pending offer applications
    const [pendingApplications] = await pool.query(
      'SELECT COUNT(*) as count FROM user_offers WHERE status = ?',
      ['pending']
    );

    // Top affiliates
    const [topAffiliates] = await pool.query(`
      SELECT u.id, u.name, u.email, u.company_name,
             COUNT(DISTINCT c.id) as clicks,
             COUNT(DISTINCT cv.id) as conversions,
             COALESCE(SUM(cv.payout), 0) as earnings
      FROM users u
      LEFT JOIN clicks c ON u.id = c.user_id AND DATE(c.created_at) = CURDATE()
      LEFT JOIN conversions cv ON u.id = cv.user_id AND DATE(cv.created_at) = CURDATE()
      WHERE u.role = 'affiliate' AND u.status = 'approved'
      GROUP BY u.id
      ORDER BY earnings DESC
      LIMIT 10
    `);

    // Top offers
    const [topOffers] = await pool.query(`
      SELECT o.id, o.name, o.payout_amount,
             COUNT(DISTINCT c.id) as clicks,
             COUNT(DISTINCT cv.id) as conversions,
             COALESCE(SUM(cv.payout), 0) as earnings
      FROM offers o
      LEFT JOIN clicks c ON o.id = c.offer_id AND DATE(c.created_at) = CURDATE()
      LEFT JOIN conversions cv ON o.id = cv.offer_id AND DATE(cv.created_at) = CURDATE()
      WHERE o.status = 'active'
      GROUP BY o.id
      ORDER BY conversions DESC
      LIMIT 10
    `);

    // Chart data
    const [chartData] = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as clicks,
        0 as conversions,
        0 as earnings
      FROM clicks
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      UNION ALL
      SELECT
        DATE(created_at) as date,
        0 as clicks,
        COUNT(*) as conversions,
        COALESCE(SUM(payout), 0) as earnings
      FROM conversions
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Process chart data
    const chartMap = {};
    chartData.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      if (!chartMap[dateStr]) {
        chartMap[dateStr] = { date: dateStr, clicks: 0, conversions: 0, earnings: 0 };
      }
      chartMap[dateStr].clicks += row.clicks;
      chartMap[dateStr].conversions += row.conversions;
      chartMap[dateStr].earnings += parseFloat(row.earnings);
    });

    const chartArray = Object.values(chartMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers[0].count,
          pending: pendingUsers[0].count,
          approved: approvedUsers[0].count
        },
        offers: {
          total: totalOffers[0].count,
          active: activeOffers[0].count
        },
        today: {
          clicks: todayClicks[0].count,
          conversions: todayConversions[0].count,
          earnings: parseFloat(todayConversions[0].earnings)
        },
        mtd: {
          clicks: mtdClicks[0].count,
          conversions: mtdConversions[0].count,
          earnings: parseFloat(mtdConversions[0].earnings)
        },
        pendingWithdrawals: {
          count: pendingWithdrawals[0].count,
          total: parseFloat(pendingWithdrawals[0].total)
        },
        pendingApplications: pendingApplications[0].count,
        topAffiliates,
        topOffers,
        chart: chartArray
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};

module.exports = {
  getDashboardStats,
  getClicksReport,
  getConversionsReport,
  getAdminDashboardStats
};
