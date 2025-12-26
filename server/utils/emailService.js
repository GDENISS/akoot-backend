const sgMail = require('@sendgrid/mail');

/**
 * Email service for sending notifications using SendGrid
 */
class EmailService {
  constructor() {
    this.isConfigured = false;
    this.initializeSendGrid();
  }

  /**
   * Initialize nodemailer transporter with Zoho SMTP settings
   */
  initializeTransporter() {
    try {
      // Check if required email config is present
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('⚠️  Email configuration missing! EMAIL_USER or EMAIL_PASSWORD not set.');
        console.error('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
        console.error('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set (hidden)' : 'Not set');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.zoho.com',
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: true, // Use SSL for port 465
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000
      });

      console.log('✅ Email service initialized successfully');
      console.log('Email config:', {
        host: process.env.EMAIL_HOST || 'smtp.zoho.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER
      });

      // Verify connection on startup
      this.verifyConnection().then(result => {
        if (!result) {
          console.error('❌ Email service verification failed - emails will not be sent!');
        }
      });
    } catch (error) {
      console.error('Failed to initialize email service:', error.message);
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConnection() {
    if (!this.transporter) {
      console.error('❌ Cannot verify connection: Email transporter not initialized');
      return false;
    }
    
    try {
      await this.transporter.verify();
      console.log('✅ Email server connection verified - ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error.message);
      console.error('Full error:', error);
      return false;
    }
  }

  /**
   * Send email notification for new contact form submission
   */
  async sendContactNotification(contactData) {
    if (!this.transporter) {
      console.error('❌ Cannot send contact notification: Email transporter not initialized');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { name, email, phone, subject, message, company } = contactData;

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: process.env.EMAIL_USER, // Send to info@akoot.tech
        replyTo: email, // Allow direct reply to the person who contacted
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
              ${company ? `<p style="margin: 10px 0;"><strong>Company:</strong> ${company}</p>` : ''}
              <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>You can reply directly to this email to respond to ${name}.</p>
              <p>Received: ${new Date().toLocaleString()}</p>
            </div>
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
      console.log('✅ Contact notification sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending contact notification:', error.message);
      console.error('Full error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email notification for new subscription
   */
  async sendSubscriptionNotification(subscriptionData) {
    if (!this.transporter) {
      console.error('❌ Cannot send subscription notification: Email transporter not initialized');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { email, name, subscriptionType, source } = subscriptionData;

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: process.env.EMAIL_USER, // Send to info@akoot.tech
        subject: `New Email Subscription: ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
              New Email Subscription
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${name ? `<p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>` : ''}
              <p style="margin: 10px 0;"><strong>Subscription Type:</strong> ${subscriptionType || 'all'}</p>
              <p style="margin: 10px 0;"><strong>Source:</strong> ${source || 'website'}</p>
              <p style="margin: 10px 0;"><strong>Subscribed At:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>A new subscriber has joined your mailing list!</p>
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

A new subscriber has joined your mailing list!
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Subscription notification sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending subscription notification:', error.message);
      console.error('Full error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new subscriber
   */
  async sendWelcomeEmail(email, name) {
    if (!this.transporter) {
      console.error('❌ Cannot send welcome email: Email transporter not initialized');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Welcome to Akoot Tech Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
              Welcome to Akoot Tech!
            </h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              ${name ? `Hi ${name},` : 'Hello,'}
            </p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for subscribing to our newsletter! We're excited to have you join our community.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              You'll receive updates about:
            </p>
            
            <ul style="font-size: 16px; line-height: 1.8;">
              <li>Latest technology trends and insights</li>
              <li>Startup tips and best practices</li>
              <li>Development tutorials and guides</li>
              <li>Company news and updates</li>
            </ul>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>If you have any questions, feel free to reply to this email.</p>
              <p>You can unsubscribe at any time by clicking the unsubscribe link in our emails.</p>
            </div>
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

If you have any questions, feel free to reply to this email.
You can unsubscribe at any time by clicking the unsubscribe link in our emails.
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      console.error('Full error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
