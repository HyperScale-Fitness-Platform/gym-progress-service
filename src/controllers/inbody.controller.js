const service = require("../services/inbody.service");

// async function create(req, res, next) {
//   try {
//     const data = {
//       ...req.body,
//       customer_id: req.user.id,
//     };

//     const created = await service.createInBody(data);

//     return res.status(201).json(created);
//   } catch (error) {
//     next(error);
//   }
// }

async function create(req, res, next) {
  try {
    console.log("1. CREATE ROUTE REACHED");

    const data = {
      ...req.body,
      customer_id: req.user.id,
    };

    console.log("2. DATA:", data);

    const created = await service.createInBody(data);

    console.log("3. CREATED:", created);

    return res.status(201).json(created);
  } catch (error) {
    console.error("CREATE ERROR:", error);
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const record = await service.getInBodyById(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "InBody record not found",
      });
    }

    return res.json(record);
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

    const records = await service.getCustomerInBodyHistory(
      req.params.customerId,
      {
        from,
        to,
        page,
        limit,
      },
    );

    return res.json(records);
  } catch (error) {
    next(error);
  }
}

async function latest(req, res, next) {
  try {
    const record = await service.getLatestInBody(
      req.params.customerId,
    );

    if (!record) {
      return res.status(404).json({
        message: "No InBody record found",
      });
    }

    return res.json(record);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const updated = await service.updateInBody(
      req.params.id,
      req.inBodyRecord.customer_id,
      req.body,
    );

    if (!updated) {
      return res.status(404).json({
        message: "InBody record not found",
      });
    }

    return res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await service.deleteInBody(
      req.params.id,
      req.inBodyRecord.customer_id,
    );

    if (!deleted) {
      return res.status(404).json({
        message: "InBody record not found",
      });
    }

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