class Activity {
  constructor({
    id,
    name,
    description,
    activitytype,
    numberofreviews,
    rating,
    image,
    addresse,
    longitude,
    latitude
  }) {
    this.id = id;
    this.name = name;
    this.description = description || '';
    this.activitytype = activitytype;
    this.numberofreviews = numberofreviews || 0;
    this.rating = rating || 0;
    this.image = image || null;
    this.address = addresse;
    this.longitude = longitude;
    this.latitude = latitude;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Activity;
