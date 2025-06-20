const LOCATION_COLUMNS = [
  'id', 'name', 'description',
  'address', 'city', 'state', 'postal_code', 'country',
  'latitude', 'longitude',
  'timezone', 'geohash', 'google_maps_url',
  'is_popular', 'created_at'
];

module.exports = {
  table: 'locations',

  columns: LOCATION_COLUMNS,

  defaults: {
    is_popular: false
  },

  validators: {
    isValidLat: (lat) =>
      typeof lat === 'number' && lat >= -90 && lat <= 90,

    isValidLon: (lon) =>
      typeof lon === 'number' && lon >= -180 && lon <= 180,

    isNonEmptyString: (val) =>
      typeof val === 'string' && val.trim().length > 0,

    isValidCountry: (country) =>
      typeof country === 'string' && country.length >= 2, // could be ISO 2-letter or name
  }
};
