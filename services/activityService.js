const activityDAO = require('../dao/activityDAO');
const createActivityInstance = require('../models/activities/activityFactory');

class ActivityService {
  async createActivity(data) {
    const doc = await activityDAO.create(data);
    return createActivityInstance(doc);
  }

  async getActivityById(id) {
    const doc = await activityDAO.getById(id);
    return doc ? createActivityInstance(doc) : null;
  }

  async updateActivity(id, updates) {
    const doc = await activityDAO.update(id, updates);
    return createActivityInstance(doc);
  }

  async deleteActivity(id) {
    return await activityDAO.delete(id);
  }

  async getAllActivities(filters = {}) {
    const list = await activityDAO.getAll(filters);
    return list.map(createActivityInstance);
  }
}

module.exports = new ActivityService();
