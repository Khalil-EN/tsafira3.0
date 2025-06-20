const BaseItinerary = require('./BaseItinerary');

class UserItinerary extends BaseItinerary {
  constructor(data) {
    super(data);
    this.typeSuggestion = 'user';
  }
}

module.exports = UserItinerary;
