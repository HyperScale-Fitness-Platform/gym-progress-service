const Router = require("express").Router;

const controller = require("../controllers/inbody.controller");

const {
  validateInBody,
} = require("../middleware/inbodyValidation.middleware");

const {
  authorize,
} = require("../middleware/role.middleware");

const {
  authorizeInBodyCustomerAccess,
  loadInBody,
  authorizeInBodyEntryAccess,
} = require("../middleware/inbodyAccess.middleware");

const router = Router();

/*
 * Customer creates their own InBody.
 * Admin can create for any customer.
 */
router.post(
  "/",
  authorize(["customer"]),
  validateInBody(),
  controller.create,
);

/*
 * Customer / assigned trainer / admin
 * view customer's InBody history.
 */
router.get(
  "/customers/:customerId",
  authorizeInBodyCustomerAccess,
  controller.listByCustomer,
);

/*
 * Customer / assigned trainer / admin
 * view latest InBody.
 */
router.get(
  "/customers/:customerId/latest",
  authorizeInBodyCustomerAccess,
  controller.latest,
);

/*
 * Customer / assigned trainer / admin
 * view one InBody record.
 */
router.get(
  "/:id",
  loadInBody,
  authorizeInBodyEntryAccess,
  controller.getById,
);

/*
 * Customer can edit own record.
 * Trainer can NOT edit customer's InBody.
 * Admin can edit any.
 */
router.patch(
  "/:id",
  loadInBody,
  authorizeInBodyEntryAccess({ allowTrainer: false }),
  validateInBody({ partial: true }),
  controller.update,
);

/*
 * Customer can delete own record.
 * Trainer cannot delete.
 * Admin can delete any.
 */
router.delete(
  "/:id",
  loadInBody,
  authorizeInBodyEntryAccess({ allowTrainer: false }),
  controller.remove,
);

module.exports = router;