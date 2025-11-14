import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  DollarSign, 
  Users, 
  Package,
  BarChart3,
  FileText,
  Settings,
  TrendingUp
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RevenueAnalysis } from "@/components/revenue/RevenueAnalysis";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ERP = () => {
  const lancamentos = [
    { id: "LC001", data: "2025-11-12", descricao: "Venda de Serviços - Transportadora ABC", tipo: "receita", valor: "R$ 28.500", categoria: "Receita Operacional" },
    { id: "LC002", data: "2025-11-12", descricao: "Pagamento Combustível", tipo: "despesa", valor: "R$ 8.240", categoria: "Combustível" },
    { id: "LC003", data: "2025-11-11", descricao: "Folha de Pagamento Novembro", tipo: "despesa", valor: "R$ 45.600", categoria: "Pessoal" },
    { id: "LC004", data: "2025-11-11", descricao: "Venda de Serviços - Logística XYZ", tipo: "receita", valor: "R$ 35.200", categoria: "Receita Operacional" },
  ];

  const balanco = [
    { conta: "Caixa e Equivalentes", valor: "R$ 245.800", variacao: "+12.5%" },
    { conta: "Contas a Receber", valor: "R$ 428.300", variacao: "+8.2%" },
    { conta: "Estoque", valor: "R$ 186.500", variacao: "-3.1%" },
    { conta: "Imobilizado", valor: "R$ 1.850.000", variacao: "+2.1%" },
  ];

  return (
    <Layout>
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
            value="R$ 1.42M" 
            icon={DollarSign}
            trend={{ value: "+15% vs mês anterior", positive: true }}
          />
          <StatCard 
            title="Margem Líquida" 
            value="18.5%" 
            icon={TrendingUp}
            trend={{ value: "+2.3pp", positive: true }}
          />
          <StatCard 
            title="Colaboradores" 
            value="87" 
            icon={Users}
            trend={{ value: "+3 este mês", positive: true }}
          />
          <StatCard 
            title="Ativos Totais" 
            value="R$ 8.2M" 
            icon={Building2}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="financeiro" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="contabilidade">Contabilidade</TabsTrigger>
            <TabsTrigger value="rh">Recursos Humanos</TabsTrigger>
            <TabsTrigger value="patrimonio">Patrimônio</TabsTrigger>
            <TabsTrigger value="receita">Receita</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Financeiro */}
          <TabsContent value="financeiro" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">R$ 1.42M</p>
                  <p className="text-sm text-muted-foreground mt-2">Novembro 2025</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">R$ 985k</p>
                  <p className="text-sm text-muted-foreground mt-2">Novembro 2025</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Lucro Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">R$ 435k</p>
                  <p className="text-sm text-muted-foreground mt-2">18.5% de margem</p>
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
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lancamentos.map((lancamento) => (
                      <TableRow key={lancamento.id}>
                        <TableCell className="font-mono">{lancamento.id}</TableCell>
                        <TableCell>{lancamento.data}</TableCell>
                        <TableCell>{lancamento.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lancamento.categoria}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={lancamento.tipo === "receita" ? "default" : "destructive"}>
                            {lancamento.tipo === "receita" ? "Receita" : "Despesa"}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-semibold ${lancamento.tipo === "receita" ? "text-green-600" : "text-red-600"}`}>
                          {lancamento.valor}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contabilidade */}
          <TabsContent value="contabilidade" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Balanço Patrimonial</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Conta</TableHead>
                      <TableHead>Saldo Atual</TableHead>
                      <TableHead>Variação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanco.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.conta}</TableCell>
                        <TableCell className="font-semibold">{item.valor}</TableCell>
                        <TableCell>
                          <Badge variant={item.variacao.startsWith("+") ? "default" : "secondary"}>
                            {item.variacao}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>DRE - Demonstração de Resultados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Receita Bruta</span>
                    <span className="font-bold">R$ 1.680k</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">(-) Impostos</span>
                    <span className="font-bold">R$ 260k</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Receita Líquida</span>
                    <span className="font-bold">R$ 1.420k</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">(-) Custos Operacionais</span>
                    <span className="font-bold">R$ 720k</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">(-) Despesas Administrativas</span>
                    <span className="font-bold">R$ 265k</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center text-primary">
                    <span className="text-sm font-bold">Lucro Líquido</span>
                    <span className="font-bold text-lg">R$ 435k</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de Caixa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Saldo Inicial</span>
                    <span className="font-bold">R$ 218k</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">(+) Entradas</span>
                    <span className="font-bold">R$ 1.420k</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">(-) Saídas</span>
                    <span className="font-bold">R$ 985k</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center text-primary">
                    <span className="text-sm font-bold">Saldo Final</span>
                    <span className="font-bold text-lg">R$ 653k</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-sm">Investimentos</span>
                    <span className="font-bold">R$ 180k</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-sm">Financiamentos</span>
                    <span className="font-bold">R$ 420k</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RH */}
          <TabsContent value="rh" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Colaboradores</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">87</p>
                  <p className="text-sm text-muted-foreground mt-2">+3 este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Folha de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">R$ 245k</p>
                  <p className="text-sm text-muted-foreground mt-2">mensal</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Taxa de Turnover</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">4.2%</p>
                  <p className="text-sm text-muted-foreground mt-2">últimos 12 meses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Benefícios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">R$ 42k</p>
                  <p className="text-sm text-muted-foreground mt-2">mensal</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gestão de Pessoal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Cadastro de Funcionários
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Gestão de Ponto e Frequência
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Processamento de Folha
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Administração de Benefícios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receita */}
          <TabsContent value="receita" className="space-y-4">
            <RevenueAnalysis />
          </TabsContent>

          {/* Patrimônio */}
          <TabsContent value="patrimonio" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Valor Total de Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">R$ 8.2M</p>
                  <p className="text-sm text-muted-foreground mt-2">atualizado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Depreciação Acumulada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">R$ 1.8M</p>
                  <p className="text-sm text-muted-foreground mt-2">histórico</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Valor Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">R$ 6.4M</p>
                  <p className="text-sm text-muted-foreground mt-2">contábil</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Categorias de Ativos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Veículos</span>
                    <span className="text-sm text-muted-foreground">R$ 4.2M (51%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '51%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Imóveis</span>
                    <span className="text-sm text-muted-foreground">R$ 2.4M (29%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '29%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Equipamentos</span>
                    <span className="text-sm text-muted-foreground">R$ 1.2M (15%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '15%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Outros</span>
                    <span className="text-sm text-muted-foreground">R$ 400k (5%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '5%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Relatórios Gerenciais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    DRE Gerencial Completo
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Análise de Custos por Centro
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Fluxo de Caixa Projetado
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Balanço Patrimonial Consolidado
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Plano de Contas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Centros de Custo
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Parâmetros Fiscais
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Integrações Contábeis
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

export default ERP;
