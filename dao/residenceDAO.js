const pool = require('../NeonConnection');
const { table, columns } = require('../schemas/residenceSchema');

const ResidenceDAO = {
  async create(data) {
    const query = `
      INSERT INTO ${table} (
        name, description, address, priceRange, rating, numberOfReviews,
        CheckInDate, CheckOutDate, image, secondary_images, longitude,
        latitude, contact_info, amenities
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *;
    `;
    const values = [
      data.name, data.description, data.address, data.priceRange,
      data.rating, data.numberOfReviews, data.CheckInDate, data.CheckOutDate,
      data.image, data.secondary_images, data.longitude, data.latitude,
      data.contact_info, data.amenities
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

  async search({ checkInDate, checkOutDate, minPrice, maxPrice, location }) {
    let query = `SELECT * FROM ${table} WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (minPrice) {
      query += ` AND priceRange >= $${idx++}`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ` AND priceRange <= $${idx++}`;
      params.push(Number(maxPrice));
    }

    /*if (location) {
      query += ` AND address ILIKE $${idx++}`;
      params.push(`%${location}%`);
    }*/

    /*if (checkInDate) {
      query += ` AND checkInDate <= $${idx++}`;
      params.push(checkInDate);
    }

    if (checkOutDate) {
      query += ` AND checkOutDate >= $${idx++}`;
      params.push(checkOutDate);
    }*/

    const result = await pool.query(query, params);
    return result.rows;
  },



  async update(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const key in updates) {
      fields.push(`${key} = $${idx}`);
      values.push(updates[key]);
      idx++;
    }

    const query = `UPDATE ${table} SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    values.push(id);

    const res = await pool.query(query, values);
    return res.rows[0];
  },

  async delete(id) {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  }
};

module.exports = ResidenceDAO;
