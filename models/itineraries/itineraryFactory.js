const UserItinerary = require('./UserItinerary');
const GeneratedItinerary = require('./GeneratedItinerary');

function createItineraryInstance(data) {
  if (data.typeSuggestion === 'generated') {
    return new GeneratedItinerary(data);
  }
  return new UserItinerary(data);
}

module.exports = createItineraryInstance;
