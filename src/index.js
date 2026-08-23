const dotenv = require("dotenv");
dotenv.config();

require("./config/database");
const app = require("./app");
const exercisePlanService = require("./services/exercisePlan.service");
const nutritionPlanService = require("./services/nutritionPlan.service");
const {
  publishExercisePlanUpsert,
  publishNutritionPlanUpsert,
} = require("./events/planEvent.publisher");
const { connectPlanProducer } = require("./config/kafka");

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`gym-progress-service listening on ${port}`);
});

/*
 * Backfill: republish every existing plan as an upsert so
 * consumers (AI plan-history projection) converge without a
 * manual migration. Idempotent on the consumer side.
 */
async function backfillPlanEvents() {
  await connectPlanProducer();

  try {
    const exercisePlans =
      await exercisePlanService.getAllExercisePlans();

    for (const plan of exercisePlans) {
      await publishExercisePlanUpsert(plan);
    }

    console.log(
      `Backfilled ${exercisePlans.length} exercise-plan events`,
    );
  } catch (error) {
    console.error(
      "Exercise plan backfill failed:",
      error.message,
    );
  }

  try {
    const nutritionPlans =
      await nutritionPlanService.getAllNutritionPlans();

    for (const plan of nutritionPlans) {
      await publishNutritionPlanUpsert(plan);
    }

    console.log(
      `Backfilled ${nutritionPlans.length} nutrition-plan events`,
    );
  } catch (error) {
    console.error(
      "Nutrition plan backfill failed:",
      error.message,
    );
  }
}

backfillPlanEvents().catch((error) =>
  console.error(
    "Plan event backfill crashed:",
    error.message,
  ),
);

module.exports = app;
