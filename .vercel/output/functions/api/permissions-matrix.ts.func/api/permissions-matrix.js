export default async function handler(req, res) {
    if (req.method !== "GET")
        return res.status(405).json({ error: "Method not allowed" });
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!supabaseUrl || !serviceKey)
        return res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
    const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
    const [modsRes, profRes, permRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/modules?select=id,key,name,description`, { headers: h }),
        fetch(`${supabaseUrl}/rest/v1/profiles?select=id,key,name,description`, { headers: h }),
        fetch(`${supabaseUrl}/rest/v1/profile_permissions?select=profile_id,module_function_id`, { headers: h })
    ]);
    if (!modsRes.ok)
        return res.status(modsRes.status).json({ error: "modules_fetch_failed", detail: await modsRes.text() });
    if (!profRes.ok)
        return res.status(profRes.status).json({ error: "profiles_fetch_failed", detail: await profRes.text() });
    if (!permRes.ok)
        return res.status(permRes.status).json({ error: "permissions_fetch_failed", detail: await permRes.text() });
    const modules = await modsRes.json();
    const profiles = await profRes.json();
    const perms = await permRes.json();
    const mfRes = await fetch(`${supabaseUrl}/rest/v1/module_functions?select=id,module_id,key,name`, { headers: h });
    if (!mfRes.ok)
        return res.status(mfRes.status).json({ error: "module_functions_fetch_failed", detail: await mfRes.text() });
    const mfs = await mfRes.json();
    const modById = {};
    for (const m of modules)
        modById[m.id] = m;
    const profById = {};
    for (const p of profiles)
        profById[p.id] = p;
    const matrix = {};
    for (const pr of perms) {
        const mf = mfs.find((x) => x.id === pr.module_function_id);
        const mod = mf ? modById[mf.module_id] : null;
        const prof = profById[pr.profile_id];
        if (!mod || !prof)
            continue;
        const pk = prof.key;
        const mk = mod.key;
        if (!matrix[mk])
            matrix[mk] = {};
        matrix[mk][pk] = true;
    }
    res.status(200).json({ modules, profiles, matrix });
}
//# sourceMappingURL=permissions-matrix.js.map