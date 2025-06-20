const residenceDAO = require('../dao/residenceDAO');
const createResidenceInstance = require('../models/residences/residenceFactory');

const residenceService = {
  async createResidence(data) {
    const doc = await residenceDAO.create(data);
    return createResidenceInstance(doc);
  },

  async getResidenceById(id) {
    const doc = await residenceDAO.getById(id);
    return doc ? createResidenceInstance(doc) : null;
  },

  async getAllResidences(filter = {}) {
    const docs = await residenceDAO.getAll(filter);
    return docs.map(createResidenceInstance);
  },

  async updateResidence(id, updates) {
    const updated = await residenceDAO.update(id, updates);
    return createResidenceInstance(updated);
  },

  async deleteResidence(id) {
    return await residenceDAO.delete(id); 
  }
};

module.exports = residenceService;
