jest.mock("../../src/models/progressEntry.model", () => {
  const ProgressEntry = jest.fn();
  ProgressEntry.findOne = jest.fn();
  ProgressEntry.find = jest.fn();
  ProgressEntry.findOneAndUpdate = jest.fn();
  ProgressEntry.findOneAndDelete = jest.fn();
  ProgressEntry.insertMany = jest.fn();
  return ProgressEntry;
});

const ProgressEntry = require("../../src/models/progressEntry.model");
const service = require("../../src/services/progress.service");

describe("progress.service", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates and saves a progress entry", async () => {
    const data = { id: "entry-1", customer_id: "customer-1" };
    const saved = { ...data, _id: "mongo-id" };
    ProgressEntry.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(saved) }));

    await expect(service.createEntry(data)).resolves.toEqual(saved);
    expect(ProgressEntry).toHaveBeenCalledWith(data);
  });

  it("uses validated updates when changing an entry", async () => {
    const lean = jest.fn().mockResolvedValue({ id: "entry-1", weight_kg: 75 });
    ProgressEntry.findOneAndUpdate.mockReturnValue({ lean });

    await service.updateEntry("entry-1", { weight_kg: 75 });

    expect(ProgressEntry.findOneAndUpdate).toHaveBeenCalledWith(
      { id: "entry-1" },
      { $set: { weight_kg: 75 } },
      { new: true, runValidators: true },
    );
  });

  it("applies customer, date, pagination, and sort options when listing entries", async () => {
    const lean = jest.fn().mockResolvedValue([]);
    const limit = jest.fn().mockReturnValue({ lean });
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });
    ProgressEntry.find.mockReturnValue({ sort });

    await service.getEntriesByCustomer("customer-1", {
      from: "2026-07-01",
      to: "2026-07-31",
      page: 2,
      limit: 10,
      sort: "weight_kg",
    });

    expect(ProgressEntry.find).toHaveBeenCalledWith({
      customer_id: "customer-1",
      entry_date: {
        $gte: new Date("2026-07-01"),
        $lte: new Date("2026-07-31"),
      },
    });
    expect(sort).toHaveBeenCalledWith("weight_kg");
    expect(skip).toHaveBeenCalledWith(10);
    expect(limit).toHaveBeenCalledWith(10);
  });

  it("rejects a bulk import that is not an array", async () => {
    await expect(service.bulkImport({})).rejects.toThrow("entries must be an array");
  });
});
