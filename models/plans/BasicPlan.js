class BasicPlan {
  constructor({
    id,
    itineraryId,
    title,
    description,
    date,
    activities = [],
    restaurants = [],
    note = '',
    createdAt = new Date(),
  }) {
    this.id = id;
    this.itineraryId = itineraryId;
    this.title = title;
    this.description = description;
    this.date = new Date(date);
    this.activities = activities; // Array of activity IDs or objects
    this.restaurants = restaurants; // Array of restaurant IDs or objects
    this.note = note;
    this.createdAt = createdAt;
  }

  getSummary() {
    return {
      title: this.title,
      date: this.date,
      activitiesCount: this.activities.length,
      mealsCount: this.restaurants.length,
    };
  }

  addActivity(activityId) {
    this.activities.push(activityId);
  }

  addRestaurant(restaurantId) {
    this.restaurants.push(restaurantId);
  }

  setNote(note) {
    this.note = note;
  }

  toJSON() {
    return {
      id: this.id,
      itineraryId: this.itineraryId,
      title: this.title,
      description: this.description,
      date: this.date,
      activities: this.activities,
      restaurants: this.restaurants,
      note: this.note,
      createdAt: this.createdAt,
    };
  }
}

module.exports = BasicPlan;
