const ProgressEntry = require("../models/progressEntry.model");
const TrainerAssignment = require("../models/trainerAssignment.model");

async function hasActiveTrainerAssignment(trainerId, customerId) {
  return TrainerAssignment.exists({
    trainer_id: trainerId,
    customer_id: customerId,
    active: true,
  });
}

async function authorizeCustomerAccess(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const customerId = req.params.customer_id || req.query.customer_id;
    if (String(customerId) === String(req.user.id) || req.user.role === "admin") {
      return next();
    }

    if (
      req.user.role === "trainer" &&
      (await hasActiveTrainerAssignment(req.user.id, customerId))
    ) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    return next(error);
  }
}

async function loadEntry(req, res, next) {
  try {
    const entry = await ProgressEntry.findOne({ id: req.params.id }).lean();
    if (!entry) return res.status(404).json({ message: "Progress entry not found" });

    req.progressEntry = entry;
    return next();
  } catch (error) {
    return next(error);
  }
}

function authorizeEntryAccess(allowedRoles = [], { allowTrainer = true } = {}) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      if (allowedRoles.includes(req.user.role)) return next();
      if (String(req.progressEntry.customer_id) === String(req.user.id)) return next();

      if (
        allowTrainer &&
        req.user.role === "trainer" &&
        (await hasActiveTrainerAssignment(req.user.id, req.progressEntry.customer_id))
      ) {
        return next();
      }

      return res.status(403).json({ message: "Forbidden" });
    } catch (error) {
      return next(error);
    }
  };
}

function authorizeReviewAuthorOrRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (allowedRoles.includes(req.user.role)) return next();

    const review = req.progressEntry.trainer_reviews.find(
      (item) => String(item._id) === String(req.params.reviewId),
    );
    if (!review) return res.status(404).json({ message: "Trainer review not found" });
    if (String(review.author_id) === String(req.user.id)) return next();

    return res.status(403).json({ message: "Forbidden" });
  };
}

module.exports = {
  loadEntry,
  authorizeCustomerAccess,
  authorizeEntryAccess,
  authorizeReviewAuthorOrRole,
};
