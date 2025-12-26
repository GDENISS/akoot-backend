const sgMail = require('@sendgrid/mail');

/**
 * Email service using SendGrid API (works on Render - no SMTP ports blocked)
 */
class EmailService {
  constructor() {
    this.isConfigured = false;
    this.initializeSendGrid();
  }

  /**
   * Initialize SendGrid with API key
   */
  initializeSendGrid() {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('⚠️  SendGrid API key not set. Get it at: https://signup.sendgrid.com/');
        return;
      }

      if (!process.env.EMAIL_FROM) {
        console.error('⚠️  EMAIL_FROM not set.');
        return;
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.isConfigured = true;

      console.log('✅ SendGrid email service initialized');
      console.log('Email from:', process.env.EMAIL_FROM);
    } catch (error) {
      console.error('Failed to initialize SendGrid:', error.message);
    }
  }

  /**
   * Send email notification for new contact form submission
   */
  async sendContactNotification(contactData) {
    if (!this.isConfigured) {
      console.error('❌ SendGrid not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { name, email, phone, subject, message, company } = contactData;

      const msg = {
        to: process.env.EMAIL_FROM, // Send to info@akoot.tech
        from: process.env.EMAIL_FROM, // Must be verified sender in SendGrid
        replyTo: email, // Allow direct reply
        subject: `New Contact: ${subject}`,
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
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
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
            
            <p style="color: #666; font-size: 12px;">Received: ${new Date().toLocaleString()}</p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('✅ Contact notification sent successfully');
      return { success: true };
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
      console.error('❌ SendGrid not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { email, name, subscriptionType, source } = subscriptionData;

      const msg = {
        to: process.env.EMAIL_FROM,
        from: process.env.EMAIL_FROM,
        subject: `New Subscriber: ${email}`,
        text: `
New Email Subscription

Email: ${email}
${name ? `Name: ${name}` : ''}
Subscription Type: ${subscriptionType || 'all'}
Source: ${source || 'website'}
Subscribed At: ${new Date().toLocaleString()}
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
              New Email Subscription
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              ${name ? `<p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>` : ''}
              <p style="margin: 10px 0;"><strong>Type:</strong> ${subscriptionType || 'all'}</p>
              <p style="margin: 10px 0;"><strong>Source:</strong> ${source || 'website'}</p>
              <p style="margin: 10px 0;"><strong>Subscribed:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('✅ Subscription notification sent successfully');
      return { success: true };
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
      console.error('❌ SendGrid not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Welcome to Akoot Tech Newsletter!',
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

Best regards,
Akoot Tech Team
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
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
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Best regards,<br>
              Akoot Tech Team
            </p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('✅ Welcome email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
