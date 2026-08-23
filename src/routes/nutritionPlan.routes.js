const Router = require("express").Router;

const controller = require("../controllers/nutritionPlan.controller");

const {
  validateNutritionPlan,
} = require("../middleware/nutritionPlanValidation.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const {
  resolvePlanTargetCustomer,
} = require("../middleware/planTargetCustomer.middleware");

const {
  authorizeNutritionPlanCustomerAccess,
  loadNutritionPlan,
  authorizeNutritionPlanEntryAccess,
} = require("../middleware/nutritionPlanAccess.middleware");

const router = Router();

/*
 * Customer creates a nutrition plan.
 * Trainer creates a plan for one of their PT-package customers
 * (customer_id in body). Admin can create for anyone.
 * AI-generated plans will also eventually be
 * created internally by the AI integration.
 */
router.post(
  "/",
  authorize(["customer", "trainer", "admin"]),
  resolvePlanTargetCustomer,
  validateNutritionPlan(),
  controller.create,
);

/*
 * Customer / assigned trainer / admin
 * view customer's nutrition-plan history.
 */
router.get(
  "/customers/:customerId",
  authorizeNutritionPlanCustomerAccess,
  controller.listByCustomer,
);

/*
 * Customer / assigned trainer / admin
 * view latest nutrition plan.
 */
router.get(
  "/customers/:customerId/latest",
  authorizeNutritionPlanCustomerAccess,
  controller.latest,
);

/*
 * Customer / assigned trainer / admin
 * view one nutrition plan.
 */
router.get(
  "/:id",
  loadNutritionPlan,
  authorizeNutritionPlanEntryAccess(),
  controller.getById,
);

/*
 * Customer / assigned trainer / admin
 * update a nutrition plan.
 */
router.patch(
  "/:id",
  loadNutritionPlan,
  authorizeNutritionPlanEntryAccess(),
  validateNutritionPlan({ partial: true }),
  controller.update,
);

/*
 * Customer can delete own plan.
 * Trainer cannot delete.
 * Admin can delete.
 */
router.delete(
  "/:id",
  loadNutritionPlan,
  authorizeNutritionPlanEntryAccess({
    allowTrainer: false,
  }),
  controller.remove,
);

module.exports = router;