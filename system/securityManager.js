const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserDAO = require('../dao/userDAO');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const SecurityManager = {
  async register({ firstName, lastName, email, phoneNumber, birthDate, password }) {
    const existingUser = await UserDAO.getUserByEmail(email);
    if (existingUser) {
        return { success: false, message: 'Email already in use.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserDAO.createUser({firstName,
        lastName,
        email,
        phoneNumber,
        birthDate,
        passwordHash: hashedPassword,
        emailVerified: false,});


    return { success: true };
    },
  async login(email, password, rememberMe = false) {
    const user = await UserDAO.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;

    const accessToken = jwt.sign({ id: user._id, role: user.role }, ACCESS_TOKEN_SECRET, { expiresIn: '2m' });
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: rememberMe ? '30d' : '3m' });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await UserDAO.updateUser(user._id, {refreshToken: hashedRefreshToken});
    return { accessToken, refreshToken, user };
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch {
      return null;
    }
  },

  async refreshToken(oldToken) {
    try {
        console.log(oldToken);
      const decoded = jwt.verify(oldToken, REFRESH_TOKEN_SECRET);
      console.log(decoded);
      const user = await UserDAO.getUserByIdAndRefreshtoken(decoded.id);
      console.log(user);
      if (!user || !(await bcrypt.compare(oldToken, user.refreshToken))) return null;

      const newAccessToken = jwt.sign({ id: user._id, role: user.role }, ACCESS_TOKEN_SECRET, { expiresIn: '2m' });
      return { accessToken: newAccessToken };
    } catch {
      return null;
    }
  },
  async logout(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await UserDAO.getUserByIdAndRefreshtoken(decoded.id);

    if (user && await bcrypt.compare(refreshToken, user.refreshToken)) {
      await UserDAO.updateUser(user._id, { refreshToken: null });
      console.log('User logged out');
    } else {
      console.log('Refresh token does not match');
    }
  } catch (err) {
    console.log('Invalid or expired refresh token');
  }
}
};

module.exports = SecurityManager;
