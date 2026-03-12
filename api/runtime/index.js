const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { getPool, quoteIdentifier, ensureAuthSchema, isValidIdentifier } = require("../shared/db");

const JWT_SECRET = process.env.AZURE_JWT_SECRET || process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = process.env.AZURE_JWT_EXPIRES_IN || "7d";
const DEFAULT_SCHEMA = "public";

const DEMO_EMAIL = (process.env.DEMO_EMAIL || "demo@xyzlogicflow.com.br").toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo123";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@xyzlogicflow.com.br").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function isDatabaseConfigured() {
  return Boolean(
    process.env.AZURE_POSTGRES_CONNECTION_STRING ||
      process.env.DATABASE_URL ||
      (process.env.AZURE_POSTGRES_HOST &&
        process.env.AZURE_POSTGRES_DB &&
        process.env.AZURE_POSTGRES_USER &&
        process.env.AZURE_POSTGRES_PASSWORD)
  );
}

function getAllowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function resolveCorsOrigin(req) {
  const configuredOrigins = getAllowedOrigins();
  if (!configuredOrigins.length) return "*";

  const origin = req.headers?.origin;
  if (origin && configuredOrigins.includes(origin)) {
    return origin;
  }

  return configuredOrigins[0] || "";
}

function normalizeLoginIdentifier(raw) {
  const value = String(raw || "").toLowerCase().trim();
  if (value === "demo") return DEMO_EMAIL;
  if (value === "admin") return ADMIN_EMAIL;
  return value;
}

async function ensureDefaultUser({ email, password, fullName, role }) {
  const pool = getPool();
  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!normalizedEmail || !password) return;

  const exists = await pool.query(`SELECT id FROM app_users WHERE email = $1 LIMIT 1`, [normalizedEmail]);
  if (exists.rowCount) return;

  const userId = randomUUID();
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO app_users (id, email, password_hash, full_name) VALUES ($1, $2, $3, $4)`,
    [userId, normalizedEmail, hash, fullName || ""]
  );

  // Compatibility tables may not exist in all databases.
  await pool
    .query(
      `INSERT INTO profiles (id, email, full_name) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name`,
      [userId, normalizedEmail, fullName || ""]
    )
    .catch(() => null);

  await pool
    .query(`INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userId, role])
    .catch(() => null);
}

async function ensureDefaultAccessUsers() {
  await ensureDefaultUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    fullName: "Usuario Demo",
    role: "driver",
  });

  await ensureDefaultUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    fullName: "Administrador",
    role: "admin",
  });
}

function json(req, status, body) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": resolveCorsOrigin(req),
      Vary: "Origin",
      "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function parseSegments(req) {
  const route = req.params?.segments || "";
  return route.split("/").filter(Boolean);
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function getBearerToken(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth || typeof auth !== "string") return "";
  if (!auth.toLowerCase().startsWith("bearer ")) return "";
  return auth.slice(7).trim();
}

function getAuthUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function buildSelectColumns(select) {
  if (!select || select === "*") return "*";
  const columns = String(select)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (!columns.length) return "*";
  return columns
    .map((column) => {
      if (column === "*") return "*";
      return quoteIdentifier(column);
    })
    .join(", ");
}

function buildWhere(filters = [], startIndex = 1) {
  let idx = startIndex;
  const clauses = [];
  const values = [];

  for (const f of filters) {
    const op = (f.op || "eq").toLowerCase();
    const column = quoteIdentifier(f.column);
    const value = f.value;

    if (op === "is") {
      if (value === null || String(value).toLowerCase() === "null") {
        clauses.push(`${column} IS NULL`);
      } else {
        clauses.push(`${column} IS NOT NULL`);
      }
      continue;
    }

    if (op === "in") {
      const arr = Array.isArray(value) ? value : [];
      if (!arr.length) {
        clauses.push("1=0");
        continue;
      }
      const placeholders = arr.map(() => `$${idx++}`);
      clauses.push(`${column} IN (${placeholders.join(",")})`);
      values.push(...arr);
      continue;
    }

    const map = {
      eq: "=",
      neq: "!=",
      gt: ">",
      gte: ">=",
      lt: "<",
      lte: "<=",
      like: "LIKE",
      ilike: "ILIKE",
    };

    const sqlOp = map[op] || "=";
    clauses.push(`${column} ${sqlOp} $${idx++}`);
    values.push(value);
  }

  if (!clauses.length) {
    return { sql: "", values, nextIndex: idx };
  }

  return {
    sql: ` WHERE ${clauses.join(" AND ")}`,
    values,
    nextIndex: idx,
  };
}

async function handleAuth(path, req) {
  await ensureAuthSchema();
  const pool = getPool();
  const body = parseBody(req);

  if (path[1] === "signup") {
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const fullName = body.fullName || body.full_name || "";
    const role = body.role || "driver";

    if (!email || !password) return json(req, 400, { error: { message: "email and password are required" } });

    const exists = await pool.query("SELECT id FROM app_users WHERE email = $1", [email]);
    if (exists.rowCount) {
      return json(req, 400, { error: { message: "Email already registered" } });
    }

    const userId = randomUUID();
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO app_users (id, email, password_hash, full_name) VALUES ($1,$2,$3,$4)`,
      [userId, email, hash, fullName]
    );

    // Keep compatibility with existing UI that reads profiles and user_roles
    await pool.query(
      `INSERT INTO profiles (id, email, full_name) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name`,
      [userId, email, fullName]
    ).catch(() => null);

    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, role]
    ).catch(() => null);

    const token = jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const user = { id: userId, email, user_metadata: { full_name: fullName } };
    return json(req, 200, { data: { user, session: { access_token: token, user } }, error: null });
  }

  if (path[1] === "signin") {
    await ensureDefaultAccessUsers();

    const email = normalizeLoginIdentifier(body.email);
    const password = String(body.password || "");
    if (!email || !password) return json(req, 400, { error: { message: "email and password are required" } });

    const rs = await pool.query(
      `SELECT id, email, password_hash, full_name FROM app_users WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (!rs.rowCount) return json(req, 401, { data: { user: null, session: null }, error: { message: "Invalid credentials" } });
    const row = rs.rows[0];
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return json(req, 401, { data: { user: null, session: null }, error: { message: "Invalid credentials" } });

    const token = jwt.sign({ sub: row.id, email: row.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const user = { id: row.id, email: row.email, user_metadata: { full_name: row.full_name || "" } };
    return json(req, 200, { data: { user, session: { access_token: token, user } }, error: null });
  }

  if (path[1] === "session") {
    const auth = getAuthUser(req);
    if (!auth) return json(req, 200, { data: { session: null }, error: null });
    const user = { id: auth.sub, email: auth.email };
    return json(req, 200, { data: { session: { access_token: getBearerToken(req), user } }, error: null });
  }

  if (path[1] === "user") {
    const auth = getAuthUser(req);
    if (!auth) return json(req, 200, { data: { user: null }, error: null });
    const rs = await pool.query(`SELECT id, email, full_name FROM app_users WHERE id = $1 LIMIT 1`, [auth.sub]);
    if (!rs.rowCount) return json(req, 200, { data: { user: null }, error: null });
    const row = rs.rows[0];
    return json(req, 200, { data: { user: { id: row.id, email: row.email, user_metadata: { full_name: row.full_name || "" } } }, error: null });
  }

  if (path[1] === "update-user") {
    const auth = getAuthUser(req);
    if (!auth) return json(req, 401, { error: { message: "Unauthorized" } });
    const newPassword = String(body.password || "");
    if (!newPassword || newPassword.length < 6) {
      return json(req, 400, { error: { message: "Password must have at least 6 characters" } });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE app_users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [hash, auth.sub]);
    return json(req, 200, { data: { user: { id: auth.sub, email: auth.email } }, error: null });
  }

  if (path[1] === "reset-password") {
    // Azure-only baseline: accepts request and returns success. Integrate Azure Communication Services in next step.
    return json(req, 200, { data: { sent: true }, error: null });
  }

  if (path[1] === "signout") {
    return json(req, 200, { error: null });
  }

  return json(req, 404, { error: { message: "Auth route not found" } });
}

function parseOrExpression(expr) {
  // Supports patterns like: "placa.ilike.%abc%,modelo.ilike.%abc%"
  if (!expr) return null;
  const parts = String(expr).split(",").map((p) => p.trim()).filter(Boolean);
  const clauses = [];
  const values = [];
  let i = 1;

  for (const p of parts) {
    const [col, op, ...rest] = p.split(".");
    if (!col || !op) continue;
    const value = rest.join(".");
    if (!isValidIdentifier(col)) continue;

    if (op === "ilike") {
      clauses.push(`${quoteIdentifier(col)} ILIKE $${i++}`);
      values.push(value);
    }
  }

  if (!clauses.length) return null;
  return { sql: `(${clauses.join(" OR ")})`, values };
}

async function handleQuery(req) {
  const pool = getPool();
  const body = parseBody(req);
  const table = body.table;
  const schema = body.schema || DEFAULT_SCHEMA;
  const filters = Array.isArray(body.filters) ? body.filters : [];
  const select = body.select || "*";
  const single = !!body.single;
  const maybeSingle = !!body.maybeSingle;
  const limit = Number.isFinite(body.limit) ? Number(body.limit) : null;
  const range = body.range || null;
  const orExpr = body.or || null;

  if (!isValidIdentifier(schema) || !isValidIdentifier(table)) {
    return json(req, 400, { data: null, error: { message: "Invalid schema/table" } });
  }

  const selectColumns = buildSelectColumns(select);
  const baseFrom = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
  const where = buildWhere(filters, 1);

  const extraClauses = [];
  const params = [...where.values];
  let idx = where.nextIndex;

  if (orExpr) {
    const parsedOr = parseOrExpression(orExpr);
    if (parsedOr) {
      const normalized = parsedOr.sql.replace(/\$(\d+)/g, () => `$${idx++}`);
      extraClauses.push(normalized);
      params.push(...parsedOr.values);
    }
  }

  let whereSql = where.sql;
  if (extraClauses.length) {
    whereSql += whereSql ? ` AND ${extraClauses.join(" AND ")}` : ` WHERE ${extraClauses.join(" AND ")}`;
  }

  const order = Array.isArray(body.order) ? body.order : [];
  const orderSql = order.length
    ? ` ORDER BY ${order
        .filter((o) => isValidIdentifier(o.column))
        .map((o) => `${quoteIdentifier(o.column)} ${o.ascending === false ? "DESC" : "ASC"}`)
        .join(", ")}`
    : "";

  let limitSql = "";
  if (range && Number.isFinite(range.from) && Number.isFinite(range.to)) {
    const take = Math.max(0, Number(range.to) - Number(range.from) + 1);
    limitSql = ` LIMIT ${take} OFFSET ${Math.max(0, Number(range.from))}`;
  } else if (limit && limit > 0) {
    limitSql = ` LIMIT ${Math.floor(limit)}`;
  }

  const sql = `SELECT ${selectColumns} FROM ${baseFrom}${whereSql}${orderSql}${limitSql}`;
  const rs = await pool.query(sql, params);

  if (single) {
    if (!rs.rows.length) return json(req, 406, { data: null, error: { message: "No rows" } });
    return json(req, 200, { data: rs.rows[0], error: null });
  }

  if (maybeSingle) {
    return json(req, 200, { data: rs.rows[0] || null, error: null });
  }

  return json(req, 200, { data: rs.rows, error: null });
}

async function handleMutate(req) {
  const pool = getPool();
  const body = parseBody(req);
  const action = String(body.action || "").toLowerCase();
  const schema = body.schema || DEFAULT_SCHEMA;
  const table = body.table;
  const filters = Array.isArray(body.filters) ? body.filters : [];
  const returning = body.returning || "*";

  if (!isValidIdentifier(schema) || !isValidIdentifier(table)) {
    return json(req, 400, { data: null, error: { message: "Invalid schema/table" } });
  }

  const fullTable = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;

  if (action === "insert") {
    const rows = Array.isArray(body.values) ? body.values : [body.values || {}];
    if (!rows.length) return json(req, 400, { data: null, error: { message: "Insert values required" } });

    const columns = Object.keys(rows[0] || {}).filter(isValidIdentifier);
    if (!columns.length) return json(req, 400, { data: null, error: { message: "No valid columns for insert" } });

    let idx = 1;
    const values = [];
    const valueSql = rows
      .map((r) => {
        const placeholders = columns.map((c) => {
          values.push(r[c]);
          return `$${idx++}`;
        });
        return `(${placeholders.join(",")})`;
      })
      .join(",");

    const sql = `INSERT INTO ${fullTable} (${columns.map(quoteIdentifier).join(",")}) VALUES ${valueSql} RETURNING ${buildSelectColumns(returning)}`;
    const rs = await pool.query(sql, values);
    return json(req, 200, { data: rs.rows, error: null });
  }

  if (action === "upsert") {
    const rows = Array.isArray(body.values) ? body.values : [body.values || {}];
    const conflict = Array.isArray(body.onConflict) ? body.onConflict.filter(isValidIdentifier) : [];
    if (!rows.length) return json(req, 400, { data: null, error: { message: "Upsert values required" } });
    if (!conflict.length) return json(req, 400, { data: null, error: { message: "onConflict is required for upsert" } });

    const columns = Object.keys(rows[0] || {}).filter(isValidIdentifier);
    if (!columns.length) return json(req, 400, { data: null, error: { message: "No valid columns for upsert" } });

    let idx = 1;
    const values = [];
    const valueSql = rows
      .map((r) => {
        const placeholders = columns.map((c) => {
          values.push(r[c]);
          return `$${idx++}`;
        });
        return `(${placeholders.join(",")})`;
      })
      .join(",");

    const updateColumns = columns.filter((c) => !conflict.includes(c));
    const updateSql = updateColumns
      .map((c) => `${quoteIdentifier(c)} = EXCLUDED.${quoteIdentifier(c)}`)
      .join(", ");

    const sql = `
      INSERT INTO ${fullTable} (${columns.map(quoteIdentifier).join(",")})
      VALUES ${valueSql}
      ON CONFLICT (${conflict.map(quoteIdentifier).join(",")}) DO UPDATE
      SET ${updateSql}
      RETURNING ${buildSelectColumns(returning)}
    `;

    const rs = await pool.query(sql, values);
    return json(req, 200, { data: rs.rows, error: null });
  }

  if (action === "update") {
    const patch = body.values || {};
    const columns = Object.keys(patch).filter(isValidIdentifier);
    if (!columns.length) return json(req, 400, { data: null, error: { message: "Update values required" } });

    let idx = 1;
    const params = [];
    const setSql = columns
      .map((c) => {
        params.push(patch[c]);
        return `${quoteIdentifier(c)} = $${idx++}`;
      })
      .join(", ");

    const where = buildWhere(filters, idx);
    params.push(...where.values);
    const sql = `UPDATE ${fullTable} SET ${setSql}${where.sql} RETURNING ${buildSelectColumns(returning)}`;
    const rs = await pool.query(sql, params);
    return json(req, 200, { data: rs.rows, error: null });
  }

  if (action === "delete") {
    const where = buildWhere(filters, 1);
    const sql = `DELETE FROM ${fullTable}${where.sql} RETURNING ${buildSelectColumns(returning)}`;
    const rs = await pool.query(sql, where.values);
    return json(req, 200, { data: rs.rows, error: null });
  }

  return json(req, 400, { data: null, error: { message: `Unsupported mutate action: ${action}` } });
}

async function handleRpc(req) {
  const pool = getPool();
  const body = parseBody(req);
  const fnName = body.fn;
  const args = body.args || {};

  if (!isValidIdentifier(fnName)) {
    return json(req, 400, { data: null, error: { message: "Invalid function name" } });
  }

  const keys = Object.keys(args).filter(isValidIdentifier);
  const placeholders = keys.map((_, i) => `$${i + 1}`);
  const values = keys.map((k) => args[k]);

  const sql = keys.length
    ? `SELECT * FROM ${quoteIdentifier(fnName)}(${placeholders.join(",")})`
    : `SELECT * FROM ${quoteIdentifier(fnName)}()`;

  const rs = await pool.query(sql, values);
  return json(req, 200, { data: rs.rows, error: null });
}

async function handleInvoke(path, req) {
  const fnName = path[1];
  if (!fnName) return json(req, 400, { data: null, error: { message: "Function name is required" } });

  const base = process.env.AZURE_FUNCTIONS_BASE_URL || "";
  if (!base) {
    return json(req, 501, { data: null, error: { message: "AZURE_FUNCTIONS_BASE_URL is not configured" } });
  }

  const body = parseBody(req);
  const key = process.env.AZURE_FUNCTIONS_API_KEY || "";
  const endpoint = `${base.replace(/\/$/, "")}/${fnName}`;

  const headers = {
    "Content-Type": "application/json",
  };

  if (key) headers["x-functions-key"] = key;

  const bearer = getBearerToken(req);
  if (bearer) headers["Authorization"] = `Bearer ${bearer}`;

  const resp = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body.body || body),
  });

  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!resp.ok) {
    return json(req, resp.status, { data: null, error: { message: typeof data === "string" ? data : JSON.stringify(data) } });
  }

  return json(req, 200, { data, error: null });
}

async function handleHealth(req) {
  const health = {
    ok: true,
    service: "azure-runtime-api",
    timestamp: new Date().toISOString(),
    runtime: {
      jwtConfigured: Boolean(process.env.AZURE_JWT_SECRET || process.env.JWT_SECRET),
      functionsProxyConfigured: Boolean(process.env.AZURE_FUNCTIONS_BASE_URL),
      allowedOriginsConfigured: getAllowedOrigins().length > 0,
    },
    database: {
      configured: true,
      reachable: true,
    },
  };

  try {
    await getPool().query("SELECT 1");
  } catch (error) {
    health.ok = false;
    health.database = {
      configured: isDatabaseConfigured(),
      reachable: false,
    };
  }

  return json(req, health.ok ? 200 : 503, health);
}

module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") return json(req, 200, { ok: true });

    const path = parseSegments(req);
    if (!path.length) {
      return json(req, 200, { ok: true, service: "azure-runtime-api" });
    }

    if (path[0] === "health") return await handleHealth(req);
    if (path[0] === "auth") return await handleAuth(path, req);
    if (path[0] === "query") return await handleQuery(req);
    if (path[0] === "mutate") return await handleMutate(req);
    if (path[0] === "rpc") return await handleRpc(req);
    if (path[0] === "invoke") return await handleInvoke(path, req);

    return json(req, 404, { error: { message: "Route not found" } });
  } catch (error) {
    context.log.error("Runtime API error", error);
    return json(req, 500, { data: null, error: { message: error.message || "Internal error" } });
  }
};
