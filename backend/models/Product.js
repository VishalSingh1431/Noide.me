import pool from '../config/database.js';

/**
 * Product Model - PostgreSQL operations
 */
class Product {
  /**
   * Create a new product
   */
  static async create(data) {
    const query = `
      INSERT INTO products (
        business_id, name, description, price, compare_at_price, image_url, images_url,
        category, stock_quantity, sku, status, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      data.businessId,
      data.name,
      data.description || null,
      data.price,
      data.compareAtPrice || null,
      data.imageUrl || null,
      JSON.stringify(data.imagesUrl || []),
      data.category || null,
      data.stockQuantity || 0,
      data.sku || null,
      data.status || 'active',
      data.featured || false,
    ];

    const result = await pool.query(query, values);
    return Product.mapRowToProduct(result.rows[0]);
  }

  /**
   * Find products by business ID
   */
  static async findByBusinessId(businessId, status = 'active') {
    const query = `
      SELECT * FROM products 
      WHERE business_id = $1 AND status = $2 
      ORDER BY featured DESC, created_at DESC
    `;
    const result = await pool.query(query, [businessId, status]);
    return result.rows.map(row => Product.mapRowToProduct(row));
  }

  /**
   * Find product by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? Product.mapRowToProduct(result.rows[0]) : null;
  }

  /**
   * Update product
   */
  static async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(data.price);
    }
    if (data.compareAtPrice !== undefined) {
      updates.push(`compare_at_price = $${paramCount++}`);
      values.push(data.compareAtPrice);
    }
    if (data.imageUrl !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(data.imageUrl);
    }
    if (data.imagesUrl !== undefined) {
      updates.push(`images_url = $${paramCount++}`);
      values.push(JSON.stringify(data.imagesUrl));
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(data.category);
    }
    if (data.stockQuantity !== undefined) {
      updates.push(`stock_quantity = $${paramCount++}`);
      values.push(data.stockQuantity);
    }
    if (data.sku !== undefined) {
      updates.push(`sku = $${paramCount++}`);
      values.push(data.sku);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.featured !== undefined) {
      updates.push(`featured = $${paramCount++}`);
      values.push(data.featured);
    }

    if (updates.length === 0) {
      return await Product.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE products 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? Product.mapRowToProduct(result.rows[0]) : null;
  }

  /**
   * Delete product
   */
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Map database row to product object
   */
  static mapRowToProduct(row) {
    if (!row) return null;

    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      compareAtPrice: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
      imageUrl: row.image_url,
      imagesUrl: Array.isArray(row.images_url) ? row.images_url : JSON.parse(row.images_url || '[]'),
      category: row.category,
      stockQuantity: row.stock_quantity,
      sku: row.sku,
      status: row.status,
      featured: row.featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default Product;

