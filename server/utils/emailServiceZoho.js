const nodemailer = require('nodemailer');

/**
 * Email service using Zoho SMTP with optimized settings for hosting platforms
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter with Zoho SMTP settings
   */
  initializeTransporter() {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('⚠️  Zoho email config missing!');
        console.error('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
        console.error('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set (hidden)' : 'Not set');
        return;
      }

      // Try port 465 with SSL first (most reliable on hosting platforms)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // SSL
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        pool: true, // Use pooled connections
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 60000, // 60 seconds
        debug: process.env.NODE_ENV === 'development', // Enable debug in dev
        logger: process.env.NODE_ENV === 'development' // Enable logger in dev
      });

      this.isConfigured = true;
      console.log('✅ Zoho email service initialized');
      console.log('Config: smtp.zoho.com:465 (SSL) -', process.env.EMAIL_USER);
      
      // Verify connection
      this.verifyConnection();
    } catch (error) {
      console.error('❌ Failed to initialize Zoho SMTP:', error.message);
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConnection() {
    if (!this.transporter) {
      console.error('❌ Transporter not initialized');
      return false;
    }
    
    try {
      await this.transporter.verify();
      console.log('✅ Zoho SMTP connection verified - ready to send!');
      return true;
    } catch (error) {
      console.error('❌ Zoho SMTP verification failed:', error.message);
      console.error('This usually means:');
      console.error('1. Wrong password (use app-specific password from Zoho)');
      console.error('2. 2FA not enabled on Zoho account');
      console.error('3. SMTP ports blocked by hosting provider');
      return false;
    }
  }

  /**
   * Send email notification for new contact form submission
   */
  async sendContactNotification(contactData) {
    if (!this.isConfigured || !this.transporter) {
      console.error('❌ Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { name, email, phone, subject, message, company } = contactData;

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Akoot Tech'} <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `New Contact: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50;">
              <h3 style="margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Received: ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company: ${company}` : ''}
Subject: ${subject}

Message:
${message}

Received: ${new Date().toLocaleString()}
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Contact notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending contact notification:', error.message);
      if (error.response) {
        console.error('SMTP Response:', error.response);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email notification for new subscription
   */
  async sendSubscriptionNotification(subscriptionData) {
    if (!this.isConfigured || !this.transporter) {
      console.error('❌ Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { email, name, subscriptionType, source } = subscriptionData;

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Akoot Tech'} <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New Subscriber: ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
              New Email Subscription
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Email:</strong> ${email}</p>
              ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
              <p><strong>Type:</strong> ${subscriptionType || 'all'}</p>
              <p><strong>Source:</strong> ${source || 'website'}</p>
              <p><strong>Subscribed:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
        text: `
New Email Subscription

Email: ${email}
${name ? `Name: ${name}` : ''}
Subscription Type: ${subscriptionType || 'all'}
Source: ${source || 'website'}
Subscribed At: ${new Date().toLocaleString()}
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Subscription notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending subscription notification:', error.message);
      if (error.response) {
        console.error('SMTP Response:', error.response);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new subscriber
   */
  async sendWelcomeEmail(email, name) {
    if (!this.isConfigured || !this.transporter) {
      console.error('❌ Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Akoot Tech'} <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Akoot Tech Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
              Welcome to Akoot Tech!
            </h2>
            
            <p style="font-size: 16px;">
              ${name ? `Hi ${name},` : 'Hello,'}
            </p>
            
            <p style="font-size: 16px;">
              Thank you for subscribing to our newsletter! We're excited to have you join our community.
            </p>
            
            <p style="font-size: 16px;">You'll receive updates about:</p>
            
            <ul style="font-size: 16px; line-height: 1.8;">
              <li>Latest technology trends and insights</li>
              <li>Startup tips and best practices</li>
              <li>Development tutorials and guides</li>
              <li>Company news and updates</li>
            </ul>
            
            <p style="margin-top: 30px; color: #666;">
              Best regards,<br>
              Akoot Tech Team
            </p>
          </div>
        `,
        text: `
Welcome to Akoot Tech!

${name ? `Hi ${name},` : 'Hello,'}

Thank you for subscribing to our newsletter! We're excited to have you join our community.

You'll receive updates about:
- Latest technology trends and insights
- Startup tips and best practices
- Development tutorials and guides
- Company news and updates

Best regards,
Akoot Tech Team
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      if (error.response) {
        console.error('SMTP Response:', error.response);
      }
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
