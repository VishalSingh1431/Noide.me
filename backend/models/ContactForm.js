import pool from '../config/database.js';

/**
 * Contact Form Submission Model
 */
class ContactForm {
  /**
   * Create a new contact form submission
   */
  static async create(data) {
    const query = `
      INSERT INTO contact_form_submissions (
        business_id, name, email, phone, subject, message
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.businessId,
      data.name,
      data.email,
      data.phone || null,
      data.subject || null,
      data.message,
    ];

    const result = await pool.query(query, values);
    return ContactForm.mapRowToSubmission(result.rows[0]);
  }

  /**
   * Find submissions by business ID
   */
  static async findByBusinessId(businessId, limit = 50) {
    const query = `
      SELECT * FROM contact_form_submissions 
      WHERE business_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [businessId, limit]);
    return result.rows.map(row => ContactForm.mapRowToSubmission(row));
  }

  /**
   * Update submission status
   */
  static async updateStatus(id, status) {
    const query = `
      UPDATE contact_form_submissions 
      SET status = $1 
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows.length > 0 ? ContactForm.mapRowToSubmission(result.rows[0]) : null;
  }

  /**
   * Map database row to submission object
   */
  static mapRowToSubmission(row) {
    if (!row) return null;

    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      subject: row.subject,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}

export default ContactForm;

