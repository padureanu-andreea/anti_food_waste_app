const express = require("express");
const { sequelize } = require("./models");

const inventoryRoutes = require("./routes/inventoryRoutes");
const claimRoutes = require("./routes/claimRoutes");
const integrationRoutes = require("./routes/integrationRoutes");

const app = express();
const port = 3000;

const authRouter = require("./routes/authRouter")
const productRouter = require("./routes/productRouter")
const feedRouter = require("./routes/feedRouter")
const groupRouter = require("./routes/groupRouter")
const debugGroupRouter = require("./routes/debugGroupRouter")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/inventory', inventoryRoutes);
app.use('/claims', claimRoutes);
app.use('/integrations', integrationRoutes);

app.listen(port, () => {
  console.log("The server is running on http://localhost:" + port);
});

// Middleware pentru erori
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
});


//aici pun base path
app.use("/auth",authRouter)
app.use("/products", productRouter)
app.use("/feed", feedRouter)
app.use("/groups",groupRouter)
app.use("/debug",debugGroupRouter)


// Ruta de test și sync DB 
app.get("/", async (req, res, next) => {
  try {
    await sequelize.sync({ force: true });
    res.status(201).json({ message: "Database connected and synced." });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
});

app.listen(port, () => {
  console.log("The server is running on http://localhost:" + port);
});