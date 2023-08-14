module.exports = {
  DARAZ_ID: process.env.DARAZ_ID,
  DARAZ_NAME: process.env.DARAZ_NAME,

  RED_DOKO_ID: process.env.RED_DOKO_ID,
  RED_DOKO_NAME: process.env.RED_DOKO_NAME,

  DARAZ_MAPPING_FIELDS: {
    Name: "product_name",
    "Short description": "product_description",
    Published: "published",
    "Regular price": "compare_price",
    "Sale price": "sale_price",
    "In stock?": "quantity",
  },
  RED_DOKO_MAPPING_FIELDS: {
    name: "product_name",
    short_description: "product_description",
    Published: "published",
    price: "compare_price",
    price: "sale_price",
    qty: "quantity",
  },

  //List of tennants
  tennants: [
    {
      tennant_id: process.env.DARAZ_ID || "",
      tennant_name: process.env.DARAZ_NAME || "",
      mapping_fields: {
        Name: "product_name",
        "Short description": "product_description",
        Published: "published",
        "Regular price": "compare_price",
        "Sale price": "sale_price",
        "In stock?": "quantity",
      },
    },
    {
      tennant_id: process.env.RED_DOKO_ID || "",
      tennant_name: process.env.RED_DOKO_NAME || "",
      mapping_fields: {
        name: "product_name",
        short_description: "product_description",
        Published: "published",
        price: "compare_price",
        price: "sale_price",
        qty: "quantity",
      },
    },
  ],
};
