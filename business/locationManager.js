const locationService = require('../services/locationService');

class LocationManager {
  async addLocation(data) {
    // Could validate geocoordinates or enrich with timezone
    return await locationService.createLocation(data);
  }

  async getLocation(id) {
    return await locationService.getLocationById(id);
  }

  async listLocations(filter = {}) {
    return await locationService.getAllLocations(filter);
  }

  async modifyLocation(id, updates) {
    return await locationService.updateLocation(id, updates);
  }

  async removeLocation(id) {
    return await locationService.deleteLocation(id);
  }
  calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => value * Math.PI / 180;
    const R = 6371; 

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

module.exports = new LocationManager();
