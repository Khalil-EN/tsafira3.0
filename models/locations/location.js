class Location {
  constructor({ id, name, description, address, city, region, postalCode, country, latitude, longitude, timeZone, createdAt }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.address = address;
    this.city = city;
    this.region = region;
    this.postalCode = postalCode;
    this.country = country;
    this.latitude = latitude;
    this.longitude = longitude;
    this.timeZone = timeZone;
    this.createdAt = createdAt || new Date();
  }
  getFullAddress() {
    return `${this.address}, ${this.city}, ${this.country}`;
  }

  getCoordinates() {
    return { lat: this.latitude, lng: this.longitude };
  }

  getCoordinatesString() {
    return `${this.latitude},${this.longitude}`;
  }

  calculateDistance(otherLocation){
    const R = 6371; // Radius of Earth in km
    const dLat = this.#toRad(otherLocation.latitude - this.latitude);
    const dLon = this.#toRad(otherLocation.longitude - this.longitude);
    const lat1 = this.#toRad(this.latitude);
    const lat2 = this.#toRad(otherLocation.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;

  }

  isNearby(otherLocation, maxDistanceKm = 10) {
    const R = 6371; // Radius of Earth in km
    const dLat = this.#toRad(otherLocation.latitude - this.latitude);
    const dLon = this.#toRad(otherLocation.longitude - this.longitude);
    const lat1 = this.#toRad(this.latitude);
    const lat2 = this.#toRad(otherLocation.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d <= maxDistanceKm;
  }

  #toRad(value) {
    return (value * Math.PI) / 180;
  }

}

module.exports = Location;
