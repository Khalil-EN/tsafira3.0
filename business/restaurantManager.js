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

    async search(filters) {
    const restaurants = await restaurantService.search(filters);
    const results = restaurants.map((row) => ({
      name: row.name,
      price: row.pricelevel,
      rating: row.rating,
      imageurl: row.image,
      location: row.address,
      openingHours: row.openinghours,
      reviews: row.numberofreviews,
      description: row.description,
      facilities: row.facilities,
      detailimages: row.images,
    }));
    return results;
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

  convertPriceRangeToLevel(minPrice, maxPrice) {
    const PRICE_LEVEL_MAP = { '$': 50, '$$': 100, '$$$': 200, '$$$$': 400 };
    const labels = Object.keys(PRICE_LEVEL_MAP);
    const values = Object.values(PRICE_LEVEL_MAP);

    function closestLabel(price) {
      if (price <= values[0]) return labels[0];
      if (price >= values[values.length - 1]) return labels[labels.length - 1];

      for (let i = 0; i < values.length - 1; i++) {
        if (price >= values[i] && price < values[i + 1]) {
          return labels[i];
        }
      }
      return labels[0]; // fallback
    }

    const labelMin = closestLabel(minPrice || 0);
    const labelMax = closestLabel(maxPrice || 0);

    return labelMin === labelMax ? labelMin : `${labelMin}-${labelMax}`;
  }


}

module.exports = new RestaurantManager();
