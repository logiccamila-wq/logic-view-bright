import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { demoList, demoCreate, demoDelete } from '@/lib/demoStore';

const tables = ['trips','service_orders','refuelings','vehicles','cte','gate_events','finance_ledgers','non_conformities'];

export default function Admin() {
  const [table, setTable] = useState('trips');
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const api = async (op: string, t: string, data?: any) => {
    const r = await fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op, table: t, data }) });
    const s = await r.text();
    try { return { ok: r.ok, data: JSON.parse(s) }; } catch { return { ok: r.ok, data: { raw: s } }; }
  };

  const load = async () => {
    setLoading(true); setMessage('');
    const res = await api('list', table);
    const arr = Array.isArray(res.data) ? res.data : demoList(table);
    setRows(arr);
    setLoading(false);
  };

  useEffect(() => { load(); }, [table]);

  const importDemo = async () => {
    setLoading(true); setMessage('');
    try {
      const r = await fetch('/api/seed-demo');
      const js = await r.json();
      const demo = js.demo || {};
      for (const t of Object.keys(demo)) {
        const arr = Array.isArray(demo[t]) ? demo[t] : [];
        for (const row of arr) demoCreate(t, row);
      }
      setMessage('Demo importado localmente');
      load();
    } catch (e) {
      setMessage('Falha ao importar demo');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setLoading(true); setMessage('');
    const res = await api('create', table, form);
    if (res.ok) { setMessage('Criado'); setForm({}); load(); } else { demoCreate(table, form); setMessage('Criado localmente'); setForm({}); load(); }
    setLoading(false);
  };

  const del = async (id: any) => {
    setLoading(true); setMessage('');
    const r = await fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'delete', table, id }) });
    if (!r.ok) demoDelete(table, id);
    setLoading(false); load();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dados</h1>
            <p className="text-muted-foreground">CRUD rápido integrado ao Supabase</p>
          </div>
          <div className="flex gap-2">
            <select className="border rounded px-3 py-2" value={table} onChange={(e)=>setTable(e.target.value)}>
              {tables.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
            <Button onClick={load} disabled={loading}>Atualizar</Button>
            <Button variant="outline" onClick={importDemo} disabled={loading}>Importar demo</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.keys(form).length === 0 && (
                <Input placeholder="campo:valor" value="" onChange={()=>{}} />
              )}
              <Input placeholder="campo" value={form.field||''} onChange={(e)=>setForm({ ...form, field: e.target.value })} />
              <Input placeholder="valor" value={form.value||''} onChange={(e)=>setForm({ ...form, value: e.target.value })} />
            </div>
            <Button onClick={submit} disabled={loading}>Criar</Button>
            {message && <div className="text-sm text-muted-foreground">{message}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">id</th>
                    <th className="text-left p-2">dados</th>
                    <th className="text-left p-2">ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r: any) => (
                    <tr key={r.id || JSON.stringify(r)} className="border-t">
                      <td className="p-2">{r.id || '-'}</td>
                      <td className="p-2"><pre className="whitespace-pre-wrap">{JSON.stringify(r, null, 2)}</pre></td>
                      <td className="p-2"><Button variant="outline" onClick={()=>del(r.id)} disabled={!r.id}>Excluir</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
