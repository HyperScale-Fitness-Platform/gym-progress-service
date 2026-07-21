const service = require("../services/progress.service");

async function create(req, res, next) {
  try {
    const data = req.body;
    const created = await service.createEntry(data);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await service.getEntryById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { customer_id, from, to, page, limit, sort } = req.query;
    if (!customer_id)
      return res.status(400).json({ message: "customer_id query is required" });
    const docs = await service.getEntriesByCustomer(customer_id, {
      from,
      to,
      page,
      limit,
      sort,
    });
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

async function replace(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await service.updateEntry(id, req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await service.deleteEntry(id);
    if (!deleted) return res.status(404).json({ message: "Progress entry not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function addReview(req, res, next) {
  try {
    const entry = await service.addTrainerReview(req.params.id, {
      author_id: req.user.id,
      notes: req.body.notes,
      metrics: req.body.metrics,
    });
    if (!entry) return res.status(404).json({ message: "Progress entry not found" });
    return res.status(201).json(entry);
  } catch (err) {
    return next(err);
  }
}

async function updateReview(req, res, next) {
  try {
    const patch = {};
    if (req.body.notes !== undefined) patch.notes = req.body.notes;
    if (req.body.metrics !== undefined) patch.metrics = req.body.metrics;
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: "notes or metrics is required" });
    }

    const entry = await service.updateTrainerReview(
      req.params.id,
      req.params.reviewId,
      patch,
    );
    if (!entry) return res.status(404).json({ message: "Trainer review not found" });
    return res.json(entry);
  } catch (err) {
    return next(err);
  }
}

async function removeReview(req, res, next) {
  try {
    const entry = await service.deleteTrainerReview(
      req.params.id,
      req.params.reviewId,
    );
    if (!entry) return res.status(404).json({ message: "Trainer review not found" });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function bulk(req, res, next) {
  try {
    const created = await service.bulkImport(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function latestForCustomer(req, res, next) {
  try {
    const { customer_id } = req.params;
    const doc = await service.getLatestByCustomer(customer_id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

async function summaryForCustomer(req, res, next) {
  try {
    const summary = await service.getSummaryByCustomer(req.params.customer_id, {
      from: req.query.from,
      to: req.query.to,
    });
    return res.json(summary);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  getById,
  list,
  replace,
  remove,
  bulk,
  latestForCustomer,
  summaryForCustomer,
  addReview,
  updateReview,
  removeReview,
};
