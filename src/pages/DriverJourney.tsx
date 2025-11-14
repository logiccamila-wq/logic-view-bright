import { Layout } from "@/components/Layout";
import { WorkSessionPanel } from "@/components/driver/WorkSessionPanel";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Violation {
  id: string;
  tipo_violacao: string;
  descricao: string;
  severidade: string;
  valor_registrado: number;
  data_hora_violacao: string;
  resolvida: boolean;
}

interface WeeklyReport {
  id: string;
  ano: number;
  semana: number;
  total_horas_trabalhadas: number;
  total_horas_extras: number;
  total_violacoes: number;
  assinado_motorista: boolean;
  data_inicio: string;
  data_fim: string;
}

export default function DriverJourney() {
  const { user } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);

  useEffect(() => {
    if (user) {
      loadViolations();
      loadWeeklyReports();
    }
  }, [user]);

  const loadViolations = async () => {
    const { data } = await supabase
      .from("driver_violations")
      .select("*")
      .eq("driver_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setViolations(data);
  };

  const loadWeeklyReports = async () => {
    const { data } = await supabase
      .from("driver_weekly_reports")
      .select("*")
      .eq("driver_id", user!.id)
      .order("ano", { ascending: false })
      .order("semana", { ascending: false })
      .limit(5);

    if (data) setWeeklyReports(data);
  };

  const getSeverityColor = (severidade: string) => {
    switch (severidade) {
      case "alta":
        return "destructive";
      case "media":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Controle de Jornada</h1>
          <p className="text-muted-foreground">
            Gestão completa da sua jornada de trabalho conforme Lei 13.103/2015
          </p>
        </div>

        {/* Painel Principal */}
        <WorkSessionPanel />

        {/* Violações Recentes */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold">Alertas e Violações</h2>
          </div>

          {violations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Nenhuma violação registrada! Continue assim!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="border rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 ${
                      violation.severidade === "alta"
                        ? "text-red-500"
                        : "text-orange-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(violation.severidade)}>
                        {violation.severidade.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(
                          new Date(violation.data_hora_violacao),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )}
                      </span>
                    </div>
                    <p className="font-medium">{violation.descricao}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Registrado: {Math.round(violation.valor_registrado)} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Relatórios Semanais */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            <h2 className="text-xl font-bold">Relatórios Semanais</h2>
          </div>

          {weeklyReports.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum relatório disponível ainda
            </p>
          ) : (
            <div className="space-y-3">
              {weeklyReports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      Semana {report.semana}/{report.ano}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(report.data_inicio), "dd/MM", {
                        locale: ptBR,
                      })}{" "}
                      -{" "}
                      {format(new Date(report.data_fim), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">
                        {report.total_horas_trabalhadas.toFixed(1)}h
                      </span>{" "}
                      trabalhadas
                    </p>
                    <p className="text-sm text-orange-500">
                      {report.total_horas_extras.toFixed(1)}h extras
                    </p>
                    {report.assinado_motorista ? (
                      <Badge variant="outline" className="text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Assinado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-500">
                        Pendente assinatura
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Informações Legais */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-bold mb-3">Limites Legais (Lei 13.103/2015)</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-medium">⏰ Jornada Diária</p>
              <p className="text-muted-foreground">
                Máximo 8h (até 12h com extras)
              </p>
            </div>
            <div>
              <p className="font-medium">🚛 Direção Contínua (Carga)</p>
              <p className="text-muted-foreground">Máximo 5h30min</p>
            </div>
            <div>
              <p className="font-medium">🛏️ Intervalo Interjornada</p>
              <p className="text-muted-foreground">Mínimo 11h de descanso</p>
            </div>
            <div>
              <p className="font-medium">🍽️ Intervalo Refeição</p>
              <p className="text-muted-foreground">Mínimo 1h</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
