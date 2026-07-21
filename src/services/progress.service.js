const ProgressEntry = require("../models/progressEntry.model");

// Creates and persists one progress entry for a customer.
async function createEntry(data) {
  const entry = new ProgressEntry(data);
  return entry.save();
}

// Retrieves a single progress entry by its public application id.
async function getEntryById(id) {
  return ProgressEntry.findOne({ id }).lean();
}

// Lists a customer's entries with optional date filtering, pagination, and sorting.
async function getEntriesByCustomer(
  customerId,
  { from, to, page = 1, limit = 20, sort = "-entry_date" } = {},
) {
  const query = { customer_id: customerId };
  if (from || to) query.entry_date = {};
  if (from) query.entry_date.$gte = new Date(from);
  if (to) query.entry_date.$lte = new Date(to);

  const skip = (page - 1) * limit;
  const docs = await ProgressEntry.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();
  return docs;
}

// Updates the supplied fields of an existing progress entry.
async function updateEntry(id, patch) {
  return ProgressEntry.findOneAndUpdate(
    { id },
    { $set: patch },
    { new: true, runValidators: true },
  ).lean();
}

// Deletes a progress entry and returns the removed document when it exists.
async function deleteEntry(id) {
  return ProgressEntry.findOneAndDelete({ id });
}

// Inserts multiple progress entries for privileged bulk-import operations.
async function bulkImport(entries = []) {
  if (!Array.isArray(entries)) throw new Error("entries must be an array");
  return ProgressEntry.insertMany(entries, { ordered: false });
}

// Returns the most recent progress entry recorded for a customer.
async function getLatestByCustomer(customerId) {
  return ProgressEntry.findOne({ customer_id: customerId })
    .sort("-entry_date")
    .lean();
}

// Calculates a lightweight progress summary over a customer's selected date range.
async function getSummaryByCustomer(customerId, { from, to } = {}) {
  const query = { customer_id: customerId };
  if (from || to) query.entry_date = {};
  if (from) query.entry_date.$gte = new Date(from);
  if (to) query.entry_date.$lte = new Date(to);

  const entries = await ProgressEntry.find(query)
    .sort("entry_date")
    .select("entry_date weight_kg body_fat_pct")
    .lean();

  const first = entries[0] || null;
  const latest = entries.at(-1) || null;
  return {
    customer_id: customerId,
    entry_count: entries.length,
    first_entry: first,
    latest_entry: latest,
    weight_change_kg:
      first?.weight_kg != null && latest?.weight_kg != null
        ? latest.weight_kg - first.weight_kg
        : null,
    body_fat_change_pct:
      first?.body_fat_pct != null && latest?.body_fat_pct != null
        ? latest.body_fat_pct - first.body_fat_pct
        : null,
  };
}

// Appends a trainer-authored review to an existing progress entry.
async function addTrainerReview(id, review) {
  return ProgressEntry.findOneAndUpdate(
    { id },
    { $push: { trainer_reviews: review } },
    { new: true },
  ).lean();
}

// Updates the permitted fields of one embedded trainer review.
async function updateTrainerReview(id, reviewId, patch) {
  return ProgressEntry.findOneAndUpdate(
    { id, "trainer_reviews._id": reviewId },
    { $set: Object.fromEntries(Object.entries(patch).map(([key, value]) => [
      `trainer_reviews.$.${key}`,
      value,
    ])) },
    { new: true },
  ).lean();
}

// Removes one embedded trainer review from a progress entry.
async function deleteTrainerReview(id, reviewId) {
  return ProgressEntry.findOneAndUpdate(
    { id, "trainer_reviews._id": reviewId },
    { $pull: { trainer_reviews: { _id: reviewId } } },
    { new: true },
  ).lean();
}

module.exports = {
  createEntry,
  getEntryById,
  getEntriesByCustomer,
  updateEntry,
  deleteEntry,
  bulkImport,
  getLatestByCustomer,
  getSummaryByCustomer,
  addTrainerReview,
  updateTrainerReview,
  deleteTrainerReview,
};
