const BaseUser = require('./basicUser');

class FreemiumUser extends BaseUser {
  constructor(userData) {
    super({ ...userData, role: 'freemium' });
    this.adLimit = 5; 
  }

  getItineraryLimit() {
    return this.adLimit;
  }
}

module.exports = FreemiumUser;
