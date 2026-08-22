const mongoose = require("mongoose");

const { Schema } = mongoose;

const MealSchema = new Schema(
  {
    meal_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    foods: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one food is required",
      },
    },

    calories_kcal: {
      type: Number,
      min: 0,
      max: 10000,
    },

    protein_g: {
      type: Number,
      min: 0,
      max: 1000,
    },

    carbohydrates_g: {
      type: Number,
      min: 0,
      max: 1000,
    },

    fat_g: {
      type: Number,
      min: 0,
      max: 1000,
    },
  },
  {
    _id: true,
  },
);

const NutritionPlanSchema = new Schema(
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

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
    },

    daily_calorie_target: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },

    daily_protein_target_g: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },

    daily_carbohydrate_target_g: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },

    daily_fat_target_g: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },

    meals: {
      type: [MealSchema],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one meal is required",
      },
    },

    goal: {
      type: String,
      enum: [
        "weight_loss",
        "muscle_gain",
        "maintenance",
        "recomposition",
      ],
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    generated_by: {
      type: String,
      enum: ["trainer", "ai"],
      required: true,
    },

    ai_generation_id: {
      type: String,
      trim: true,
      maxlength: 150,
    },
  },
  {
    timestamps: true,
  },
);

NutritionPlanSchema.index({
  customer_id: 1,
  start_date: -1,
});

module.exports = mongoose.model(
  "NutritionPlan",
  NutritionPlanSchema,
);