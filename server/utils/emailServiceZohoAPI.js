const axios = require('axios');

/**
 * Email service using Zoho ZeptoMail API (works on Render - HTTPS, no SMTP ports)
 * Free tier: 10,000 emails/month
 * Setup: https://www.zoho.com/zeptomail/
 */
class EmailService {
  constructor() {
    this.isConfigured = false;
    this.apiUrl = 'https://api.zeptomail.com/v1.1/email';
    this.initializeZoho();
  }

  /**
   * Initialize Zoho ZeptoMail API
   */
  initializeZoho() {
    try {
      if (!process.env.ZOHO_MAIL_TOKEN) {
        console.error('⚠️  ZOHO_MAIL_TOKEN not set');
        console.error('Get it at: https://www.zoho.com/zeptomail/');
        console.error('1. Sign up for ZeptoMail (free 10k emails/month)');
        console.error('2. Verify your domain or use Mail Agent');
        console.error('3. Get Send Mail Token from Settings');
        return;
      }

      if (!process.env.EMAIL_FROM) {
        console.error('⚠️  EMAIL_FROM not set');
        return;
      }

      this.isConfigured = true;
      console.log('✅ Zoho ZeptoMail API initialized');
      console.log('Email from:', process.env.EMAIL_FROM);
    } catch (error) {
      console.error('❌ Failed to initialize Zoho API:', error.message);
    }
  }

  /**
   * Send email using Zoho ZeptoMail API
   */
  async sendEmail(to, subject, htmlContent, textContent, replyTo = null) {
    if (!this.isConfigured) {
      console.error('❌ Zoho API not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const payload = {
        from: {
          address: process.env.EMAIL_FROM,
          name: process.env.EMAIL_FROM_NAME || 'Akoot Tech'
        },
        to: [
          {
            email_address: {
              address: to,
              name: to
            }
          }
        ],
        subject: subject,
        htmlbody: htmlContent,
        textbody: textContent
      };

      if (replyTo) {
        payload.reply_to = [
          {
            address: replyTo,
            name: replyTo
          }
        ];
      }

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': process.env.ZOHO_MAIL_TOKEN
        },
        timeout: 30000
      });

      console.log('✅ Email sent successfully via Zoho API');
      return { success: true, messageId: response.data.request_id };
    } catch (error) {
      console.error('❌ Zoho API error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email notification for new contact form submission
   */
  async sendContactNotification(contactData) {
    const { name, email, phone, subject, message, company } = contactData;

    const htmlContent = `
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
    `;

    const textContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company: ${company}` : ''}
Subject: ${subject}

Message:
${message}

Received: ${new Date().toLocaleString()}
    `;

    return await this.sendEmail(
      process.env.EMAIL_FROM,
      `New Contact: ${subject}`,
      htmlContent,
      textContent,
      email // Set reply-to as the contact's email
    );
  }

  /**
   * Send email notification for new subscription
   */
  async sendSubscriptionNotification(subscriptionData) {
    const { email, name, subscriptionType, source } = subscriptionData;

    const htmlContent = `
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
    `;

    const textContent = `
New Email Subscription

Email: ${email}
${name ? `Name: ${name}` : ''}
Subscription Type: ${subscriptionType || 'all'}
Source: ${source || 'website'}
Subscribed At: ${new Date().toLocaleString()}
    `;

    return await this.sendEmail(
      process.env.EMAIL_FROM,
      `New Subscriber: ${email}`,
      htmlContent,
      textContent
    );
  }

  /**
   * Send welcome email to new subscriber
   */
  async sendWelcomeEmail(email, name) {
    const htmlContent = `
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
    `;

    const textContent = `
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
    `;

    return await this.sendEmail(
      email,
      'Welcome to Akoot Tech Newsletter!',
      htmlContent,
      textContent
    );
  }
}

// Export singleton instance
module.exports = new EmailService();
