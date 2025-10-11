import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initializeEmailService() {
    if (this.initialized) return;
    
    try {
      // Debug: Check if environment variables are available
      logger.info(`📧 Checking email config - User: ${process.env.GMAIL_USER ? 'SET' : 'NOT SET'}, Password: ${process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT SET'}`);
      
      // Gmail SMTP Configuration
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // Use Gmail service
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.GMAIL_USER, // Your Gmail address
          pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
        }
      });

      // Verify connection (optional - skip if no credentials provided)
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        logger.info(`📧 Attempting to verify SMTP connection for ${process.env.GMAIL_USER}...`);
        await this.transporter.verify();
        logger.info('📧 Gmail SMTP email service initialized successfully');
        this.initialized = true;
      } else {
        logger.warn('📧 Gmail credentials not provided, email service will be disabled');
      }
    } catch (error) {
      logger.error('❌ Email service initialization failed:', error.message);
      logger.error('❌ Full error details:', error);
      logger.warn('💡 To enable emails: Set GMAIL_USER and GMAIL_APP_PASSWORD in .env file');
      // In development, continue without email service
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async sendPasswordResetEmail(email, resetToken, username) {
    await this.initializeEmailService(); // Ensure service is initialized
    
    const resetUrl = `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/reset-password?token=${resetToken}`;
    
    const emailTemplate = {
      subject: 'Lanka Bus Trace - Password Reset Request',
      html: this.getPasswordResetTemplate(username, resetUrl, resetToken),
      text: this.getPasswordResetTextTemplate(username, resetUrl, resetToken)
    };

    return this.sendEmail(email, emailTemplate);
  }

  async sendEmail(to, { subject, html, text }) {
    await this.initializeEmailService(); // Ensure service is initialized
    
    try {
      if (!this.isEmailServiceAvailable()) {
        logger.warn('📧 Email service not available, skipping email send');
        return { success: false, message: 'Email service not configured' };
      }

      const emailData = {
        from: process.env.GMAIL_USER || 'noreply@lanka-bus-trace.com',
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(emailData);
      
      logger.info(`📧 Email sent successfully to ${to}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      logger.error(`❌ Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  isEmailServiceAvailable() {
    return this.initialized && !!this.transporter && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
  }

  getPasswordResetTemplate(username, resetUrl, resetToken) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Lanka Bus Trace</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background-color: #f4f4f4; 
                margin: 0; 
                padding: 20px; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                border-radius: 10px; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                overflow: hidden;
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { 
                padding: 30px; 
            }
            .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                text-decoration: none; 
                padding: 12px 30px; 
                border-radius: 5px; 
                margin: 20px 0; 
                font-weight: bold;
            }
            .footer { 
                background-color: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚌 Lanka Bus Trace</h1>
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <p>Hello <strong>${username}</strong>,</p>
                
                <p>We received a request to reset your password for your Lanka Bus Trace account. If you didn't request this, please ignore this email.</p>
                
                <p>To reset your password, click the button below:</p>
                
                <a href="${resetUrl}" class="button">Reset Password</a>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong>
                    <ul>
                        <li>This link will expire in <strong>15 minutes</strong></li>
                        <li>Only use this link if you requested the password reset</li>
                        <li>Never share this link with anyone</li>
                    </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
                    ${resetUrl}
                </p>
                
                <p>Or use this reset code directly in the app:</p>
                <p style="font-family: monospace; font-size: 18px; background-color: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; letter-spacing: 2px;">
                    <strong>${resetToken}</strong>
                </p>
                
                <p>If you continue to have problems, please contact our support team.</p>
                
                <p>Best regards,<br>The Lanka Bus Trace Team</p>
            </div>
            <div class="footer">
                <p>© 2025 Lanka Bus Trace. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getPasswordResetTextTemplate(username, resetUrl, resetToken) {
    return `
Lanka Bus Trace - Password Reset Request

Hello ${username},

We received a request to reset your password for your Lanka Bus Trace account.

To reset your password, visit this link:
${resetUrl}

Or use this reset code: ${resetToken}

This link will expire in 15 minutes.

If you didn't request this password reset, please ignore this email.

Best regards,
The Lanka Bus Trace Team

© 2025 Lanka Bus Trace. All rights reserved.
    `;
  }
}

// Export singleton instance
export default new EmailService();