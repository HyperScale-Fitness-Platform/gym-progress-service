const ExercisePlan = require("../models/exercisePlan.model");

async function createExercisePlan(data) {
  const plan = new ExercisePlan(data);
  return plan.save();
}

async function getExercisePlanById(id) {
  return ExercisePlan.findOne({ id }).lean();
}

async function getCustomerExercisePlans(
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

  const skip = (Number(page) - 1) * Number(limit);

  return ExercisePlan.find(query)
    .sort({ start_date: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();
}

async function getLatestExercisePlan(customerId) {
  return ExercisePlan.findOne({
    customer_id: customerId,
  })
    .sort({ start_date: -1, createdAt: -1 })
    .lean();
}

async function getAllExercisePlans() {
  return ExercisePlan.find({}).lean();
}

async function updateExercisePlan(
  id,
  customerId,
  patch
) {
  const existing = await ExercisePlan.findOne({
    id,
    customer_id: customerId,
  });

  if (!existing) {
    return null;
  }

  const startDate =
    patch.start_date !== undefined
      ? new Date(patch.start_date)
      : existing.start_date;

  const endDate =
    patch.end_date !== undefined
      ? patch.end_date
        ? new Date(patch.end_date)
        : null
      : existing.end_date;

  if (
    endDate &&
    startDate &&
    endDate < startDate
  ) {
    const error = new Error(
      "End date cannot be before start date"
    );

    error.status = 400;

    throw error;
  }

  return ExercisePlan.findOneAndUpdate(
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
    }
  ).lean();
}


async function deleteExercisePlan(id, customerId) {
  return ExercisePlan.findOneAndDelete({
    id,
    customer_id: customerId,
  });
}

module.exports = {
  createExercisePlan,
  getExercisePlanById,
  getCustomerExercisePlans,
  getLatestExercisePlan,
  getAllExercisePlans,
  updateExercisePlan,
  deleteExercisePlan,
};