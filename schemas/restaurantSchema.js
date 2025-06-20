const RESTAURANT_MEALS = ['breakfast', 'lunch', 'dinner', 'brunch', 'dessert', 'snack'];
const RESTAURANT_FACILITIES = [
  'delivery', 'takeout', 'dine-in', 'outdoor seating', 'vegetarian options',
  'vegan options', 'gluten-free options', 'reservations', 'live music',
  'parking', 'wifi', 'pet friendly', 'wheelchair accessible', 'halal'
];

module.exports = {
  table: 'restaurants',
  columns: [
    'id', 'name', 'address', 'priceLevel', 'rating', 'numberOfReviews',
    'OpeningHours', 'image', 'longitude', 'latitude',
    'contact_info', 'description', 'facilities', 'meals', 'images', 'tags'
  ],
  enums: {
    facilities: RESTAURANT_FACILITIES,
    meals: RESTAURANT_MEALS
  },
  defaults: {
    rating: 0,
    numberOfReviews: 0
  },
  validators: {
    isValidFacility: (f) => RESTAURANT_FACILITIES.includes(f),
    isValidMeal: (m) => RESTAURANT_MEALS.includes(m),
    isValidRating: (r) => typeof r === 'number' && r >= 0 && r <= 5
  }
};
