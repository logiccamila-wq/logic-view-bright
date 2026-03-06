const { Pool } = require("pg");

let pool;

function getConnectionString() {
  const explicit = process.env.AZURE_POSTGRES_CONNECTION_STRING || process.env.DATABASE_URL;
  if (explicit) return explicit;

  const host = process.env.AZURE_POSTGRES_HOST;
  const port = process.env.AZURE_POSTGRES_PORT || "5432";
  const database = process.env.AZURE_POSTGRES_DB;
  const user = process.env.AZURE_POSTGRES_USER;
  const password = process.env.AZURE_POSTGRES_PASSWORD;

  if (!host || !database || !user || !password) {
    return "";
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function getPool() {
  if (!pool) {
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error("Database connection is not configured. Set AZURE_POSTGRES_* or DATABASE_URL.");
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pool;
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
  quoteIdentifier,
  isValidIdentifier,
  ensureAuthSchema,
};
