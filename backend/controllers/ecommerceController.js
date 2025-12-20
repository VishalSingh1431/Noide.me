import Product from '../models/Product.js';
import Order from '../models/Order.js';
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
 * Send order notification via WhatsApp (formatted message)
 */
const formatWhatsAppOrderMessage = (order, business) => {
  const itemsText = order.items.map(item => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
    const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity);
    return `• ${item.name} x${quantity} - ₹${(price * quantity).toFixed(2)}`;
  }).join('\n');

  return `🛒 *New Order Received!*

*Order Number:* ${order.orderNumber}
*Customer:* ${order.customerName}
*Phone:* ${order.customerPhone}
${order.customerEmail ? `*Email:* ${order.customerEmail}` : ''}
${order.customerAddress ? `*Address:* ${order.customerAddress}` : ''}

*Items:*
${itemsText}

*Subtotal:* ₹${parseFloat(order.subtotal || 0).toFixed(2)}
${order.tax > 0 ? `*Tax:* ₹${parseFloat(order.tax).toFixed(2)}` : ''}
${order.shipping > 0 ? `*Shipping:* ₹${parseFloat(order.shipping).toFixed(2)}` : ''}
*Total:* ₹${parseFloat(order.total || 0).toFixed(2)}

*Payment Status:* ${order.paymentStatus}
${order.notes ? `*Notes:* ${order.notes}` : ''}

---
*Business:* ${business.businessName}`;
};

/**
 * Send order notification via Email
 */
const sendOrderEmail = async (order, business) => {
  const transporter = initializeEmailTransporter();
  if (!transporter) {
    console.log('Email transporter not configured');
    return false;
  }

  const itemsHtml = order.items.map(item => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
    return `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(price * quantity).toFixed(2)}</td>
    </tr>`;
  }).join('');

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
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #2563eb; color: white; padding: 10px; text-align: left; }
    .total { font-size: 18px; font-weight: bold; color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 New Order Received!</h1>
    </div>
    <div class="content">
      <h2>Order Details</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Customer Name:</strong> ${order.customerName}</p>
      <p><strong>Phone:</strong> ${order.customerPhone}</p>
      ${order.customerEmail ? `<p><strong>Email:</strong> ${order.customerEmail}</p>` : ''}
      ${order.customerAddress ? `<p><strong>Address:</strong> ${order.customerAddress}</p>` : ''}
      
      <h3>Order Items</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="text-align: right; margin-top: 20px;">
        <p>Subtotal: ₹${parseFloat(order.subtotal || 0).toFixed(2)}</p>
        ${order.tax > 0 ? `<p>Tax: ₹${parseFloat(order.tax).toFixed(2)}</p>` : ''}
        ${order.shipping > 0 ? `<p>Shipping: ₹${parseFloat(order.shipping).toFixed(2)}</p>` : ''}
        <p class="total">Total: ₹${parseFloat(order.total || 0).toFixed(2)}</p>
      </div>
      
      <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
      ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">Business: ${business.businessName}</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"VaranasiHub Orders" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@varanasihub.com'}>`,
      to: business.email,
      subject: `New Order: ${order.orderNumber} - ${business.businessName}`,
      html: emailHtml,
      text: formatWhatsAppOrderMessage(order, business),
    });
    return true;
  } catch (error) {
    console.error('Error sending order email:', error);
    return false;
  }
};

/**
 * Get products for a business
 */
export const getProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const business = await Business.findBySlug(slug, ['approved', 'active']);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const products = await Product.findByBusinessId(business.id);
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/**
 * Create a new order
 */
export const createOrder = async (req, res) => {
  try {
    const { slug } = req.params;
    const { items, customerName, customerEmail, customerPhone, customerAddress, notes, notificationMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: 'Customer name and phone are required' });
    }

    const business = await Business.findBySlug(slug, ['approved', 'active']);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.businessId !== business.id) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrl,
      });
    }

    const tax = 0; // Can be calculated based on business settings
    const shipping = 0; // Can be calculated based on address
    const total = subtotal + tax + shipping;

    // Create order
    const order = await Order.create({
      businessId: business.id,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      notes,
      notificationMethod: notificationMethod || 'both',
    });

    // Update product stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        await Product.update(product.id, {
          stockQuantity: Math.max(0, product.stockQuantity - item.quantity),
        });
      }
    }

    // Send notifications
    const notificationSent = { whatsapp: false, email: false };

    if (order.notificationMethod === 'whatsapp' || order.notificationMethod === 'both') {
      if (business.whatsapp) {
        const whatsappMessage = formatWhatsAppOrderMessage(order, business);
        const whatsappUrl = `https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
        notificationSent.whatsapp = true;
        // Note: In production, you might want to use WhatsApp Business API
        order.whatsappUrl = whatsappUrl;
      }
    }

    if (order.notificationMethod === 'email' || order.notificationMethod === 'both') {
      notificationSent.email = await sendOrderEmail(order, business);
    }

    // Mark notification as sent
    if (notificationSent.whatsapp || notificationSent.email) {
      await Order.markNotificationSent(order.id);
    }

    res.json({
      success: true,
      order,
      notificationSent,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

