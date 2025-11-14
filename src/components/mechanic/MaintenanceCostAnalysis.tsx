import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CostTrend {
  month: string;
  actual: number;
  predicted: number;
  preventive: number;
  corrective: number;
}

interface VehicleCostAnalysis {
  plate: string;
  totalCost: number;
  avgCostPerService: number;
  predictedNextMonthCost: number;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  efficiency: number;
  recommendations: string[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export const MaintenanceCostAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'3m' | '6m' | '12m'>('6m');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [costTrends, setCostTrends] = useState<CostTrend[]>([]);
  const [vehicleAnalysis, setVehicleAnalysis] = useState<VehicleCostAnalysis[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalSpent: 0,
    avgMonthly: 0,
    predictedNext: 0,
    savingsPotential: 0
  });
  const [costDistribution, setCostDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadCostAnalysis();
  }, [timeframe, selectedVehicle]);

  const loadCostAnalysis = async () => {
    try {
      setLoading(true);

      const monthsBack = timeframe === '3m' ? 3 : timeframe === '6m' ? 6 : 12;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);

      // Buscar ordens de serviço com custo
      const { data: serviceOrders, error } = await supabase
        .from('service_orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Processar dados por veículo
      const vehicleMap = new Map<string, any[]>();
      serviceOrders?.forEach(order => {
        if (selectedVehicle === 'all' || order.vehicle_plate === selectedVehicle) {
          const existing = vehicleMap.get(order.vehicle_plate) || [];
          vehicleMap.set(order.vehicle_plate, [...existing, order]);
        }
      });

      // Calcular tendências mensais
      const trends = calculateMonthlyTrends(serviceOrders || [], monthsBack);
      setCostTrends(trends);

      // Analisar custos por veículo
      const analysis = Array.from(vehicleMap.entries()).map(([plate, orders]) => 
        analyzeVehicleCosts(plate, orders)
      );
      setVehicleAnalysis(analysis.sort((a, b) => b.totalCost - a.totalCost));

      // Calcular estatísticas totais
      const totalCost = analysis.reduce((sum, v) => sum + v.totalCost, 0);
      const avgMonthly = totalCost / monthsBack;
      const predictedNext = analysis.reduce((sum, v) => sum + v.predictedNextMonthCost, 0);
      const savingsPotential = calculateSavingsPotential(analysis);

      setTotalStats({
        totalSpent: totalCost,
        avgMonthly,
        predictedNext,
        savingsPotential
      });

      // Distribuição de custos
      setCostDistribution([
        { name: 'Mão de Obra', value: calculateLaborCosts(serviceOrders || []) },
        { name: 'Peças', value: calculatePartsCosts(serviceOrders || []) },
        { name: 'Preventiva', value: calculatePreventiveCosts(serviceOrders || []) },
        { name: 'Corretiva', value: calculateCorrectiveCosts(serviceOrders || []) }
      ]);

    } catch (error) {
      console.error('Erro ao carregar análise de custos:', error);
      toast.error('Erro ao carregar análise de custos');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyTrends = (orders: any[], months: number): CostTrend[] => {
    const trends: CostTrend[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setMonth(targetDate.getMonth() - i);
      const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const actual = monthOrders.reduce((sum, o) => sum + calculateOrderCost(o), 0);
      const preventive = monthOrders
        .filter(o => o.priority === 'baixa')
        .reduce((sum, o) => sum + calculateOrderCost(o), 0);
      const corrective = actual - preventive;

      // Previsão simples baseada na média móvel
      const predicted = trends.length >= 2 
        ? (trends[trends.length - 1].actual + trends[trends.length - 2].actual) / 2 
        : actual * 1.1;

      trends.push({
        month: targetDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        actual,
        predicted: Math.round(predicted),
        preventive,
        corrective
      });
    }

    return trends;
  };

  const analyzeVehicleCosts = (plate: string, orders: any[]): VehicleCostAnalysis => {
    const totalCost = orders.reduce((sum, o) => sum + calculateOrderCost(o), 0);
    const avgCostPerService = orders.length > 0 ? totalCost / orders.length : 0;

    // Calcular tendência
    const recentCosts = orders.slice(-3).map(o => calculateOrderCost(o));
    const olderCosts = orders.slice(0, -3).map(o => calculateOrderCost(o));
    const recentAvg = recentCosts.reduce((a, b) => a + b, 0) / recentCosts.length;
    const olderAvg = olderCosts.reduce((a, b) => a + b, 0) / (olderCosts.length || 1);
    
    let costTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.15) costTrend = 'increasing';
    else if (recentAvg < olderAvg * 0.85) costTrend = 'decreasing';

    // Previsão para próximo mês
    const predictedNextMonthCost = recentAvg * 1.1;

    // Calcular eficiência (baseado em manutenções preventivas vs corretivas)
    const preventiveCount = orders.filter(o => o.priority === 'baixa').length;
    const efficiency = orders.length > 0 ? (preventiveCount / orders.length) * 100 : 0;

    // Recomendações
    const recommendations: string[] = [];
    if (costTrend === 'increasing') {
      recommendations.push('📈 Custos em alta - Avaliar necessidade de manutenção preventiva');
    }
    if (efficiency < 50) {
      recommendations.push('⚠️ Baixa taxa de preventivas - Implementar plano de manutenção');
    }
    if (avgCostPerService > 2000) {
      recommendations.push('💰 Custo médio alto - Considerar revisão de fornecedores');
    }
    if (orders.length > 10) {
      recommendations.push('🔧 Alta frequência de manutenções - Avaliar condição do veículo');
    }

    return {
      plate,
      totalCost,
      avgCostPerService,
      predictedNextMonthCost,
      costTrend,
      efficiency,
      recommendations
    };
  };

  const calculateOrderCost = (order: any): number => {
    let cost = 0;
    
    // Custo de mão de obra (R$ 80/hora)
    cost += (order.labor_hours || 0) * 80;
    
    // Custo de peças
    if (order.parts_used && Array.isArray(order.parts_used)) {
      cost += order.parts_used.reduce((sum: number, part: any) => {
        return sum + ((part.quantity || 0) * (part.unit_price || 0));
      }, 0);
    }
    
    return cost;
  };

  const calculateLaborCosts = (orders: any[]): number => {
    return orders.reduce((sum, o) => sum + (o.labor_hours || 0) * 80, 0);
  };

  const calculatePartsCosts = (orders: any[]): number => {
    return orders.reduce((sum, o) => {
      if (o.parts_used && Array.isArray(o.parts_used)) {
        return sum + o.parts_used.reduce((pSum: number, part: any) => 
          pSum + ((part.quantity || 0) * (part.unit_price || 0)), 0);
      }
      return sum;
    }, 0);
  };

  const calculatePreventiveCosts = (orders: any[]): number => {
    return orders
      .filter(o => o.priority === 'baixa')
      .reduce((sum, o) => sum + calculateOrderCost(o), 0);
  };

  const calculateCorrectiveCosts = (orders: any[]): number => {
    return orders
      .filter(o => o.priority !== 'baixa')
      .reduce((sum, o) => sum + calculateOrderCost(o), 0);
  };

  const calculateSavingsPotential = (analysis: VehicleCostAnalysis[]): number => {
    // Estimar economia potencial melhorando eficiência para 70%
    return analysis.reduce((sum, v) => {
      if (v.efficiency < 70) {
        const potentialSavings = v.totalCost * 0.2; // 20% de economia
        return sum + potentialSavings;
      }
      return sum;
    }, 0);
  };

  const exportData = () => {
    const csvContent = [
      ['Veículo', 'Custo Total', 'Custo Médio', 'Previsão Próximo Mês', 'Tendência', 'Eficiência'],
      ...vehicleAnalysis.map(v => [
        v.plate,
        v.totalCost.toFixed(2),
        v.avgCostPerService.toFixed(2),
        v.predictedNextMonthCost.toFixed(2),
        v.costTrend,
        v.efficiency.toFixed(1) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-custos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Relatório exportado com sucesso!');
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-destructive" />;
    if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <span className="h-4 w-4">→</span>;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando análise de custos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise Preditiva de Custos</h2>
          <p className="text-muted-foreground">
            Previsões e tendências de gastos com manutenção
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="12m">12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto Total</p>
                <p className="text-2xl font-bold">
                  R$ {totalStats.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Mensal</p>
                <p className="text-2xl font-bold">
                  R$ {totalStats.avgMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Previsão Próximo Mês</p>
                <p className="text-2xl font-bold text-yellow-600">
                  R$ {totalStats.predictedNext.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Potencial</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalStats.savingsPotential.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Custos */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={costTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Legend />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Real" />
                <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Previsto" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Custos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Preventiva vs Corretiva */}
        <Card>
          <CardHeader>
            <CardTitle>Preventiva vs Corretiva</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="preventive" fill="#10b981" name="Preventiva" />
                <Bar dataKey="corrective" fill="#ef4444" name="Corretiva" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Veículos por Custo */}
        <Card>
          <CardHeader>
            <CardTitle>Maiores Custos por Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vehicleAnalysis.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="plate" type="category" width={80} />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Bar dataKey="totalCost" fill="#8b5cf6" name="Custo Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análise Detalhada por Veículo */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada por Veículo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicleAnalysis.map((vehicle) => (
              <div key={vehicle.plate} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{vehicle.plate}</h3>
                    {getTrendIcon(vehicle.costTrend)}
                    <Badge variant={vehicle.efficiency >= 70 ? 'default' : 'destructive'}>
                      {vehicle.efficiency.toFixed(1)}% Eficiência
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Custo Total</p>
                    <p className="text-xl font-bold">
                      R$ {vehicle.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Custo Médio/Serviço</p>
                    <p className="font-semibold">
                      R$ {vehicle.avgCostPerService.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Previsão Próximo Mês</p>
                    <p className="font-semibold text-yellow-600">
                      R$ {vehicle.predictedNextMonthCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tendência</p>
                    <p className="font-semibold capitalize">{vehicle.costTrend === 'increasing' ? 'Crescente' : vehicle.costTrend === 'decreasing' ? 'Decrescente' : 'Estável'}</p>
                  </div>
                </div>

                {vehicle.recommendations.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Recomendações:</p>
                    <ul className="space-y-1">
                      {vehicle.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
