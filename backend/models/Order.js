import pool from '../config/database.js';

/**
 * Order Model - PostgreSQL operations
 */
class Order {
  /**
   * Generate unique order number
   */
  static generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Create a new order
   */
  static async create(data) {
    const orderNumber = Order.generateOrderNumber();
    
    const query = `
      INSERT INTO orders (
        business_id, order_number, customer_name, customer_email, customer_phone,
        customer_address, items, subtotal, tax, shipping, total, status,
        payment_method, payment_status, notes, notification_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      data.businessId,
      orderNumber,
      data.customerName,
      data.customerEmail || null,
      data.customerPhone,
      data.customerAddress || null,
      JSON.stringify(data.items || []),
      data.subtotal,
      data.tax || 0,
      data.shipping || 0,
      data.total,
      data.status || 'pending',
      data.paymentMethod || null,
      data.paymentStatus || 'pending',
      data.notes || null,
      data.notificationMethod || 'both',
    ];

    const result = await pool.query(query, values);
    return Order.mapRowToOrder(result.rows[0]);
  }

  /**
   * Find orders by business ID
   */
  static async findByBusinessId(businessId, limit = 50) {
    const query = `
      SELECT * FROM orders 
      WHERE business_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [businessId, limit]);
    return result.rows.map(row => Order.mapRowToOrder(row));
  }

  /**
   * Find order by order number
   */
  static async findByOrderNumber(orderNumber) {
    const query = 'SELECT * FROM orders WHERE order_number = $1';
    const result = await pool.query(query, [orderNumber]);
    return result.rows.length > 0 ? Order.mapRowToOrder(result.rows[0]) : null;
  }

  /**
   * Find order by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? Order.mapRowToOrder(result.rows[0]) : null;
  }

  /**
   * Update order status
   */
  static async updateStatus(id, status, paymentStatus = null) {
    const updates = [`status = $1`, `updated_at = CURRENT_TIMESTAMP`];
    const values = [status];
    
    if (paymentStatus) {
      updates.push(`payment_status = $${values.length + 1}`);
      values.push(paymentStatus);
    }
    
    values.push(id);
    
    const query = `
      UPDATE orders 
      SET ${updates.join(', ')} 
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? Order.mapRowToOrder(result.rows[0]) : null;
  }

  /**
   * Mark notification as sent
   */
  static async markNotificationSent(id) {
    const query = `
      UPDATE orders 
      SET notification_sent = TRUE, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? Order.mapRowToOrder(result.rows[0]) : null;
  }

  /**
   * Map database row to order object
   */
  static mapRowToOrder(row) {
    if (!row) return null;

    return {
      id: row.id,
      businessId: row.business_id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      customerAddress: row.customer_address,
      items: typeof row.items === 'object' ? row.items : JSON.parse(row.items || '[]'),
      subtotal: parseFloat(row.subtotal),
      tax: parseFloat(row.tax),
      shipping: parseFloat(row.shipping),
      total: parseFloat(row.total),
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      notes: row.notes,
      notificationSent: row.notification_sent,
      notificationMethod: row.notification_method,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default Order;

