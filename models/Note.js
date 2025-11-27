const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    quiz: {
      questions: [
        {
          question: { type: String, required: true },
          options: [{ type: String, required: true }],
          answerIndex: { type: Number, required: true },
        },
      ],
      lastGeneratedAt: { type: Date },
    },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, title: 1 });
noteSchema.index({ userId: 1, subject: 1 });
noteSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model("Note", noteSchema);
