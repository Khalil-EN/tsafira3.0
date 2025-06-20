const Restaurant = require('./basicRestaurant');

function createRestaurantInstance(doc) {
  return new Restaurant(doc);
}

module.exports = createRestaurantInstance;
