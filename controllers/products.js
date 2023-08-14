const { getTennat } = require("../config/database");
const { migrateData } = require("../utils/migration-tool");

const getProducts = async (req, res, next) => {
  const tennant_name = req.params.store;
  const client = await getTennat(tennant_name);

  try {
    // **** TRANSACTION ****
    await client.query("BEGIN");

    // Check the tennat
    const current_tennat = client.tennant;

    if (!current_tennat?.id) {
      await client.query("ROLLBACK");
      return res.json({ error: { message: "Permission denied!" } });
    }

    const { rows } = await client.query(
      `SELECT id, product_name, sale_price::INTEGER, compare_price::INTEGER, quantity, 
      product_description FROM products`
    );

    await client.query("COMMIT");
    return res.status(200).json({ product: rows });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createProduct = async (req, res, next) => {
  const { storeName } = req.body;
  const tennant_name = storeName;
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  const sourceData = req.file;

  const client = await getTennat(tennant_name);

  const current_tennant = client.tennant;

  await migrateData(sourceData, current_tennant, res, next);
};

module.exports = {
  createProduct,
  getProducts,
};
