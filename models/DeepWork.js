const mongoose = require("mongoose");

const deepWorkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dailyGoalMinutes: { type: Number, default: 180 }, // 3h default goal
    totalFocusMinutes: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeepWork", deepWorkSchema);
