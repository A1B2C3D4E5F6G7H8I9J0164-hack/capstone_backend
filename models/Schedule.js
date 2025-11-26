const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  time: { type: String, required: true },
  detail: { type: String, default: "" },
  date: { type: Date, default: Date.now }, // For filtering by date
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null }, // Link to associated task
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);

