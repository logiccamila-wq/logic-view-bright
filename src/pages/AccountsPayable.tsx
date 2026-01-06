import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, DollarSign, AlertCircle, CheckCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ContaPagarDialog } from "@/components/financial/ContaPagarDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  categoria: string;
  observacoes: string;
}

const AccountsPayable = () => {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contaToDelete, setContaToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadContas();
  }, []);

  const loadContas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contas_pagar")
        .select("*")
        .order("data_vencimento", { ascending: true });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      toast.error("Erro ao carregar contas a pagar");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (conta?: ContaPagar) => {
    setSelectedConta(conta || null);
    setDialogOpen(true);
  };

  const handleMarkAsPaid = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("contas_pagar")
        .update({
          status: "pago",
          data_pagamento: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Conta marcada como paga!");
      loadContas();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao atualizar conta");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setContaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!contaToDelete) return;
    
    setActionLoading(contaToDelete);
    try {
      const { error } = await supabase
        .from("contas_pagar")
        .delete()
        .eq("id", contaToDelete);

      if (error) throw error;
      toast.success("Conta excluída com sucesso!");
      loadContas();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao excluir conta");
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setContaToDelete(null);
    }
  };

  const filteredContas = contas.filter(
    (c) =>
      c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendente = contas
    .filter((c) => c.status === "pendente")
    .reduce((sum, c) => sum + Number(c.valor), 0);

  const totalPago = contas
    .filter((c) => c.status === "pago")
    .reduce((sum, c) => sum + Number(c.valor), 0);

  const contasAtrasadas = contas.filter(
    (c) => c.status === "pendente" && new Date(c.data_vencimento) < new Date()
  ).length;

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string, dataVencimento: string) => {
    if (status === "pago") {
      return <Badge variant="outline" className="bg-green-500/20 text-green-600">PAGO</Badge>;
    }
    if (new Date(dataVencimento) < new Date()) {
      return <Badge variant="destructive">ATRASADO</Badge>;
    }
    return <Badge variant="secondary">PENDENTE</Badge>;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contas a Pagar</h1>
            <p className="text-muted-foreground">Gestão de contas a pagar e despesas</p>
          </div>
          <Button className="gap-2" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4" />
            Nova Conta
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Pendente"
            value={formatMoney(totalPendente)}
            icon={AlertCircle}
          />
          <StatCard
            title="Total Pago"
            value={formatMoney(totalPago)}
            icon={CheckCircle}
          />
          <StatCard
            title="Contas Atrasadas"
            value={contasAtrasadas.toString()}
            icon={DollarSign}
          />
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por descrição ou fornecedor..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        {loading ? (
          <Card>
            <CardContent className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredContas.map((conta) => (
              <Card key={conta.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{conta.descricao}</h3>
                        {getStatusBadge(conta.status, conta.data_vencimento)}
                        {conta.categoria && (
                          <Badge variant="outline">{conta.categoria}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Fornecedor: {conta.fornecedor}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>
                          Vencimento:{" "}
                          {format(new Date(conta.data_vencimento), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                        {conta.data_pagamento && (
                          <span>
                            Pago em:{" "}
                            {format(new Date(conta.data_pagamento), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                        )}
                      </div>
                      {conta.observacoes && (
                        <p className="text-sm mt-2">{conta.observacoes}</p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-2xl font-bold">{formatMoney(conta.valor)}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(conta)}
                          disabled={actionLoading === conta.id}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(conta.id)}
                          disabled={actionLoading === conta.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {conta.status === "pendente" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(conta.id)}
                            disabled={actionLoading === conta.id}
                          >
                            {actionLoading === conta.id && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Marcar como Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredContas.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  Nenhuma conta a pagar encontrada
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <ContaPagarDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        conta={selectedConta}
        onSuccess={loadContas}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."
      />
    </>
  );
};

export default AccountsPayable;
