const Router = require("express").Router;
const controller = require("../controllers/progress.controller");
const {
  validateProgressEntry,
  validateBulkEntries,
  validateListQuery,
  validateDateRange,
  validateReview,
} = require("../middleware/progressValidation.middleware");
const { authorize, authorizeSelfOrRole } = require("../middleware/role.middleware");
const {
  loadEntry,
  authorizeCustomerAccess,
  authorizeEntryAccess,
  authorizeReviewAuthorOrRole,
} = require("../middleware/progressAccess.middleware");

const router = Router();

// Customers create only entries tied to their own gateway user id; admins may create any entry.
router.post(
  "/",
  validateProgressEntry(),
  authorizeSelfOrRole(["admin"], ["body.customer_id"]),
  controller.create,
);
// Bulk imports can affect many customers, so only administrators may perform them.
router.post("/bulk", authorize(["admin"]), validateBulkEntries, controller.bulk);

// Customers view their own latest entry; trainers require an active customer assignment; admins may view all.
router.get(
  "/customers/:customer_id/latest",
  authorizeCustomerAccess,
  controller.latestForCustomer,
);
// Customers view their own aggregate progress; trainers require an active customer assignment; admins may view all.
router.get(
  "/customers/:customer_id/summary",
  validateDateRange,
  authorizeCustomerAccess,
  controller.summaryForCustomer,
);

// Customers list their own entries; trainers require an active customer assignment; admins may view all.
router.get(
  "/",
  validateListQuery,
  authorizeCustomerAccess,
  controller.list,
);

// Entry-level ownership is loaded from the database because the customer id is not in the URL.
router.get(
  "/:id",
  loadEntry,
  authorizeEntryAccess(["admin"]),
  controller.getById,
);

// Customers may edit only their own loaded entry; trainers cannot alter client measurements; admins may edit any entry.
router.patch(
  "/:id",
  loadEntry,
  authorizeEntryAccess(["admin"], { allowTrainer: false }),
  validateProgressEntry({ partial: true }),
  controller.replace,
);

// PUT is retained for API compatibility and has the same customer/admin ownership rule as PATCH.
router.put(
  "/:id",
  loadEntry,
  authorizeEntryAccess(["admin"], { allowTrainer: false }),
  validateProgressEntry({ partial: true }),
  controller.replace,
);

// Customers may delete only their own loaded entry; trainers cannot delete client data; admins may delete any entry.
router.delete(
  "/:id",
  loadEntry,
  authorizeEntryAccess(["admin"], { allowTrainer: false }),
  controller.remove,
);

// Reviews are professional feedback: trainers need an active assignment and admins may review any entry.
router.post(
  "/:id/reviews",
  loadEntry,
  authorizeEntryAccess(["admin"]),
  authorize(["trainer", "admin"]),
  validateReview(),
  controller.addReview,
);

// Trainers need an active assignment and may edit only their own review; admins may edit any review.
router.patch(
  "/:id/reviews/:reviewId",
  loadEntry,
  authorizeEntryAccess(["admin"]),
  authorizeReviewAuthorOrRole(["admin"]),
  validateReview({ partial: true }),
  controller.updateReview,
);

// Trainers need an active assignment and may delete only their own review; admins may delete any review.
router.delete(
  "/:id/reviews/:reviewId",
  loadEntry,
  authorizeEntryAccess(["admin"]),
  authorizeReviewAuthorOrRole(["admin"]),
  controller.removeReview,
);

module.exports = router;
