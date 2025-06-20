const BaseItinerary = require('./BaseItinerary');

class GeneratedItinerary extends BaseItinerary {
  constructor(data) {
    super(data);
    this.typeSuggestion = 'generated';
  }
}

module.exports = GeneratedItinerary;
