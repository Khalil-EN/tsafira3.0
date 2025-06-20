const RESIDENCE_AMENITIES = [
  'wifi', 'parking', 'air conditioning', 'pool',
  'spa', 'gym', 'restaurant', 'bar', 'pet friendly',
  'airport shuttle', 'breakfast included', 'room service'
];

module.exports = {
  table: 'hotels',
  columns: [
    'id', 'name', 'description', 'address', 'priceRange',
    'rating', 'numberOfReviews', 'CheckInDate', 'CheckOutDate',
    'image', 'secondary_images', 'longitude', 'latitude',
    'contact_info', 'amenities'
  ],
  enums: {
    amenities: RESIDENCE_AMENITIES
  },
  defaults: {
    numberOfReviews: 0,
    rating: 0
  },
  validators: {
    isValidAmenity: (a) => RESIDENCE_AMENITIES.includes(a),
    isValidRating: (r) => typeof r === 'number' && r >= 0 && r <= 5
  }
};
