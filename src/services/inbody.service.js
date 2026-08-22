const InBody = require("../models/inbodyRecord.model");

async function createInBody(data) {
  const entry = new InBody(data);
  return entry.save();
}

async function getInBodyById(id) {
  return InBody.findOne({ id }).lean();
}

async function getCustomerInBodyHistory(customerId, options = {}) {
  const {
    from,
    to,
    page = 1,
    limit = 20,
  } = options;

  const query = {
    customer_id: customerId,
  };

  if (from || to) {
    query.test_date = {};

    if (from) {
      query.test_date.$gte = new Date(from);
    }

    if (to) {
      query.test_date.$lte = new Date(to);
    }
  }

  const skip = (Number(page) - 1) * Number(limit);

  return InBody.find(query)
    .sort({ test_date: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();
}

async function getLatestInBody(customerId) {
  return InBody.findOne({
    customer_id: customerId,
  })
    .sort({ test_date: -1 })
    .lean();
}

async function updateInBody(id, customerId, patch) {
  return InBody.findOneAndUpdate(
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
    },
  ).lean();
}

async function deleteInBody(id, customerId) {
  return InBody.findOneAndDelete({
    id,
    customer_id: customerId,
  });
}

module.exports = {
  createInBody,
  getInBodyById,
  getCustomerInBodyHistory,
  getLatestInBody,
  updateInBody,
  deleteInBody,
};