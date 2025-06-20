const LocationDAO = require('../dao/locationDAO');
const createLocationInstance = require('../models/locations/locationFactory');

const LocationService = {
  async createLocation(data) {
    const raw = await LocationDAO.create(data);
    return createLocationInstance(raw);
  },

  async getLocationById(id) {
    const doc = await LocationDAO.getById(id);
    return createLocationInstance(doc);
  },

  async getAllLocations(filter = {}) {
    const list = await LocationDAO.getAll(filter);
    return list.map(createLocationInstance);
  },

  async updateLocation(id, updates) {
    const doc = await LocationDAO.update(id, updates);
    return createLocationInstance(doc);
  },

  async deleteLocation(id) {
    return await LocationDAO.delete(id);
  }
};

module.exports = LocationService;
