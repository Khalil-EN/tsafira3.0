const Itinerary = require('../schemas/itinerarySchema');

const ItineraryDAO = {
  async create(itineraryData) {
    return await Itinerary.create(itineraryData);
  },

  async getById(id) {
    return await Itinerary.findById(id).populate('plans').populate('userId').exec();
  },

  async getByUserId(userId) {
    return await Itinerary.find({ userId }).populate('plans').exec();
  },

  async update(id, updates) {
    return await Itinerary.findByIdAndUpdate(id, updates, { new: true }).populate('plans').exec();
  },

  async delete(id) {
    return await Itinerary.findByIdAndDelete(id);
  },

  async getAll() {
    return await Itinerary.find({}).populate('plans').exec();
  }
};

module.exports = ItineraryDAO;
