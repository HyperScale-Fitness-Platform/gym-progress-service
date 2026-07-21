const express = require("express");
const progressRoutes = require("./routes/progress.routes");
const auth = require("./middleware/auth.middleware");
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/errorHandler.middleware");

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/ready", (req, res) => res.json({ ready: true }));
app.use("/api/progress", auth, progressRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
