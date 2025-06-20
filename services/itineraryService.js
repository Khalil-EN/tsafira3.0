// itineraryService.js
const ItineraryDAO = require('../dao/itineraryDAO');
const createItineraryInstance = require('../models/itineraries/itineraryFactory');

const ItineraryService = {
  async createItinerary(data) {
    const raw = await ItineraryDAO.create(data);
    return createItineraryInstance(raw); 
  },

  async getItineraryById(id) {
    const raw = await ItineraryDAO.getById(id);
    if (!raw) throw new Error("Itinerary not found");
    return createItineraryInstance(raw);
  },

  async getUserItineraries(userId) {
    const list = await ItineraryDAO.getByUserId(userId);
    return list.map(createItineraryInstance);
  },

  async updateItinerary(id, updates) {
    const raw = await ItineraryDAO.update(id, updates);
    return createItineraryInstance(raw);
  },

  async deleteItinerary(id) {
    return await ItineraryDAO.delete(id);
  }
};

module.exports = ItineraryService;
