import pool from '../config/database.js';

/**
 * OTP Model - PostgreSQL operations
 */
class Otp {
  /**
   * Create a new OTP
   */
  static async create(email, otp, expiresAt) {
    const query = `
      INSERT INTO otps (email, otp, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [email.toLowerCase(), otp, new Date(expiresAt)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find valid OTP by email
   */
  static async findValidOtp(email, otp) {
    const query = `
      SELECT * FROM otps 
      WHERE email = $1 
        AND otp = $2 
        AND expires_at > CURRENT_TIMESTAMP 
        AND used = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [email.toLowerCase(), otp]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Mark OTP as used
   */
  static async markAsUsed(id) {
    const query = 'UPDATE otps SET used = TRUE WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Clean up expired OTPs (optional cleanup function)
   */
  static async cleanupExpired() {
    const query = 'DELETE FROM otps WHERE expires_at < CURRENT_TIMESTAMP';
    const result = await pool.query(query);
    return result.rowCount;
  }
}

export default Otp;

