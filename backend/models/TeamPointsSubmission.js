const mongoose = require("mongoose");

/**
 * Team Points Submission Schema
 * Stores individual student submissions for a Team Points Distribution event
 * Each student can submit once per event
 */
const teamPointsSubmissionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamPointsEvent",
      required: true,
    },
    raterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    ratings: [
      {
        rateeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        points: {
          type: Number,
          required: true,
          min: 0,
          validate: {
            validator: Number.isInteger,
            message: "Points must be an integer >= 0",
          },
        },
      },
    ],
    totalPoints: {
      type: Number,
      required: true,
      validate: {
        validator: function(value) {
          return Number.isInteger(value) && value >= 0;
        },
        message: "Total points must be an integer >= 0",
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Compound unique index - ensures one submission per student per event
teamPointsSubmissionSchema.index(
  { eventId: 1, raterId: 1 },
  { unique: true, name: "event_rater_unique" }
);

module.exports = mongoose.model("TeamPointsSubmission", teamPointsSubmissionSchema);

