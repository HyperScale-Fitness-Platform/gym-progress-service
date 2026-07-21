const dotenv = require("dotenv");
dotenv.config();

require("./config/database");
const app = require("./app");

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`gym-progress-service listening on ${port}`);
});

module.exports = app;
