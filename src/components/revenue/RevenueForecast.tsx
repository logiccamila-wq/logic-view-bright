import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Download,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface Prediction {
  mes: string;
  receita_prevista: number;
  receita_min: number;
  receita_max: number;
  confianca: number;
  fatores: string[];
}

interface Insights {
  tendencia_geral: string;
  taxa_crescimento_mensal: number;
  sazonalidade: {
    meses_altos: number[];
    meses_baixos: number[];
  };
  confiabilidade: string;
  recomendacoes: string[];
}

interface ForecastData {
  historical_data: any[];
  predictions: Prediction[];
  insights: Insights;
  metadata: {
    generated_at: string;
    months_analyzed: number;
    months_predicted: number;
  };
}

export function RevenueForecast() {
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [monthsAhead, setMonthsAhead] = useState('3');
  const { toast } = useToast();

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('predict-revenue', {
        body: { months_ahead: parseInt(monthsAhead) }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setForecastData(data);
      toast({
        title: "Previsão gerada",
        description: `Análise de ${data.metadata.months_analyzed} meses históricos completa`
      });

    } catch (error: any) {
      console.error('Erro ao gerar previsão:', error);
      toast({
        title: "Erro ao gerar previsão",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCombinedChartData = () => {
    if (!forecastData) return [];

    const historical = forecastData.historical_data.map(d => ({
      mes: `${d.mes}/${d.ano}`,
      receita_real: d.receita,
      tipo: 'Histórico'
    }));

    const predicted = forecastData.predictions.map(p => ({
      mes: new Date(p.mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      receita_prevista: p.receita_prevista,
      receita_min: p.receita_min,
      receita_max: p.receita_max,
      tipo: 'Previsão'
    }));

    return [...historical.slice(-12), ...predicted];
  };

  const getTrendIcon = () => {
    if (!forecastData) return null;
    return forecastData.insights.tendencia_geral === 'crescimento' ? (
      <TrendingUp className="h-5 w-5 text-green-600" />
    ) : (
      <TrendingDown className="h-5 w-5 text-red-600" />
    );
  };

  const getConfidenceColor = (confianca: number) => {
    if (confianca >= 80) return 'bg-green-500';
    if (confianca >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const exportForecast = () => {
    if (!forecastData) return;

    const csv = [
      ['Mês', 'Receita Prevista', 'Receita Mínima', 'Receita Máxima', 'Confiança (%)'],
      ...forecastData.predictions.map(p => [
        p.mes,
        p.receita_prevista.toFixed(2),
        p.receita_min.toFixed(2),
        p.receita_max.toFixed(2),
        p.confianca.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `previsao-receita-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Analisando dados históricos...</p>
            <p className="text-sm text-muted-foreground">Gerando previsões com Machine Learning</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!forecastData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Gere uma previsão para começar</p>
            <Button onClick={loadForecast}>
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Previsão
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Previsão de Receita
          </h3>
          <p className="text-muted-foreground">
            Análise preditiva baseada em {forecastData.metadata.months_analyzed} meses de histórico
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={monthsAhead} onValueChange={setMonthsAhead}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Meses</SelectItem>
              <SelectItem value="6">6 Meses</SelectItem>
              <SelectItem value="12">12 Meses</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadForecast} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={exportForecast} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência Geral</CardTitle>
            {getTrendIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {forecastData.insights.tendencia_geral}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {forecastData.insights.taxa_crescimento_mensal > 0 ? '+' : ''}
              {forecastData.insights.taxa_crescimento_mensal.toFixed(1)}% ao mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiabilidade</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {forecastData.insights.confiabilidade}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado em análise de padrões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Mês</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(forecastData.predictions[0]?.receita_prevista || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Confiança: {forecastData.predictions[0]?.confianca}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico e Previsão de Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={getCombinedChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => 
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                }
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receita_real" 
                stroke="#10b981" 
                name="Receita Real" 
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
              <Line 
                type="monotone" 
                dataKey="receita_prevista" 
                stroke="#3b82f6" 
                strokeDasharray="5 5"
                name="Previsão" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
              <Area
                type="monotone"
                dataKey="receita_max"
                stroke="none"
                fill="#3b82f6"
                fillOpacity={0.1}
                name="Intervalo de Confiança"
              />
              <Area
                type="monotone"
                dataKey="receita_min"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Previsões Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecastData.predictions.map((pred, idx) => (
              <div key={pred.mes} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    +{idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {new Date(pred.mes + '-01').toLocaleDateString('pt-BR', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {pred.fatores.slice(0, 2).map((fator, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {fator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(pred.receita_prevista)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      notation: 'compact'
                    }).format(pred.receita_min)} - {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      notation: 'compact'
                    }).format(pred.receita_max)}
                  </p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(pred.confianca)}`} />
                    <span className="text-xs text-muted-foreground">{pred.confianca}% confiança</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sazonalidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Meses de Alta</p>
              <div className="flex gap-2">
                {forecastData.insights.sazonalidade.meses_altos.map(mes => (
                  <Badge key={mes} className="bg-green-500">
                    {new Date(2025, mes - 1).toLocaleDateString('pt-BR', { month: 'short' })}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Meses de Baixa</p>
              <div className="flex gap-2">
                {forecastData.insights.sazonalidade.meses_baixos.map(mes => (
                  <Badge key={mes} variant="secondary">
                    {new Date(2025, mes - 1).toLocaleDateString('pt-BR', { month: 'short' })}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {forecastData.insights.recomendacoes.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}