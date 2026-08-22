const ALLOWED_FIELDS = [
  "id",
  "test_date",
  "weight_kg",
  "height_cm",
  "bmi",
  "body_fat_pct",
  "body_fat_mass_kg",
  "skeletal_muscle_mass_kg",
  "fat_free_mass_kg",
  "basal_metabolic_rate_kcal",
  "visceral_fat_level",
  "waist_hip_ratio",
  "waist_circumference_cm",
  "inbody_score",
  "phase_angle",
];

const MUTABLE_FIELDS = ALLOWED_FIELDS.filter(
  (field) => field !== "id"
);

function validationError(res, errors) {
  return res.status(400).json({
    message: "Validation failed",
    errors,
  });
}

function isValidDate(value) {
  if (typeof value !== "string") {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

function validateNumber(
  value,
  field,
  min,
  max,
  errors,
  required = false
) {
  if (value === undefined || value === null || value === "") {
    if (required) {
      errors[field] = "is required";
    }

    return;
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < min ||
    number > max
  ) {
    errors[field] = `must be a number between ${min} and ${max}`;
  }
}

function validateInBody({ partial = false } = {}) {
  return (req, res, next) => {
    try {
      const body = req.body;
      const errors = {};

      console.log("INBODY VALIDATION REACHED");
      console.log("BODY:", body);

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

      const unsupportedFields = Object.keys(body).filter(
        (field) => !allowedFields.includes(field)
      );

      if (unsupportedFields.length > 0) {
        errors.unsupportedFields = unsupportedFields;
      }

      // ID is required only during creation.
      if (!partial) {
        if (
          typeof body.id !== "string" ||
          body.id.trim().length === 0 ||
          body.id.length > 100
        ) {
          errors.id =
            "must be a non-empty string up to 100 characters";
        }
      }

      // Date
      if (!partial || body.test_date !== undefined) {
        if (!isValidDate(body.test_date)) {
          errors.test_date = "must be a valid date";
        }
      }

      // Required fields during creation
      validateNumber(
        body.weight_kg,
        "weight_kg",
        0,
        500,
        errors,
        !partial
      );

      validateNumber(
        body.height_cm,
        "height_cm",
        50,
        250,
        errors,
        !partial
      );

      validateNumber(
        body.bmi,
        "bmi",
        5,
        100,
        errors,
        !partial
      );

      validateNumber(
        body.body_fat_pct,
        "body_fat_pct",
        0,
        100,
        errors,
        !partial
      );

      validateNumber(
        body.body_fat_mass_kg,
        "body_fat_mass_kg",
        0,
        500,
        errors,
        !partial
      );

      validateNumber(
        body.skeletal_muscle_mass_kg,
        "skeletal_muscle_mass_kg",
        0,
        200,
        errors,
        !partial
      );

      validateNumber(
        body.fat_free_mass_kg,
        "fat_free_mass_kg",
        0,
        500,
        errors,
        !partial
      );

      validateNumber(
        body.basal_metabolic_rate_kcal,
        "basal_metabolic_rate_kcal",
        0,
        10000,
        errors,
        !partial
      );

      // Optional fields
      validateNumber(
        body.visceral_fat_level,
        "visceral_fat_level",
        0,
        50,
        errors
      );

      validateNumber(
        body.waist_hip_ratio,
        "waist_hip_ratio",
        0,
        5,
        errors
      );

      validateNumber(
        body.waist_circumference_cm,
        "waist_circumference_cm",
        0,
        300,
        errors
      );

      validateNumber(
        body.inbody_score,
        "inbody_score",
        0,
        100,
        errors
      );

      validateNumber(
        body.phase_angle,
        "phase_angle",
        0,
        20,
        errors
      );

      if (
        partial &&
        Object.keys(body).length === 0
      ) {
        errors.body =
          "must include at least one field to update";
      }

      if (Object.keys(errors).length > 0) {
        console.log("INBODY VALIDATION FAILED:", errors);

        return validationError(res, errors);
      }

      console.log("INBODY VALIDATION PASSED");

      next();
    } catch (error) {
      console.error("INBODY VALIDATION ERROR:", error);
      next(error);
    }
  };
}

module.exports = {
  validateInBody,
};