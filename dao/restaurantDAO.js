const pool = require('../NeonConnection');
const { table } = require('../schemas/restaurantSchema');

const RestaurantDAO = {
  async create(data) {
    const query = `
      INSERT INTO ${table} (
        name, address, priceLevel, rating, numberOfReviews, OpeningHours,
        image, longitude, latitude, contact_info,
        description, facilities, meals, images, tags
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15
      )
      RETURNING *;
    `;

    const values = [
      data.name, data.address, data.priceLevel, data.rating, data.numberOfReviews,
      data.OpeningHours, data.image, data.longitude, data.latitude,
      data.contact_info, data.description, data.facilities,
      data.meals, data.images, data.tags
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
  },

  async getById(id) {
    const res = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return res.rows[0];
  },

  async getAll(filters = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    for (const key in filters) {
      if (Array.isArray(filters[key])) {
        // e.g., activitytype: ['museum', 'beach']
        const placeholders = filters[key].map(() => `$${i++}`).join(', ');
        conditions.push(`${key} IN (${placeholders})`);
        values.push(...filters[key]);
      } else {
        conditions.push(`${key} = $${i++}`);
        values.push(filters[key]);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM ${table} ${whereClause}`;
    const res = await pool.query(query, values);
    return res.rows;
  },

  async search({ location, priceLevel, cuisines, time }) {
    let query = `SELECT * FROM ${table} WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (priceLevel) {
      query += ` AND priceLevel = $${idx++}`;
      params.push(priceLevel);
    }

    /*if (location) {
      query += ` AND address ILIKE $${idx++}`;
      params.push(`%${location}%`);
    }*/

    // Filter by cuisines (tags) – assumes tags is a text[] column
    if (cuisines && cuisines.length > 0) {
      query += ` AND tags && $${idx++}::text[]`;
      params.push(cuisines); // e.g., ['Italian', 'Mexican']
    }

    // Filter by time if provided
    /*if (time) {
      // Example format: "13:00" (24h)
      query += ` AND (
        to_timestamp(split_part(openinghours, '-', 1), 'HH12:MI AM') <= to_timestamp($${idx}, 'HH24:MI')
        AND to_timestamp(split_part(openinghours, '-', 2), 'HH12:MI AM') >= to_timestamp($${idx++}, 'HH24:MI')
      )`;
      params.push(time);
    }*/

    const result = await pool.query(query, params);
    return result.rows;
  },



  async update(id, updates) {
    const fields = [];
    const values = [];
    let i = 1;

    for (const key in updates) {
      fields.push(`${key} = $${i}`);
      values.push(updates[key]);
      i++;
    }

    const query = `UPDATE ${table} SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
    values.push(id);

    const res = await pool.query(query, values);
    return res.rows[0];
  },

  async delete(id) {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  }
};

module.exports = RestaurantDAO;
