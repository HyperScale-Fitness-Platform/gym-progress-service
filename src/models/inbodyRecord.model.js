const mongoose = require("mongoose");

const { Schema } = mongoose;

const InBodySchema = new Schema(
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

    test_date: {
      type: Date,
      required: true,
    },

    // Basic measurements
    weight_kg: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },

    height_cm: {
      type: Number,
      required: true,
      min: 50,
      max: 250,
    },

    bmi: {
      type: Number,
      required: true,
      min: 5,
      max: 100,
    },

    // Body composition
    body_fat_pct: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    body_fat_mass_kg: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },

    skeletal_muscle_mass_kg: {
      type: Number,
      required: true,
      min: 0,
      max: 200,
    },

    fat_free_mass_kg: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },

    // Metabolism
    basal_metabolic_rate_kcal: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },

    // Visceral fat
    visceral_fat_level: {
      type: Number,
      min: 0,
      max: 50,
    },

    // Body measurements
    waist_hip_ratio: {
      type: Number,
      min: 0,
      max: 5,
    },

    waist_circumference_cm: {
      type: Number,
      min: 0,
      max: 300,
    },

    // Overall InBody score
    inbody_score: {
      type: Number,
      min: 0,
      max: 100,
    },

    // Advanced metric
    phase_angle: {
      type: Number,
      min: 0,
      max: 20,
    },
  },
  {
    timestamps: true,
  },
);

InBodySchema.index({
  customer_id: 1,
  test_date: -1,
});

module.exports = mongoose.model("InBody", InBodySchema);