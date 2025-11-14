import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContaReceber {
  id: string;
  descricao: string;
  cliente: string;
  valor: number;
  data_vencimento: string;
  data_recebimento: string | null;
  status: string;
  cte_id: string | null;
  observacoes: string;
}

const AccountsReceivable = () => {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContas();
  }, []);

  const loadContas = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("contas_receber")
        .select("*")
        .order("data_vencimento", { ascending: true });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      toast.error("Erro ao carregar contas a receber");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContas = contas.filter(
    (c) =>
      c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendente = contas
    .filter((c) => c.status === "pendente")
    .reduce((sum, c) => sum + Number(c.valor), 0);

  const totalRecebido = contas
    .filter((c) => c.status === "recebido")
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
    if (status === "recebido") {
      return <Badge variant="outline" className="bg-green-500/20 text-green-600">RECEBIDO</Badge>;
    }
    if (new Date(dataVencimento) < new Date()) {
      return <Badge variant="destructive">ATRASADO</Badge>;
    }
    return <Badge variant="secondary">PENDENTE</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contas a Receber</h1>
            <p className="text-muted-foreground">Gestão de contas a receber e receitas</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Conta
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total a Receber"
            value={formatMoney(totalPendente)}
            icon={AlertCircle}
          />
          <StatCard
            title="Total Recebido"
            value={formatMoney(totalRecebido)}
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
                placeholder="Buscar por descrição ou cliente..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        <div className="grid gap-4">
          {filteredContas.map((conta) => (
            <Card key={conta.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{conta.descricao}</h3>
                      {getStatusBadge(conta.status, conta.data_vencimento)}
                      {conta.cte_id && (
                        <Badge variant="outline">Com CTe</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cliente: {conta.cliente}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>
                        Vencimento:{" "}
                        {format(new Date(conta.data_vencimento), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      {conta.data_recebimento && (
                        <span>
                          Recebido em:{" "}
                          {format(new Date(conta.data_recebimento), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      )}
                    </div>
                    {conta.observacoes && (
                      <p className="text-sm mt-2">{conta.observacoes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatMoney(conta.valor)}</p>
                    {conta.status === "pendente" && (
                      <Button size="sm" className="mt-2">
                        Marcar como Recebido
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredContas.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Nenhuma conta a receber encontrada
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AccountsReceivable;
