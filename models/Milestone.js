const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  detail: { type: String, required: true },
  state: { type: String, default: "Planned" },
}, { timestamps: true });

module.exports = mongoose.model("Milestone", milestoneSchema);

