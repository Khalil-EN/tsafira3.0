const mongoose = require("mongoose");

const roles = ["freemium", "premium", "admin"];
const statuses = ["active", "inactive", "suspended"];

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  lastLoginDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: statuses,
    default: "active",
  },
  role: {
    type: String,
    enum: roles,
    default: "freemium",
  },
  /*preferences: {
    type: mongoose.Schema.Types.Mixed, // Can hold an object with tags, types, etc.
    default: {},
  },*/
  emailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  refreshToken: {
  type: String,
  default: null,
  select: false  // so it's not returned by default in queries
  },
  suggestionCountToday: {
    type: Number,
    default: 0
  },
  lastSuggestionDate: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
