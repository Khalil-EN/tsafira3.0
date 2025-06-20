class BaseItinerary {
  constructor({
    id, userId, title, description, destination, country,
    duration, budget,nbrOfPeople, typeSuggestion, typeItinerary,
    itineraryActivityPreferences, residenceId, plans = [],
    createdAt
  }) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.destination = destination;
    this.country = country;
    this.duration = duration;
    this.budget = budget;
    this.nbrOfPeople = nbrOfPeople;
    this.typeSuggestion = typeSuggestion;
    this.typeItinerary = typeItinerary;
    this.itineraryActivityPreferences = itineraryActivityPreferences;
    this.residenceId = residenceId;
    this.plans = plans;
    this.createdAt = createdAt || new Date();
  }

  addPlan(plan) {
    this.plans.push(plan);
  }

  getSummary() {
    return {
      id: this.id,
      title: this.title,
      duration: this.duration,
      type: this.typeItinerary
    };
  }
}

module.exports = BaseItinerary;
