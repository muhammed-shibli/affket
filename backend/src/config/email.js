const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

const emailTemplates = {
  accountApproved: (userName) => ({
    subject: `Welcome to ${process.env.BRAND_NAME} - Account Approved!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.BRAND_NAME}</h1>
          </div>
          <div class="content">
            <h2>Congratulations, ${userName}!</h2>
            <p>Your account has been approved. You can now log in to your affiliate dashboard and start exploring offers.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Dashboard</a>
            </p>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${process.env.BRAND_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Congratulations ${userName}! Your ${process.env.BRAND_NAME} account has been approved. You can now login at ${process.env.FRONTEND_URL}/login`
  }),

  accountRejected: (userName, reason) => ({
    subject: `${process.env.BRAND_NAME} - Account Application Update`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.BRAND_NAME}</h1>
          </div>
          <div class="content">
            <h2>Hello, ${userName}</h2>
            <p>We regret to inform you that your account application has not been approved at this time.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you believe this is an error or have questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${process.env.BRAND_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${userName}, We regret to inform you that your ${process.env.BRAND_NAME} account application has not been approved. ${reason ? `Reason: ${reason}` : ''}`
  }),

  withdrawalStatusUpdate: (userName, amount, status) => ({
    subject: `${process.env.BRAND_NAME} - Withdrawal ${status}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status { padding: 10px 20px; border-radius: 4px; display: inline-block; }
          .paid { background: #d4edda; color: #155724; }
          .rejected { background: #f8d7da; color: #721c24; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.BRAND_NAME}</h1>
          </div>
          <div class="content">
            <h2>Hello, ${userName}</h2>
            <p>Your withdrawal request for <strong>$${amount}</strong> has been <span class="status ${status.toLowerCase()}">${status}</span>.</p>
            <p>Check your wallet for more details.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${process.env.BRAND_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${userName}, Your withdrawal request for $${amount} has been ${status}.`
  })
};

module.exports = { sendEmail, emailTemplates, transporter };
