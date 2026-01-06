import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { listCentrosCusto, createCentroCusto, updateCentroCusto, deleteCentroCusto } from "@/lib/db/centrosCusto";
import type { CentroCusto } from "@/types/financeiro";

export default function CentrosCusto() {
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroCusto | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    descricao: "",
    status: "ativo",
  });

  useEffect(() => {
    loadCentros();
  }, []);

  async function loadCentros() {
    try {
      setLoading(true);
      const data = await listCentrosCusto();
      setCentros(data);
    } catch (error: any) {
      toast.error("Erro ao carregar centros de custo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(centro: CentroCusto) {
    setEditingCentro(centro);
    setFormData({
      codigo: centro.codigo,
      nome: centro.nome,
      descricao: centro.descricao || "",
      status: centro.status,
    });
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingCentro(null);
    setFormData({
      codigo: "",
      nome: "",
      descricao: "",
      status: "ativo",
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    try {
      if (editingCentro) {
        await updateCentroCusto(editingCentro.id, formData);
        toast.success("Centro de custo atualizado");
      } else {
        await createCentroCusto(formData);
        toast.success("Centro de custo criado");
      }
      setDialogOpen(false);
      loadCentros();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar centro de custo");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este centro de custo?")) return;

    try {
      await deleteCentroCusto(id);
      toast.success("Centro de custo excluído");
      loadCentros();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir centro de custo");
    }
  }

  const filteredCentros = centros.filter(
    (c) =>
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Centros de Custo</h1>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Centro de Custo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : (
              <div className="space-y-2">
                {filteredCentros.map((centro) => (
                  <div
                    key={centro.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{centro.codigo} - {centro.nome}</p>
                      {centro.descricao && (
                        <p className="text-sm text-muted-foreground">{centro.descricao}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(centro)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(centro.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCentro ? "Editar" : "Novo"} Centro de Custo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Código</Label>
              <Input
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="CC001"
              />
            </div>
            <div>
              <Label>Nome</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Administrativo"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do centro de custo"
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
    </>
  )
}
