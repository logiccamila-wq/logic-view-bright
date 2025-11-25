import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ArrowUpCircle, ArrowDownCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import { listLancamentos, createLancamento, updateLancamento, deleteLancamento } from "@/lib/db/lancamentos";
import { listPlanoContas } from "@/lib/db/planoContas";
import { listCentrosCusto } from "@/lib/db/centrosCusto";
import { supabase } from "@/integrations/supabase/client";

export default function Lancamentos() {
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLanc, setEditingLanc] = useState<any | null>(null);
  const [filters, setFilters] = useState({
    dataInicio: "",
    dataFim: "",
    tipo: "todos",
    planoContasId: "todos",
    centroCustoId: "todos",
    vehiclePlaca: "todos",
  });
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    descricao: "",
    valor: 0,
    tipo: "saida" as "entrada" | "saida",
    plano_contas_id: "nenhum",
    centro_custo_id: "nenhum",
    vehicle_placa: "nenhum",
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  async function loadData() {
    try {
      setLoading(true);
      const lancFiltros = {
        ...filters,
        tipo: filters.tipo === "todos" ? "" : filters.tipo,
        planoContasId: filters.planoContasId === "todos" ? "" : filters.planoContasId,
        centroCustoId: filters.centroCustoId === "todos" ? "" : filters.centroCustoId,
        vehiclePlaca: filters.vehiclePlaca === "todos" ? "" : filters.vehiclePlaca,
      };
      const [lancData, contasData, centrosData, vehiclesData] = await Promise.all([
        listLancamentos(lancFiltros),
        listPlanoContas(),
        listCentrosCusto(),
        supabase.from("vehicles").select("*").eq("status", "ativo").order("placa"),
      ]);
      setLancamentos(lancData);
      setContas(contasData);
      setCentros(centrosData);
      setVehicles(vehiclesData.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(lanc: any) {
    setEditingLanc(lanc);
    setFormData({
      data: lanc.data,
      descricao: lanc.descricao || "",
      valor: lanc.valor,
      tipo: lanc.tipo,
      plano_contas_id: lanc.plano_contas_id || "nenhum",
      centro_custo_id: lanc.centro_custo_id || "nenhum",
      vehicle_placa: lanc.vehicle_placa || "nenhum",
    });
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingLanc(null);
    setFormData({
      data: new Date().toISOString().split("T")[0],
      descricao: "",
      valor: 0,
      tipo: "saida",
      plano_contas_id: "nenhum",
      centro_custo_id: "nenhum",
      vehicle_placa: "nenhum",
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    try {
      if (!formData.vehicle_placa || formData.vehicle_placa === "nenhum") {
        toast.error("Selecione uma placa para a despesa!");
        return;
      }
      const dataToSave: any = {
        ...formData,
        plano_contas_id: formData.plano_contas_id === "nenhum" ? null : formData.plano_contas_id,
        centro_custo_id: formData.centro_custo_id === "nenhum" ? null : formData.centro_custo_id,
        vehicle_placa: formData.vehicle_placa === "nenhum" ? null : formData.vehicle_placa,
      };

      if (editingLanc) {
        await updateLancamento(editingLanc.id, dataToSave);
        toast.success("Lançamento atualizado");
      } else {
        await createLancamento(dataToSave);
        toast.success("Lançamento criado");
      }
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar lançamento");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este lançamento?")) return;
    try {
      await deleteLancamento(id);
      toast.success("Lançamento excluído");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir lançamento");
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const totalEntradas = lancamentos.filter((l) => l.tipo === "entrada").reduce((sum, l) => sum + Number(l.valor), 0);
  const totalSaidas = lancamentos.filter((l) => l.tipo === "saida").reduce((sum, l) => sum + Number(l.valor), 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Lançamentos Financeiros</h1>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Entradas</span>
                <ArrowUpCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Saídas</span>
                <ArrowDownCircle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <span className="text-sm font-medium">Saldo</span>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(saldo)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="grid grid-cols-6 gap-4">
              <div>
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
                />
              </div>
              <div>
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={filters.tipo} onValueChange={(value) => setFilters({ ...filters, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Conta</Label>
                <Select
                  value={filters.planoContasId}
                  onValueChange={(value) => setFilters({ ...filters, planoContasId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {contas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.codigo} - {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Centro de Custo</Label>
                <Select
                  value={filters.centroCustoId}
                  onValueChange={(value) => setFilters({ ...filters, centroCustoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {centros.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.codigo} - {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Placa</Label>
                <Select
                  value={filters.vehiclePlaca}
                  onValueChange={(value) => setFilters({ ...filters, vehiclePlaca: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas placas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v.placa} value={v.placa}>
                        {v.placa} - {v.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : (
              <div className="space-y-2">
                {lancamentos.map((lanc) => (
                  <div key={lanc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      {lanc.tipo === "entrada" ? (
                        <ArrowUpCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold">{formatDate(lanc.data)}</p>
                          <p>{lanc.descricao}</p>
                          {lanc.vehicle_placa && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-600 flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {lanc.vehicle_placa}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {lanc.plano_contas && <span>{lanc.plano_contas.nome}</span>}
                          {lanc.centros_custo && <span>Centro: {lanc.centros_custo.nome}</span>}
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${lanc.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(lanc.valor)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(lanc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(lanc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLanc ? "Editar" : "Novo"} Lançamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />
            </div>
            <div>
              <Label>Valor *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Placa do Veículo *</Label>
              <Select
                value={formData.vehicle_placa}
                onValueChange={(value) => setFormData({ ...formData, vehicle_placa: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma placa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.placa} value={v.placa}>
                      {v.placa} - {v.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conta</Label>
              <Select
                value={formData.plano_contas_id}
                onValueChange={(value) => setFormData({ ...formData, plano_contas_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhuma</SelectItem>
                  {contas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.codigo} - {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Centro de Custo</Label>
              <Select
                value={formData.centro_custo_id}
                onValueChange={(value) => setFormData({ ...formData, centro_custo_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
                  {centros.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.codigo} - {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Descrição *</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do lançamento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
