import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email service not configured. Skipping welcome email.');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"VaranasiHub" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Welcome to VaranasiHub! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to VaranasiHub! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${userName || 'there'},</p>
              <p>Thank you for joining VaranasiHub! We're excited to help you create a stunning online presence for your business.</p>
              <p>With VaranasiHub, you can:</p>
              <ul>
                <li>Create a professional website in minutes</li>
                <li>Get a custom subdomain instantly</li>
                <li>Showcase your business with photos and videos</li>
                <li>Connect with customers via WhatsApp and phone</li>
              </ul>
              <a href="${process.env.FRONTEND_URL || 'https://varanasihub.com'}/create-website" class="button">Create Your Website</a>
              <p>If you have any questions, feel free to reach out to us.</p>
              <p>Best regards,<br>The VaranasiHub Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - email failure shouldn't break the flow
  }
};

/**
 * Send business approval email
 */
export const sendApprovalEmail = async (businessEmail, businessName, businessUrl) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email service not configured. Skipping approval email.');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"VaranasiHub" <${process.env.SMTP_USER}>`,
      to: businessEmail,
      subject: `🎉 Your Business "${businessName}" is Now Live!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .url-box { background: white; padding: 15px; border-radius: 5px; border: 2px solid #667eea; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your Business is Live!</h1>
            </div>
            <div class="content">
              <p>Great news! Your business website <strong>"${businessName}"</strong> has been approved and is now live!</p>
              <div class="url-box">
                <p style="margin: 0;"><strong>Your Website URL:</strong></p>
                <p style="margin: 5px 0 0 0;"><a href="${businessUrl}" style="color: #667eea;">${businessUrl}</a></p>
              </div>
              <p>You can now:</p>
              <ul>
                <li>Share your website with customers</li>
                <li>Update your business information anytime</li>
                <li>View analytics and track visitors</li>
                <li>Manage appointments and bookings</li>
              </ul>
              <a href="${businessUrl}" class="button">Visit Your Website</a>
              <p>Thank you for choosing VaranasiHub!</p>
              <p>Best regards,<br>The VaranasiHub Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${businessEmail}`);
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
};

/**
 * Send business rejection email
 */
export const sendRejectionEmail = async (businessEmail, businessName, reason) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email service not configured. Skipping rejection email.');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"VaranasiHub" <${process.env.SMTP_USER}>`,
      to: businessEmail,
      subject: `Update on Your Business "${businessName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Action Required</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>We reviewed your business listing for <strong>"${businessName}"</strong> and need some additional information or corrections.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>Please update your business information and resubmit for review.</p>
              <a href="${process.env.FRONTEND_URL || 'https://varanasihub.com'}/profile" class="button">Update Business</a>
              <p>If you have any questions, please contact our support team.</p>
              <p>Best regards,<br>The VaranasiHub Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${businessEmail}`);
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
};

/**
 * Send appointment confirmation email
 */
export const sendAppointmentConfirmation = async (customerEmail, customerName, businessName, appointmentDate, appointmentTime) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email service not configured. Skipping appointment email.');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"VaranasiHub" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Appointment Confirmed with ${businessName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Appointment Confirmed</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>Your appointment has been confirmed!</p>
              <div class="info-box">
                <p><strong>Business:</strong> ${businessName}</p>
                <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
              </div>
              <p>We look forward to seeing you!</p>
              <p>Best regards,<br>${businessName}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Appointment confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending appointment email:', error);
  }
};

