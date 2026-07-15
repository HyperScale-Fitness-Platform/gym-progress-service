const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  author_id: { type: String },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  metrics: { type: Schema.Types.Mixed },
});

const ProgressEntrySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    customer_id: { type: String, required: true, index: true },
    entry_date: { type: Date, required: true, index: true },
    weight_kg: { type: Number },
    body_fat_pct: { type: Number },
    inbody_data: { type: Schema.Types.Mixed },
    nutrition_log: { type: Schema.Types.Mixed },
    trainer_reviews: { type: [ReviewSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProgressEntry", ProgressEntrySchema);
