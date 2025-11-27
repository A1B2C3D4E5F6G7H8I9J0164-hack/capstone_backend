const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, 
  googleId: { type: String, required: false, unique: true, sparse: true },
  currentStreak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  lastActivityDate: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);