import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  Route, 
  MapPin, 
  Clock,
  DollarSign,
  Package,
  AlertCircle,
  Plus,
  Search,
  FileText
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
import { CTEManagement } from "@/components/tms/CTEManagement";
import { RevenueAnalysis } from "@/components/revenue/RevenueAnalysis";

const TMS = () => {
  const viagensAtivas = [
    { id: "VG001", motorista: "João Silva", veiculo: "ABC-1234", origem: "São Paulo", destino: "Rio de Janeiro", status: "em_transito", eta: "14:30" },
    { id: "VG002", motorista: "Maria Santos", veiculo: "DEF-5678", origem: "Curitiba", destino: "Florianópolis", status: "carregando", eta: "16:00" },
    { id: "VG003", motorista: "Carlos Oliveira", veiculo: "GHI-9012", origem: "Belo Horizonte", destino: "Brasília", status: "em_transito", eta: "18:45" },
    { id: "VG004", motorista: "Ana Costa", veiculo: "JKL-3456", origem: "Salvador", destino: "Recife", status: "aguardando", eta: "09:00" },
  ];

  const cargas = [
    { id: "CG001", cliente: "Empresa ABC", peso: "24.5t", valor: "R$ 15.800", tipo: "Geral", prazo: "2 dias" },
    { id: "CG002", cliente: "Indústria XYZ", peso: "18.2t", valor: "R$ 12.400", tipo: "Refrigerado", prazo: "1 dia" },
    { id: "CG003", cliente: "Comércio 123", peso: "32.0t", valor: "R$ 21.500", tipo: "Perigosa", prazo: "3 dias" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">TMS - Transport Management</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestão de Transportes e Logística
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Viagens Ativas" 
            value="38" 
            icon={Truck}
            trend={{ value: "+5 hoje", positive: true }}
          />
          <StatCard 
            title="Taxa Ocupação" 
            value="87%" 
            icon={Package}
            trend={{ value: "+3% vs ontem", positive: true }}
          />
          <StatCard 
            title="Entregas no Prazo" 
            value="94.2%" 
            icon={Clock}
          />
          <StatCard 
            title="Receita Mês" 
            value="R$ 485k" 
            icon={DollarSign}
            trend={{ value: "+12%", positive: true }}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="viagens" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="viagens">Viagens</TabsTrigger>
            <TabsTrigger value="cte">CT-e</TabsTrigger>
            <TabsTrigger value="cargas">Cargas</TabsTrigger>
            <TabsTrigger value="rotas">Rotas</TabsTrigger>
            <TabsTrigger value="frete">Frete</TabsTrigger>
            <TabsTrigger value="rastreamento">Rastreamento</TabsTrigger>
            <TabsTrigger value="receita">Receita</TabsTrigger>
          </TabsList>

          {/* Viagens */}
          <TabsContent value="viagens" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Viagens em Andamento</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar viagens..." className="pl-8 w-64" />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Viagem
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Motorista</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ETA</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viagensAtivas.map((viagem) => (
                      <TableRow key={viagem.id}>
                        <TableCell className="font-mono">{viagem.id}</TableCell>
                        <TableCell>{viagem.motorista}</TableCell>
                        <TableCell className="font-mono">{viagem.veiculo}</TableCell>
                        <TableCell>{viagem.origem}</TableCell>
                        <TableCell>{viagem.destino}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              viagem.status === "em_transito" ? "default" : 
                              viagem.status === "carregando" ? "secondary" : 
                              "outline"
                            }
                          >
                            {viagem.status === "em_transito" ? "Em Trânsito" : 
                             viagem.status === "carregando" ? "Carregando" : 
                             "Aguardando"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{viagem.eta}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CT-e */}
          <TabsContent value="cte" className="space-y-4">
            <CTEManagement />
          </TabsContent>

          {/* Cargas */}
          <TabsContent value="cargas" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestão de Cargas</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Carga
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cargas.map((carga) => (
                      <TableRow key={carga.id}>
                        <TableCell className="font-mono">{carga.id}</TableCell>
                        <TableCell>{carga.cliente}</TableCell>
                        <TableCell className="font-semibold">{carga.peso}</TableCell>
                        <TableCell className="text-green-600">{carga.valor}</TableCell>
                        <TableCell>
                          <Badge variant={carga.tipo === "Perigosa" ? "destructive" : "outline"}>
                            {carga.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{carga.prazo}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Alocar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rotas */}
          <TabsContent value="rotas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Otimização de Rotas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Economia Combustível</span>
                    <span className="font-bold text-green-600">18.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Redução Km Rodado</span>
                    <span className="font-bold text-green-600">1.240 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rotas Otimizadas Hoje</span>
                    <span className="font-bold">12</span>
                  </div>
                  <Button className="w-full mt-4">
                    Otimizar Novas Rotas
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Alertas de Rota
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm font-medium">Congestionamento BR-101</p>
                    <p className="text-xs text-muted-foreground mt-1">Atraso estimado: 45 min</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium">Interdição parcial BR-116</p>
                    <p className="text-xs text-muted-foreground mt-1">Rota alternativa sugerida</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium">Condições climáticas adversas</p>
                    <p className="text-xs text-muted-foreground mt-1">Sul do país - chuva forte</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Frete */}
          <TabsContent value="frete" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cálculo e Gestão de Frete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Origem</label>
                    <Input placeholder="CEP ou cidade" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destino</label>
                    <Input placeholder="CEP ou cidade" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Peso (kg)</label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <Button className="w-full">Calcular Frete</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rastreamento */}
          <TabsContent value="rastreamento" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Rastreamento em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Mapa de rastreamento será carregado aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receita */}
          <TabsContent value="receita" className="space-y-4">
            <RevenueAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TMS;
