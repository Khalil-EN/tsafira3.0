const restaurantService = require('../services/restaurantService');
const SystemManager = require('../system/SystemManager');

class RestaurantManager {
  async addRestaurant(input) {
    const restaurant = await restaurantService.createRestaurant(input);
    SystemManager.notifyNewRestaurant(instance);
    return restaurant;
  }

  async getRestaurant(id) {
    return await restaurantService.getRestaurantById(id);
  }

  async listRestaurants(filter = {}) {
    return await restaurantService.getAllRestaurants(filter);
  }

  async modifyRestaurant(id, updates) {
    return await restaurantService.updateRestaurant(id, updates);
  }

  async removeRestaurant(id) {
    return await restaurantService.deleteRestaurant(id);
  }

  cleanTypeofCuisine(data){
    let restauTags = data.map(item => item.split(' ')[0]);
    restauTags = restauTags.map(tag => tag.toLowerCase()); 
    return restauTags;
  }
  convertPriceLevel(priceLevel) {
    const PRICE_LEVEL_MAP = { '$': 50, '$$': 100, '$$$': 200, '$$$$': 400 };
    if (!priceLevel || typeof priceLevel !== 'string') return 0;
  
    
    const parts = priceLevel.replace(/\s+/g, '').split('-');
  
    
    if (parts.length === 1) {
      return PRICE_LEVEL_MAP[parts[0]] || 0;
    }
  
    
    const values = parts.map(part => PRICE_LEVEL_MAP[part] || 0);
  
    if (values.length === 2) {
      return (values[0] + values[1]) / 2; 
    }
  
    return 0; 
  }
}

module.exports = new RestaurantManager();
