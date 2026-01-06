import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Banknote, TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkSessionPanel } from "@/components/driver/WorkSessionPanel";

interface Gratification {
  id: string;
  mes: number;
  ano: number;
  total_valor_ctes: number;
  total_combustivel: number;
  base_calculo_gratificacao: number;
  valor_gratificacao: number;
  status: string;
  data_pagamento: string | null;
}

export default function DriverPayroll() {
  const { user } = useAuth();
  const [gratifications, setGratifications] = useState<Gratification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGratifications();
  }, [user]);

  const loadGratifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("driver_gratification")
        .select("*")
        .eq("driver_id", user.id)
        .order("ano", { ascending: false })
        .order("mes", { ascending: false });

      if (error) throw error;
      setGratifications(data || []);
    } catch (error) {
      console.error("Erro ao carregar gratificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      calculado: "secondary",
      aprovado: "default",
      pago: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const totalGratificacoes = gratifications.reduce(
    (sum, g) => sum + Number(g.valor_gratificacao || 0),
    0
  );

  return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Folha de Pagamento & Ponto</h1>
        </div>

        {/* Painel de Ponto */}
        <WorkSessionPanel />
        
        <h2 className="text-2xl font-semibold mt-8">Minhas Gratificações</h2>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Banknote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gratificações</p>
              <p className="text-2xl font-bold">{formatMoney(totalGratificacoes)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Períodos</p>
              <p className="text-2xl font-bold">{gratifications.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Último Período</p>
              <p className="text-2xl font-bold">
                {gratifications[0] ? `${gratifications[0].mes}/${gratifications[0].ano}` : "-"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Gratificações */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Histórico de Gratificações</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : gratifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma gratificação calculada ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {gratifications.map((grat) => (
              <Card key={grat.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {String(grat.mes).padStart(2, "0")}/{grat.ano}
                      </h3>
                      {getStatusBadge(grat.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor CTe's</p>
                        <p className="font-semibold">{formatMoney(grat.total_valor_ctes)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Combustível</p>
                        <p className="font-semibold text-red-500">
                          -{formatMoney(grat.total_combustivel)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Base Cálculo</p>
                        <p className="font-semibold">
                          {formatMoney(grat.base_calculo_gratificacao)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gratificação (3%)</p>
                        <p className="font-semibold text-green-500">
                          {formatMoney(grat.valor_gratificacao)}
                        </p>
                      </div>
                    </div>

                    {grat.data_pagamento && (
                      <p className="text-xs text-muted-foreground">
                        Pago em: {new Date(grat.data_pagamento).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Informações sobre o Cálculo */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Como é calculada sua gratificação?
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            1. <strong>Valor Total dos CTe's</strong>: Soma de todos os fretes do período
          </p>
          <p>
            2. <strong>Desconto de 17%</strong>: Desconto automático sobre o valor dos CTe's
          </p>
          <p>
            3. <strong>Combustível</strong>: Dedução do valor gasto com combustível
          </p>
          <p>
            4. <strong>Gratificação de 3%</strong>: Calculada sobre o valor final (CTe - 17% - combustível)
          </p>
        </div>
      </Card>
      </div>
  );
}
