const {
  publishPlanEvent,
  EXERCISE_PLAN_EVENTS,
  NUTRITION_PLAN_EVENTS,
} = require("../config/kafka");

function publishExercisePlanUpsert(plan) {
  if (!plan) {
    return;
  }

  return publishPlanEvent(EXERCISE_PLAN_EVENTS, {
    eventType: "upsert",
    plan,
  });
}

function publishNutritionPlanUpsert(plan) {
  if (!plan) {
    return;
  }

  return publishPlanEvent(NUTRITION_PLAN_EVENTS, {
    eventType: "upsert",
    plan,
  });
}

function publishExercisePlanDelete(plan) {
  if (!plan) {
    return;
  }

  return publishPlanEvent(EXERCISE_PLAN_EVENTS, {
    eventType: "delete",
    plan: { id: plan.id, customer_id: plan.customer_id },
  });
}

function publishNutritionPlanDelete(plan) {
  if (!plan) {
    return;
  }

  return publishPlanEvent(NUTRITION_PLAN_EVENTS, {
    eventType: "delete",
    plan: { id: plan.id, customer_id: plan.customer_id },
  });
}

module.exports = {
  publishExercisePlanUpsert,
  publishNutritionPlanUpsert,
  publishExercisePlanDelete,
  publishNutritionPlanDelete,
};
