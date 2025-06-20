const residenceService = require('../services/residenceService');
const SystemManager = require('../system/SystemManager');

class ResidenceManager {
  async createResidence(data) {
    const residence = await residenceService.createResidence(data);
    await SystemManager.handleNewResidence(residence); // new line
    return residence;
  }

  async getResidenceDetails(id) {
    return await residenceService.getResidenceById(id);
  }

  async listResidences(filter = {}) {
    return await residenceService.getAllResidences(filter);
  }

  async updateResidence(id, updates) {
    return await residenceService.updateResidence(id, updates);
  }

  async removeResidence(id) {
    return await residenceService.deleteResidence(id);
  }
}

module.exports = new ResidenceManager();
