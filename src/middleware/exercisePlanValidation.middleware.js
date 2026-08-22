const ALLOWED_FIELDS = [
    "plan_name",
    "start_date",
    "end_date",
    "exercises",
    "notes",
];

const MUTABLE_FIELDS = [
    "plan_name",
    "start_date",
    "end_date",
    "exercises",
    "notes",
];

function validationError(res, errors) {
    return res.status(400).json({
        message: "Validation failed",
        errors,
    });
}

function isNonEmptyString(value, maxLength = 150) {
    return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        value.length <= maxLength
    );
}

function isValidDate(value) {
    return (
        typeof value === "string" &&
        !Number.isNaN(new Date(value).getTime())
    );
}

function validateExercises(exercises, errors) {
    if (!Array.isArray(exercises)) {
        errors.exercises = "must be an array";
        return;
    }

    if (exercises.length === 0) {
        errors.exercises = "must contain at least one exercise";
        return;
    }

    exercises.forEach((exercise, index) => {
        if (!exercise || typeof exercise !== "object") {
            errors[`exercises.${index}`] =
                "must be an object";
            return;
        }

        if (
            !isNonEmptyString(exercise.exercise_name, 150)
        ) {
            errors[`exercises.${index}.exercise_name`] =
                "must be a non-empty string";
        }

        if (
            !isNonEmptyString(exercise.machine_name, 150)
        ) {
            errors[`exercises.${index}.machine_name`] =
                "must be a non-empty string";
        }

        if (
            typeof exercise.weight_kg !== "number" ||
            !Number.isFinite(exercise.weight_kg) ||
            exercise.weight_kg < 0 ||
            exercise.weight_kg > 1000
        ) {
            errors[`exercises.${index}.weight_kg`] =
                "must be a number between 0 and 1000";
        }

        if (
            typeof exercise.sets !== "number" ||
            !Number.isInteger(exercise.sets) ||
            exercise.sets < 1 ||
            exercise.sets > 20
        ) {
            errors[`exercises.${index}.sets`] =
                "must be an integer between 1 and 20";
        }

        if (
            typeof exercise.reps !== "number" ||
            !Number.isInteger(exercise.reps) ||
            exercise.reps < 1 ||
            exercise.reps > 100
        ) {
            errors[`exercises.${index}.reps`] =
                "must be an integer between 1 and 100";
        }
    });
}

function validateExercisePlan({ partial = false } = {}) {
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

        const unsupportedFields = Object.keys(body).filter(
            (field) => !allowedFields.includes(field),
        );

        if (unsupportedFields.length > 0) {
            errors.unsupportedFields = unsupportedFields;
        }

        // CREATE validation
        if (!partial) {

            if (!isNonEmptyString(body.plan_name)) {
                errors.plan_name =
                    "must be a non-empty string";
            }

            if (!isValidDate(body.start_date)) {
                errors.start_date =
                    "must be a valid date";
            }

            validateExercises(body.exercises, errors);
        }

        // Validate supplied fields
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

        if (body.exercises !== undefined) {
            validateExercises(body.exercises, errors);
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
    validateExercisePlan,
};