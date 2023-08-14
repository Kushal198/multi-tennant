const { pool } = require("../config/database");
const config = require("../config/dataMapping");
const fs = require("fs");
const csvParser = require("csv-parser");
const path = require("path");

const checkTennants = (tennant_id = null) => {
  if (tennant_id == config?.DARAZ_ID) {
    return {
      tennant_id: config?.DARAZ_ID,
      tennant_name: config.DARAZ_NAME,
      mapping_fields: config.DARAZ_MAPPING_FIELDS,
    };
  }
  if (tennant_id == config?.RED_DOKO_ID) {
    return {
      tennant_id: config?.RED_DOKO_ID,
      tennant_name: config?.RED_DOKO_NAME,
      mapping_fields: config.RED_DOKO_MAPPING_FIELDS,
    };
  }
};

exports.migrateData = async (sourceData, tennantInfo, res) => {
  try {
    await pool.query("BEGIN");
    let startDate = new Date();
    // Check the tennant
    const tennantId = tennantInfo?.id;

    if (!tennantId) {
      await pool.query("ROLLBACK");
      return res.json({ error: { message: "Permission denied!" } });
    }

    //checkTennant
    const tennant = checkTennants(tennantId);
    const csvData = sourceData.buffer.toString();

    if (tennant) {
      const mapping_fields = tennant.mapping_fields;
      const mappedData = [];
      // Pipe the CSV data into the parser
      const tempFilePath = path.join(__dirname, "temp.csv");
      fs.writeFileSync(tempFilePath, csvData);
      const readStream = fs.createReadStream(tempFilePath, {
        encoding: "utf-8",
      });

      const insertQuery = `
          INSERT INTO products (product_name, product_description, published, sale_price, compare_price,  quantity, tennant_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          ON CONFLICT DO NOTHING`;

      const insertIntoReport = `
      INSERT INTO reports (csv_name, total_rows, total_uploaded, start_date, end_date, tennant_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT DO NOTHING
      `;

      let repo = {};
      repo["csv_name"] = sourceData.originalname;
      repo["start_date"] = startDate;
      let row_count = 0;
      readStream
        .pipe(csvParser())
        .on("data", async (row) => {
          repo["total_rows"] = ++row_count;
          const mappedRow = {};

          for (const [header, mappedKey] of Object.entries(mapping_fields)) {
            if (mapping_fields.hasOwnProperty(header)) {
              if (mappedKey == "sale_price" || mappedKey == "compare_price") {
                mappedRow[mappedKey] = parseFloat(row[header])
                  ? parseFloat(row[header])
                  : 0.0;
              } else if (mappedKey == "quantity") {
                mappedRow[mappedKey] = parseInt(row[header])
                  ? parseInt(row[header])
                  : 0;
              } else {
                mappedRow[mappedKey] = row[header];
              }
            }
          }
          mappedRow["tennant_id"] = tennant.tennant_id;
          mappedData.push(mappedRow);
        })
        .on("end", async () => {
          for (const obj of mappedData) {
            let {
              product_name,
              product_description,
              published,
              sale_price,
              compare_price,
              quantity,
              tennant_id,
            } = obj;
            const values = [
              product_name,
              product_description,
              published,
              sale_price,
              compare_price,
              quantity,
              tennant_id,
            ];
            await pool.query(insertQuery, values);
          }
          repo["total_uploaded"] = mappedData.length;
          repo["end_date"] = new Date();
          repo["tennant_id"] = tennant.tennant_id;
          console.log(repo);
          await pool.query(insertIntoReport, [
            repo.csv_name,
            repo.total_rows,
            repo.total_uploaded,
            repo.start_date,
            repo.end_date,
            repo.tennant_id,
          ]);

          fs.unlink(tempFilePath, (error) => {
            if (error) {
              console.error("Error deleting temporary file:", error);
            }
            console.log("Temporary file deleted:", tempFilePath);
          });
          console.log("CSV processing complete");
        })
        .on("error", (err) => {
          return res.status(400).json({ error: "Error on parsing DAta" });
        });
      await pool.query("COMMIT");
      return res.json({ message: "Succesfully Uploaded All Products" });
    } else {
      return res
        .status(404)
        .json({ error: "Tennant Not configured in configuration." });
    }
  } catch (error) {
    await pool.query("ROLLBACK");
    return res.status(500).json({ error: "Some Error Occured" });
  }
};
