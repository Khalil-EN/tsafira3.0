const FreemiumUser = require('./freemiumUser');
const PremiumUser = require('./premiumUser');
const AdminUser = require('./adminUser');

function createUser(userData) {
  switch (userData.role) {
    case 'premium':
      return new PremiumUser(userData);
    case 'admin':
      return new AdminUser(userData);
    case 'freemium':
    default:
      return new FreemiumUser(userData);
  }
}

module.exports = createUser;
