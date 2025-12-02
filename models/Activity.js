const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["task_completed", "task_created", "schedule_added", "schedule_completed", "schedule_deleted", "milestone_added", "overview_added", "streak_updated", "summary_generated"],
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, {
  timestamps: true,
});

activitySchema.index({ userId: 1, date: -1 });
activitySchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Activity", activitySchema);

