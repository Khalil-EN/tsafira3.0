const activityService = require('../services/activityService');
const systemManager = require('../system/SystemManager');

class ActivityManager {
  async createNewActivity(data) {
    const activity = await activityService.createActivity(data);
    systemManager.logNewActivity(activity); 
    return activity;
  }

  async getActivityDetails(id) {
    return await activityService.getActivityById(id);
  }

  async updateActivity(id, updates) {
    return await activityService.updateActivity(id, updates);
  }

  async deleteActivity(id) {
    return await activityService.deleteActivity(id);
  }

  async getAllActivities(filters = {}) {
    return await activityService.getAllActivities(filters);
  }
  normalizeActivityTypes(activityTypes) {
    const mapping = {
      'Museums': 'museum',
      'Mountains': 'nature',
      'Beach': 'beach',
      'Gardens': 'nature',
      'Cultural Attractions': 'historical landmark',
      'Entertainement Activities': 'tourist attraction'
    };
  
    return activityTypes.map(item => mapping[item] || item);
  }
}

module.exports = new ActivityManager();
