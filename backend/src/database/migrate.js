const mysql = require('mysql2/promise');
require('dotenv').config();

const migrate = async () => {
  let connection;

  try {
    // First connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    console.log('📦 Creating tables...');

    // Users table (Affiliates)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
        role ENUM('affiliate', 'admin') DEFAULT 'affiliate',
        wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
        bank_account_number VARCHAR(50),
        bank_name VARCHAR(100),
        ifsc_code VARCHAR(20),
        upi_id VARCHAR(100),
        features JSON DEFAULT NULL,
        show_custom_campaign BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Categories table created');

    // Offers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        logo VARCHAR(500),
        category_id INT,
        offer_type ENUM('CPA', 'CPI', 'CPS', 'CPL', 'CPC') DEFAULT 'CPA',
        payout_type ENUM('fixed', 'percentage', 'dynamic') DEFAULT 'fixed',
        payout_amount DECIMAL(10, 2) DEFAULT 0.00,
        preview_url VARCHAR(500),
        tracking_url VARCHAR(500),
        status ENUM('active', 'inactive', 'paused') DEFAULT 'active',
        daily_cap INT DEFAULT 0,
        total_cap INT DEFAULT 0,
        countries JSON,
        devices JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Offers table created');

    // Offer Goals/Events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS offer_goals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        offer_id INT NOT NULL,
        event_name VARCHAR(100) NOT NULL,
        objective VARCHAR(255),
        payout_amount DECIMAL(10, 2) DEFAULT 0.00,
        payout_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
        daily_cap INT DEFAULT 0,
        total_cap INT DEFAULT 0,
        remaining_cap INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Offer Goals table created');

    // User Offer Applications
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_offers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        offer_id INT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        tracking_link VARCHAR(500),
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_offer (user_id, offer_id)
      )
    `);
    console.log('✅ User Offers table created');

    // Clicks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clicks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        click_id VARCHAR(100) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        offer_id INT NOT NULL,
        ip VARCHAR(50),
        user_agent TEXT,
        os VARCHAR(50),
        browser VARCHAR(50),
        device VARCHAR(50),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        p1 VARCHAR(255),
        p2 VARCHAR(255),
        p3 VARCHAR(255),
        p4 VARCHAR(255),
        p5 VARCHAR(255),
        p6 VARCHAR(255),
        referer VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
        INDEX idx_click_date (created_at),
        INDEX idx_user_clicks (user_id, created_at)
      )
    `);
    console.log('✅ Clicks table created');

    // Conversions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS conversions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        click_id VARCHAR(100) NOT NULL,
        user_id INT NOT NULL,
        offer_id INT NOT NULL,
        goal_id INT,
        event_name VARCHAR(100),
        payout DECIMAL(10, 2) DEFAULT 0.00,
        ip VARCHAR(50),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
        FOREIGN KEY (goal_id) REFERENCES offer_goals(id) ON DELETE SET NULL,
        INDEX idx_conversion_date (created_at),
        INDEX idx_user_conversions (user_id, created_at)
      )
    `);
    console.log('✅ Conversions table created');

    // Postbacks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS postbacks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        offer_id INT NOT NULL,
        goal_id INT,
        postback_url VARCHAR(1000) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
        FOREIGN KEY (goal_id) REFERENCES offer_goals(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Postbacks table created');

    // Transactions/Wallet table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type ENUM('credit', 'debit', 'withdrawal') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        balance_after DECIMAL(10, 2) NOT NULL,
        description VARCHAR(255),
        status ENUM('pending', 'paid', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Transactions table created');

    // Gateway Config table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gateway_config (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('payment', 'sms') NOT NULL,
        name VARCHAR(100) NOT NULL,
        method ENUM('GET', 'POST') DEFAULT 'POST',
        api_url VARCHAR(500) NOT NULL,
        parameters JSON,
        headers JSON,
        response_example TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Gateway Config table created');

    // Postback Logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS postback_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        postback_id INT NOT NULL,
        conversion_id INT,
        request_url VARCHAR(1000),
        response_code INT,
        response_body TEXT,
        status ENUM('success', 'failed') DEFAULT 'success',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (postback_id) REFERENCES postbacks(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Postback Logs table created');

    console.log('\n✅ All tables created successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

migrate()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
  });
