const express = require("express");
const { sequelize } = require("./models");

const productRoutes = require("./routes/productRoutes");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/products', productRoutes);

app.listen(port, () => {
  console.log("The server is running on http://localhost:" + port);
});

// Middleware pentru erori
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
});

// Ruta de test și sync DB 
app.get("/", async (req, res, next) => {
  try {
    await sequelize.sync({ alter: true });
    res.status(201).json({ message: "Database connected and synced." });
  } catch (err) {
    next(err);
  }
});