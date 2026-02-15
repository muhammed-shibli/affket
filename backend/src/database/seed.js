const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
require('dotenv').config();

const seed = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(`
      INSERT INTO users (name, email, mobile, company_name, password, status, role, wallet_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name = name
    `, ['Admin User', 'admin@affket.com', '1234567890', 'Affket', hashedPassword, 'approved', 'admin', 0]);
    console.log('✅ Admin user created (admin@affket.com / admin123)');

    // Create sample categories
    const categories = ['Gaming', 'Finance', 'E-commerce', 'Dating', 'Health', 'Education', 'Travel', 'Utilities'];
    for (const cat of categories) {
      await pool.query(`
        INSERT INTO categories (name, status)
        VALUES (?, 'active')
        ON DUPLICATE KEY UPDATE name = name
      `, [cat]);
    }
    console.log('✅ Categories created');

    // Create sample offers
    const offers = [
      {
        name: 'Mobile Game Install',
        description: 'Install and play for 5 minutes',
        category_id: 1,
        offer_type: 'CPI',
        payout_type: 'fixed',
        payout_amount: 2.50,
        preview_url: 'https://example.com/game',
        status: 'active'
      },
      {
        name: 'Credit Card Signup',
        description: 'Complete credit card application',
        category_id: 2,
        offer_type: 'CPL',
        payout_type: 'fixed',
        payout_amount: 25.00,
        preview_url: 'https://example.com/credit',
        status: 'active'
      },
      {
        name: 'E-commerce Purchase',
        description: 'Make a purchase of minimum $50',
        category_id: 3,
        offer_type: 'CPS',
        payout_type: 'percentage',
        payout_amount: 10.00,
        preview_url: 'https://example.com/shop',
        status: 'active'
      },
      {
        name: 'Dating App Registration',
        description: 'Register and complete profile',
        category_id: 4,
        offer_type: 'CPL',
        payout_type: 'fixed',
        payout_amount: 5.00,
        preview_url: 'https://example.com/dating',
        status: 'active'
      },
      {
        name: 'Health Supplement Trial',
        description: 'Order free trial (pay shipping)',
        category_id: 5,
        offer_type: 'CPA',
        payout_type: 'fixed',
        payout_amount: 35.00,
        preview_url: 'https://example.com/health',
        status: 'active'
      }
    ];

    for (const offer of offers) {
      const [result] = await pool.query(`
        INSERT INTO offers (name, description, category_id, offer_type, payout_type, payout_amount, preview_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = name
      `, [offer.name, offer.description, offer.category_id, offer.offer_type, offer.payout_type, offer.payout_amount, offer.preview_url, offer.status]);

      // Add goals for each offer
      if (result.insertId) {
        await pool.query(`
          INSERT INTO offer_goals (offer_id, event_name, objective, payout_amount, payout_type, daily_cap, remaining_cap)
          VALUES (?, 'Install', 'Complete installation', ?, 'fixed', 1000, 1000)
        `, [result.insertId, offer.payout_amount]);

        await pool.query(`
          INSERT INTO offer_goals (offer_id, event_name, objective, payout_amount, payout_type, daily_cap, remaining_cap)
          VALUES (?, 'Registration', 'Complete registration', ?, 'fixed', 500, 500)
        `, [result.insertId, offer.payout_amount * 0.5]);
      }
    }
    console.log('✅ Sample offers and goals created');

    // Create a sample affiliate user
    const affiliatePassword = await bcrypt.hash('affiliate123', 10);
    await pool.query(`
      INSERT INTO users (name, email, mobile, company_name, password, status, role, wallet_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name = name
    `, ['Test Affiliate', 'affiliate@test.com', '9876543210', 'Test Media', affiliatePassword, 'approved', 'affiliate', 150.00]);
    console.log('✅ Test affiliate user created (affiliate@test.com / affiliate123)');

    console.log('\n✅ Database seeded successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
};

seed();
