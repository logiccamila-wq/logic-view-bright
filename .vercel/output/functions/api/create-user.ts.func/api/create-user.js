import { createClient } from "@supabase/supabase-js";
export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }
        const supabaseUrl = process.env.SUPABASE_URL || "";
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
        if (!supabaseUrl || !serviceKey) {
            return res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
        }
        const { email, password, role } = (req.body || {});
        if (!email || !password) {
            return res.status(400).json({ error: "email and password required" });
        }
        const supabase = createClient(supabaseUrl, serviceKey);
        const { data: userRes, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (createErr) {
            return res.status(400).json({ error: "create_user_failed", detail: createErr.message });
        }
        const userId = userRes?.user?.id || "";
        if (!userId) {
            return res.status(500).json({ error: "user_id_missing" });
        }
        let roleResult = null;
        if (role && typeof role === "string" && role.trim().length > 0) {
            const resp = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${serviceKey}`,
                    apikey: serviceKey,
                    Prefer: "return=representation",
                },
                body: JSON.stringify({ user_id: userId, role }),
            });
            const txt = await resp.text();
            try {
                roleResult = JSON.parse(txt);
            }
            catch {
                roleResult = { raw: txt };
            }
            if (resp.status !== 201 && resp.status !== 200) {
                return res.status(resp.status).json({ error: "assign_role_failed", detail: roleResult });
            }
        }
        return res.status(200).json({ success: true, user_id: userId, email, role, user: userRes?.user, roleResult });
    }
    catch (e) {
        return res.status(500).json({ error: "unexpected_error", detail: e?.message || String(e) });
    }
}
//# sourceMappingURL=create-user.js.map