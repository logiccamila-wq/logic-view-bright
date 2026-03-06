import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Clock, Plus, Search, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOmsOrders, useOmsMutations, OmsOrder } from "@/hooks/useOMS";

const emptyOrder: Partial<OmsOrder> = { order_number: "", customer_name: "", customer_document: "", origin: "", destination: "", status: "pendente", priority: "normal", items_description: "", total_value: 0, notes: "" };

const OMS = () => {
  const { data: orders = [], isLoading } = useOmsOrders();
  const { createOrder, updateOrder, deleteOrder } = useOmsMutations();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<OmsOrder> | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendentes = orders.filter(o => o.status === "pendente").length;
  const emTransito = orders.filter(o => o.status === "em_transito").length;
  const entregues = orders.filter(o => o.status === "entregue").length;
  const totalValue = orders.reduce((s, o) => s + (o.total_value || 0), 0);

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pendente: { label: "Pendente", variant: "secondary" },
      aprovado: { label: "Aprovado", variant: "default" },
      em_separacao: { label: "Em Separação", variant: "outline" },
      em_transito: { label: "Em Trânsito", variant: "default" },
      entregue: { label: "Entregue", variant: "default" },
      cancelado: { label: "Cancelado", variant: "destructive" },
    };
    const s = map[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={s.variant} className={status === "entregue" ? "bg-green-600" : status === "em_transito" ? "bg-blue-600" : ""}>{s.label}</Badge>;
  };

  const priorityBadge = (p: string) => {
    if (p === "urgente") return <Badge variant="destructive">Urgente</Badge>;
    if (p === "alta") return <Badge className="bg-orange-500">Alta</Badge>;
    return <Badge variant="outline">{p}</Badge>;
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      updateOrder.mutate(editing as OmsOrder);
    } else {
      createOrder.mutate(editing);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir este pedido?")) deleteOrder.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OMS - Gestão de Pedidos</h1>
          <p className="text-muted-foreground mt-1">Ciclo operacional de pedidos ponta a ponta</p>
        </div>
        <Button onClick={() => { setEditing({ ...emptyOrder, order_number: `PED-${Date.now().toString(36).toUpperCase()}` }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Novo Pedido
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Pedidos" value={orders.length} icon={<ShoppingCart className="h-5 w-5" />} />
        <StatCard title="Pendentes" value={pendentes} icon={<Clock className="h-5 w-5 text-yellow-500" />} />
        <StatCard title="Em Trânsito" value={emTransito} icon={<Package className="h-5 w-5 text-blue-500" />} />
        <StatCard title="Entregues" value={entregues} icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Pedidos</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="em_separacao">Em Separação</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar pedido ou cliente..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum pedido encontrado</TableCell></TableRow>
                ) : filtered.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono font-medium">{o.order_number}</TableCell>
                    <TableCell>{o.customer_name}</TableCell>
                    <TableCell>{o.origin || "-"}</TableCell>
                    <TableCell>{o.destination || "-"}</TableCell>
                    <TableCell>R$ {(o.total_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{priorityBadge(o.priority)}</TableCell>
                    <TableCell>{statusBadge(o.status)}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing({ ...o }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar Pedido" : "Novo Pedido"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nº Pedido</Label><Input value={editing?.order_number || ""} onChange={e => setEditing(prev => ({ ...prev, order_number: e.target.value }))} /></div>
              <div>
                <Label>Prioridade</Label>
                <Select value={editing?.priority || "normal"} onValueChange={v => setEditing(prev => ({ ...prev, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Cliente</Label><Input value={editing?.customer_name || ""} onChange={e => setEditing(prev => ({ ...prev, customer_name: e.target.value }))} /></div>
              <div><Label>CNPJ/CPF</Label><Input value={editing?.customer_document || ""} onChange={e => setEditing(prev => ({ ...prev, customer_document: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Origem</Label><Input value={editing?.origin || ""} onChange={e => setEditing(prev => ({ ...prev, origin: e.target.value }))} /></div>
              <div><Label>Destino</Label><Input value={editing?.destination || ""} onChange={e => setEditing(prev => ({ ...prev, destination: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Valor Total (R$)</Label><Input type="number" step="0.01" value={editing?.total_value ?? 0} onChange={e => setEditing(prev => ({ ...prev, total_value: Number(e.target.value) }))} /></div>
              <div>
                <Label>Status</Label>
                <Select value={editing?.status || "pendente"} onValueChange={v => setEditing(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="em_separacao">Em Separação</SelectItem>
                    <SelectItem value="em_transito">Em Trânsito</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Itens / Descrição</Label><Textarea value={editing?.items_description || ""} onChange={e => setEditing(prev => ({ ...prev, items_description: e.target.value }))} rows={3} /></div>
            <div><Label>Observações</Label><Input value={editing?.notes || ""} onChange={e => setEditing(prev => ({ ...prev, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createOrder.isPending || updateOrder.isPending}>
              {editing?.id ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OMS;
