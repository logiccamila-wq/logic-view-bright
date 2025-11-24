import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { listFolhaPagamento, createFolhaPagamento, updateFolhaPagamento, deleteFolhaPagamento } from "@/lib/db/folha";
import { supabase } from "@/integrations/supabase/client";

export default function FolhaPagamento() {
  const [folhas, setFolhas] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [competenciaFilter, setCompetenciaFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFolha, setEditingFolha] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    funcionario_id: "",
    competencia: new Date().toISOString().slice(0, 7),
    salario_base: 0,
    horas_extras: 0,
    descontos: 0,
    beneficios: 0,
    ferias: false,
    ferias_inicio: "",
    ferias_fim: "",
    promocao: false,
    nova_funcao: "",
    exame_periodico: "",
  });

  useEffect(() => {
    loadData();
  }, [competenciaFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const [folhasData, empData] = await Promise.all([
        listFolhaPagamento(competenciaFilter),
        supabase.from("employees").select("*").order("nome"),
      ]);
      setFolhas(folhasData || []);
      setEmployees(empData.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(folha: any) {
    setEditingFolha(folha);
    setFormData({
      funcionario_id: folha.funcionario_id,
      competencia: folha.competencia,
      salario_base: folha.salario_base || 0,
      horas_extras: folha.horas_extras || 0,
      descontos: folha.descontos || 0,
      beneficios: folha.beneficios || 0,
      ferias: folha.ferias || false,
      ferias_inicio: folha.ferias_inicio || "",
      ferias_fim: folha.ferias_fim || "",
      promocao: folha.promocao || false,
      nova_funcao: folha.nova_funcao || "",
      exame_periodico: folha.exame_periodico || "",
    });
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingFolha(null);
    setFormData({
      funcionario_id: "",
      competencia: new Date().toISOString().slice(0, 7),
      salario_base: 0,
      horas_extras: 0,
      descontos: 0,
      beneficios: 0,
      ferias: false,
      ferias_inicio: "",
      ferias_fim: "",
      promocao: false,
      nova_funcao: "",
      exame_periodico: "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    try {
      const dataToSave = {
        ...formData,
        ferias_inicio: formData.ferias && formData.ferias_inicio ? formData.ferias_inicio : null,
        ferias_fim: formData.ferias && formData.ferias_fim ? formData.ferias_fim : null,
        nova_funcao: formData.promocao && formData.nova_funcao ? formData.nova_funcao : null,
        exame_periodico: formData.exame_periodico || null,
      };

      if (editingFolha) {
        await updateFolhaPagamento(editingFolha.id, dataToSave);
        toast.success("Folha atualizada");
      } else {
        await createFolhaPagamento(dataToSave);
        toast.success("Folha criada");
      }
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar folha");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir esta folha?")) return;

    try {
      await deleteFolhaPagamento(id);
      toast.success("Folha excluída");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir folha");
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calcularTotal = (folha: any) => {
    const base = Number(folha.salario_base) || 0;
    const extras = Number(folha.horas_extras) || 0;
    const beneficios = Number(folha.beneficios) || 0;
    const descontos = Number(folha.descontos) || 0;
    return base + extras + beneficios - descontos;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Folha de Pagamento</h1>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Folha
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Label>Competência</Label>
              <Input
                type="month"
                value={competenciaFilter}
                onChange={(e) => setCompetenciaFilter(e.target.value)}
                className="w-48"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : (
              <div className="space-y-3">
                {folhas.map((folha) => (
                  <Card key={folha.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{folha.employees?.nome}</h3>
                            <span className="text-sm text-muted-foreground">
                              {folha.competencia}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Salário Base:</span>{" "}
                              <span className="font-medium">{formatCurrency(folha.salario_base || 0)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Horas Extras:</span>{" "}
                              <span className="font-medium">{formatCurrency(folha.horas_extras || 0)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Benefícios:</span>{" "}
                              <span className="font-medium">{formatCurrency(folha.beneficios || 0)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Descontos:</span>{" "}
                              <span className="font-medium text-red-600">
                                -{formatCurrency(folha.descontos || 0)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-4 mt-3">
                            {folha.ferias && (
                              <div className="flex items-center gap-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                <CheckCircle className="h-3 w-3" />
                                Férias: {new Date(folha.ferias_inicio).toLocaleDateString()} -{" "}
                                {new Date(folha.ferias_fim).toLocaleDateString()}
                              </div>
                            )}
                            {folha.promocao && (
                              <div className="flex items-center gap-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                <CheckCircle className="h-3 w-3" />
                                Promoção: {folha.nova_funcao}
                              </div>
                            )}
                            {folha.exame_periodico && (
                              <div className="flex items-center gap-2 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                <AlertCircle className="h-3 w-3" />
                                Exame: {new Date(folha.exame_periodico).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t mt-3">
                            <span className="text-sm text-muted-foreground">Total Líquido:</span>{" "}
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(calcularTotal(folha))}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(folha)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(folha.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFolha ? "Editar" : "Nova"} Folha de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Funcionário</Label>
              <Select
                value={formData.funcionario_id}
                onValueChange={(value) => setFormData({ ...formData, funcionario_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nome} - {emp.cargo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Competência</Label>
              <Input
                type="month"
                value={formData.competencia}
                onChange={(e) => setFormData({ ...formData, competencia: e.target.value })}
              />
            </div>
            <div>
              <Label>Salário Base</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.salario_base}
                onChange={(e) => setFormData({ ...formData, salario_base: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Horas Extras</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.horas_extras}
                onChange={(e) => setFormData({ ...formData, horas_extras: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Benefícios</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.beneficios}
                onChange={(e) => setFormData({ ...formData, beneficios: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Descontos</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.descontos}
                onChange={(e) => setFormData({ ...formData, descontos: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="col-span-2 space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ferias"
                  checked={formData.ferias}
                  onCheckedChange={(checked) => setFormData({ ...formData, ferias: checked as boolean })}
                />
                <Label htmlFor="ferias">Férias</Label>
              </div>

              {formData.ferias && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <Label>Início das Férias</Label>
                    <Input
                      type="date"
                      value={formData.ferias_inicio}
                      onChange={(e) => setFormData({ ...formData, ferias_inicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Fim das Férias</Label>
                    <Input
                      type="date"
                      value={formData.ferias_fim}
                      onChange={(e) => setFormData({ ...formData, ferias_fim: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="promocao"
                  checked={formData.promocao}
                  onCheckedChange={(checked) => setFormData({ ...formData, promocao: checked as boolean })}
                />
                <Label htmlFor="promocao">Promoção</Label>
              </div>

              {formData.promocao && (
                <div className="pl-6">
                  <Label>Nova Função</Label>
                  <Input
                    value={formData.nova_funcao}
                    onChange={(e) => setFormData({ ...formData, nova_funcao: e.target.value })}
                    placeholder="Nome da nova função"
                  />
                </div>
              )}

              <div>
                <Label>Exame Periódico</Label>
                <Input
                  type="date"
                  value={formData.exame_periodico}
                  onChange={(e) => setFormData({ ...formData, exame_periodico: e.target.value })}
                />
              </div>
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
