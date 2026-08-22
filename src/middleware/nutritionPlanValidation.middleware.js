const ALLOWED_FIELDS = [
  "id",
  "plan_name",
  "start_date",
  "end_date",
  "daily_calorie_target",
  "daily_protein_target_g",
  "daily_carbohydrate_target_g",
  "daily_fat_target_g",
  "meals",
  "goal",
  "notes",
  "generated_by",
  "ai_generation_id",
];

const MUTABLE_FIELDS = [
  "plan_name",
  "start_date",
  "end_date",
  "daily_calorie_target",
  "daily_protein_target_g",
  "daily_carbohydrate_target_g",
  "daily_fat_target_g",
  "meals",
  "goal",
  "notes",
];

function validationError(res, errors) {
  return res.status(400).json({
    message: "Validation failed",
    errors,
  });
}

function isNonEmptyString(
  value,
  maxLength = 150,
) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function isValidDate(value) {
  return (
    typeof value === "string" &&
    !Number.isNaN(
      new Date(value).getTime(),
    )
  );
}

function validateNumber(
  value,
  field,
  min,
  max,
  errors,
  required = false,
) {
  if (
    value === undefined ||
    value === null
  ) {
    if (required) {
      errors[field] = "is required";
    }

    return;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    errors[field] =
      `must be a number between ${min} and ${max}`;
  }
}

function validateMeals(meals, errors) {
  if (!Array.isArray(meals)) {
    errors.meals = "must be an array";
    return;
  }

  if (meals.length === 0) {
    errors.meals =
      "must contain at least one meal";
    return;
  }

  meals.forEach((meal, index) => {
    if (
      !meal ||
      typeof meal !== "object" ||
      Array.isArray(meal)
    ) {
      errors[`meals.${index}`] =
        "must be an object";
      return;
    }

    if (
      !isNonEmptyString(
        meal.meal_name,
        100,
      )
    ) {
      errors[
        `meals.${index}.meal_name`
      ] = "must be a non-empty string";
    }

    if (
      !Array.isArray(meal.foods) ||
      meal.foods.length === 0
    ) {
      errors[
        `meals.${index}.foods`
      ] =
        "must contain at least one food";
    } else if (
      meal.foods.some(
        (food) =>
          typeof food !== "string" ||
          food.trim().length === 0,
      )
    ) {
      errors[
        `meals.${index}.foods`
      ] =
        "must contain only non-empty strings";
    }

    validateNumber(
      meal.calories_kcal,
      `meals.${index}.calories_kcal`,
      0,
      10000,
      errors,
    );

    validateNumber(
      meal.protein_g,
      `meals.${index}.protein_g`,
      0,
      1000,
      errors,
    );

    validateNumber(
      meal.carbohydrates_g,
      `meals.${index}.carbohydrates_g`,
      0,
      1000,
      errors,
    );

    validateNumber(
      meal.fat_g,
      `meals.${index}.fat_g`,
      0,
      1000,
      errors,
    );
  });
}

function validateNutritionPlan({
  partial = false,
} = {}) {
  return (req, res, next) => {
    const body = req.body;
    const errors = {};

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return validationError(res, {
        body: "must be a JSON object",
      });
    }

    const allowedFields = partial
      ? MUTABLE_FIELDS
      : ALLOWED_FIELDS;

    const unsupportedFields =
      Object.keys(body).filter(
        (field) =>
          !allowedFields.includes(field),
      );

    if (unsupportedFields.length > 0) {
      errors.unsupportedFields =
        unsupportedFields;
    }

    if (!partial) {
      if (!isNonEmptyString(body.id, 100)) {
        errors.id =
          "must be a non-empty string up to 100 characters";
      }

      if (
        !isNonEmptyString(body.plan_name)
      ) {
        errors.plan_name =
          "must be a non-empty string";
      }

      if (!isValidDate(body.start_date)) {
        errors.start_date =
          "must be a valid date";
      }

      validateNumber(
        body.daily_calorie_target,
        "daily_calorie_target",
        0,
        10000,
        errors,
        true,
      );

      validateNumber(
        body.daily_protein_target_g,
        "daily_protein_target_g",
        0,
        1000,
        errors,
        true,
      );

      validateNumber(
        body.daily_carbohydrate_target_g,
        "daily_carbohydrate_target_g",
        0,
        1000,
        errors,
        true,
      );

      validateNumber(
        body.daily_fat_target_g,
        "daily_fat_target_g",
        0,
        1000,
        errors,
        true,
      );

      validateMeals(body.meals, errors);

      if (
        ![
          "weight_loss",
          "muscle_gain",
          "maintenance",
          "recomposition",
        ].includes(body.goal)
      ) {
        errors.goal =
          "must be weight_loss, muscle_gain, maintenance, or recomposition";
      }

      if (
        !["trainer", "ai"].includes(
          body.generated_by,
        )
      ) {
        errors.generated_by =
          "must be trainer or ai";
      }
    }

    if (
      body.plan_name !== undefined &&
      !isNonEmptyString(body.plan_name)
    ) {
      errors.plan_name =
        "must be a non-empty string";
    }

    if (
      body.start_date !== undefined &&
      !isValidDate(body.start_date)
    ) {
      errors.start_date =
        "must be a valid date";
    }

    if (
      body.end_date !== undefined &&
      body.end_date !== null &&
      !isValidDate(body.end_date)
    ) {
      errors.end_date =
        "must be a valid date";
    }

    validateNumber(
      body.daily_calorie_target,
      "daily_calorie_target",
      0,
      10000,
      errors,
    );

    validateNumber(
      body.daily_protein_target_g,
      "daily_protein_target_g",
      0,
      1000,
      errors,
    );

    validateNumber(
      body.daily_carbohydrate_target_g,
      "daily_carbohydrate_target_g",
      0,
      1000,
      errors,
    );

    validateNumber(
      body.daily_fat_target_g,
      "daily_fat_target_g",
      0,
      1000,
      errors,
    );

    if (body.meals !== undefined) {
      validateMeals(body.meals, errors);
    }

    if (
      body.goal !== undefined &&
      ![
        "weight_loss",
        "muscle_gain",
        "maintenance",
        "recomposition",
      ].includes(body.goal)
    ) {
      errors.goal = "invalid goal";
    }

    if (
      body.notes !== undefined &&
      typeof body.notes !== "string"
    ) {
      errors.notes = "must be a string";
    }

    if (
      partial &&
      Object.keys(body).length === 0
    ) {
      errors.body =
        "must include at least one field to update";
    }

    if (Object.keys(errors).length > 0) {
      return validationError(res, errors);
    }

    next();
  };
}

module.exports = {
  validateNutritionPlan,
};