const planDAO = require('../dao/planDAO');
const PlanFactory = require('../models/plans/planFactory');

class PlanService {
  async createPlan(planData) {
    const plan = PlanFactory.createPlan(planData);
    // Optionally call plan methods here, e.g., enrich, set default notes, etc.
    return await planDAO.create(plan.toJSON());
  }

  async getPlanById(planId) {
    const rawData = await planDAO.getById(planId);
    if (!rawData) return null;
    return PlanFactory.createPlan(rawData);
  }

  async getPlansByItinerary(itineraryId) {
    const plans = await planDAO.getByItineraryId(itineraryId);
    return plans.map(raw => PlanFactory.createPlan(raw));
  }

  async updatePlan(planId, updates) {
    // Optional: Load, mutate via Plan methods, then update
    const existing = await this.getPlanById(planId);
    if (!existing) return null;

    // Example: update note via model method
    if (updates.note) existing.setNote(updates.note);

    // Add or modify activities, restaurants, etc. via model methods if needed
    return await planDAO.update(planId, existing.toJSON());
  }

  async deletePlan(planId) {
    return await planDAO.delete(planId);
  }
}

module.exports = new PlanService();
