const Router = require("express").Router;

const controller = require("../controllers/exercisePlan.controller");

const {
  validateExercisePlan,
} = require("../middleware/exercisePlanValidation.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const {
  resolvePlanTargetCustomer,
} = require("../middleware/planTargetCustomer.middleware");

const {
  authorizeExercisePlanCustomerAccess,
  loadExercisePlan,
  authorizeExercisePlanEntryAccess,
} = require("../middleware/exercisePlanAccess.middleware");

const router = Router();

/*
 * Customer creates their own exercise plan.
 * Trainer creates a plan for one of their PT-package customers
 * (customer_id in body). Admin can create for anyone.
 */
router.post(
  "/",
  authorize(["customer", "trainer", "admin"]),
  resolvePlanTargetCustomer,
  validateExercisePlan(),
  controller.create,
);

/*
 * Customer / assigned trainer / admin
 * view customer's exercise-plan history.
 */
router.get(
  "/customers/:customerId",
  authorizeExercisePlanCustomerAccess,
  controller.listByCustomer,
);

/*
 * Customer / assigned trainer / admin
 * view latest exercise plan.
 */
router.get(
  "/customers/:customerId/latest",
  authorizeExercisePlanCustomerAccess,
  controller.latest,
);

/*
 * Customer / assigned trainer / admin
 * view one exercise plan.
 */
router.get(
  "/:id",
  loadExercisePlan,
  authorizeExercisePlanEntryAccess(),
  controller.getById,
);

/*
 * Customer can edit own plan.
 * Assigned trainer can also edit it.
 * Admin can edit any.
 */
router.patch(
  "/:id",
  loadExercisePlan,
  authorizeExercisePlanEntryAccess(),
  validateExercisePlan({ partial: true }),
  controller.update,
);

/*
 * Customer can delete own plan.
 * Trainer cannot delete.
 * Admin can delete.
 */
router.delete(
  "/:id",
  loadExercisePlan,
  authorizeExercisePlanEntryAccess({
    allowTrainer: false,
  }),
  controller.remove,
);

module.exports = router;