const express = require("express");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = 3001;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Users Service is running"
  });
});

app.use(userRoutes);

app.listen(PORT, () => {
  console.log(`Users Service is running on port ${PORT}`);
});