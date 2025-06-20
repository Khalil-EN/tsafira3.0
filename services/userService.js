const UserDAO = require('../dao/userDAO');
const createUserInstance = require('../models/users/userFactory');

const UserService = {
  async registerUser(userData) {
    const userDoc = await UserDAO.createUser(userData);
    return createUserInstance(userDoc);
  },

  async getUserById(id) {
    const userDoc = await UserDAO.getUserById(id);
    if (!userDoc) throw new Error("User not found");
    return createUserInstance(userDoc);
  },

  async getUserByEmail(email) {
    const userDoc = await UserDAO.getUserByEmail(email);
    if (!userDoc) throw new Error("User not found");
    return createUserInstance(userDoc);
  },

  async updateUser(id, updates) {
    const updatedDoc = await UserDAO.updateUser(id, updates);
    return createUserInstance(updatedDoc);
  },

  async deactivateUser(id) {
    const updatedDoc = await UserDAO.updateUser(id, { status: 'inactive', isActive: false });
    return createUserInstance(updatedDoc);
  },

  async getAllUsersByRole(role) {
    const users = await UserDAO.getAllUsers({ role });
    return users.map(createUserInstance);
  }
};

module.exports = UserService;
