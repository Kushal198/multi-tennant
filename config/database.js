const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const {
  POSTGRES_USER,
  POSTGRES_USER_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  NODE_ENV,
} = process.env;

const DEV_NODE_ENV = NODE_ENV !== "production";

const pool = new Pool({
  host: DEV_NODE_ENV ? "127.0.0.1" : POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  user: POSTGRES_USER,
  password: POSTGRES_USER_PASSWORD,
  database: POSTGRES_DB,
  max: 15,
});

exports.getTennat = async (store_name) => {
  const client = await pool.connect();

  // Set tennant name session
  await client.query(
    `SELECT set_config('app.current_tennant_name', $1, FALSE)`,
    [store_name]
  );

  // Get the current tennant information
  const { rows: tennantRow } = await client.query(
    "SELECT id, store_name, fullname, email FROM tennants WHERE store_name = $1",
    [store_name]
  );

  if (tennantRow?.length > 0) {
    const current_tennant = tennantRow[0];
    client.tennant = current_tennant;

    // Set tennant id session
    const tennant_id = current_tennant.id;
    await client.query(
      `SELECT set_config('app.current_tennant_id', $1, FALSE)`,
      [tennant_id]
    );
  }

  const query = client.query;
  const release = client.release;

  client.release = async () => {
    // Resetting the session's state
    await client.query("DISCARD ALL", []);
    client.tennant = null;

    // Set the methods back to their old un-monkey-patched version
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  return client;
};

exports.pool = pool;
