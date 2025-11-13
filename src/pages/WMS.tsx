import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Warehouse, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  BarChart3,
  Plus,
  Search
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const WMS = () => {
  const inventoryData = [
    { id: "INV001", produto: "Pneu Pirelli 275/80R22.5", quantidade: 145, local: "A1-B3", status: "ok" },
    { id: "INV002", produto: "Óleo Lubrificante 15W40", quantidade: 23, local: "C2-D1", status: "baixo" },
    { id: "INV003", produto: "Filtro de Ar HD", quantidade: 67, local: "A2-C4", status: "ok" },
    { id: "INV004", produto: "Pastilha de Freio", quantidade: 12, local: "B1-A2", status: "crítico" },
    { id: "INV005", produto: "Bateria 150Ah", quantidade: 89, local: "D3-E1", status: "ok" },
  ];

  const movimentacoes = [
    { id: "MOV001", tipo: "Entrada", produto: "Pneu Pirelli", quantidade: 50, data: "2025-11-12", origem: "Fornecedor XYZ" },
    { id: "MOV002", tipo: "Saída", produto: "Óleo Lubrificante", quantidade: 15, data: "2025-11-12", destino: "Frota 001" },
    { id: "MOV003", tipo: "Transferência", produto: "Filtro de Ar", quantidade: 20, data: "2025-11-11", destino: "CD São Paulo" },
    { id: "MOV004", tipo: "Entrada", produto: "Bateria", quantidade: 30, data: "2025-11-11", origem: "Fornecedor ABC" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">WMS - Warehouse Management</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestão de Armazém e Controle de Estoque
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Itens em Estoque" 
            value="1.247" 
            icon={Package}
            trend={{ value: "+12 esta semana", positive: true }}
          />
          <StatCard 
            title="Ocupação" 
            value="78%" 
            icon={Warehouse}
          />
          <StatCard 
            title="Giro de Estoque" 
            value="4.2x" 
            icon={TrendingUp}
            trend={{ value: "+0.3 vs mês anterior", positive: true }}
          />
          <StatCard 
            title="Alertas" 
            value="8" 
            icon={AlertTriangle}
          />
        </div>

        {/* Tabs de Funcionalidades */}
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="locations">Localização</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Inventário */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Controle de Inventário</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar produtos..." className="pl-8 w-64" />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Entrada
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell>{item.produto}</TableCell>
                        <TableCell className="font-semibold">{item.quantidade}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.local}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              item.status === "ok" ? "default" : 
                              item.status === "baixo" ? "secondary" : 
                              "destructive"
                            }
                          >
                            {item.status === "ok" ? "OK" : 
                             item.status === "baixo" ? "Estoque Baixo" : 
                             "Crítico"}
                          </Badge>
                        </TableCell>
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

          {/* Movimentações */}
          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Movimentações de Estoque</CardTitle>
                  <Button>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Nova Movimentação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Origem/Destino</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell className="font-mono">{mov.id}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              mov.tipo === "Entrada" ? "default" : 
                              mov.tipo === "Saída" ? "secondary" : 
                              "outline"
                            }
                          >
                            {mov.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{mov.produto}</TableCell>
                        <TableCell className="font-semibold">{mov.quantidade}</TableCell>
                        <TableCell>{mov.data}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {mov.origem || mov.destino}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Localização */}
          <TabsContent value="locations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Zona A</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Ocupação:</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capacidade:</span>
                      <span className="text-muted-foreground">450 m³</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Zona B</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Ocupação:</span>
                      <span className="font-semibold">62%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capacidade:</span>
                      <span className="text-muted-foreground">380 m³</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Zona C</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Ocupação:</span>
                      <span className="font-semibold">91%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capacidade:</span>
                      <span className="text-muted-foreground">520 m³</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Relatórios Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Relatório de Giro de Estoque
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Análise de Ocupação por Zona
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Histórico de Movimentações
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Produtos Abaixo do Estoque Mínimo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Indicadores de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Acuracidade do Inventário</span>
                    <span className="font-bold text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio de Picking</span>
                    <span className="font-bold">4.2 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Devolução</span>
                    <span className="font-bold text-green-600">0.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Utilização de Espaço</span>
                    <span className="font-bold">78%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default WMS;
