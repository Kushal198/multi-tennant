const express = require("express");
const { pool } = require("./config/database");

const app = express();

app.set("trust proxy", true); // populate req.ip
app.use(express.json());

const products = require("./routes/products");
app.use("/api/v1/products/", products);

const createTennant = async (req, res, next) => {
  const { storeName, fullName, email } = req.body;
  try {
    await pool.query(
      `INSERT INTO tennants (store_name, fullname, email) VALUES($1, $2, $3)`,
      [storeName, fullName, email]
    );
    return res.json({ message: "Tennant created successfully" });
  } catch (error) {
    next(error);
  }
};

app.post("/api/v1/tennants", createTennant);

const PORT = 8000;
app.listen(PORT, function () {
  console.log(`Express Server started on port ${PORT}`);
});
