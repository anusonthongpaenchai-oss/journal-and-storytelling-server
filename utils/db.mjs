import * as pg from "pg";

const { Pool } = pg.default;
const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
  console.error("CONNECTION_STRING is not set in environment variables");
}

const connectionPool = connectionString
  ? new Pool({ connectionString })
  : null;

export const isDbConfigured = Boolean(connectionString);

export default connectionPool;
