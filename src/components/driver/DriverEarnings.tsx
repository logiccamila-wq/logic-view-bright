import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Award, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const DriverEarnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, [user]);

  const loadEarnings = async () => {
    if (!user) return;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from('driver_payroll')
      .select('*')
      .eq('driver_id', user.id)
      .eq('mes', currentMonth)
      .eq('ano', currentYear)
      .single();

    if (data) {
      setEarnings(data);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Minhas Gratificações
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Mês Atual
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {earnings ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Gratificação</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(earnings.valor_gratificacao || 0)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Base Cálculo</p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(earnings.base_calculo_gratificacao || 0)}
                  </p>
                </div>
                <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total CT-e</p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(earnings.total_valor_ctes || 0)}
                  </p>
                </div>
                <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Combustível</p>
                  <p className="text-sm font-semibold text-red-600">
                    -{formatCurrency(earnings.total_combustivel || 0)}
                  </p>
                </div>
                <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Horas Extras</p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(earnings.valor_horas_extras || 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">Total Bruto</span>
                </div>
                <span className="text-xl font-bold">
                  {formatCurrency(earnings.total_bruto || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <span className="font-semibold">Total Líquido</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(earnings.total_liquido || 0)}
                </span>
              </div>
            </div>

            {earnings.status === 'pendente' && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Status: Aguardando aprovação</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum dado de gratificação disponível</p>
            <p className="text-sm mt-1">Continue trabalhando para acumular ganhos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
