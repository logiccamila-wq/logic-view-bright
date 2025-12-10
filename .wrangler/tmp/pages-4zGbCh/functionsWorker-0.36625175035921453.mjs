var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/assign-role.ts
var onRequest = /* @__PURE__ */ __name(async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  let email = "";
  let uid = "";
  let role = "";
  try {
    const b = await request.json();
    email = (b.email || "").trim();
    uid = (b.uid || "").trim();
    role = (b.role || "").trim();
  } catch {
  }
  if (!role) return new Response(JSON.stringify({ error: "role required" }), { status: 400 });
  let authUserId = uid;
  const headers = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" };
  if (!authUserId && email) {
    const u = new URL(`${supabaseUrl}/auth/v1/admin/users`);
    u.searchParams.set("email", email);
    const r = await fetch(u.toString(), { headers });
    if (!r.ok) return new Response(JSON.stringify({ error: "failed_resolving_user", detail: await r.text() }), { status: r.status });
    const js = await r.json().catch(() => ({}));
    const user = Array.isArray(js) ? js[0] : js?.users?.[0];
    if (!user?.id) return new Response(JSON.stringify({ error: "user_not_found" }), { status: 404 });
    authUserId = user.id;
  }
  if (!authUserId) return new Response(JSON.stringify({ error: "uid or email required" }), { status: 400 });
  const ins = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: authUserId, role })
  });
  if (ins.status !== 201) return new Response(JSON.stringify({ error: "insert_failed", detail: await ins.text() }), { status: ins.status });
  return new Response(JSON.stringify({ success: true, user_id: authUserId, role }), { status: 200 });
}, "onRequest");

// api/create-user.ts
var onRequest2 = /* @__PURE__ */ __name(async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  let email = "", password = "", role = "";
  try {
    const b = await request.json();
    email = (b.email || "").trim();
    password = (b.password || "").trim();
    role = (b.role || "").trim();
  } catch {
  }
  if (!email || !password) return new Response(JSON.stringify({ error: "email and password required" }), { status: 400 });
  const r = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    body: JSON.stringify({ email, password, email_confirm: true })
  });
  const userResText = await r.text();
  let userRes = null;
  try {
    userRes = JSON.parse(userResText);
  } catch {
    userRes = { raw: userResText };
  }
  if (!r.ok) return new Response(JSON.stringify({ error: "create_user_failed", detail: userRes }), { status: r.status });
  const userId = userRes?.user?.id || userRes?.id || "";
  if (!userId) return new Response(JSON.stringify({ error: "user_id_missing", detail: userRes }), { status: 500 });
  let roleResult = null;
  if (role) {
    const ins = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: "return=representation" },
      body: JSON.stringify({ user_id: userId, role })
    });
    const txt = await ins.text();
    try {
      roleResult = JSON.parse(txt);
    } catch {
      roleResult = { raw: txt };
    }
    if (ins.status !== 201 && ins.status !== 200) return new Response(JSON.stringify({ error: "assign_role_failed", detail: roleResult }), { status: ins.status });
  }
  return new Response(JSON.stringify({ success: true, user_id: userId, email, role, user: userRes, roleResult }), { status: 200 });
}, "onRequest");

// api/db.ts
var onRequest3 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const allowed = /* @__PURE__ */ new Set(["trips", "trip_macros", "refuelings", "service_orders", "gate_events", "non_conformities", "vehicles", "finance_ledgers", "cte"]);
  let payload = {};
  try {
    payload = await request.json();
  } catch {
  }
  const op = (payload.op || "").toLowerCase();
  const table = (payload.table || "").toLowerCase();
  if (!allowed.has(table)) return new Response(JSON.stringify({ error: "table_not_allowed" }), { status: 400 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" };
  if (op === "create") {
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}`, { method: "POST", headers: { ...h, Prefer: "return=representation" }, body: JSON.stringify(payload.data || {}) });
    const t = await r.text();
    try {
      return new Response(t, { status: r.status });
    } catch {
      return new Response(JSON.stringify({ raw: t }), { status: r.status });
    }
  }
  if (op === "list") {
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=${encodeURIComponent(String(payload.limit || 50))}`, { headers: h });
    const t = await r.text();
    try {
      return new Response(t, { status: r.status });
    } catch {
      return new Response(JSON.stringify({ raw: t }), { status: r.status });
    }
  }
  if (op === "update") {
    const id = payload.id;
    if (!id) return new Response(JSON.stringify({ error: "id_required" }), { status: 400 });
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(String(id))}`, { method: "PATCH", headers: { ...h, Prefer: "return=representation" }, body: JSON.stringify(payload.data || {}) });
    const t = await r.text();
    try {
      return new Response(t, { status: r.status });
    } catch {
      return new Response(JSON.stringify({ raw: t }), { status: r.status });
    }
  }
  if (op === "delete") {
    const id = payload.id;
    if (!id) return new Response(JSON.stringify({ error: "id_required" }), { status: 400 });
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(String(id))}`, { method: "DELETE", headers: { ...h, Prefer: "return=representation" } });
    const t = await r.text();
    try {
      return new Response(t, { status: r.status });
    } catch {
      return new Response(JSON.stringify({ raw: t }), { status: r.status });
    }
  }
  return new Response(JSON.stringify({ error: "op_not_supported" }), { status: 400 });
}, "onRequest");

// api/esg-insights.ts
var onRequest4 = /* @__PURE__ */ __name(async ({ env }) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
  const [fuelRes, tireRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/refuelings?select=liters,total_value,trip_id&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/service_orders?select=type,status,cost&limit=1000`, { headers: h })
  ]);
  const fuels = fuelRes.ok ? await fuelRes.json() : [];
  const orders = tireRes.ok ? await tireRes.json() : [];
  const liters = (fuels || []).reduce((acc, f) => acc + Number(f.liters || 0), 0);
  const trips = Math.max(1, new Set((fuels || []).map((f) => f.trip_id)).size || 1);
  const co2_per_km = Number((liters * 2.31 / Math.max(1, trips * 100)).toFixed(2));
  const tireOrders = (orders || []).filter((o) => String(o.type || "").toLowerCase().includes("pneu"));
  const recycled = tireOrders.filter((o) => String(o.status || "").includes("reciclado")).length;
  const tire_recycle_rate = tireOrders.length ? Number((recycled / tireOrders.length * 100).toFixed(1)) + "%" : "0%";
  const water_use_index = Number(((orders || []).filter((o) => String(o.type || "").toLowerCase().includes("lava")).length * 0.5).toFixed(2));
  const renewables_share = "30%";
  return new Response(JSON.stringify({ co2_per_km, tire_recycle_rate, water_use_index, renewables_share }), { status: 200 });
}, "onRequest");

// api/gate-event.ts
var onRequest5 = /* @__PURE__ */ __name(async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  let body = {};
  try {
    body = await request.json();
  } catch {
  }
  const plate = (body.plate || "").trim();
  const driver = (body.driver || "").trim();
  const kind = (body.kind || "entry").trim();
  if (!plate) return new Response(JSON.stringify({ error: "plate required" }), { status: 400 });
  const payload = { plate, driver, kind, ts: (/* @__PURE__ */ new Date()).toISOString() };
  const r = await fetch(`${supabaseUrl}/rest/v1/gate_events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: "return=minimal" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const detail = await r.text();
    return new Response(JSON.stringify({ warning: "insert_failed", detail, payload }), { status: 200 });
  }
  return new Response(JSON.stringify({ success: true, payload }), { status: 200 });
}, "onRequest");

// api/get-roles.ts
var onRequest6 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const url = new URL(request.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();
  const uid = (url.searchParams.get("uid") || "").trim();
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  let userId = uid;
  if (!userId && email) {
    const u = new URL(`${supabaseUrl}/auth/v1/admin/users`);
    u.searchParams.set("email", email);
    const r = await fetch(u.toString(), { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
    if (!r.ok) return new Response(JSON.stringify({ error: "failed_resolving_user", detail: await r.text() }), { status: r.status });
    const js = await r.json();
    const user = Array.isArray(js) ? js[0] : js?.users?.[0];
    userId = user?.id || "";
  }
  if (!userId) return new Response(JSON.stringify({ error: "uid_or_email_required" }), { status: 400 });
  const ru = new URL(`${supabaseUrl}/rest/v1/user_roles`);
  ru.searchParams.set("user_id", `eq.${userId}`);
  const rr = await fetch(ru.toString(), { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
  const roles = rr.ok ? await rr.json() : [];
  return new Response(JSON.stringify({ user_id: userId, roles }), { status: 200 });
}, "onRequest");

// api/install-module.ts
var onRequest7 = /* @__PURE__ */ __name(async ({ request, env }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const moduleId = body?.moduleId || "";
    const clientKey = body?.clientKey || "ejg";
    if (!moduleId) {
      return new Response(JSON.stringify({ error: "moduleId required" }), { status: 400 });
    }
    const headers = {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json"
    };
    const known = {
      dashboard: { name: "Dashboard OptiLog", category: "core" },
      tms: { name: "TMS", category: "logistics" },
      wms: { name: "WMS", category: "logistics" },
      oms: { name: "OMS", category: "operations" },
      "mechanic-hub": { name: "Hub Mec\xE2nico", category: "maintenance" },
      "driver-app": { name: "App Motorista", category: "mobile" },
      "control-tower": { name: "Torre de Controle", category: "operations" },
      crm: { name: "CRM", category: "business" },
      erp: { name: "ERP", category: "business" },
      supergestor: { name: "Supergestor", category: "operations" },
      "predictive-maintenance": { name: "Manuten\xE7\xE3o Preditiva", category: "maintenance" },
      "drivers-management": { name: "Gest\xE3o de Motoristas", category: "operations" },
      approvals: { name: "Aprova\xE7\xF5es", category: "operations" },
      "logistics-kpi": { name: "KPIs de Log\xEDstica", category: "operations" },
      "bank-reconciliation": { name: "Concilia\xE7\xE3o Banc\xE1ria", category: "finance" },
      "cost-monitoring": { name: "Monitoramento de Custos", category: "finance" },
      iot: { name: "IoT", category: "iot" },
      permissions: { name: "Permiss\xF5es", category: "operations" },
      developer: { name: "Developer", category: "dev" },
      reports: { name: "Relat\xF3rios", category: "business" }
    };
    const upsertModule = /* @__PURE__ */ __name(async (key) => {
      const meta = known[key] || { name: key, category: "operations" };
      const enabled = !meta.comingSoon;
      const url = `${supabaseUrl}/rest/v1/modules?on_conflict=key`;
      const r = await fetch(url, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ key, name: meta.name, category: meta.category, description: meta.description || key, enabled })
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`modules upsert failed: ${txt}`);
      }
      await r.json().catch(() => ({}));
    }, "upsertModule");
    const targets = moduleId === "all" ? Object.keys(known) : [moduleId];
    const installed = [];
    for (const key of targets) {
      await upsertModule(key);
      installed.push(key);
    }
    return new Response(JSON.stringify({ ok: true, installedCount: installed.length, installed, client: clientKey }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}, "onRequest");

// api/iot-feed.ts
var onRequest8 = /* @__PURE__ */ __name(async () => {
  const now = Date.now();
  const vehicles = ["EJG-1234", "AAZ-9988", "BRZ-5521"];
  const events = Array.from({ length: 25 }).map((_, i) => ({
    ts: new Date(now - i * 6e4).toISOString(),
    type: ["gps", "rpm", "temp", "tpms"][i % 4],
    vehicle: vehicles[i % vehicles.length],
    value: Number((Math.random() * 100).toFixed(1))
  }));
  return new Response(JSON.stringify({ events }), { status: 200 });
}, "onRequest");

// api/ledger-blockchain.ts
var onRequest9 = /* @__PURE__ */ __name(async ({ request }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const payloadText = await request.text();
  const data = payloadText || "{}";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  const hashArray = Array.from(new Uint8Array(digest));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return new Response(JSON.stringify({ hash: hashHex, data: JSON.parse(data) }), { status: 200 });
}, "onRequest");

// api/permissions-matrix.ts
var onRequest10 = /* @__PURE__ */ __name(async ({ request, env }) => {
  if (request.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
  const [modsRes, rolesRes, permRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/modules`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/user_roles?select=role`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/permissions`, { headers: h })
  ]);
  const modules = modsRes.ok ? await modsRes.json().catch(() => []) : [];
  const rolesRows = rolesRes.ok ? await rolesRes.json().catch(() => []) : [];
  const roleKeys = Array.from(new Set((rolesRows || []).map((r) => r.role))).filter(Boolean);
  const profiles = roleKeys.map((key) => ({ key, name: key }));
  let permissionsRows = [];
  if (permRes.ok) {
    try {
      permissionsRows = await permRes.json();
    } catch {
      permissionsRows = [];
    }
  } else {
    try {
      const txt = await permRes.text();
      permissionsRows = [];
    } catch {
      permissionsRows = [];
    }
  }
  const matrix = {};
  for (const row of permissionsRows) {
    const mk = row.module_key;
    const pk = row.profile_key;
    if (!mk || !pk) continue;
    matrix[mk] = matrix[mk] || {};
    matrix[mk][pk] = !!row.allowed;
  }
  return new Response(JSON.stringify({ modules, profiles, matrix }), { status: 200 });
}, "onRequest");

// api/predict-maintenance.ts
var onRequest11 = /* @__PURE__ */ __name(async ({ env }) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
  const [vehRes, ncRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/vehicles?select=id,plate,year,mileage,last_service_km&limit=200`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/non_conformities?select=id,vehicle_id,rpn,created_at,status&status=eq.open&limit=500`, { headers: h })
  ]);
  const vehicles = vehRes.ok ? await vehRes.json() : [];
  const ncs = ncRes.ok ? await ncRes.json() : [];
  const predictions = (vehicles || []).slice(0, 50).map((v) => {
    const ncScore = (ncs || []).filter((n) => n.vehicle_id === v.id).reduce((acc, n) => acc + (n.rpn || 0), 0);
    const mileage = Number(v.mileage || 0);
    const lastServiceKm = Number(v.last_service_km || 0);
    const delta = Math.max(0, mileage - lastServiceKm);
    const risk = Math.min(1, ncScore / 1e3 + delta / 2e4);
    const dueDays = Math.max(1, Math.round(30 * risk));
    const system = risk > 0.7 ? "Freios" : risk > 0.5 ? "Suspens\xE3o" : "Lubrifica\xE7\xE3o";
    return { vehicle_id: v.id, plate: v.plate, system, risk, due_in_days: dueDays };
  });
  return new Response(JSON.stringify({ predictions }), { status: 200 });
}, "onRequest");

// api/process-cron.ts
var onRequest12 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
  const overdueRes = await fetch(`${supabaseUrl}/rest/v1/process_actions?due_date=lt.${encodeURIComponent(now)}&status=not.eq.completed&limit=200`, { headers: h });
  const criticalRes = await fetch(`${supabaseUrl}/rest/v1/non_conformities?rpn=gte.200&status=eq.open&limit=200`, { headers: h });
  const overdue = overdueRes.ok ? await overdueRes.json() : [];
  const critical = criticalRes.ok ? await criticalRes.json() : [];
  return new Response(JSON.stringify({ success: true, overdue: (overdue || []).length, critical: (critical || []).length }), { status: 200 });
}, "onRequest");

// api/seed-demo.ts
var onRequest13 = /* @__PURE__ */ __name(async ({ env }) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" };
  const demo = {
    vehicles: [
      { placa: "ABC1A23", modelo: "Volvo FH", tipo: "truck", status: "active" },
      { placa: "DEF4B56", modelo: "Scania R440", tipo: "truck", status: "active" }
    ],
    service_orders: [
      { issue_description: "Troca de pastilhas de freio", odometer: 12e4, priority: "high", status: "pending", vehicle_model: "Volvo FH", vehicle_plate: "ABC1A23" }
    ],
    trips: [
      { origin: "S\xE3o Paulo", destination: "Rio de Janeiro", driver_id: "demo", driver_name: "Motorista Demo", status: "running", vehicle_plate: "ABC1A23" }
    ],
    refuelings: [
      { driver_id: "demo", vehicle_plate: "ABC1A23", km: 120500, liters: 200, total_value: 1800 }
    ],
    non_conformities: [
      { module: "fleet", vehicle_plate: "ABC1A23", description: "Vibra\xE7\xE3o anormal ao frear", severity: 7, occurrence: 6, detection: 6, status: "open" }
    ]
  };
  const result = { inserted: {}, missingTables: [], demo };
  const tryInsert = /* @__PURE__ */ __name(async (table, rows) => {
    if (!supabaseUrl || !serviceKey) {
      result.missingEnv = true;
      return;
    }
    for (const row of rows) {
      const r = await fetch(`${supabaseUrl}/rest/v1/${table}`, { method: "POST", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify(row) });
      if (!r.ok) {
        const txt = await r.text();
        if (txt.includes("Could not find the table") || r.status === 404) {
          if (!result.missingTables.includes(table)) result.missingTables.push(table);
        } else {
          result.inserted[table] = result.inserted[table] || [];
          result.inserted[table].push({ warning: "insert_failed", detail: txt, row });
        }
      } else {
        result.inserted[table] = result.inserted[table] || [];
        result.inserted[table].push({ ok: true });
      }
    }
  }, "tryInsert");
  await tryInsert("vehicles", demo.vehicles);
  await tryInsert("service_orders", demo.service_orders);
  await tryInsert("trips", demo.trips);
  await tryInsert("refuelings", demo.refuelings);
  await tryInsert("non_conformities", demo.non_conformities);
  return new Response(JSON.stringify(result), { status: 200 });
}, "onRequest");

// api/send-email.ts
var onRequest14 = /* @__PURE__ */ __name(async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const apiKey = env.RESEND_API_KEY || "";
  if (!apiKey) return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), { status: 500 });
  let payload = {};
  try {
    payload = await request.json();
  } catch {
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const txt = await r.text();
  let data = null;
  try {
    data = JSON.parse(txt);
  } catch {
    data = { raw: txt };
  }
  return new Response(JSON.stringify(data), { status: r.ok ? 200 : r.status });
}, "onRequest");

// api/setup-ejg.ts
var onRequest15 = /* @__PURE__ */ __name(async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" };
  const users = [
    { email: "administrativo@ejgtransporte.com.br", password: "Multi.13", roles: ["admin"], full_name: "Administrativo" },
    { email: "jailson.barros@ejgtransporte.com.br", password: "Multi.13", roles: ["admin", "logistics_manager", "finance"], full_name: "Jailson Barros" },
    { email: "enio.gomes@ejgtransporte.com.br", password: "Multi.13", roles: ["admin", "logistics_manager", "operations"], full_name: "Enio Gomes" },
    { email: "comercial@ejgtransporte.com.br", password: "Multi.13", roles: ["commercial"], full_name: "Comercial" },
    { email: "mecanico@ejgtransporte.com.br", password: "Multi.13", roles: ["fleet_maintenance"], full_name: "Mec\xE2nico" },
    { email: "frota@ejgtransporte.com.br", password: "Multi.13", roles: ["fleet_maintenance"], full_name: "Gestor de Frota" }
  ];
  const ensureUser = /* @__PURE__ */ __name(async (email, password, full_name) => {
    const u = new URL(`${supabaseUrl}/auth/v1/admin/users`);
    u.searchParams.set("email", email);
    const r = await fetch(u.toString(), { headers: h });
    let userId = "";
    if (r.ok) {
      const js = await r.json().catch(() => ({}));
      const user = Array.isArray(js) ? js[0] : js?.users?.[0];
      userId = user?.id || "";
    }
    if (!userId) {
      const rc = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name } })
      });
      if (!rc.ok) throw new Error(`create_user_failed: ${await rc.text()}`);
      const js = await rc.json().catch(() => ({}));
      userId = js?.id || js?.user?.id || "";
    }
    if (userId) {
      await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=id`, {
        method: "POST",
        headers: { ...h, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ id: userId, email, full_name: full_name || email })
      });
    }
    return userId;
  }, "ensureUser");
  const ensureRole = /* @__PURE__ */ __name(async (userId, role) => {
    const ins = await fetch(`${supabaseUrl}/rest/v1/user_roles?on_conflict=user_id,role`, {
      method: "POST",
      headers: { ...h, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ user_id: userId, role })
    });
    if (!ins.ok) throw new Error(`assign_role_failed: ${await ins.text()}`);
  }, "ensureRole");
  const upsertModule = /* @__PURE__ */ __name(async (key, name, category, description) => {
    const url = `${supabaseUrl}/rest/v1/modules?on_conflict=key`;
    const r = await fetch(url, {
      method: "POST",
      headers: { ...h, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ key, name, category, description: description || name, enabled: true })
    });
    if (!r.ok) throw new Error(`modules_upsert_failed: ${await r.text()}`);
  }, "upsertModule");
  const upsertPermission = /* @__PURE__ */ __name(async (profile_key, module_key, allowed = true) => {
    const url = `${supabaseUrl}/rest/v1/permissions?on_conflict=profile_key,module_key`;
    const r = await fetch(url, {
      method: "POST",
      headers: { ...h, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ profile_key, module_key, allowed })
    });
    if (!r.ok) throw new Error(`permissions_upsert_failed: ${await r.text()}`);
  }, "upsertPermission");
  try {
    const created = [];
    for (const u of users) {
      const id = await ensureUser(u.email, u.password, u.full_name);
      for (const role of u.roles) await ensureRole(id, role);
      created.push({ email: u.email, user_id: id, roles: u.roles });
    }
    const modulesList = [
      ["dashboard", "Dashboard OptiLog", "core"],
      ["tms", "TMS", "logistics"],
      ["wms", "WMS", "logistics"],
      ["oms", "OMS", "operations"],
      ["mechanic-hub", "Hub Mec\xE2nico", "maintenance"],
      ["driver-app", "App Motorista", "mobile"],
      ["control-tower", "Torre de Controle", "operations"],
      ["crm", "CRM", "business"],
      ["erp", "ERP", "business"],
      ["employees", "Funcion\xE1rios", "business"],
      ["users", "Usu\xE1rios", "system"],
      ["inventory", "Estoque/Oficina", "maintenance"],
      ["settings", "Configura\xE7\xF5es", "system"],
      ["hr", "Recursos Humanos", "business"],
      ["dp", "Departamento Pessoal", "business"],
      ["supergestor", "Supergestor", "operations"],
      ["predictive-maintenance", "Manuten\xE7\xE3o Preditiva", "maintenance"],
      ["drivers-management", "Gest\xE3o de Motoristas", "operations"],
      ["approvals", "Aprova\xE7\xF5es", "operations"],
      ["logistics-kpi", "KPIs de Log\xEDstica", "operations"],
      ["bank-reconciliation", "Concilia\xE7\xE3o Banc\xE1ria", "finance"],
      ["cost-monitoring", "Monitoramento de Custos", "finance"],
      ["iot", "IoT", "iot"],
      ["permissions", "Permiss\xF5es", "operations"],
      ["developer", "Developer", "dev"],
      ["reports", "Relat\xF3rios", "business"]
    ];
    for (const [key, name, category, desc] of modulesList) await upsertModule(key, name, category, desc);
    const modsRes = await fetch(`${supabaseUrl}/rest/v1/modules?select=key`, { headers: h });
    const mods = modsRes.ok ? await modsRes.json().catch(() => []) : [];
    const moduleKeys = (mods || []).map((m) => m.key).filter(Boolean);
    for (const mk of moduleKeys) {
      await upsertPermission("admin", mk, true);
      await upsertPermission("finance", mk, true);
    }
    return new Response(JSON.stringify({ ok: true, created }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}, "onRequest");

// api/supergestor-insights.ts
var onRequest16 = /* @__PURE__ */ __name(async ({ env }) => {
  const e = env;
  const supabaseUrl = e.SUPABASE_URL || e.VITE_SUPABASE_URL || "";
  const serviceKey = e.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
  const [vehRes, ordersRes, tripsRes, ncRes, finRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/vehicles?select=id,status&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/service_orders?select=id,status&status=eq.pendente&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/trips?select=id,status&status=in.(running,started)&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/non_conformities?select=id,rpn,status&status=eq.open&rpn=gte.200&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/finance_ledgers?select=id,amount&type=in.(expense,revenue)&limit=1000`, { headers: h })
  ]);
  const vehicles = vehRes.ok ? await vehRes.json() : [];
  const orders = ordersRes.ok ? await ordersRes.json() : [];
  const trips = tripsRes.ok ? await tripsRes.json() : [];
  const ncs = ncRes.ok ? await ncRes.json() : [];
  const fins = finRes.ok ? await finRes.json() : [];
  const avgCostKm = (fins || []).reduce((acc, f) => acc + Number(f.amount || 0), 0) / Math.max(1, (trips || []).length * 100);
  const start = /* @__PURE__ */ new Date();
  start.setMonth(start.getMonth() - 12);
  const revRes = await fetch(`${supabaseUrl}/rest/v1/revenue_records?select=valor_frete,valor_icms,data_emissao,status&status=eq.ativo&data_emissao=gte.${start.toISOString()}&limit=100000`, { headers: h });
  const revs = revRes.ok ? await revRes.json() : [];
  const receitaTotal = (revs || []).reduce((t, r) => t + Number(r?.valor_frete || 0), 0);
  const icmsTotal = (revs || []).reduce((t, r) => t + Number(r?.valor_icms || 0), 0);
  return new Response(JSON.stringify({
    vehiclesActive: (vehicles || []).filter((v) => v.status === "active").length,
    ordersPending: (orders || []).length,
    tripsRunning: (trips || []).length,
    criticalNC: (ncs || []).length,
    avgCostKm: Number.isFinite(avgCostKm) ? Number(avgCostKm.toFixed(2)) : null,
    predictedMaint: Math.round(((vehicles || []).length || 0) * 0.1),
    receitaTotal,
    icmsTotal
  }), { status: 200 });
}, "onRequest");

// _middleware.ts
var onRequest17 = /* @__PURE__ */ __name(async ({ request, next, env }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    return next();
  }
  const res = await next();
  if (res.status === 404 && request.method === "GET") {
    return env.ASSETS.fetch(new Request(url.origin + "/index.html"));
  }
  return res;
}, "onRequest");

// ../.wrangler/tmp/pages-4zGbCh/functionsRoutes-0.04446994830188378.mjs
var routes = [
  {
    routePath: "/api/assign-role",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/create-user",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/db",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/esg-insights",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/gate-event",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/get-roles",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  },
  {
    routePath: "/api/install-module",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest7]
  },
  {
    routePath: "/api/iot-feed",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest8]
  },
  {
    routePath: "/api/ledger-blockchain",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest9]
  },
  {
    routePath: "/api/permissions-matrix",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest10]
  },
  {
    routePath: "/api/predict-maintenance",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest11]
  },
  {
    routePath: "/api/process-cron",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest12]
  },
  {
    routePath: "/api/seed-demo",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest13]
  },
  {
    routePath: "/api/send-email",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest14]
  },
  {
    routePath: "/api/setup-ejg",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest15]
  },
  {
    routePath: "/api/supergestor-insights",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest16]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest17],
    modules: []
  }
];

// ../node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-bHb3Hv/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-bHb3Hv/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.36625175035921453.mjs.map
