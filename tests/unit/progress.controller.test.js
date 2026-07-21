jest.mock("../../src/services/progress.service", () => ({
  createEntry: jest.fn(),
  getEntryById: jest.fn(),
  getEntriesByCustomer: jest.fn(),
  updateEntry: jest.fn(),
  deleteEntry: jest.fn(),
  bulkImport: jest.fn(),
  getLatestByCustomer: jest.fn(),
  getSummaryByCustomer: jest.fn(),
  addTrainerReview: jest.fn(),
  updateTrainerReview: jest.fn(),
  deleteTrainerReview: jest.fn(),
}));

const service = require("../../src/services/progress.service");
const controller = require("../../src/controllers/progress.controller");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
}

describe("progress.controller", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates an entry and returns 201", async () => {
    const entry = { id: "entry-1" };
    service.createEntry.mockResolvedValue(entry);
    const res = createResponse();

    await controller.create({ body: entry }, res, jest.fn());

    expect(service.createEntry).toHaveBeenCalledWith(entry);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(entry);
  });

  it("returns 404 when deleting a missing entry", async () => {
    service.deleteEntry.mockResolvedValue(null);
    const res = createResponse();

    await controller.remove({ params: { id: "missing" } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Progress entry not found" });
  });

  it("sets the authenticated trainer as the review author", async () => {
    service.addTrainerReview.mockResolvedValue({ id: "entry-1" });
    const res = createResponse();

    await controller.addReview(
      {
        params: { id: "entry-1" },
        user: { id: "trainer-1" },
        body: { notes: "Great work", metrics: { goal_met: true } },
      },
      res,
      jest.fn(),
    );

    expect(service.addTrainerReview).toHaveBeenCalledWith("entry-1", {
      author_id: "trainer-1",
      notes: "Great work",
      metrics: { goal_met: true },
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("rejects review updates with no mutable fields", async () => {
    const res = createResponse();

    await controller.updateReview(
      { params: { id: "entry-1", reviewId: "review-1" }, body: {} },
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "notes or metrics is required" });
  });
});
