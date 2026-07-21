const request = require("supertest");
const mongoose = require("mongoose");

// Fedora is mapped to a discontinued RHEL 8 archive by mongodb-memory-server v8.
// The Ubuntu 22.04 MongoDB 7 build is available and uses the current OpenSSL ABI.
process.env.MONGOMS_DISTRO = "ubuntu-22.04";

const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const ProgressEntry = require("../../src/models/progressEntry.model");
const TrainerAssignment = require("../../src/models/trainerAssignment.model");

let mongoServer;

// First execution may need to download the MongoDB 7 binary before the server can start.
jest.setTimeout(120000);

function entry(overrides = {}) {
  return {
    id: "entry-1",
    customer_id: "customer-1",
    entry_date: "2026-07-16T08:00:00.000Z",
    weight_kg: 82.4,
    body_fat_pct: 18.2,
    ...overrides,
  };
}
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: "7.0.14" },
    instance: {
      storageEngine: "wiredTiger",
    },
  });
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;
  await Promise.all([
    ProgressEntry.deleteMany({}),
    TrainerAssignment.deleteMany({}),
  ]);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe("integration: progress routes", () => {
  it("creates an entry for its owner and rejects another customer", async () => {
    const created = await request(app)
      .post("/api/progress")
      .set("user-id", "customer-1")
      .set("user-role", "customer")
      .send(entry());

    expect(created.status).toBe(201);
    expect(created.body.customer_id).toBe("customer-1");

    const forbidden = await request(app)
      .get("/api/progress/entry-1")
      .set("user-id", "customer-2")
      .set("user-role", "customer");

    expect(forbidden.status).toBe(403);
  });

  it("allows an assigned trainer, but denies an unassigned trainer", async () => {
    await ProgressEntry.create(entry());
    await TrainerAssignment.create({
      trainer_id: "trainer-1",
      customer_id: "customer-1",
    });

    const allowed = await request(app)
      .get("/api/progress/entry-1")
      .set("user-id", "trainer-1")
      .set("user-role", "trainer");
    const forbidden = await request(app)
      .get("/api/progress/entry-1")
      .set("user-id", "trainer-2")
      .set("user-role", "trainer");

    expect(allowed.status).toBe(200);
    expect(forbidden.status).toBe(403);
  });

  it("allows an admin to read any customer entry", async () => {
    await ProgressEntry.create(entry());

    const response = await request(app)
      .get("/api/progress/entry-1")
      .set("user-id", "admin-1")
      .set("user-role", "admin");

    expect(response.status).toBe(200);
  });

  it("allows only the assigned review author to update a trainer review", async () => {
    await ProgressEntry.create(entry());
    await TrainerAssignment.create([
      { trainer_id: "trainer-1", customer_id: "customer-1" },
      { trainer_id: "trainer-2", customer_id: "customer-1" },
    ]);

    const created = await request(app)
      .post("/api/progress/entry-1/reviews")
      .set("user-id", "trainer-1")
      .set("user-role", "trainer")
      .send({ notes: "Good progress" });
    const reviewId = created.body.trainer_reviews[0]._id;

    const forbidden = await request(app)
      .patch(`/api/progress/entry-1/reviews/${reviewId}`)
      .set("user-id", "trainer-2")
      .set("user-role", "trainer")
      .send({ notes: "Different review" });
    const allowed = await request(app)
      .patch(`/api/progress/entry-1/reviews/${reviewId}`)
      .set("user-id", "trainer-1")
      .set("user-role", "trainer")
      .send({ notes: "Updated review" });

    expect(created.status).toBe(201);
    expect(forbidden.status).toBe(403);
    expect(allowed.status).toBe(200);
    expect(allowed.body.trainer_reviews[0].notes).toBe("Updated review");
  });

  it("rejects immutable entry fields and invalid list queries", async () => {
    await ProgressEntry.create(entry());

    const update = await request(app)
      .patch("/api/progress/entry-1")
      .set("user-id", "customer-1")
      .set("user-role", "customer")
      .send({ customer_id: "customer-2" });
    const list = await request(app)
      .get("/api/progress?customer_id=customer-1&page=0")
      .set("user-id", "customer-1");

    expect(update.status).toBe(400);
    expect(list.status).toBe(400);
  });
});
