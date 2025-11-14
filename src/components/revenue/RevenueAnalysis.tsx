import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText,
  Users,
  Package,
  Download,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { RevenueAlertsConfig } from "./RevenueAlertsConfig";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface MonthlyRevenue {
  mes: string;
  receita: number;
  custo: number;
  margem: number;
}

interface ClientRevenue {
  cliente: string;
  cnpj: string;
  valor: number;
  percentual: number;
}

interface RouteRevenue {
  rota: string;
  valor: number;
  qtd_ctes: number;
}

export function RevenueAnalysis() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('6m');
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [topClients, setTopClients] = useState<ClientRevenue[]>([]);
  const [topRoutes, setTopRoutes] = useState<RouteRevenue[]>([]);
  const [summary, setSummary] = useState({
    receita_total: 0,
    custo_total: 0,
    margem_liquida: 0,
    total_ctes: 0,
    total_clientes: 0,
    ticket_medio: 0,
    receita_por_kg: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRevenueData();
  }, [timeframe]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);

      // Calcular período
      const months = timeframe === '3m' ? 3 : timeframe === '6m' ? 6 : 12;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      // Buscar dados de receita
      const { data: revenues, error: revenueError } = await (supabase as any)
        .from('revenue_records')
        .select('*')
        .gte('data_emissao', startDate.toISOString())
        .eq('status', 'ativo')
        .order('data_emissao', { ascending: true });

      if (revenueError) throw revenueError;

      // Processar dados mensais
      const monthlyMap = new Map<string, MonthlyRevenue>();
      const clientMap = new Map<string, { valor: number; nome: string; cnpj: string }>();
      const routeMap = new Map<string, { valor: number; qtd: number }>();

      let totalReceita = 0;
      let totalPeso = 0;
      const clientsSet = new Set<string>();

      revenues?.forEach((rev: any) => {
        const month = new Date(rev.data_emissao).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        const valorFrete = parseFloat(rev.valor_frete || 0);
        const valorMercadoria = parseFloat(rev.valor_mercadoria || 0);
        const peso = parseFloat(rev.peso_kg || 0);

        // Agregar por mês
        const existing = monthlyMap.get(month) || { mes: month, receita: 0, custo: 0, margem: 0 };
        existing.receita += valorFrete;
        // Estimativa de custo (70% do frete)
        existing.custo += valorFrete * 0.7;
        existing.margem = existing.receita - existing.custo;
        monthlyMap.set(month, existing);

        // Agregar por cliente
        const clientKey = rev.cliente_cnpj;
        const clientData = clientMap.get(clientKey) || { valor: 0, nome: rev.cliente_nome, cnpj: clientKey };
        clientData.valor += valorFrete;
        clientMap.set(clientKey, clientData);
        clientsSet.add(clientKey);

        // Agregar por rota
        const routeKey = `${rev.origem_uf} → ${rev.destino_uf}`;
        const routeData = routeMap.get(routeKey) || { valor: 0, qtd: 0 };
        routeData.valor += valorFrete;
        routeData.qtd += 1;
        routeMap.set(routeKey, routeData);

        totalReceita += valorFrete;
        totalPeso += peso;
      });

      // Converter para arrays
      const monthlyArray = Array.from(monthlyMap.values());
      setMonthlyData(monthlyArray);

      // Top 5 clientes
      const clientsArray = Array.from(clientMap.entries())
        .map(([cnpj, data]) => ({
          cliente: data.nome,
          cnpj,
          valor: data.valor,
          percentual: (data.valor / totalReceita) * 100
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);
      setTopClients(clientsArray);

      // Top 5 rotas
      const routesArray = Array.from(routeMap.entries())
        .map(([rota, data]) => ({
          rota,
          valor: data.valor,
          qtd_ctes: data.qtd
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);
      setTopRoutes(routesArray);

      // Calcular totais
      const totalCusto = totalReceita * 0.7; // Estimativa
      setSummary({
        receita_total: totalReceita,
        custo_total: totalCusto,
        margem_liquida: ((totalReceita - totalCusto) / totalReceita) * 100,
        total_ctes: revenues?.length || 0,
        total_clientes: clientsSet.size,
        ticket_medio: revenues?.length ? totalReceita / revenues.length : 0,
        receita_por_kg: totalPeso ? totalReceita / totalPeso : 0
      });

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csv = [
      ['Mês', 'Receita', 'Custo', 'Margem'],
      ...monthlyData.map(m => [m.mes, m.receita.toFixed(2), m.custo.toFixed(2), m.margem.toFixed(2)])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-receita-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Análise de Receita</h3>
          <p className="text-muted-foreground">Indicadores financeiros e performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="12m">12 Meses</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.receita_total)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Margem: {summary.margem_liquida.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.ticket_medio)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.total_ctes} CT-es emitidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_clientes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita por KG</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.receita_por_kg)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Frete por quilograma
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Evolução Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Receita e Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => 
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                      }
                    />
                    <Legend />
                    <Line type="monotone" dataKey="receita" stroke="#10b981" name="Receita" strokeWidth={2} />
                    <Line type="monotone" dataKey="custo" stroke="#ef4444" name="Custo" strokeWidth={2} />
                    <Line type="monotone" dataKey="margem" stroke="#3b82f6" name="Margem" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Margem Líquida */}
            <Card>
              <CardHeader>
                <CardTitle>Margem Líquida por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => 
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                      }
                    />
                    <Legend />
                    <Bar dataKey="margem" fill="#3b82f6" name="Margem Líquida" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Clientes por Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.map((client, idx) => (
                  <div key={client.cnpj} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{client.cliente}</p>
                        <p className="text-sm text-muted-foreground">{client.cnpj}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.valor)}
                      </p>
                      <p className="text-sm text-muted-foreground">{client.percentual.toFixed(1)}% do total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Rotas por Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topRoutes.map((route, idx) => (
                  <div key={route.rota} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{route.rota}</p>
                        <p className="text-sm text-muted-foreground">{route.qtd_ctes} CT-es</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(route.valor)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(route.valor / route.qtd_ctes)} /CT-e
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <RevenueAlertsConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}