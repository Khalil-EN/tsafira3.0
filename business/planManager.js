const planService = require('../services/planService');
const SystemManager = require('../system/SystemManager');

class PlanManager {
  async createNewPlan(input) {
    // Automatically assign dayNumber if missing
    if (!input.dayNumber && input.itineraryId) {
      const existingPlans = await planService.getPlansByItinerary(input.itineraryId);
      input.dayNumber = existingPlans.length + 1;
    }

    const plan = await planService.createPlan(input);
    await SystemManager.handleNewPlan(plan); // Notify system of new plan

    return plan;
  }

  async getFullPlan(planId) {
    return await planService.getPlanById(planId);
  }

  async getPlansForItinerary(itineraryId) {
    return await planService.getPlansByItinerary(itineraryId);
  }

  async updatePlan(planId, updates) {
    const updatedPlan = await planService.updatePlan(planId, updates);
    await SystemManager.handlePlanUpdate(updatedPlan); // Optional hook
    return updatedPlan;
  }

  async deletePlan(planId) {
    const deleted = await planService.deletePlan(planId);
    await SystemManager.handlePlanDeletion(planId); // Optional hook
    return deleted;
  }
}

module.exports = new PlanManager();
