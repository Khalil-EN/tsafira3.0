const restaurantDAO = require('../dao/restaurantDAO');
const createRestaurantInstance = require('../models/restaurants/restaurantFactory');

const RestaurantService = {
  async createRestaurant(data) {
    const doc = await restaurantDAO.create(data);
    const instance = createRestaurantInstance(doc);
    return instance;
  },

  async getRestaurantById(id) {
    const doc = await restaurantDAO.getById(id);
    return doc ? createRestaurantInstance(doc) : null;
  },

  async getAllRestaurants(filter) {
    const list = await restaurantDAO.getAll(filter);
    return list.map(createRestaurantInstance);
  },

  async updateRestaurant(id, updates) {
    const updated = await restaurantDAO.update(id, updates);
    return createRestaurantInstance(updated);
  },

  async search(filters) {
    return await restaurantDAO.search(filters);
  },

  async deleteRestaurant(id) {
    return await restaurantDAO.delete(id);
  }
};

module.exports = RestaurantService;
