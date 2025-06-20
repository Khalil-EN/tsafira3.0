class Residence {
  constructor({
    id,
    name,
    description,
    address,
    pricerange,
    rating,
    numberofreviews,
    checkindate,
    checkoutdate,
    image,
    secondary_images,
    longitude,
    latitude,
    contact_info,
    amenities
  }) {
    this.id = id;
    this.name = name;
    this.description = description || '';
    this.address = address;
    this.pricerange = pricerange;
    this.rating = rating || 0;
    this.numberofreviews = numberofreviews || 0;
    this.checkindate = checkindate || null;
    this.checkoutdate = checkoutdate || null;
    this.image = image || null;
    this.secondaryimages = secondary_images || [];
    this.longitude = longitude;
    this.latitude = latitude;
    this.contactInfo = contact_info || null;
    this.amenities = amenities || [];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      priceRange: this.priceRange,
      rating: this.rating,
      image: this.image,
      amenities: this.amenities
    };
  }
}

module.exports = Residence;
