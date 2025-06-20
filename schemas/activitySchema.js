const ACTIVITY_TYPES = [
  'museum', 'hiking', 'beach', 'cultural site', 'garden',
  'entertainment', 'historical site', 'city tour', 'adventure',
  'art gallery', 'shopping', 'local experience'
];

module.exports = {
  table: 'activities',
  columns: [
    'id', 'name', 'rating', 'numberofreviews', 'image',
    'addresse', 'longitude', 'latitude', 'description', 'activitytype'
  ],
  enums: {
    activitytype: ACTIVITY_TYPES
  },
  defaults: {
    rating: 0,
    numberofreviews: 0
  },
  validators: {
    isValidType: (type) => ACTIVITY_TYPES.includes(type),
    isValidRating: (rating) => typeof rating === 'number' && rating >= 0 && rating <= 5
  }
};
