const mongoose = require("mongoose");
const { Schema } = mongoose;

const TrainerAssignmentSchema = new Schema(
  {
    trainer_id: { type: String, required: true, trim: true, maxlength: 100 },
    customer_id: { type: String, required: true, trim: true, maxlength: 100 },
    active: { type: Boolean, default: true },
    assigned_at: { type: Date, default: Date.now },
    unassigned_at: { type: Date, default: null },
  },
  { timestamps: true },
);

TrainerAssignmentSchema.index({ trainer_id: 1, customer_id: 1 }, { unique: true });
TrainerAssignmentSchema.index({ customer_id: 1, active: 1 });

module.exports = mongoose.model("TrainerAssignment", TrainerAssignmentSchema);
