import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Truck,
  FileText,
  Globe,
  User,
  Wrench,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DashboardData {
  financeiro: {
    faturamento_bruto: number;
    custo_km: number;
    margem_liquida: number;
    total_abastecimentos: number;
    custo_total_combustivel: number;
    dados_dre: Array<{ mes: string; receita: number; custo: number }>;
  };
  operacional: {
    viagens_ativas: number;
    viagens_pendentes: number;
    total_motoristas: number;
    macros_hoje: number;
    abastecimentos_hoje: number;
  };
  manutencao: {
    ordens_pendentes: number;
    ordens_em_andamento: number;
    ordens_concluidas: number;
    checklists_pendentes: number;
    alertas_tpms: number;
  };
  ia_insights: {
    insights: Array<{ tipo: string; msg: string }>;
    topicos_reuniao: Array<{ topico: string; responsavel: string }>;
  };
}

const ControlTower = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Financeiro - Abastecimentos
      const { data: refuelings, error: refError } = await supabase
        .from('refuelings')
        .select('*')
        .order('timestamp', { ascending: false });

      if (refError) throw refError;

      const totalCombustivel = refuelings?.reduce((sum, r) => sum + Number(r.total_value), 0) || 0;
      const totalKm = refuelings?.reduce((sum, r) => sum + Number(r.km), 0) || 0;
      const custoKm = totalKm > 0 ? totalCombustivel / totalKm : 0;

      // Operacional - Viagens
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*');

      if (tripsError) throw tripsError;

      const viagensAtivas = trips?.filter(t => t.status === 'em_andamento').length || 0;
      const viagensPendentes = trips?.filter(t => t.status === 'pendente').length || 0;

      // Macros de hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const { data: macros, error: macrosError } = await supabase
        .from('trip_macros')
        .select('*')
        .gte('timestamp', hoje.toISOString());

      if (macrosError) throw macrosError;

      // Abastecimentos de hoje
      const { data: refToday, error: refTodayError } = await supabase
        .from('refuelings')
        .select('*')
        .gte('timestamp', hoje.toISOString());

      if (refTodayError) throw refTodayError;

      // Manutenção - Ordens de Serviço
      const { data: serviceOrders, error: soError } = await supabase
        .from('service_orders')
        .select('*');

      if (soError) throw soError;

      const osPendentes = serviceOrders?.filter(so => so.status === 'pendente').length || 0;
      const osEmAndamento = serviceOrders?.filter(so => so.status === 'em_andamento').length || 0;
      const osConcluidas = serviceOrders?.filter(so => so.status === 'concluida').length || 0;

      // Checklists
      const { data: checklists, error: checkError } = await supabase
        .from('maintenance_checklists')
        .select('*')
        .eq('status', 'em_andamento');

      if (checkError) throw checkError;

      // TPMS Alertas
      const { data: tpms, error: tpmsError } = await supabase
        .from('tpms_readings')
        .select('*')
        .in('alert_level', ['amarelo', 'vermelho']);

      if (tpmsError) throw tpmsError;

      // Simular dados DRE (3 meses)
      const dadosDRE = [
        { mes: 'Mês 1', receita: 195000, custo: 130000 },
        { mes: 'Mês 2', receita: 240000, custo: 170000 },
        { mes: 'Mês 3', receita: totalCombustivel * 3.5, custo: totalCombustivel },
      ];

      const faturamentoBruto = dadosDRE[2].receita;
      const margemLiquida = faturamentoBruto > 0 ? (faturamentoBruto - dadosDRE[2].custo) / faturamentoBruto : 0;

      // Contar motoristas únicos
      const motoristasUnicos = new Set(trips?.map(t => t.driver_id) || []).size;

      // IA Insights
      const insights = [
        {
          tipo: 'Preditivo',
          msg: `IA Preditiva: ${osPendentes + osEmAndamento} ordens de serviço em aberto. ${tpms?.length || 0} alertas de pneus detectados. Recomendar manutenção preventiva.`
        },
        {
          tipo: 'Financeiro',
          msg: `Análise de Custos: Custo médio por KM está em R$ ${custoKm.toFixed(2)}. ${viagensAtivas} viagens ativas consumindo recursos.`
        },
        {
          tipo: 'Operacional',
          msg: `Gestão de Frota: ${viagensPendentes} viagens aguardando aprovação. ${macros?.length || 0} macros registradas hoje.`
        }
      ];

      const topicosReuniao = [
        { topico: `${viagensPendentes} viagens pendentes de aprovação`, responsavel: 'Gerente de Logística' },
        { topico: `${osPendentes} ordens de serviço pendentes`, responsavel: 'Gerente de Manutenção' },
        { topico: `Otimização de custos - Custo/KM: R$ ${custoKm.toFixed(2)}`, responsavel: 'Financeiro/CEO' },
      ];

      setData({
        financeiro: {
          faturamento_bruto: faturamentoBruto,
          custo_km: custoKm,
          margem_liquida: margemLiquida,
          total_abastecimentos: refuelings?.length || 0,
          custo_total_combustivel: totalCombustivel,
          dados_dre: dadosDRE,
        },
        operacional: {
          viagens_ativas: viagensAtivas,
          viagens_pendentes: viagensPendentes,
          total_motoristas: motoristasUnicos,
          macros_hoje: macros?.length || 0,
          abastecimentos_hoje: refToday?.length || 0,
        },
        manutencao: {
          ordens_pendentes: osPendentes,
          ordens_em_andamento: osEmAndamento,
          ordens_concluidas: osConcluidas,
          checklists_pendentes: checklists?.length || 0,
          alertas_tpms: tpms?.length || 0,
        },
        ia_insights: {
          insights,
          topicos_reuniao: topicosReuniao,
        },
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando Torre de Controle...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Torre de Controle OptiLog</h1>
            <p className="text-muted-foreground">Visão estratégica e operacional em tempo real</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
        </div>

        <Tabs defaultValue="financeiro" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="financeiro">
              <DollarSign className="w-4 h-4 mr-2" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="operacional">
              <Truck className="w-4 h-4 mr-2" />
              Operacional
            </TabsTrigger>
            <TabsTrigger value="manutencao">
              <Wrench className="w-4 h-4 mr-2" />
              Manutenção
            </TabsTrigger>
            <TabsTrigger value="insights">
              <TrendingUp className="w-4 h-4 mr-2" />
              IA Insights
            </TabsTrigger>
          </TabsList>

          {/* Financeiro */}
          <TabsContent value="financeiro" className="space-y-6">
            <p className="text-muted-foreground">
              Performance financeira e análise de custos em tempo real
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {data.financeiro.faturamento_bruto.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground">Receita estimada</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Custo/KM</CardTitle>
                  <BarChart className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {data.financeiro.custo_km.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Média por quilômetro</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {(data.financeiro.margem_liquida * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Margem de lucro</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Combustível</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {data.financeiro.custo_total_combustivel.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.financeiro.total_abastecimentos} abastecimentos
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Receita vs. Custo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBar data={data.financeiro.dados_dre}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="receita" fill="hsl(var(--primary))" name="Receita" />
                    <Bar dataKey="custo" fill="hsl(var(--destructive))" name="Custo" />
                  </RechartsBar>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operacional */}
          <TabsContent value="operacional" className="space-y-6">
            <p className="text-muted-foreground">
              Monitoramento da frota e execução de viagens
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Viagens Ativas</CardTitle>
                  <Truck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {data.operacional.viagens_ativas}
                  </div>
                  <p className="text-xs text-muted-foreground">Em andamento</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.operacional.viagens_pendentes}
                  </div>
                  <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
                  <User className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.operacional.total_motoristas}
                  </div>
                  <p className="text-xs text-muted-foreground">Ativos no sistema</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Macros Hoje</CardTitle>
                  <Globe className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.operacional.macros_hoje}
                  </div>
                  <p className="text-xs text-muted-foreground">Registros de jornada</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Abastec. Hoje</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.operacional.abastecimentos_hoje}
                  </div>
                  <p className="text-xs text-muted-foreground">Lançamentos</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manutenção */}
          <TabsContent value="manutencao" className="space-y-6">
            <p className="text-muted-foreground">
              Status da frota e ordens de serviço
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">OS Pendentes</CardTitle>
                  <FileText className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.manutencao.ordens_pendentes}
                  </div>
                  <p className="text-xs text-muted-foreground">Aguardando</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                  <Wrench className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.manutencao.ordens_em_andamento}
                  </div>
                  <p className="text-xs text-muted-foreground">Sendo executadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {data.manutencao.ordens_concluidas}
                  </div>
                  <p className="text-xs text-muted-foreground">Finalizadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Checklists</CardTitle>
                  <FileText className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.manutencao.checklists_pendentes}
                  </div>
                  <p className="text-xs text-muted-foreground">Em andamento</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas TPMS</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {data.manutencao.alertas_tpms}
                  </div>
                  <p className="text-xs text-muted-foreground">Atenção necessária</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* IA Insights */}
          <TabsContent value="insights" className="space-y-6">
            <p className="text-muted-foreground">
              Análises e recomendações estratégicas geradas por IA
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {data.ia_insights.insights.map((insight, index) => (
                  <Card key={index} className="border-l-4 border-primary">
                    <CardHeader>
                      <CardTitle className="text-sm uppercase text-muted-foreground">
                        {insight.tipo}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{insight.msg}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pauta para Reunião Gerencial</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tópicos prioritários identificados pela IA
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {data.ia_insights.topicos_reuniao.map((item, index) => (
                      <li key={index} className="border-l-2 border-primary pl-4">
                        <p className="font-semibold text-sm">{item.topico}</p>
                        <p className="text-xs text-muted-foreground">
                          Responsável: {item.responsavel}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6">
                    Agendar Reunião
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ControlTower;
