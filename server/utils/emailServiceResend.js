const { Resend } = require('resend');

/**
 * Email service using Resend API (works on Render - HTTPS)
 * Free tier: 100 emails/day, 3000/month
 * Setup: https://resend.com/
 */
class EmailService {
  constructor() {
    this.resend = null;
    this.isConfigured = false;
    this.initializeResend();
  }

  /**
   * Initialize Resend API
   */
  initializeResend() {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('⚠️  RESEND_API_KEY not set');
        console.error('Get it at: https://resend.com/api-keys');
        return;
      }

      if (!process.env.EMAIL_FROM) {
        console.error('⚠️  EMAIL_FROM not set');
        return;
      }

      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.isConfigured = true;

      console.log('✅ Resend email service initialized');
      console.log('Email from:', process.env.EMAIL_FROM);
    } catch (error) {
      console.error('❌ Failed to initialize Resend:', error.message);
    }
  }

  /**
   * Send email notification for new contact form submission
   */
  async sendContactNotification(contactData) {
    if (!this.isConfigured) {
      console.error('❌ Resend not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { name, email, phone, subject, message, company } = contactData;

      const { data, error } = await this.resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME || 'Akoot Tech'} <${process.env.EMAIL_FROM}>`,
        to: [process.env.EMAIL_FROM],
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
        `
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Contact notification sent:', data.id);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Error sending contact notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email notification for new subscription
   */
  async sendSubscriptionNotification(subscriptionData) {
    if (!this.isConfigured) {
      console.error('❌ Resend not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { email, name, subscriptionType, source } = subscriptionData;

      const { data, error } = await this.resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME || 'Akoot Tech'} <${process.env.EMAIL_FROM}>`,
        to: [process.env.EMAIL_FROM],
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
        `
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Subscription notification sent:', data.id);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Error sending subscription notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new subscriber
   */
  async sendWelcomeEmail(email, name) {
    if (!this.isConfigured) {
      console.error('❌ Resend not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME || 'Akoot Tech'} <${process.env.EMAIL_FROM}>`,
        to: [email],
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
        `
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Welcome email sent:', data.id);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
