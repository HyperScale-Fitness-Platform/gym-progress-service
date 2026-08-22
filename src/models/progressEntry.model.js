const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  author_id: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },
  notes: { type: String, required: true, trim: true, maxlength: 2000 },
  metrics: { type: Schema.Types.Mixed },
});

const ProgressEntrySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, immutable: true, trim: true, maxlength: 100 },
    customer_id: { type: String, required: true, immutable: true, trim: true, maxlength: 100 },
    entry_date: { type: Date, required: true, immutable: true },
    weight_kg: { type: Number, min: 0, max: 500 },
    body_fat_pct: { type: Number, min: 0, max: 100 },
    // inbody_data: { type: Schema.Types.Mixed },
    nutrition_log: { type: Schema.Types.Mixed },
    trainer_reviews: { type: [ReviewSchema], default: [] },
  },
  { timestamps: true },
);

ProgressEntrySchema.index({ customer_id: 1, entry_date: -1 });

module.exports = mongoose.model("ProgressEntry", ProgressEntrySchema);
