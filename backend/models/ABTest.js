import pool from '../config/database.js';

/**
 * A/B Test Variant Model
 */
class ABTest {
  /**
   * Create or update a variant
   */
  static async upsertVariant(data) {
    const query = `
      INSERT INTO ab_test_variants (
        business_id, variant_name, layout_type, is_active
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (business_id, variant_name) 
      DO UPDATE SET 
        layout_type = EXCLUDED.layout_type,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      data.businessId,
      data.variantName,
      data.layoutType,
      data.isActive !== undefined ? data.isActive : true,
    ];

    const result = await pool.query(query, values);
    return ABTest.mapRowToVariant(result.rows[0]);
  }

  /**
   * Find variants by business ID
   */
  static async findByBusinessId(businessId) {
    const query = `
      SELECT * FROM ab_test_variants 
      WHERE business_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [businessId]);
    return result.rows.map(row => ABTest.mapRowToVariant(row));
  }

  /**
   * Increment visitor count
   */
  static async incrementVisitor(businessId, variantName) {
    const query = `
      UPDATE ab_test_variants 
      SET visitor_count = visitor_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE business_id = $1 AND variant_name = $2
      RETURNING *
    `;
    const result = await pool.query(query, [businessId, variantName]);
    return result.rows.length > 0 ? ABTest.mapRowToVariant(result.rows[0]) : null;
  }

  /**
   * Increment conversion count
   */
  static async incrementConversion(businessId, variantName) {
    const query = `
      UPDATE ab_test_variants 
      SET conversion_count = conversion_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE business_id = $1 AND variant_name = $2
      RETURNING *
    `;
    const result = await pool.query(query, [businessId, variantName]);
    return result.rows.length > 0 ? ABTest.mapRowToVariant(result.rows[0]) : null;
  }

  /**
   * Get conversion rate
   */
  static async getConversionRate(businessId, variantName) {
    const variant = await pool.query(
      'SELECT visitor_count, conversion_count FROM ab_test_variants WHERE business_id = $1 AND variant_name = $2',
      [businessId, variantName]
    );
    
    if (variant.rows.length === 0) return 0;
    const { visitor_count, conversion_count } = variant.rows[0];
    return visitor_count > 0 ? (conversion_count / visitor_count) * 100 : 0;
  }

  /**
   * Map database row to variant object
   */
  static mapRowToVariant(row) {
    if (!row) return null;

    return {
      id: row.id,
      businessId: row.business_id,
      variantName: row.variant_name,
      layoutType: row.layout_type,
      isActive: row.is_active,
      visitorCount: row.visitor_count,
      conversionCount: row.conversion_count,
      conversionRate: row.visitor_count > 0 ? (row.conversion_count / row.visitor_count) * 100 : 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default ABTest;

