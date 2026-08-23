const NutritionPlan = require("../models/nutritionPlan.model");

async function createNutritionPlan(data) {
  const plan = new NutritionPlan(data);
  return plan.save();
}

async function getNutritionPlanById(id) {
  return NutritionPlan.findOne({ id }).lean();
}

async function getCustomerNutritionPlans(
  customerId,
  { from, to, page = 1, limit = 20 } = {},
) {
  const query = {
    customer_id: customerId,
  };

  if (from || to) {
    query.start_date = {};

    if (from) {
      query.start_date.$gte = new Date(from);
    }

    if (to) {
      query.start_date.$lte = new Date(to);
    }
  }

  const skip =
    (Number(page) - 1) * Number(limit);

  return NutritionPlan.find(query)
    .sort({ start_date: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();
}

async function getLatestNutritionPlan(customerId) {
  return NutritionPlan.findOne({
    customer_id: customerId,
  })
    .sort({ start_date: -1, createdAt: -1 })
    .lean();
}

async function getAllNutritionPlans() {
  return NutritionPlan.find({}).lean();
}

async function updateNutritionPlan(
  id,
  customerId,
  patch,
) {
  return NutritionPlan.findOneAndUpdate(
    {
      id,
      customer_id: customerId,
    },
    {
      $set: patch,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();
}

async function deleteNutritionPlan(
  id,
  customerId,
) {
  return NutritionPlan.findOneAndDelete({
    id,
    customer_id: customerId,
  });
}

module.exports = {
  getAllNutritionPlans,
  createNutritionPlan,
  getNutritionPlanById,
  getCustomerNutritionPlans,
  getLatestNutritionPlan,
  updateNutritionPlan,
  deleteNutritionPlan,
};