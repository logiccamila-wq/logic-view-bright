import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { History, DollarSign, Calendar, TrendingUp, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DriverPayrollHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('driver_payroll')
      .select('*')
      .eq('driver_id', user.id)
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })
      .limit(12);

    if (data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMonthName = (month: number, year: number) => {
    const date = new Date(year, month - 1, 1);
    return format(date, "MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'calculado': { variant: 'secondary', label: 'Calculado' },
      'aprovado': { variant: 'default', label: 'Aprovado' },
      'pago': { variant: 'outline', label: 'Pago' },
      'pendente': { variant: 'destructive', label: 'Pendente' }
    };
    
    const config = variants[status] || variants['calculado'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Memória de Cálculos
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Últimos 12 meses
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando histórico...
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map((payroll) => (
                <div
                  key={payroll.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold capitalize">
                          {getMonthName(payroll.mes, payroll.ano)}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Calculado em {format(new Date(payroll.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    {getStatusBadge(payroll.status)}
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Salário Base</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(payroll.salario_base)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Horas Normais</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(payroll.valor_horas_normais)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Horas Extras</p>
                        <p className="text-sm font-semibold text-green-600">
                          +{formatCurrency(payroll.valor_horas_extras)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Horas Espera</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(payroll.valor_horas_espera)}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total CT-e</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(payroll.total_valor_ctes)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Combustível</p>
                        <p className="text-sm font-semibold text-red-600">
                          -{formatCurrency(payroll.total_combustivel)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Base Gratificação</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(payroll.base_calculo_gratificacao)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Gratificação</p>
                        <p className="text-sm font-semibold text-green-600">
                          +{formatCurrency(payroll.valor_gratificacao)}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">Total Líquido</span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(payroll.total_liquido)}
                      </span>
                    </div>

                    {payroll.observacoes && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <p className="text-muted-foreground">
                          <strong>Obs:</strong> {payroll.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum histórico de pagamento encontrado</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
