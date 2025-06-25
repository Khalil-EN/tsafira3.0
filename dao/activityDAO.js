const pool = require('../NeonConnection');
const { table } = require('../schemas/activitySchema');

const ActivityDAO = {
  async create(data) {
    const query = `
      INSERT INTO ${table} (
        name, rating, numberofreviews, image,
        addresse, longitude, latitude, description, activitytype
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9
      )
      RETURNING *;
    `;

    const values = [
      data.name,
      data.rating,
      data.numberofreviews,
      data.image,
      data.addresse,
      data.longitude,
      data.latitude,
      data.description,
      data.activitytype
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

  async search({date, time, freeOnly, location, participants, ageGroups, specialRequirements, activityTypes}) {
    let query = `SELECT * FROM activities WHERE 1=1`;
    const params = [];
    let idx = 1;

    /*if (freeOnly === true) {
      query += ` AND price = 0`;
    }

    if (location) {
      query += ` AND addresse ILIKE $${idx++}`;
      params.push(`%${location}%`);
    }*/

    if (activityTypes && activityTypes.length > 0) {
    query += ` AND activitytype IN (${activityTypes.map(() => `$${idx++}`).join(', ')})`;
    params.push(...activityTypes);
  }

    /*if (time) {
      query += ` AND (
        to_timestamp(trim(split_part(openinghours, '-', 1)), 'HH12:MI AM')::time <= to_timestamp($${idx}, 'HH24:MI')::time AND
        to_timestamp(trim(split_part(openinghours, '-', 2)), 'HH12:MI AM')::time >= to_timestamp($${idx++}, 'HH24:MI')::time
      )`;
      params.push(time); // e.g., "14:30"
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

module.exports = ActivityDAO;
