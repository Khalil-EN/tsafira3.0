const db = require('../NeonConnection');
const LocationSchema = require('../schemas/locationSchema');

const LocationDAO = {
  async create(data) {
    const insertData = {
      ...LocationSchema.defaults,
      ...data,
    };

    const fields = [];
    const placeholders = [];
    const values = [];

    LocationSchema.columns.forEach((col, i) => {
      if (col === 'id' || col === 'created_at') return; // skip auto-generated columns
      if (insertData[col] !== undefined) {
        fields.push(col);
        values.push(insertData[col]);
        placeholders.push(`$${values.length}`);
      }
    });

    const result = await db.query(
      `INSERT INTO ${LocationSchema.table} (${fields.join(', ')})
       VALUES (${placeholders.join(', ')})
       RETURNING *`,
      values
    );

    return result.rows[0];
  },

  async getById(id) {
    const result = await db.query(
      `SELECT * FROM ${LocationSchema.table} WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const key in updates) {
      if (LocationSchema.columns.includes(key)) {
        fields.push(`${key} = $${idx++}`);
        values.push(updates[key]);
      }
    }

    values.push(id);

    const result = await db.query(
      `UPDATE ${LocationSchema.table} SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query(
      `DELETE FROM ${LocationSchema.table} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async getAll(filters = {}) {
    // Simple filterless fetch
    const result = await db.query(
      `SELECT * FROM ${LocationSchema.table}`
    );
    return result.rows;
  }
};

module.exports = LocationDAO;
