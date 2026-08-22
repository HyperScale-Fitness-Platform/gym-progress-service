const mongoose = require("mongoose");

const { Schema } = mongoose;

const ExerciseSchema = new Schema(
  {
    exercise_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    machine_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    sets: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },

    reps: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    weight_kg: {
      type: Number,
      min: 0,
      max: 1000,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: true },
);

const ExercisePlanSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
      maxlength: 100,
    },

    customer_id: {
      type: String,
      required: true,
      immutable: true,
      trim: true,
      maxlength: 100,
    },

    plan_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
    },

    exercises: {
      type: [ExerciseSchema],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one exercise is required",
      },
    },

    source: {
      type: String,
      enum: ["trainer", "ai", "customer"],
      default: "trainer",
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

ExercisePlanSchema.index({
  customer_id: 1,
  start_date: -1,
});

module.exports = mongoose.model(
  "ExercisePlan",
  ExercisePlanSchema,
);