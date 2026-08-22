const InBodyRecord = require("../models/inbodyRecord.model");
const TrainerAssignment = require("../models/trainerAssignment.model");

async function hasActiveTrainerAssignment(trainerId, customerId) {
  return TrainerAssignment.exists({
    trainer_id: trainerId,
    customer_id: customerId,
    active: true,
  });
}

async function authorizeInBodyCustomerAccess(req, res, next) {
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
      (await hasActiveTrainerAssignment(req.user.id, customerId))
    ) {
      return next();
    }

    return res.status(403).json({
      message: "Forbidden",
    });
  } catch (error) {
    return next(error);
  }
}

async function loadInBody(req, res, next) {
  try {
    const record = await InBodyRecord.findOne({
      id: req.params.id,
    }).lean();

    if (!record) {
      return res.status(404).json({
        message: "InBody record not found",
      });
    }

    req.inBodyRecord = record;

    next();
  } catch (error) {
    next(error);
  }
}

function authorizeInBodyEntryAccess({ allowTrainer = true } = {}) {
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
        String(req.inBodyRecord.customer_id) ===
        String(req.user.id)
      ) {
        return next();
      }

      if (
        allowTrainer &&
        req.user.role === "trainer" &&
        (await hasActiveTrainerAssignment(
          req.user.id,
          req.inBodyRecord.customer_id,
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
  authorizeInBodyCustomerAccess,
  loadInBody,
  authorizeInBodyEntryAccess,
};