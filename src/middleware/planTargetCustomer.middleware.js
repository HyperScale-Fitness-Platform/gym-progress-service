const {
  trainerHasCustomer,
} = require("../services/assignment.service");

/*
 * Resolves the customer a plan is being created for.
 *
 * - customers always create for themselves
 * - trainers must pass customer_id in the body and
 *   must have an active/exhausted PT package with
 *   that customer (verified against operations)
 * - admins may pass any customer_id (defaults self)
 *
 * The resolved id is stored on res.locals and the raw
 * field removed from req.body so validation middleware
 * never rejects it as an unsupported field.
 */
async function resolvePlanTargetCustomer(
  req,
  res,
  next,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const requested = req.body
      ? req.body.customer_id
      : undefined;

    /*
     * Customers may flag an AI-generated plan at
     * adoption time; any other value is ignored.
     */
    const requestedSource = req.body
      ? req.body.source
      : undefined;

    const requestedAiSource =
      requestedSource === "ai" &&
      req.user.role === "customer";

    let targetCustomerId;

    if (req.user.role === "trainer") {
      if (
        !requested ||
        typeof requested !== "string" ||
        !requested.trim()
      ) {
        return res.status(400).json({
          message:
            "customer_id is required when a trainer creates a plan for a customer",
        });
      }

      const allowed =
        await trainerHasCustomer(
          req.user.id,
          requested.trim(),
        );

      if (!allowed) {
        return res.status(403).json({
          message:
            "Trainer has no PT package relationship with this customer",
        });
      }

      targetCustomerId = requested.trim();
    } else if (req.user.role === "admin") {
      targetCustomerId =
        requested && String(requested).trim()
          ? String(requested).trim()
          : req.user.id;
    } else {
      if (
        requested &&
        String(requested) !== String(req.user.id)
      ) {
        return res.status(403).json({
          message:
            "Customers can only create plans for themselves",
        });
      }

      targetCustomerId = req.user.id;
    }

    if (req.body) {
      delete req.body.customer_id;
      delete req.body.source;
    }

    res.locals.planTargetCustomerId =
      targetCustomerId;

    res.locals.requestedAiSource = requestedAiSource;

    res.locals.createdByTrainerId =
      req.user.role === "trainer"
        ? req.user.id
        : null;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  resolvePlanTargetCustomer,
};
