import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Warehouse, ArrowUpDown, Plus, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useWmsProducts, useWmsMovements, useWmsZones, useWmsMutations, WmsProduct } from "@/hooks/useWMS";

const emptyProduct: Partial<WmsProduct> = { code: "", name: "", category: "peca", unit: "UN", quantity: 0, minimum_stock: 5, unit_price: 0, location: "", zone: "", barcode: "" };

const WMS = () => {
  const { data: products = [], isLoading: loadingProducts } = useWmsProducts();
  const { data: movements = [], isLoading: loadingMovs } = useWmsMovements();
  const { data: zones = [] } = useWmsZones();
  const { createProduct, updateProduct, deleteProduct, createMovement } = useWmsMutations();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movDialogOpen, setMovDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<WmsProduct> | null>(null);
  const [movForm, setMovForm] = useState({ product_id: "", type: "entrada", quantity: 1, origin: "", destination: "", reason: "" });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = products.reduce((s, p) => s + p.quantity, 0);
  const lowStock = products.filter(p => p.quantity <= p.minimum_stock).length;
  const totalValue = products.reduce((s, p) => s + p.quantity * p.unit_price, 0);

  const statusBadge = (p: WmsProduct) => {
    if (p.quantity <= 0) return <Badge variant="destructive">Zerado</Badge>;
    if (p.quantity <= p.minimum_stock) return <Badge className="bg-yellow-600">Baixo</Badge>;
    return <Badge className="bg-green-600">OK</Badge>;
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      updateProduct.mutate(editing as WmsProduct);
    } else {
      createProduct.mutate(editing);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Remover este produto do estoque?")) deleteProduct.mutate(id);
  };

  const handleMovSave = () => {
    createMovement.mutate(movForm);
    setMovDialogOpen(false);
    setMovForm({ product_id: "", type: "entrada", quantity: 1, origin: "", destination: "", reason: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WMS - Gestão de Armazém</h1>
          <p className="text-muted-foreground mt-1">Controle de Estoque e Movimentações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setMovForm({ product_id: "", type: "entrada", quantity: 1, origin: "", destination: "", reason: "" }); setMovDialogOpen(true); }}>
            <ArrowUpDown className="h-4 w-4 mr-2" /> Movimentação
          </Button>
          <Button onClick={() => { setEditing({ ...emptyProduct }); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Produto
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Itens" value={totalItems.toLocaleString("pt-BR")} icon={<Package className="h-5 w-5" />} />
        <StatCard title="SKUs Cadastrados" value={products.length} icon={<Warehouse className="h-5 w-5" />} />
        <StatCard title="Estoque Baixo" value={lowStock} icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />} />
        <StatCard title="Valor Total" value={`R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={<Package className="h-5 w-5" />} />
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="zones">Zonas</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produtos em Estoque</CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar produto, código ou local..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Mín</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum produto encontrado</TableCell></TableRow>
                    ) : filtered.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.code}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell>{p.minimum_stock}</TableCell>
                        <TableCell>{p.location}</TableCell>
                        <TableCell>R$ {p.unit_price?.toFixed(2)}</TableCell>
                        <TableCell>{statusBadge(p)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditing({ ...p }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader><CardTitle>Últimas Movimentações</CardTitle></CardHeader>
            <CardContent>
              {loadingMovs ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma movimentação</TableCell></TableRow>
                    ) : movements.map(m => (
                      <TableRow key={m.id}>
                        <TableCell>{new Date(m.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <Badge variant={m.type === "entrada" ? "default" : m.type === "saida" ? "destructive" : "secondary"}>
                            {m.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{products.find(p => p.id === m.product_id)?.name || m.product_id}</TableCell>
                        <TableCell>{m.quantity}</TableCell>
                        <TableCell>{m.origin || "-"}</TableCell>
                        <TableCell>{m.destination || "-"}</TableCell>
                        <TableCell>{m.reason || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <div className="grid gap-4 md:grid-cols-3">
            {zones.length === 0 ? (
              <p className="col-span-3 text-center py-8 text-muted-foreground">Nenhuma zona cadastrada</p>
            ) : zones.map(z => (
              <Card key={z.id}>
                <CardHeader><CardTitle className="text-lg">{z.name}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Tipo: {z.type}</p>
                  <p className="text-sm">Capacidade: {z.capacity_m3} m³</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Ocupação</span><span>{z.occupation_pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${z.occupation_pct > 90 ? "bg-red-500" : z.occupation_pct > 70 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${z.occupation_pct}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Produto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar Produto" : "Novo Produto"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Código</Label><Input value={editing?.code || ""} onChange={e => setEditing(prev => ({ ...prev, code: e.target.value }))} /></div>
              <div><Label>Código de Barras</Label><Input value={editing?.barcode || ""} onChange={e => setEditing(prev => ({ ...prev, barcode: e.target.value }))} /></div>
            </div>
            <div><Label>Nome</Label><Input value={editing?.name || ""} onChange={e => setEditing(prev => ({ ...prev, name: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select value={editing?.category || "peca"} onValueChange={v => setEditing(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peca">Peça</SelectItem>
                    <SelectItem value="fluido">Fluido</SelectItem>
                    <SelectItem value="pneu">Pneu</SelectItem>
                    <SelectItem value="filtro">Filtro</SelectItem>
                    <SelectItem value="eletrico">Elétrico</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Unidade</Label><Input value={editing?.unit || "UN"} onChange={e => setEditing(prev => ({ ...prev, unit: e.target.value }))} /></div>
              <div><Label>Localização</Label><Input placeholder="A1-B3" value={editing?.location || ""} onChange={e => setEditing(prev => ({ ...prev, location: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Quantidade</Label><Input type="number" value={editing?.quantity ?? 0} onChange={e => setEditing(prev => ({ ...prev, quantity: Number(e.target.value) }))} /></div>
              <div><Label>Estoque Mín.</Label><Input type="number" value={editing?.minimum_stock ?? 5} onChange={e => setEditing(prev => ({ ...prev, minimum_stock: Number(e.target.value) }))} /></div>
              <div><Label>Preço Unit.(R$)</Label><Input type="number" step="0.01" value={editing?.unit_price ?? 0} onChange={e => setEditing(prev => ({ ...prev, unit_price: Number(e.target.value) }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createProduct.isPending || updateProduct.isPending}>
              {editing?.id ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Movimentação */}
      <Dialog open={movDialogOpen} onOpenChange={setMovDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova Movimentação</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Produto</Label>
              <Select value={movForm.product_id} onValueChange={v => setMovForm(f => ({ ...f, product_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select value={movForm.type} onValueChange={v => setMovForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Quantidade</Label><Input type="number" value={movForm.quantity} onChange={e => setMovForm(f => ({ ...f, quantity: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Origem</Label><Input value={movForm.origin} onChange={e => setMovForm(f => ({ ...f, origin: e.target.value }))} placeholder="Fornecedor ou local" /></div>
            <div><Label>Destino</Label><Input value={movForm.destination} onChange={e => setMovForm(f => ({ ...f, destination: e.target.value }))} placeholder="Frota ou CD" /></div>
            <div><Label>Motivo</Label><Input value={movForm.reason} onChange={e => setMovForm(f => ({ ...f, reason: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleMovSave} disabled={!movForm.product_id || createMovement.isPending}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WMS;
