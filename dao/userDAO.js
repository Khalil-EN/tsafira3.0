const UserModel = require('../schemas/userSchema');

const UserDAO = {
  async createUser(userData) {
    const user = new UserModel(userData);
    return await user.save();
  },

  async getUserById(id) {
    return await UserModel.findById(id).lean();
  },

  async getUserByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  },

  async updateUser(id, updateData) {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  },

  async deleteUser(id) {
    return await UserModel.findByIdAndDelete(id);
  },

  async getAllUsers(filter = {}) {
    return await UserModel.find(filter).lean();
  },
  async getUserByIdAndRefreshtoken(id) {
  return await UserModel.findById(id).select('+refreshToken').lean();
}

};

module.exports = UserDAO;
