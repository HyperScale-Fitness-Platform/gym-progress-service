function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.fromEntries(
        Object.entries(err.errors).map(([field, error]) => [field, error.message]),
      ),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid ${err.path}`,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "A progress entry with this id already exists",
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
}

module.exports = errorHandler;
