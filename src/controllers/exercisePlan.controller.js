const service = require("../services/exercisePlan.service");
const {
  publishExercisePlanUpsert,
  publishExercisePlanDelete,
} = require("../events/planEvent.publisher");

async function create(req, res, next) {
    try {
        const data = {
            ...req.body,
            id: `exercise-plan-${Date.now()}`,
            customer_id:
                res.locals.planTargetCustomerId ||
                req.user.id,
            source:
                res.locals.requestedAiSource
                    ? "ai"
                    : req.user.role === "customer"
                        ? "customer"
                        : "trainer",
        };

        if (res.locals.createdByTrainerId) {
            data.created_by_trainer_id =
                res.locals.createdByTrainerId;
        }

        const created =
            await service.createExercisePlan(data);

        publishExercisePlanUpsert(created);

        return res.status(201).json(created);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const plan = await service.getExercisePlanById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                message: "Exercise plan not found",
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

        const plans = await service.getCustomerExercisePlans(
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
        const plan = await service.getLatestExercisePlan(
            req.params.customerId,
        );

        if (!plan) {
            return res.status(404).json({
                message: "No exercise plan found",
            });
        }

        return res.json(plan);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const updated = await service.updateExercisePlan(
            req.params.id,
            req.exercisePlanRecord.customer_id,
            req.body,
        );

        if (!updated) {
            return res.status(404).json({
                message: "Exercise plan not found",
            });
        }

        publishExercisePlanUpsert(updated);

        return res.json(updated);
    } catch (error) {
        next(error);
    }
}

async function remove(req, res, next) {
    try {
        const deleted = await service.deleteExercisePlan(
            req.params.id,
            req.exercisePlanRecord.customer_id,
        );

        if (!deleted) {
            return res.status(404).json({
                message: "Exercise plan not found",
            });
        }

        publishExercisePlanDelete(deleted);

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