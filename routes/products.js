const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/products");

// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/:store", productController.getProducts);
router.post("/", upload.single("csvFile"), productController.createProduct);

module.exports = router;
