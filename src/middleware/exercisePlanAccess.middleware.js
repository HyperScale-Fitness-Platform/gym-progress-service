const ExercisePlan = require("../models/exercisePlan.model");
const {
  trainerHasCustomer,
} = require("../services/assignment.service");

async function hasActiveTrainerAssignment(
  trainerId,
  customerId,
) {
  return trainerHasCustomer(
    String(trainerId),
    String(customerId),
  );
}

async function authorizeExercisePlanCustomerAccess(
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

    const customerId =
      req.params.customerId ||
      req.params.customer_id ||
      req.query.customer_id;

    if (
      String(customerId) === String(req.user.id) ||
      req.user.role === "admin"
    ) {
      return next();
    }

    if (
      req.user.role === "trainer" &&
      (await hasActiveTrainerAssignment(
        req.user.id,
        customerId,
      ))
    ) {
      return next();
    }

    return res.status(403).json({
      message: "Forbidden",
    });
  } catch (error) {
    next(error);
  }
}

async function loadExercisePlan(req, res, next) {
  try {
    const record = await ExercisePlan.findOne({
      id: req.params.id,
    }).lean();

    if (!record) {
      return res.status(404).json({
        message: "Exercise plan not found",
      });
    }

    req.exercisePlanRecord = record;

    next();
  } catch (error) {
    next(error);
  }
}

function authorizeExercisePlanEntryAccess({
  allowTrainer = true,
} = {}) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      if (req.user.role === "admin") {
        return next();
      }

      if (
        String(req.exercisePlanRecord.customer_id) ===
        String(req.user.id)
      ) {
        return next();
      }

      if (
        allowTrainer &&
        req.user.role === "trainer" &&
        (await hasActiveTrainerAssignment(
          req.user.id,
          req.exercisePlanRecord.customer_id,
        ))
      ) {
        return next();
      }

      return res.status(403).json({
        message: "Forbidden",
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  authorizeExercisePlanCustomerAccess,
  loadExercisePlan,
  authorizeExercisePlanEntryAccess,
};