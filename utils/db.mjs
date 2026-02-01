import * as pg from "pg";

const { Pool } = pg.default;

if (!process.env.CONNECTION_STRING) {
    console.error("CONNECTION_STRING is not set in environment variables");
    throw new Error("CONNECTION_STRING is required");
}

const connectionPool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
})

export default connectionPool;