import ContactForm from '../models/ContactForm.js';
import Business from '../models/Business.js';
import nodemailer from 'nodemailer';

/**
 * Initialize email transporter
 */
const initializeEmailTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  return null;
};

/**
 * Submit contact form
 */
export const submitContactForm = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const business = await Business.findBySlug(slug, ['approved', 'active']);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Save submission
    const submission = await ContactForm.create({
      businessId: business.id,
      name,
      email,
      phone,
      subject,
      message,
    });

    // Send email notification to business owner
    const transporter = initializeEmailTransporter();
    if (transporter) {
      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .message-box { background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 New Contact Form Submission</h1>
    </div>
    <div class="content">
      <h2>Contact Details</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
      
      <div class="message-box">
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">Business: ${business.businessName}</p>
      <p style="color: #6b7280; font-size: 12px;">Submitted: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
        `;

        await transporter.sendMail({
          from: `"VaranasiHub Contact" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@varanasihub.com'}>`,
          to: business.email,
          replyTo: email,
          subject: subject || `New Contact Form Submission - ${business.businessName}`,
          html: emailHtml,
          text: `New contact form submission from ${name} (${email})\n\n${phone ? `Phone: ${phone}\n` : ''}${subject ? `Subject: ${subject}\n\n` : ''}Message:\n${message}`,
        });

        // Send auto-reply to customer
        const autoReplyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Contacting Us!</h1>
    </div>
    <div class="content">
      <p>Dear ${name},</p>
      <p>Thank you for reaching out to <strong>${business.businessName}</strong>. We have received your message and will get back to you as soon as possible.</p>
      <p>Your message:</p>
      <div style="background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0;">
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
      <p>We appreciate your interest and look forward to assisting you.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">Best regards,<br>${business.businessName}</p>
    </div>
  </div>
</body>
</html>
        `;

        await transporter.sendMail({
          from: `"${business.businessName}" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@varanasihub.com'}>`,
          to: email,
          subject: `Thank you for contacting ${business.businessName}`,
          html: autoReplyHtml,
          text: `Dear ${name},\n\nThank you for reaching out to ${business.businessName}. We have received your message and will get back to you as soon as possible.\n\nYour message:\n${message}\n\nBest regards,\n${business.businessName}`,
        });
      } catch (emailError) {
        console.error('Error sending contact form emails:', emailError);
        // Continue even if email fails
      }
    }

    res.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      submission,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
};

