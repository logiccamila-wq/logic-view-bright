const postgres = require("postgres");

let sqlClient;
let closePromise;

function getConnectionString() {
  return process.env.DATABASE_URL || "";
}

function getPool() {
  if (!sqlClient) {
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error("Database connection is not configured. Set DATABASE_URL.");
    }

    const sql = postgres(connectionString, {
      max: 10,
      ssl: "require",
      prepare: false,
    });

    sqlClient = {
      async query(statement, params = []) {
        const rows = await sql.unsafe(statement, params, { prepare: true });
        return {
          rows,
          rowCount: typeof rows.count === "number" ? rows.count : rows.length,
        };
      },
      async end() {
        if (!closePromise) {
          closePromise = sql.end({ timeout: 5 });
        }
        return closePromise;
      },
    };
  }

  return sqlClient;
}

async function closePool() {
  if (!sqlClient) return;
  await sqlClient.end();
  sqlClient = undefined;
  closePromise = undefined;
}

function isValidIdentifier(value) {
  return typeof value === "string" && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
}

function quoteIdentifier(id) {
  if (!isValidIdentifier(id)) {
    throw new Error(`Invalid identifier: ${id}`);
  }
  return `"${id}"`;
}

async function ensureAuthSchema() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = {
  getPool,
  closePool,
  quoteIdentifier,
  isValidIdentifier,
  ensureAuthSchema,
};
