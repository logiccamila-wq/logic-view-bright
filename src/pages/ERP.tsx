import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  DollarSign, 
  Users, 
  TrendingUp,
  Loader2,
  Wallet
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RevenueAnalysis } from "@/components/revenue/RevenueAnalysis";
import { PayrollSection } from "@/components/erp/PayrollSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ERP = () => {
  const { data: financialData, isLoading } = useFinancialData();

  // Buscar número de usuários
  const { data: usersData } = useQuery({
    queryKey: ['users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return formatCurrency(value);
  };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ERP - Enterprise Resource Planning</h1>
          <p className="text-muted-foreground mt-2">
            Sistema Integrado de Gestão Empresarial
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Faturamento Mês" 
            value={formatCompactCurrency(financialData?.receitaMesAtual || 0)}
            icon={DollarSign}
            trend={{ 
              value: `${financialData?.variacaoReceita >= 0 ? '+' : ''}${financialData?.variacaoReceita.toFixed(1)}% vs mês anterior`, 
              positive: (financialData?.variacaoReceita || 0) >= 0 
            }}
          />
          <StatCard 
            title="Margem Líquida" 
            value={`${financialData?.margemLiquida.toFixed(1)}%`}
            icon={TrendingUp}
            trend={{ 
              value: `${financialData?.totalCtes || 0} CT-es`, 
              positive: true 
            }}
          />
          <StatCard 
            title="Colaboradores" 
            value={usersData || 0}
            icon={Users}
          />
          <StatCard 
            title="Contas a Receber" 
            value={formatCompactCurrency(financialData?.receitaPendente || 0)}
            icon={Building2}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="financeiro" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="receita">Análise de Receita</TabsTrigger>
            <TabsTrigger value="contas">Contas a Receber/Pagar</TabsTrigger>
            <TabsTrigger value="folha">
              <Wallet className="w-4 h-4 mr-2" />
              Folha de Pagamento
            </TabsTrigger>
          </TabsList>

          {/* Financeiro */}
          <TabsContent value="financeiro" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(financialData?.receitaMesAtual || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(financialData?.despesasMes || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Lucro Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(financialData?.lucroLiquido || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {financialData?.margemLiquida.toFixed(1)}% de margem
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lançamentos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData?.lancamentos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum lançamento encontrado. Importe CT-es para visualizar receitas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      financialData?.lancamentos.map((lancamento) => (
                        <TableRow key={lancamento.id}>
                          <TableCell>{new Date(lancamento.data).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="max-w-xs truncate">{lancamento.descricao}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{lancamento.categoria}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={lancamento.tipo === "receita" ? "default" : "secondary"}>
                              {lancamento.tipo === "receita" ? "Receita" : "Despesa"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={lancamento.status === "pago" ? "default" : "outline"}>
                              {lancamento.status}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            lancamento.tipo === "receita" ? "text-green-600" : "text-red-600"
                          }`}>
                            {formatCurrency(lancamento.valor)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receita */}
          <TabsContent value="receita">
            <RevenueAnalysis />
          </TabsContent>

          {/* Contas */}
          <TabsContent value="contas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contas a Receber</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialData?.contasReceber.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Nenhuma conta a receber
                          </TableCell>
                        </TableRow>
                      ) : (
                        financialData?.contasReceber.slice(0, 10).map((conta) => (
                          <TableRow key={conta.created_at}>
                            <TableCell className="max-w-xs truncate">{conta.cliente}</TableCell>
                            <TableCell>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              <Badge variant={conta.status === "pago" ? "default" : "outline"}>
                                {conta.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(Number(conta.valor))}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contas a Pagar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialData?.contasPagar.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Nenhuma conta a pagar
                          </TableCell>
                        </TableRow>
                      ) : (
                        financialData?.contasPagar.slice(0, 10).map((conta) => (
                          <TableRow key={conta.created_at}>
                            <TableCell className="max-w-xs truncate">{conta.fornecedor}</TableCell>
                            <TableCell>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              <Badge variant={conta.status === "pago" ? "default" : "outline"}>
                                {conta.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatCurrency(Number(conta.valor))}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Folha de Pagamento */}
          <TabsContent value="folha">
            <PayrollSection />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default ERP;
