// Azure runtime client that preserves the supabase-like API surface used by the app.

type AnyObj = Record<string, any>;

type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED";

type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

export interface User {
  id: string;
  email: string;
  role?: string;
  user_metadata?: AnyObj;
}

export interface Session {
  access_token: string;
  user: User;
}

export interface RealtimeChannelPayload {
  eventType: RealtimeEventType;
  new: AnyObj;
  old: AnyObj;
}

export interface RealtimeChannel {
  on: (
    event: "postgres_changes",
    config: AnyObj,
    callback: (payload: RealtimeChannelPayload) => void,
  ) => RealtimeChannel;
  subscribe: () => RealtimeChannel;
  unsubscribe: () => void;
}

const TOKEN_KEY = "azure_session_token";
const SESSION_KEY = "azure_session_data";

const getEnvVar = (viteKey: string, nextKey?: string): string | undefined => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const value = (import.meta.env as Record<string, string | undefined>)[viteKey];
    if (value) return value;
  }

  if (nextKey && typeof process !== "undefined" && process.env) {
    return process.env[nextKey];
  }

  return undefined;
};

const API_BASE_URL = (getEnvVar("VITE_API_BASE_URL") || "/api").replace(/\/$/, "");
const RUNTIME_BASE = `${API_BASE_URL}/runtime`;

function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage failures
  }
}

function getStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore storage failures
  }
}

async function runtimeRequest(path: string, method = "POST", payload?: AnyObj, extraHeaders?: HeadersInit) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(extraHeaders || {}),
  };

  if (token) {
    (headers as AnyObj).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${RUNTIME_BASE}${path}`, {
    method,
    headers,
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  let body: AnyObj;
  try {
    body = await response.json();
  } catch {
    body = { data: null, error: { message: "Invalid JSON response" } };
  }

  if (!response.ok && !body.error) {
    body.error = { message: `HTTP ${response.status}` };
  }

  return body;
}

const authListeners = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

function emitAuth(event: AuthChangeEvent, session: Session | null) {
  for (const listener of authListeners) {
    try {
      listener(event, session);
    } catch {
      // ignore listener errors
    }
  }
}

function parseFilterString(filter?: string) {
  if (!filter) return null;
  const [column, op, ...rest] = String(filter).split("=")[0].split(".");
  const value = String(filter).split(".").slice(2).join(".");
  if (!column || !op) return null;

  const normalizedOp = op.toLowerCase();
  if (!["eq", "neq", "gt", "gte", "lt", "lte", "ilike", "like"].includes(normalizedOp)) {
    return null;
  }

  return {
    op: normalizedOp,
    column,
    value,
  };
}

class PollingChannel implements RealtimeChannel {
  private watchers: Array<{ config: AnyObj; callback: (payload: RealtimeChannelPayload) => void }> = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private state = new Map<number, Map<string, AnyObj>>();
  private initialized = new Set<number>();

  constructor(private readonly name: string) {}

  on(event: "postgres_changes", config: AnyObj, callback: (payload: RealtimeChannelPayload) => void) {
    if (event !== "postgres_changes") return this;
    this.watchers.push({ config, callback });
    return this;
  }

  subscribe() {
    if (this.intervalId) return this;

    const pollAll = async () => {
      await Promise.all(
        this.watchers.map(async (watcher, idx) => {
          const table = watcher.config?.table;
          if (!table) return;

          const filters = [];
          const parsed = parseFilterString(watcher.config?.filter);
          if (parsed) filters.push(parsed);

          const resp = await runtimeRequest("/query", "POST", {
            table,
            select: "*",
            filters,
          });

          if (resp.error || !Array.isArray(resp.data)) return;

          const currentMap = new Map<string, AnyObj>();
          for (const row of resp.data) {
            const id = String(row.id ?? `${row.created_at ?? ""}:${JSON.stringify(row)}`);
            currentMap.set(id, row);
          }

          const prevMap = this.state.get(idx) || new Map<string, AnyObj>();

          if (this.initialized.has(idx)) {
            for (const [id, row] of currentMap.entries()) {
              if (!prevMap.has(id)) {
                watcher.callback({ eventType: "INSERT", new: row, old: {} });
              } else if (JSON.stringify(prevMap.get(id)) !== JSON.stringify(row)) {
                watcher.callback({ eventType: "UPDATE", new: row, old: prevMap.get(id) || {} });
              }
            }

            for (const [id, oldRow] of prevMap.entries()) {
              if (!currentMap.has(id)) {
                watcher.callback({ eventType: "DELETE", new: {}, old: oldRow });
              }
            }
          }

          this.state.set(idx, currentMap);
          this.initialized.add(idx);
        }),
      );
    };

    void pollAll();
    this.intervalId = setInterval(() => {
      void pollAll();
    }, 5000);

    return this;
  }

  unsubscribe() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

class AzureQueryBuilder implements PromiseLike<any> {
  private action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private selectColumns = "*";
  private returning = "*";
  private filters: Array<{ op: string; column: string; value: any }> = [];
  private orderBy: Array<{ column: string; ascending: boolean }> = [];
  private limitCount: number | null = null;
  private rangeWindow: { from: number; to: number } | null = null;
  private payload: any = null;
  private singleRow = false;
  private maybeSingleRow = false;
  private orExpr: string | null = null;
  private conflictColumns: string[] = [];

  constructor(private readonly table: string) {}

  // options (e.g. { count: "exact" }) are accepted for API compatibility but not used in this runtime stub
  select(columns = "*", _options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
    if (this.action === "insert" || this.action === "update" || this.action === "delete" || this.action === "upsert") {
      this.returning = columns || "*";
      return this;
    }
    this.action = "select";
    this.selectColumns = columns || "*";
    return this;
  }

  insert(values: any) {
    this.action = "insert";
    this.payload = values;
    return this;
  }

  update(values: any) {
    this.action = "update";
    this.payload = values;
    return this;
  }

  delete() {
    this.action = "delete";
    this.payload = null;
    return this;
  }

  upsert(values: any, options?: { onConflict?: string | string[] }) {
    this.action = "upsert";
    this.payload = values;
    const raw = options?.onConflict;
    if (Array.isArray(raw)) {
      this.conflictColumns = raw;
    } else if (typeof raw === "string") {
      this.conflictColumns = raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ op: "eq", column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ op: "neq", column, value });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push({ op: "gt", column, value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ op: "gte", column, value });
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push({ op: "lt", column, value });
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push({ op: "lte", column, value });
    return this;
  }

  like(column: string, value: any) {
    this.filters.push({ op: "like", column, value });
    return this;
  }

  ilike(column: string, value: any) {
    this.filters.push({ op: "ilike", column, value });
    return this;
  }

  in(column: string, value: any[]) {
    this.filters.push({ op: "in", column, value: Array.isArray(value) ? value : [] });
    return this;
  }

  is(column: string, value: any) {
    this.filters.push({ op: "is", column, value });
    return this;
  }

  match(values: AnyObj) {
    Object.entries(values || {}).forEach(([column, value]) => {
      this.filters.push({ op: "eq", column, value });
    });
    return this;
  }

  or(expression: string) {
    this.orExpr = expression;
    return this;
  }

  not(column: string, operator: string, value: any) {
    const op = operator === "eq" ? "neq" : operator;
    this.filters.push({ op, column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  limit(count: number) {
    this.limitCount = Number(count);
    return this;
  }

  range(from: number, to: number) {
    this.rangeWindow = { from: Number(from), to: Number(to) };
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingleRow = true;
    return this;
  }

  async execute() {
    if (this.action === "select") {
      return runtimeRequest("/query", "POST", {
        table: this.table,
        select: this.selectColumns,
        filters: this.filters,
        order: this.orderBy,
        limit: this.limitCount,
        range: this.rangeWindow,
        single: this.singleRow,
        maybeSingle: this.maybeSingleRow,
        or: this.orExpr,
      });
    }

    return runtimeRequest("/mutate", "POST", {
      action: this.action,
      table: this.table,
      values: this.payload,
      filters: this.filters,
      returning: this.returning,
      onConflict: this.conflictColumns,
    });
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any);
  }
}

const supabase = {
  from(table: string) {
    return new AzureQueryBuilder(table);
  },

  rpc(fn: string, args?: AnyObj) {
    return runtimeRequest("/rpc", "POST", { fn, args: args || {} });
  },

  functions: {
    async invoke(name: string, options?: AnyObj) {
      return runtimeRequest(`/invoke/${name}`, "POST", options || {});
    },
  },

  channel(name: string): RealtimeChannel {
    return new PollingChannel(name);
  },

  removeChannel(channel: RealtimeChannel) {
    try {
      channel.unsubscribe();
      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  auth: {
    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },

    async getSession() {
      const token = getToken();
      if (!token) return { data: { session: null }, error: null };

      const resp = await runtimeRequest("/auth/session", "GET");
      return {
        data: { session: (resp.data?.session || getStoredSession()) as Session | null },
        error: resp.error || null,
      };
    },

    async signInWithPassword(credentials: { email: string; password: string }) {
      const resp = await runtimeRequest("/auth/signin", "POST", credentials);
      const session = resp.data?.session as Session | null;
      if (session?.access_token) {
        setToken(session.access_token);
        setStoredSession(session);
        emitAuth("SIGNED_IN", session);
      }
      return { data: resp.data || { user: null, session: null }, error: resp.error || null };
    },

    async signUp(payload: { email: string; password: string; options?: AnyObj }) {
      const fullName = payload.options?.data?.full_name || "";
      const role = payload.options?.data?.role || "driver";
      const resp = await runtimeRequest("/auth/signup", "POST", {
        email: payload.email,
        password: payload.password,
        full_name: fullName,
        role,
      });

      const session = resp.data?.session as Session | null;
      if (session?.access_token) {
        setToken(session.access_token);
        setStoredSession(session);
        emitAuth("SIGNED_IN", session);
      }

      return { data: resp.data || { user: null, session: null }, error: resp.error || null };
    },

    async signOut() {
      await runtimeRequest("/auth/signout", "POST", {});
      setToken("");
      setStoredSession(null);
      emitAuth("SIGNED_OUT", null);
      return { error: null };
    },

    async getUser() {
      const resp = await runtimeRequest("/auth/user", "GET");
      return { data: { user: (resp.data?.user || null) as User | null }, error: resp.error || null };
    },

    // options (e.g. { redirectTo }) are accepted for API compatibility but not used in this runtime stub
    async resetPasswordForEmail(email: string, _options?: { redirectTo?: string }) {
      const resp = await runtimeRequest("/auth/reset-password", "POST", { email });
      return { data: resp.data || null, error: resp.error || null };
    },

    async updateUser(payload: { password?: string }) {
      const resp = await runtimeRequest("/auth/update-user", "POST", payload);
      const current = getStoredSession();
      if (current?.user && resp.data?.user) {
        const nextSession = { ...current, user: { ...current.user, ...resp.data.user } };
        setStoredSession(nextSession);
        emitAuth("USER_UPDATED", nextSession);
      }
      return { data: resp.data || null, error: resp.error || null };
    },
  },
};

export { supabase };
