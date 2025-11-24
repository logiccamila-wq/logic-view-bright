import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { listPlanoContas, createPlanoContas, updatePlanoContas, deletePlanoContas } from "@/lib/db/planoContas";
import { listCentrosCusto } from "@/lib/db/centrosCusto";
import type { PlanoContas } from "@/types/financeiro";

export default function PlanoContasPage() {
  const [contas, setContas] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    tipo: "despesa" as PlanoContas["tipo"],
    classe: "",
    centro_custo_id: "",
    descricao: "",
    status: "ativo",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [contasData, centrosData] = await Promise.all([
        listPlanoContas(),
        listCentrosCusto(),
      ]);
      setContas(contasData);
      setCentros(centrosData);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(conta: any) {
    setEditingConta(conta);
    setFormData({
      codigo: conta.codigo,
      nome: conta.nome,
      tipo: conta.tipo,
      classe: conta.classe || "",
      centro_custo_id: conta.centro_custo_id || "",
      descricao: conta.descricao || "",
      status: conta.status,
    });
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingConta(null);
    setFormData({
      codigo: "",
      nome: "",
      tipo: "despesa",
      classe: "",
      centro_custo_id: "",
      descricao: "",
      status: "ativo",
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    try {
      const dataToSave = {
        ...formData,
        centro_custo_id: formData.centro_custo_id || null,
      };

      if (editingConta) {
        await updatePlanoContas(editingConta.id, dataToSave);
        toast.success("Conta atualizada");
      } else {
        await createPlanoContas(dataToSave);
        toast.success("Conta criada");
      }
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar conta");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir esta conta?")) return;

    try {
      await deletePlanoContas(id);
      toast.success("Conta excluída");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir conta");
    }
  }

  const filteredContas = contas.filter((c) => {
    const matchesSearch =
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !tipoFilter || c.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Plano de Contas</h1>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="imposto">Imposto</SelectItem>
                  <SelectItem value="custo">Custo</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="passivo">Passivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : (
              <div className="space-y-2">
                {filteredContas.map((conta) => (
                  <div
                    key={conta.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">
                        {conta.codigo} - {conta.nome}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Tipo: {conta.tipo}</span>
                        {conta.classe && <span>Classe: {conta.classe}</span>}
                        {conta.centros_custo && (
                          <span>Centro: {conta.centros_custo.nome}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(conta)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(conta.id)}
                      >
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
            <DialogTitle>{editingConta ? "Editar" : "Nova"} Conta</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código</Label>
              <Input
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="1.1.001"
              />
            </div>
            <div>
              <Label>Nome</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome da conta"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="imposto">Imposto</SelectItem>
                  <SelectItem value="custo">Custo</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="passivo">Passivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Classe</Label>
              <Input
                value={formData.classe}
                onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                placeholder="Classe"
              />
            </div>
            <div className="col-span-2">
              <Label>Centro de Custo</Label>
              <Select
                value={formData.centro_custo_id}
                onValueChange={(value) => setFormData({ ...formData, centro_custo_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {centros.map((centro) => (
                    <SelectItem key={centro.id} value={centro.id}>
                      {centro.codigo} - {centro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição da conta"
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
