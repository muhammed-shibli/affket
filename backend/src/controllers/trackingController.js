const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const useragent = require('useragent');
const geoip = require('geoip-lite');
const axios = require('axios');

// Handle click tracking
const trackClick = async (req, res) => {
  try {
    const { offer_id, user_id } = req.params;
    const { click_id, p1, p2, p3, p4, p5, p6 } = req.query;

    // Validate offer and user
    const [userOffer] = await pool.query(`
      SELECT uo.*, o.preview_url, o.tracking_url
      FROM user_offers uo
      JOIN offers o ON uo.offer_id = o.id
      WHERE uo.user_id = ? AND uo.offer_id = ? AND uo.status = 'approved'
    `, [user_id, offer_id]);

    if (userOffer.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found or not approved'
      });
    }

    // Generate click ID if not provided
    const generatedClickId = click_id || uuidv4();

    // Parse user agent
    const agent = useragent.parse(req.headers['user-agent']);
    const os = agent.os.toString();
    const browser = agent.toAgent();
    const device = agent.device.toString();

    // Get IP and geo data
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const cleanIp = ip.split(',')[0].trim();
    const geo = geoip.lookup(cleanIp) || {};

    // Save click
    await pool.query(`
      INSERT INTO clicks (click_id, user_id, offer_id, ip, user_agent, os, browser, device,
                         country, state, city, p1, p2, p3, p4, p5, p6, referer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [generatedClickId, user_id, offer_id, cleanIp, req.headers['user-agent'],
        os, browser, device, geo.country || '', geo.region || '', geo.city || '',
        p1 || '', p2 || '', p3 || '', p4 || '', p5 || '', p6 || '',
        req.headers['referer'] || '']);

    // Redirect to offer URL
    let redirectUrl = userOffer[0].tracking_url || userOffer[0].preview_url;

    // Replace macros in URL
    if (redirectUrl) {
      redirectUrl = redirectUrl
        .replace('{click_id}', generatedClickId)
        .replace('{aff_id}', user_id)
        .replace('{offer_id}', offer_id)
        .replace('{p1}', p1 || '')
        .replace('{p2}', p2 || '')
        .replace('{p3}', p3 || '')
        .replace('{p4}', p4 || '')
        .replace('{p5}', p5 || '')
        .replace('{p6}', p6 || '');
    }

    res.redirect(redirectUrl || 'https://example.com');
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Tracking error'
    });
  }
};

// Handle conversion postback
const trackConversion = async (req, res) => {
  try {
    const { click_id, event, payout, goal_id } = req.query;

    if (!click_id) {
      return res.status(400).json({
        success: false,
        message: 'Click ID required'
      });
    }

    // Find click
    const [clicks] = await pool.query(
      'SELECT * FROM clicks WHERE click_id = ?',
      [click_id]
    );

    if (clicks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Click not found'
      });
    }

    const click = clicks[0];

    // Get goal if specified
    let eventName = event || 'Conversion';
    let payoutAmount = parseFloat(payout) || 0;

    if (goal_id) {
      const [goals] = await pool.query(
        'SELECT * FROM offer_goals WHERE id = ? AND offer_id = ?',
        [goal_id, click.offer_id]
      );

      if (goals.length > 0) {
        eventName = goals[0].event_name;
        payoutAmount = payoutAmount || goals[0].payout_amount;

        // Update remaining cap
        await pool.query(
          'UPDATE offer_goals SET remaining_cap = remaining_cap - 1 WHERE id = ? AND remaining_cap > 0',
          [goal_id]
        );
      }
    }

    // Create conversion
    const [result] = await pool.query(`
      INSERT INTO conversions (click_id, user_id, offer_id, goal_id, event_name, payout, ip, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
    `, [click_id, click.user_id, click.offer_id, goal_id || null, eventName, payoutAmount, click.ip]);

    // Update user wallet
    await pool.query(
      'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
      [payoutAmount, click.user_id]
    );

    // Create transaction record
    const [userBalance] = await pool.query(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [click.user_id]
    );

    await pool.query(`
      INSERT INTO transactions (user_id, type, amount, balance_after, description, status)
      VALUES (?, 'credit', ?, ?, ?, 'paid')
    `, [click.user_id, payoutAmount, userBalance[0].wallet_balance,
        `Conversion - ${eventName} for Offer #${click.offer_id}`]);

    // Fire affiliate postback
    await fireAffiliatePostback(click.user_id, click.offer_id, goal_id, click, result.insertId, payoutAmount);

    res.json({
      success: true,
      message: 'Conversion tracked'
    });
  } catch (error) {
    console.error('Track conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Conversion tracking error'
    });
  }
};

// Fire affiliate postback
const fireAffiliatePostback = async (userId, offerId, goalId, click, conversionId, payout) => {
  try {
    let query = 'SELECT * FROM postbacks WHERE user_id = ? AND offer_id = ? AND status = ?';
    const params = [userId, offerId, 'active'];

    if (goalId) {
      query += ' AND (goal_id = ? OR goal_id IS NULL)';
      params.push(goalId);
    }

    const [postbacks] = await pool.query(query, params);

    for (const postback of postbacks) {
      let url = postback.postback_url;

      // Replace tokens
      url = url
        .replace('{click_id}', click.click_id)
        .replace('{camp_id}', offerId)
        .replace('{click_ip}', click.ip)
        .replace('{payout}', payout)
        .replace('{p1}', click.p1 || '')
        .replace('{p2}', click.p2 || '')
        .replace('{p3}', click.p3 || '')
        .replace('{p4}', click.p4 || '')
        .replace('{p5}', click.p5 || '')
        .replace('{p6}', click.p6 || '');

      try {
        const response = await axios.get(url, { timeout: 10000 });

        await pool.query(`
          INSERT INTO postback_logs (postback_id, conversion_id, request_url, response_code, response_body, status)
          VALUES (?, ?, ?, ?, ?, 'success')
        `, [postback.id, conversionId, url, response.status, JSON.stringify(response.data).substring(0, 1000)]);
      } catch (err) {
        await pool.query(`
          INSERT INTO postback_logs (postback_id, conversion_id, request_url, response_code, response_body, status)
          VALUES (?, ?, ?, ?, ?, 'failed')
        `, [postback.id, conversionId, url, err.response?.status || 0, err.message]);
      }
    }
  } catch (error) {
    console.error('Fire postback error:', error);
  }
};

module.exports = {
  trackClick,
  trackConversion
};
