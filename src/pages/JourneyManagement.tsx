import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/azure/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Clock,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface DriverStats {
  driver_id: string;
  driver_name: string;
  total_sessions: number;
  total_violations: number;
  total_horas: number;
  total_extras: number;
}

interface Violation {
  id: string;
  driver_id: string;
  tipo_violacao: string;
  descricao: string;
  severidade: string;
  data_hora_violacao: string;
  resolvida: boolean;
}

export default function JourneyManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [violations, setViolations] = useState<Violation[]>([]);
  const [stats, setStats] = useState<any>(null);
  type SessionAllowance = {
    id: string;
    driver_id: string;
    vehicle_plate: string;
    data_inicio: string;
    data_fim: string | null;
    allowance_approved?: boolean | null;
    horas_extras_minutos?: number | null;
  };
  const [allowances, setAllowances] = useState<SessionAllowance[]>([]);
  const [loadingAllowances, setLoadingAllowances] = useState(false);

  useEffect(() => {
    loadData();
    loadAllowances();
  }, []);

  const loadData = async () => {
    // Carregar violações
    const { data: violationsData } = await (supabase as any)
      .from("driver_violations")
      .select(`
        *,
        driver_work_sessions!inner(driver_id)
      `)
      .eq("resolvida", false)
      .order("created_at", { ascending: false })
      .limit(20);

    if (violationsData) setViolations(violationsData);

    // Carregar estatísticas gerais
    const { data: sessionsData } = await (supabase as any)
      .from("driver_work_sessions")
      .select("*");

    const { data: violationsCount } = await (supabase as any)
      .from("driver_violations")
      .select("id", { count: "exact" });

    if (sessionsData) {
      const totalHoras = sessionsData.reduce(
        (acc, s) => acc + (s.total_trabalho_minutos || 0),
        0
      ) / 60;
      const totalExtras = sessionsData.reduce(
        (acc, s) => acc + (s.horas_extras_minutos || 0),
        0
      ) / 60;

      setStats({
        totalSessions: sessionsData.length,
        totalViolations: violationsCount?.length || 0,
        totalHoras: totalHoras.toFixed(1),
        totalExtras: totalExtras.toFixed(1),
      });
    }
  };

  const loadAllowances = async () => {
    setLoadingAllowances(true);
    const { data } = await (supabase as any)
      .from("driver_work_sessions")
      .select("id,driver_id,vehicle_plate,data_inicio,data_fim,allowance_approved")
      .eq("status", "finalizada")
      .order("data_inicio", { ascending: false })
      .limit(30);
    setAllowances((data as SessionAllowance[]) || []);
    setLoadingAllowances(false);
  };

  const approveAllowance = async (sessionId: string) => {
    const { error } = await (supabase as any)
      .from("driver_work_sessions")
      .update({ allowance_approved: true })
      .eq("id", sessionId);
    if (!error) loadAllowances();
  };

  const updateExtraMinutes = async (sessionId: string, minutes: number) => {
    const { error } = await (supabase as any)
      .from("driver_work_sessions")
      .update({ horas_extras_minutos: minutes })
      .eq("id", sessionId);
    if (!error) loadData();
  };

  const calculateDailyAllowance = (s: SessionAllowance) => {
    if (!s?.data_inicio || !s?.data_fim) return 0;
    const start = new Date(s.data_inicio);
    const end = new Date(s.data_fim);
    const days = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return days * 80;
  };

  const marcarComoResolvida = async (violationId: string) => {
    const { error } = await (supabase as any)
      .from("driver_violations")
      .update({ resolvida: true })
      .eq("id", violationId);

    if (error) {
      toast.error("Erro ao atualizar violação");
      return;
    }

    toast.success("Violação marcada como resolvida");
    loadData();
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
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Jornadas</h1>
          <p className="text-muted-foreground">
            Monitoramento e controle das jornadas de trabalho dos motoristas
          </p>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Jornadas</p>
                <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Violações</p>
                <p className="text-2xl font-bold text-orange-500">
                  {stats?.totalViolations || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Horas Totais</p>
                <p className="text-2xl font-bold">{stats?.totalHoras || 0}h</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Horas Extras</p>
                <p className="text-2xl font-bold text-orange-500">
                  {stats?.totalExtras || 0}h
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Users className="mr-2 h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="violations">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Violações
            </TabsTrigger>
            <TabsTrigger value="allowances">
              <Clock className="mr-2 h-4 w-4" />
              Diárias
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="mr-2 h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Resumo do Sistema</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Conformidade Legal</h3>
                    <p className="text-sm text-muted-foreground">
                      Sistema implementado conforme Lei nº 13.103/2015, garantindo o
                      cumprimento de todos os requisitos legais para jornada de
                      motoristas.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Monitoramento em Tempo Real</h3>
                    <p className="text-sm text-muted-foreground">
                      Acompanhamento automático de jornadas, detecção de violações e
                      geração de alertas para gestores e motoristas.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="allowances" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Aprovação de Diárias</h2>
                <Button variant="outline" onClick={loadAllowances}>Atualizar</Button>
              </div>

              {loadingAllowances ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : allowances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma diária pendente</div>
              ) : (
                <div className="space-y-3">
                  {allowances.map((s) => (
                    <div key={s.id} className="border rounded-lg p-4 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{s.vehicle_plate}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(s.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                            {' → '}
                            {s.data_fim && format(new Date(s.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-green-600">R$ {calculateDailyAllowance(s).toFixed(2)}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={s.allowance_approved ? 'default' : 'secondary'}>
                            {s.allowance_approved ? 'Aprovado' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!s.allowance_approved && (
                          <Button onClick={() => approveAllowance(s.id)}>Aprovar</Button>
                        )}
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Horas extras (min)"
                            className="w-40"
                            defaultValue={s.horas_extras_minutos || 0}
                            onBlur={(e) => updateExtraMinutes(s.id, Number((e.target as HTMLInputElement).value || 0))}
                          />
                          <Button variant="outline" onClick={() => updateExtraMinutes(s.id, Number(s.horas_extras_minutos || 0))}>Salvar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Violações Pendentes</h2>

              {violations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Nenhuma violação pendente!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {violations.map((violation) => (
                    <div
                      key={violation.id}
                      className="border rounded-lg p-4 flex items-start justify-between"
                    >
                      <div className="flex items-start gap-3 flex-1">
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
                        </div>
                      </div>
                      <Button
                        onClick={() => marcarComoResolvida(violation.id)}
                        variant="outline"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolver
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Relatórios e Documentação</h2>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>Sistema de relatórios em desenvolvimento</p>
                <p className="text-sm mt-2">
                  Em breve: Relatórios mensais, anuais e análise de compliance
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informações Legais */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-bold mb-3">Referência Legal - Lei 13.103/2015</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">📋 Jornada Diária</p>
              <p className="text-muted-foreground">
                Máximo de 8 horas, podendo ser estendida por até 4 horas extras (total
                de 12 horas)
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🚛 Direção Contínua - Carga</p>
              <p className="text-muted-foreground">
                Máximo de 5h30min ininterruptas de direção
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🚌 Direção Contínua - Passageiros</p>
              <p className="text-muted-foreground">
                Máximo de 4 horas ininterruptas de direção
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🛏️ Intervalo Interjornada</p>
              <p className="text-muted-foreground">
                Mínimo de 11 horas de descanso a cada 24 horas (8h ininterruptas)
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🍽️ Intervalo Refeição</p>
              <p className="text-muted-foreground">
                Mínimo de 1 hora, podendo coincidir com parada obrigatória
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">⏸️ Parada Obrigatória</p>
              <p className="text-muted-foreground">
                30 minutos a cada período de direção contínua
              </p>
            </div>
          </div>
        </Card>
      </div>
  );
}
