import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
  Plus,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const SCM = () => {
  const fornecedores = [
    { id: "FOR001", nome: "Pirelli Pneus Brasil", categoria: "Pneus", lead_time: "5 dias", confiabilidade: 98, pedidos_mes: 12 },
    { id: "FOR002", nome: "Shell Lubrificantes", categoria: "Lubrificantes", lead_time: "3 dias", confiabilidade: 95, pedidos_mes: 8 },
    { id: "FOR003", nome: "Bosch Peças Auto", categoria: "Peças", lead_time: "7 dias", confiabilidade: 92, pedidos_mes: 15 },
    { id: "FOR004", nome: "Petronas Combustível", categoria: "Combustível", lead_time: "1 dia", confiabilidade: 99, pedidos_mes: 30 },
  ];

  const compras = [
    { id: "CP001", fornecedor: "Pirelli Pneus", item: "Pneu 275/80R22.5", qtd: 50, valor: "R$ 42.500", prazo: "2025-11-15", status: "aprovado" },
    { id: "CP002", fornecedor: "Shell Lubrificantes", item: "Óleo 15W40", qtd: 200, valor: "R$ 8.400", prazo: "2025-11-14", status: "transito" },
    { id: "CP003", fornecedor: "Bosch Peças", item: "Filtro de Ar HD", qtd: 80, valor: "R$ 3.200", prazo: "2025-11-18", status: "pendente" },
  ];

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">SCM - Supply Chain Management</h1>
            <p className="text-muted-foreground mt-2">
              Gestão da Cadeia de Suprimentos e Fornecedores
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button variant="default" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Odoo
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Fornecedores Ativos" 
            value="48" 
            icon={Users}
            trend={{ value: "+3 este mês", positive: true }}
          />
          <StatCard 
            title="Lead Time Médio" 
            value="4.2 dias" 
            icon={Package}
            trend={{ value: "-0.5 dias", positive: true }}
          />
          <StatCard 
            title="Taxa Entrega" 
            value="96.5%" 
            icon={CheckCircle}
          />
          <StatCard 
            title="Economia Mês" 
            value="R$ 28k" 
            icon={TrendingDown}
            trend={{ value: "+12%", positive: true }}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="fornecedores" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
            <TabsTrigger value="compras">Compras</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analise">Análise</TabsTrigger>
          </TabsList>

          {/* Fornecedores */}
          <TabsContent value="fornecedores" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Cadastro de Fornecedores</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Fornecedor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Confiabilidade</TableHead>
                      <TableHead>Pedidos/Mês</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fornecedores.map((fornecedor) => (
                      <TableRow key={fornecedor.id}>
                        <TableCell className="font-mono">{fornecedor.id}</TableCell>
                        <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{fornecedor.categoria}</Badge>
                        </TableCell>
                        <TableCell>{fornecedor.lead_time}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-600" 
                                style={{ width: `${fornecedor.confiabilidade}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{fornecedor.confiabilidade}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{fornecedor.pedidos_mes}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Detalhes</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compras */}
          <TabsContent value="compras" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ordens de Compra</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Ordem
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Prazo Entrega</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compras.map((compra) => (
                      <TableRow key={compra.id}>
                        <TableCell className="font-mono">{compra.id}</TableCell>
                        <TableCell>{compra.fornecedor}</TableCell>
                        <TableCell>{compra.item}</TableCell>
                        <TableCell className="text-center">{compra.qtd}</TableCell>
                        <TableCell className="font-semibold text-green-600">{compra.valor}</TableCell>
                        <TableCell>{compra.prazo}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              compra.status === "aprovado" ? "default" : 
                              compra.status === "transito" ? "secondary" : 
                              "outline"
                            }
                          >
                            {compra.status === "aprovado" ? "Aprovado" : 
                             compra.status === "transito" ? "Em Trânsito" : 
                             "Pendente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    KPIs de Fornecedores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Entrega no Prazo</span>
                    <span className="font-bold text-green-600">96.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Qualidade Média</span>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Não Conformidades</span>
                    <span className="font-bold text-red-600">3.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio Resposta</span>
                    <span className="font-bold">2.1 dias</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Alertas e Ações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium">3 fornecedores com atraso</p>
                    <p className="text-xs text-muted-foreground mt-1">Requer ação imediata</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm font-medium">5 contratos para renovação</p>
                    <p className="text-xs text-muted-foreground mt-1">Próximos 30 dias</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium">Oportunidade de negociação</p>
                    <p className="text-xs text-muted-foreground mt-1">Economia estimada: R$ 12k</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Análise */}
          <TabsContent value="analise" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Gastos Totais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">R$ 2.4M</p>
                  <p className="text-sm text-muted-foreground mt-2">este ano</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Economia Negociada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">R$ 186k</p>
                  <p className="text-sm text-muted-foreground mt-2">7.8% de economia</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Fornecedores Certificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">42</p>
                  <p className="text-sm text-muted-foreground mt-2">87.5% do total</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Análise da Cadeia de Suprimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Pneus</span>
                      <span className="text-sm text-muted-foreground">35% do total</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Combustível</span>
                      <span className="text-sm text-muted-foreground">28% do total</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '28%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Peças e Manutenção</span>
                      <span className="text-sm text-muted-foreground">22% do total</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '22%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Outros</span>
                      <span className="text-sm text-muted-foreground">15% do total</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default SCM;
