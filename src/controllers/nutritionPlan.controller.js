const service = require("../services/nutritionPlan.service");
const {
  publishNutritionPlanUpsert,
  publishNutritionPlanDelete,
} = require("../events/planEvent.publisher");

async function create(req, res, next) {
  try {
    const data = {
      ...req.body,
      id:
        req.body.id ||
        `nutrition-plan-${Date.now()}`,
      customer_id:
        res.locals.planTargetCustomerId ||
        req.user.id,
      generated_by: req.body.generated_by || "trainer",
    };

    if (res.locals.createdByTrainerId) {
      data.created_by_trainer_id =
        res.locals.createdByTrainerId;
    }

    const created =
      await service.createNutritionPlan(data);

    publishNutritionPlanUpsert(created);

    return res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const plan =
      await service.getNutritionPlanById(
        req.params.id,
      );

    if (!plan) {
      return res.status(404).json({
        message: "Nutrition plan not found",
      });
    }

    return res.json(plan);
  } catch (error) {
    next(error);
  }
}

async function listByCustomer(req, res, next) {
  try {
    const {
      from,
      to,
      page = 1,
      limit = 20,
    } = req.query;

    const plans =
      await service.getCustomerNutritionPlans(
        req.params.customerId,
        {
          from,
          to,
          page,
          limit,
        },
      );

    return res.json(plans);
  } catch (error) {
    next(error);
  }
}

async function latest(req, res, next) {
  try {
    const plan =
      await service.getLatestNutritionPlan(
        req.params.customerId,
      );

    if (!plan) {
      return res.status(404).json({
        message: "No nutrition plan found",
      });
    }

    return res.json(plan);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const updated =
      await service.updateNutritionPlan(
        req.params.id,
        req.nutritionPlanRecord.customer_id,
        req.body,
      );

    if (!updated) {
      return res.status(404).json({
        message: "Nutrition plan not found",
      });
    }

    publishNutritionPlanUpsert(updated);

    return res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted =
      await service.deleteNutritionPlan(
        req.params.id,
        req.nutritionPlanRecord.customer_id,
      );

    if (!deleted) {
      return res.status(404).json({
        message: "Nutrition plan not found",
      });
    }

    publishNutritionPlanDelete(deleted);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  getById,
  listByCustomer,
  latest,
  update,
  remove,
};