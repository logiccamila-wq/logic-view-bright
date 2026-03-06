import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, ShoppingBag, FileText, Plus, Search, Pencil, Trash2, Star } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useScmSuppliers, useScmPurchaseOrders, useScmMutations, ScmSupplier, ScmPurchaseOrder } from "@/hooks/useSCM";

const emptySupplier: Partial<ScmSupplier> = { name: "", document: "", contact_name: "", email: "", phone: "", category: "pecas", rating: 5, status: "ativo", address: "" };
const emptyPO: Partial<ScmPurchaseOrder> = { po_number: "", supplier_id: "", status: "rascunho", items_description: "", total_value: 0, delivery_date: "", notes: "" };

const SCM = () => {
  const { data: suppliers = [], isLoading: loadingSupp } = useScmSuppliers();
  const { data: purchaseOrders = [], isLoading: loadingPOs } = useScmPurchaseOrders();
  const { createSupplier, updateSupplier, deleteSupplier, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = useScmMutations();

  const [search, setSearch] = useState("");
  const [suppDialogOpen, setSuppDialogOpen] = useState(false);
  const [poDialogOpen, setPoDialogOpen] = useState(false);
  const [editingSupp, setEditingSupp] = useState<Partial<ScmSupplier> | null>(null);
  const [editingPO, setEditingPO] = useState<Partial<ScmPurchaseOrder> | null>(null);

  const filteredSupp = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.document.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPOs = purchaseOrders.filter(po =>
    po.po_number.toLowerCase().includes(search.toLowerCase())
  );

  const totalPOValue = purchaseOrders.reduce((s, po) => s + (po.total_value || 0), 0);
  const pendingPOs = purchaseOrders.filter(po => po.status === "pendente" || po.status === "rascunho").length;

  const handleSaveSupp = () => {
    if (!editingSupp) return;
    if (editingSupp.id) updateSupplier.mutate(editingSupp as ScmSupplier);
    else createSupplier.mutate(editingSupp);
    setSuppDialogOpen(false);
    setEditingSupp(null);
  };

  const handleDeleteSupp = (id: string) => {
    if (confirm("Excluir este fornecedor?")) deleteSupplier.mutate(id);
  };

  const handleSavePO = () => {
    if (!editingPO) return;
    if (editingPO.id) updatePurchaseOrder.mutate(editingPO as ScmPurchaseOrder);
    else createPurchaseOrder.mutate(editingPO);
    setPoDialogOpen(false);
    setEditingPO(null);
  };

  const handleDeletePO = (id: string) => {
    if (confirm("Excluir esta ordem de compra?")) deletePurchaseOrder.mutate(id);
  };

  const ratingStars = (r: number) => (
    <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3 w-3 ${i < r ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}</div>
  );

  const poStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      rascunho: { label: "Rascunho", color: "" },
      pendente: { label: "Pendente", color: "bg-yellow-600" },
      aprovada: { label: "Aprovada", color: "bg-blue-600" },
      enviada: { label: "Enviada", color: "bg-indigo-600" },
      recebida: { label: "Recebida", color: "bg-green-600" },
      cancelada: { label: "Cancelada", color: "" },
    };
    const s = map[status] || { label: status, color: "" };
    return <Badge variant={status === "cancelada" ? "destructive" : status === "rascunho" ? "secondary" : "default"} className={s.color}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SCM - Supply Chain</h1>
          <p className="text-muted-foreground mt-1">Gestão de Fornecedores e Compras</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Fornecedores" value={suppliers.length} icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Ordens de Compra" value={purchaseOrders.length} icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard title="OCs Pendentes" value={pendingPOs} icon={<FileText className="h-5 w-5 text-yellow-500" />} />
        <StatCard title="Valor Total OCs" value={`R$ ${totalPOValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<ShoppingBag className="h-5 w-5" />} />
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="purchase-orders">Ordens de Compra</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>Fornecedores</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar fornecedor..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <Button onClick={() => { setEditingSupp({ ...emptySupplier }); setSuppDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Novo Fornecedor
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSupp ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSupp.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum fornecedor</TableCell></TableRow>
                    ) : filteredSupp.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="font-mono text-xs">{s.document}</TableCell>
                        <TableCell>{s.contact_name || "-"}</TableCell>
                        <TableCell>{s.phone || "-"}</TableCell>
                        <TableCell><Badge variant="outline">{s.category}</Badge></TableCell>
                        <TableCell>{ratingStars(s.rating)}</TableCell>
                        <TableCell><Badge className={s.status === "ativo" ? "bg-green-600" : ""}>{s.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingSupp({ ...s }); setSuppDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSupp(s.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-orders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>Ordens de Compra</CardTitle>
                <Button onClick={() => { setEditingPO({ ...emptyPO, po_number: `OC-${Date.now().toString(36).toUpperCase()}` }); setPoDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Nova OC
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPOs ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OC</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Entrega</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPOs.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma OC</TableCell></TableRow>
                    ) : filteredPOs.map(po => (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono font-medium">{po.po_number}</TableCell>
                        <TableCell>{suppliers.find(s => s.id === po.supplier_id)?.name || po.supplier_id}</TableCell>
                        <TableCell>R$ {(po.total_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{po.delivery_date ? new Date(po.delivery_date).toLocaleDateString("pt-BR") : "-"}</TableCell>
                        <TableCell>{poStatusBadge(po.status)}</TableCell>
                        <TableCell>{new Date(po.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingPO({ ...po }); setPoDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePO(po.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Fornecedor */}
      <Dialog open={suppDialogOpen} onOpenChange={setSuppDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingSupp?.id ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Razão Social</Label><Input value={editingSupp?.name || ""} onChange={e => setEditingSupp(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>CNPJ</Label><Input value={editingSupp?.document || ""} onChange={e => setEditingSupp(p => ({ ...p, document: e.target.value }))} placeholder="00.000.000/0001-00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contato</Label><Input value={editingSupp?.contact_name || ""} onChange={e => setEditingSupp(p => ({ ...p, contact_name: e.target.value }))} /></div>
              <div><Label>Telefone</Label><Input value={editingSupp?.phone || ""} onChange={e => setEditingSupp(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div><Label>E-mail</Label><Input type="email" value={editingSupp?.email || ""} onChange={e => setEditingSupp(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>Endereço</Label><Input value={editingSupp?.address || ""} onChange={e => setEditingSupp(p => ({ ...p, address: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select value={editingSupp?.category || "pecas"} onValueChange={v => setEditingSupp(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pecas">Peças</SelectItem>
                    <SelectItem value="pneus">Pneus</SelectItem>
                    <SelectItem value="combustivel">Combustível</SelectItem>
                    <SelectItem value="lubrificantes">Lubrificantes</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Avaliação</Label>
                <Select value={String(editingSupp?.rating || 5)} onValueChange={v => setEditingSupp(p => ({ ...p, rating: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} estrela{n > 1 ? "s" : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editingSupp?.status || "ativo"} onValueChange={v => setEditingSupp(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuppDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveSupp} disabled={createSupplier.isPending || updateSupplier.isPending}>
              {editingSupp?.id ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog OC */}
      <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingPO?.id ? "Editar OC" : "Nova Ordem de Compra"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nº OC</Label><Input value={editingPO?.po_number || ""} onChange={e => setEditingPO(p => ({ ...p, po_number: e.target.value }))} /></div>
              <div>
                <Label>Fornecedor</Label>
                <Select value={editingPO?.supplier_id || ""} onValueChange={v => setEditingPO(p => ({ ...p, supplier_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={editingPO?.total_value ?? 0} onChange={e => setEditingPO(p => ({ ...p, total_value: Number(e.target.value) }))} /></div>
              <div><Label>Previsão Entrega</Label><Input type="date" value={editingPO?.delivery_date || ""} onChange={e => setEditingPO(p => ({ ...p, delivery_date: e.target.value }))} /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editingPO?.status || "rascunho"} onValueChange={v => setEditingPO(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="recebida">Recebida</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Itens / Descrição</Label><Textarea value={editingPO?.items_description || ""} onChange={e => setEditingPO(p => ({ ...p, items_description: e.target.value }))} rows={3} /></div>
            <div><Label>Observações</Label><Input value={editingPO?.notes || ""} onChange={e => setEditingPO(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePO} disabled={createPurchaseOrder.isPending || updatePurchaseOrder.isPending}>
              {editingPO?.id ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SCM;
