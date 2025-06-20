const UserService = require('../services/userService');
const SystemManager = require('../system/SystemManager');

class UserManager {
  async registerUser(userData) {
    const user = await UserService.registerUser(userData);
    await SystemManager.handleNewUser(user); // Logging, analytics, etc.
    return user;
  }

  async getUserById(id) {
    return await UserService.getUserById(id);
  }

  async getUserByEmail(email) {
    return await UserService.getUserByEmail(email);
  }

  async updateUser(id, updates) {
    return await UserService.updateUser(id, updates);
  }

  async deactivateUser(id) {
    const user = await UserService.deactivateUser(id);
    await SystemManager.logDeactivation(user);
    return user;
  }

  async getAllUsersByRole(role) {
    return await UserService.getAllUsersByRole(role);
  }

  async checkSuggestionLimit(userId) {
    const MAX_FREE_SUGGESTIONS_PER_DAY = 5;
    const user = await UserService.getUserById(userId);
    if (!user) throw new Error("User not found");

    const now = new Date();

    // Get the start of today (00:00:00)
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Get the start of tomorrow (00:00:00 next day)
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const lastUsed = new Date(user.lastSuggestionDate || 0);
    const isToday =
      lastUsed >= startOfToday && lastUsed < startOfTomorrow;

    // Reset counter if it's not today
    if (!isToday) {
      user.suggestionCountToday = 0;
    }

    if (user.role === 'freemium') {
      if (user.suggestionCountToday >= MAX_FREE_SUGGESTIONS_PER_DAY) {
        //throw new Error("Daily suggestion limit reached. Upgrade to premium to unlock more suggestions.");
        return false;
      }

      user.suggestionCountToday += 1;
      user.lastSuggestionDate = now;

      console.log(user.suggestionCountToday, user.lastSuggestionDate);

      await UserService.updateUser(userId, {suggestionCountToday: user.suggestionCountToday,lastSuggestionDate: user.lastSuggestionDate});
    }

    return true;
  }

}

module.exports = new UserManager();
