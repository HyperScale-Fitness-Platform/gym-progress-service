const express = require("express");
const progressRoutes = require("./routes/progress.routes");
const inbodyRoutes = require("./routes/inbody.routes");
const auth = require("./middleware/auth.middleware");
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/errorHandler.middleware");
const exercisePlanRoutes = require("./routes/exercisePlan.routes");
const app = express();
const nutritionPlanRoutes = require("./routes/nutritionPlan.routes");

app.use(express.json());
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/ready", (req, res) => res.json({ ready: true }));
app.use("/progress", auth, progressRoutes);
app.use("/progress/inbody", auth, inbodyRoutes);
app.use("/progress/exercise-plans",auth, exercisePlanRoutes);
app.use("/progress/nutrition-plans",auth,nutritionPlanRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
