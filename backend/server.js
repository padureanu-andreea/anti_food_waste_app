// Express Initialisation
const express = require("express");
const app = express();
const port = 3000;

// Sequelize Initialisation
const sequelize = require("./config/db");

// Import created models


// Define relationship


// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Start Express
app.listen(port, () => {
  console.log("The server is running on http://localhost:" + port);
});

// 500 error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]:" + err);
  res.status(500).json({ message: "500 - Server Error" });
});

// Special GET endpoint to sync DB
app.get("/", async (req, res, next) => {
  try {
    await sequelize.sync({ alter: true });
    res.status(201).json({ message: "Database ok." });
  } catch (err) {
    next(err);
  }
});
