const BaseUser = require('./basicUser');

class PremiumUser extends BaseUser {
  constructor(userData) {
    super({ ...userData, role: 'premium' });
    this.prioritySupport = true;
    this.unlimitedSuggestions = true;
  }

  hasAccessToPremiumFeatures() {
    return true;
  }
}

module.exports = PremiumUser;
