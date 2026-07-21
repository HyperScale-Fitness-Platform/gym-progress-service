const ENTRY_FIELDS = [
  "id",
  "customer_id",
  "entry_date",
  "weight_kg",
  "body_fat_pct",
  "inbody_data",
  "nutrition_log",
];
const MUTABLE_ENTRY_FIELDS = [
  "weight_kg",
  "body_fat_pct",
  "inbody_data",
  "nutrition_log",
];
const SORT_FIELDS = new Set([
  "entry_date",
  "-entry_date",
  "weight_kg",
  "-weight_kg",
  "body_fat_pct",
  "-body_fat_pct",
]);

function validationError(res, errors) {
  return res.status(400).json({ message: "Validation failed", errors });
}

function isNonEmptyString(value, maxLength = 200) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function isValidDate(value) {
  return (typeof value === "string" || value instanceof Date) && !Number.isNaN(new Date(value).getTime());
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateMetric(value, name, min, max, errors) {
  if (value !== undefined && (!Number.isFinite(value) || value < min || value > max)) {
    errors[name] = `must be a number between ${min} and ${max}`;
  }
}

function validateEntryBody(body, { partial = false } = {}) {
  const errors = {};
  if (!isPlainObject(body)) return { body: "must be a JSON object" };

  const allowedFields = partial ? MUTABLE_ENTRY_FIELDS : ENTRY_FIELDS;
  const unsupported = Object.keys(body).filter((key) => !allowedFields.includes(key));
  if (unsupported.length > 0) errors.unsupportedFields = unsupported;

  if (!partial) {
    if (!isNonEmptyString(body.id, 100)) errors.id = "must be a non-empty string up to 100 characters";
    if (!isNonEmptyString(body.customer_id, 100)) {
      errors.customer_id = "must be a non-empty string up to 100 characters";
    }
    if (!isValidDate(body.entry_date)) errors.entry_date = "must be a valid date";
  }

  validateMetric(body.weight_kg, "weight_kg", 0, 500, errors);
  validateMetric(body.body_fat_pct, "body_fat_pct", 0, 100, errors);

  for (const field of ["inbody_data", "nutrition_log"]) {
    if (body[field] !== undefined && !isPlainObject(body[field])) {
      errors[field] = "must be a JSON object";
    }
  }

  if (partial && Object.keys(body).length === 0) {
    errors.body = "must include at least one mutable field";
  }

  return errors;
}

function validateProgressEntry({ partial = false } = {}) {
  return (req, res, next) => {
    const errors = validateEntryBody(req.body, { partial });
    if (Object.keys(errors).length > 0) return validationError(res, errors);
    return next();
  };
}

function validateBulkEntries(req, res, next) {
  if (!Array.isArray(req.body) || req.body.length === 0 || req.body.length > 100) {
    return validationError(res, { body: "must be an array containing 1 to 100 entries" });
  }

  const entryErrors = req.body
    .map((entry, index) => ({ index, errors: validateEntryBody(entry) }))
    .filter(({ errors }) => Object.keys(errors).length > 0);
  if (entryErrors.length > 0) return validationError(res, { entries: entryErrors });

  return next();
}

function validateListQuery(req, res, next) {
  const { customer_id, from, to, page, limit, sort } = req.query;
  const errors = {};
  if (!isNonEmptyString(customer_id, 100)) errors.customer_id = "is required";
  if (from !== undefined && !isValidDate(from)) errors.from = "must be a valid date";
  if (to !== undefined && !isValidDate(to)) errors.to = "must be a valid date";
  if (!errors.from && !errors.to && from && to && new Date(from) > new Date(to)) {
    errors.date_range = "from must be before or equal to to";
  }

  const pageNumber = page === undefined ? 1 : Number(page);
  const limitNumber = limit === undefined ? 20 : Number(limit);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) errors.page = "must be a positive integer";
  if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
    errors.limit = "must be an integer between 1 and 100";
  }
  if (sort !== undefined && !SORT_FIELDS.has(sort)) errors.sort = "is not supported";

  if (Object.keys(errors).length > 0) return validationError(res, errors);
  req.query.page = pageNumber;
  req.query.limit = limitNumber;
  req.query.sort = sort || "-entry_date";
  return next();
}

function validateDateRange(req, res, next) {
  const { from, to } = req.query;
  const errors = {};
  if (from !== undefined && !isValidDate(from)) errors.from = "must be a valid date";
  if (to !== undefined && !isValidDate(to)) errors.to = "must be a valid date";
  if (!errors.from && !errors.to && from && to && new Date(from) > new Date(to)) {
    errors.date_range = "from must be before or equal to to";
  }
  if (Object.keys(errors).length > 0) return validationError(res, errors);
  return next();
}

function validateReview({ partial = false } = {}) {
  return (req, res, next) => {
    const body = req.body;
    const errors = {};
    if (!isPlainObject(body)) errors.body = "must be a JSON object";
    else {
      const allowedFields = ["notes", "metrics"];
      const unsupported = Object.keys(body).filter((key) => !allowedFields.includes(key));
      if (unsupported.length > 0) errors.unsupportedFields = unsupported;
      if (!partial && !isNonEmptyString(body.notes, 2000)) {
        errors.notes = "must be a non-empty string up to 2000 characters";
      }
      if (partial && Object.keys(body).length === 0) {
        errors.body = "must include notes or metrics";
      }
      if (body.notes !== undefined && !isNonEmptyString(body.notes, 2000)) {
        errors.notes = "must be a non-empty string up to 2000 characters";
      }
      if (body.metrics !== undefined && !isPlainObject(body.metrics)) {
        errors.metrics = "must be a JSON object";
      }
    }
    if (Object.keys(errors).length > 0) return validationError(res, errors);
    return next();
  };
}

module.exports = {
  validateProgressEntry,
  validateBulkEntries,
  validateListQuery,
  validateDateRange,
  validateReview,
};
