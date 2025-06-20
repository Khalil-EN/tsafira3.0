const Plan = require('../schemas/planSchema');

class PlanDAO {
  async create(planData) {
    return await Plan.create(planData);
  }

  async getById(planId) {
    return await Plan.findById(planId).populate('activities').populate('meals.restaurant');
  }

  async getByItineraryId(itineraryId) {
    return await Plan.find({ itineraryId }).populate('activities').populate('meals.restaurant');
  }

  async update(planId, updates) {
    return await Plan.findByIdAndUpdate(planId, updates, { new: true });
  }

  async delete(planId) {
    return await Plan.findByIdAndDelete(planId);
  }
}

module.exports = new PlanDAO();
