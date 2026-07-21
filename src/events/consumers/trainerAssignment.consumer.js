const TrainerAssignment = require("../../models/trainerAssignment.model");

async function handleTrainerAssigned({ trainer_id, customer_id }) {
  if (!trainer_id || !customer_id) {
    throw new Error("trainer_id and customer_id are required");
  }

  return TrainerAssignment.findOneAndUpdate(
    { trainer_id, customer_id },
    {
      $set: { active: true, unassigned_at: null },
      $setOnInsert: { assigned_at: new Date() },
    },
    { new: true, upsert: true, runValidators: true },
  ).lean();
}

async function handleTrainerUnassigned({ trainer_id, customer_id }) {
  if (!trainer_id || !customer_id) {
    throw new Error("trainer_id and customer_id are required");
  }

  return TrainerAssignment.findOneAndUpdate(
    { trainer_id, customer_id },
    { $set: { active: false, unassigned_at: new Date() } },
    { new: true },
  ).lean();
}

module.exports = { handleTrainerAssigned, handleTrainerUnassigned };
