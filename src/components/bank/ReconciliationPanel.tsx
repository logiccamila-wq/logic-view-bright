import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ReconciliationPanelProps {
  transactions: any[];
}

export function ReconciliationPanel({ transactions }: ReconciliationPanelProps) {
  const { data: contasPagar } = useQuery({
    queryKey: ["contas_pagar_pendentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_pagar")
        .select("*")
        .eq("status", "pendente")
        .order("data_vencimento");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: contasReceber } = useQuery({
    queryKey: ["contas_receber_pendentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_receber")
        .select("*")
        .eq("status", "pendente")
        .order("data_vencimento");
      
      if (error) throw error;
      return data;
    },
  });

  const handleConciliar = async (transactionId: string, contaId: string, tipo: 'pagar' | 'receber') => {
    try {
      const updateData: any = {
        conciliado: true,
      };

      if (tipo === 'pagar') {
        updateData.conta_pagar_id = contaId;
      } else {
        updateData.conta_receber_id = contaId;
      }

      const { error: transError } = await supabase
        .from("bank_transactions")
        .update(updateData)
        .eq("id", transactionId);

      if (transError) throw transError;

      const { error: contaError } = await supabase
        .from(tipo === 'pagar' ? 'contas_pagar' : 'contas_receber')
        .update({ 
          status: 'pago',
          data_pagamento: new Date().toISOString(),
        })
        .eq("id", contaId);

      if (contaError) throw contaError;

      toast.success("Conciliação realizada com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getSugestoes = (transaction: any) => {
    const sugestoes: any[] = [];

    // Buscar em contas a pagar
    contasPagar?.forEach((conta) => {
      const valorMatch = Math.abs(Number(conta.valor) - Number(transaction.valor)) < 0.01;
      const dataProxima = Math.abs(
        new Date(conta.data_vencimento).getTime() - new Date(transaction.data_transacao).getTime()
      ) < 3 * 24 * 60 * 60 * 1000; // 3 dias

      if (valorMatch && dataProxima && transaction.tipo_transacao === 'debito') {
        sugestoes.push({ ...conta, tipo: 'pagar' as const, score: 95 });
      }
    });

    // Buscar em contas a receber
    contasReceber?.forEach((conta) => {
      const valorMatch = Math.abs(Number(conta.valor) - Number(transaction.valor)) < 0.01;
      const dataProxima = Math.abs(
        new Date(conta.data_vencimento).getTime() - new Date(transaction.data_transacao).getTime()
      ) < 3 * 24 * 60 * 60 * 1000;

      if (valorMatch && dataProxima && transaction.tipo_transacao === 'credito') {
        sugestoes.push({ ...conta, tipo: 'receber' as const, score: 95 });
      }
    });

    return sugestoes.sort((a, b) => b.score - a.score);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Transações Pendentes de Conciliação</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {transactions.length} transação(ões) aguardando conciliação
        </p>

        <div className="space-y-4">
          {transactions.map((transaction) => {
            const sugestoes = getSugestoes(transaction);
            
            return (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium">{transaction.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.data_transacao).toLocaleDateString("pt-BR")} • {transaction.documento}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    {Number(transaction.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>

                {sugestoes.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Sugestões de conciliação:</p>
                    {sugestoes.map((sugestao) => (
                      <div
                        key={sugestao.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{sugestao.score}% match</Badge>
                          <div>
                            <p className="font-medium">{sugestao.descricao}</p>
                            <p className="text-sm text-muted-foreground">
                              {sugestao.tipo === 'pagar' ? sugestao.fornecedor : sugestao.cliente}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleConciliar(transaction.id, sugestao.id, sugestao.tipo)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Conciliar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">Nenhuma sugestão automática encontrada</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Conciliar Manualmente
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
