const BaseUser = require('./basicUser');

class AdminUser extends BaseUser {
  constructor(userData) {
    super({ ...userData, role: 'admin' });
  }

  canManageUsers() {
    return true;
  }

  canViewAnalytics() {
    return true;
  }
}


module.exports = AdminUser;
