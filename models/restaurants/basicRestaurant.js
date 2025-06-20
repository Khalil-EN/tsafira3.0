class Restaurant {
  constructor({
    id,
    name,
    address,
    pricelevel,
    rating,
    numberofreviews,
    openinghours,
    image,
    longitude,
    latitude,
    contact_info,
    description,
    facilities,
    meals,
    images,
    tags
  }) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.pricelevel = pricelevel;
    this.rating = rating || 0;
    this.numberofreviews = numberofreviews || 0;
    this.openingHours = openinghours || null;
    this.image = image || null;
    this.longitude = longitude;
    this.latitude = latitude;
    this.contactInfo = contact_info || null;
    this.description = description || '';
    this.facilities = facilities || [];
    this.meals = meals || [];
    this.images = images || [];
    this.tags = tags || [];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      priceLevel: this.priceLevel,
      rating: this.rating,
      image: this.image
    };
  }
}

module.exports = Restaurant;
