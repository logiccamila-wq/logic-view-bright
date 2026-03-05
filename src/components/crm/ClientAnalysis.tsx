import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface ClientAnalysisProps {
  clientCnpj: string;
  clientName: string;
}

export function ClientAnalysis({ clientCnpj, clientName }: ClientAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-client', {
        body: { clientCnpj }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      toast.success("Análise concluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao analisar cliente:", error);
      toast.error(error.message || "Erro ao analisar cliente");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Análise Inteligente - {clientName}</CardTitle>
            <Button onClick={runAnalysis} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Analisando..." : "Gerar Análise com IA"}
            </Button>
          </div>
        </CardHeader>
        {analysis && (
          <CardContent className="space-y-6">
            {/* Métricas Rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total CT-es</p>
                      <p className="text-2xl font-bold">{analysis.metrics.totalCtes}</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(analysis.metrics.totalReceita)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(analysis.metrics.ticketMedio)}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-2xl font-bold">{analysis.metrics.scoreCliente}/100</p>
                    </div>
                    {analysis.metrics.scoreCliente >= 80 ? (
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    ) : analysis.metrics.scoreCliente >= 60 ? (
                      <TrendingDown className="w-8 h-8 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status */}
            <div className="flex gap-2">
              {analysis.metrics.inadimplente && (
                <Badge variant="destructive">Inadimplente</Badge>
              )}
              {analysis.metrics.ctesAtrasados > 0 && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  {analysis.metrics.ctesAtrasados} CT-es Atrasados
                </Badge>
              )}
              {!analysis.metrics.inadimplente && analysis.metrics.ctesAtrasados === 0 && (
                <Badge variant="default">Adimplente</Badge>
              )}
            </div>

            {/* Análise da IA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise Detalhada com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Histórico Financeiro */}
            {analysis.financialHistory && analysis.financialHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico Financeiro (12 meses)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.financialHistory.map((month: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {String(month.periodo_mes).padStart(2, '0')}/{month.periodo_ano}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {month.total_ctes} CT-es
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(Number(month.receita_total))}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ticket: {formatCurrency(Number(month.ticket_medio))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
