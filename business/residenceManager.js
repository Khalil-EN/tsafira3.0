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
    const residences = await residenceService.getAllResidences(filter);
    const results = residences.map((row) => ({
      name: row.name,
      price: row.pricerange,
      rating: row.rating,
      imageurl: row.image,
      location: row.address,
      description: row.description,
      detailimages: row.secondaryimages,
      reviews: row.numberofreviews,
      amenities: row.amenities,
    }));
    return results
  }

  async updateResidence(id, updates) {
    return await residenceService.updateResidence(id, updates);
  }

  async removeResidence(id) {
    return await residenceService.deleteResidence(id);
  }
  async search(filters) {
    const residences = await residenceService.search(filters);
    const results = residences.map((row) => ({
      name: row.name,
      price: row.pricerange,
      rating: row.rating,
      imageurl: row.image,
      location: row.address,
      description: row.description,
      detailimages: row.secondary_images,
      reviews: row.numberofreviews,
      amenities: row.amenities,
    }));
    return results;
}

}

module.exports = new ResidenceManager();
