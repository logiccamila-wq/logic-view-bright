import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  PackageCheck, 
  TrendingUp, 
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  Search,
  FileText,
  Download,
  Upload,
  RefreshCw
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

const OMS = () => {
  const pedidos = [
    { id: "PD001", cliente: "Transportadora ABC", data: "2025-11-12", valor: "R$ 28.500", status: "processando", itens: 5 },
    { id: "PD002", cliente: "Logística XYZ", data: "2025-11-12", valor: "R$ 15.200", status: "aprovado", itens: 3 },
    { id: "PD003", cliente: "Frota Nacional", data: "2025-11-11", valor: "R$ 42.100", status: "entregue", itens: 8 },
    { id: "PD004", cliente: "Cargo Express", data: "2025-11-11", valor: "R$ 19.800", status: "separacao", itens: 4 },
    { id: "PD005", cliente: "Trans Brasil", data: "2025-11-10", valor: "R$ 33.600", status: "pendente", itens: 6 },
  ];

  const pedidosPendentes = [
    { id: "PP001", cliente: "Cliente A", motivo: "Aguardando pagamento", prazo: "Hoje" },
    { id: "PP002", cliente: "Cliente B", motivo: "Produto em falta", prazo: "Amanhã" },
    { id: "PP003", cliente: "Cliente C", motivo: "Revisão de preços", prazo: "2 dias" },
  ];

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">OMS - Order Management</h1>
            <p className="text-muted-foreground mt-2">
              Sistema de Gestão de Pedidos e Ordens de Compra
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
            title="Pedidos Hoje" 
            value="47" 
            icon={ShoppingCart}
            trend={{ value: "+8 vs ontem", positive: true }}
          />
          <StatCard 
            title="Taxa Aprovação" 
            value="92%" 
            icon={PackageCheck}
            trend={{ value: "+2%", positive: true }}
          />
          <StatCard 
            title="Tempo Médio" 
            value="4.2h" 
            icon={Clock}
          />
          <StatCard 
            title="Ticket Médio" 
            value="R$ 27.5k" 
            icon={DollarSign}
            trend={{ value: "+15%", positive: true }}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pedidos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pedidos">Todos Pedidos</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Todos Pedidos */}
          <TabsContent value="pedidos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestão de Pedidos</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar pedidos..." className="pl-8 w-64" />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Pedido
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos.map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell className="font-mono">{pedido.id}</TableCell>
                        <TableCell>{pedido.cliente}</TableCell>
                        <TableCell>{pedido.data}</TableCell>
                        <TableCell className="text-center">{pedido.itens}</TableCell>
                        <TableCell className="font-semibold text-green-600">{pedido.valor}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              pedido.status === "entregue" ? "default" : 
                              pedido.status === "aprovado" ? "secondary" : 
                              pedido.status === "processando" ? "outline" :
                              pedido.status === "separacao" ? "secondary" :
                              "destructive"
                            }
                          >
                            {pedido.status === "entregue" ? "Entregue" : 
                             pedido.status === "aprovado" ? "Aprovado" : 
                             pedido.status === "processando" ? "Processando" :
                             pedido.status === "separacao" ? "Em Separação" :
                             "Pendente"}
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

          {/* Pendentes */}
          <TabsContent value="pendentes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Pedidos Pendentes de Ação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosPendentes.map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell className="font-mono">{pedido.id}</TableCell>
                        <TableCell>{pedido.cliente}</TableCell>
                        <TableCell>{pedido.motivo}</TableCell>
                        <TableCell>
                          <Badge variant={pedido.prazo === "Hoje" ? "destructive" : "secondary"}>
                            {pedido.prazo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Resolver</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faturamento */}
          <TabsContent value="faturamento" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Faturamento Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">R$ 1.28M</p>
                  <p className="text-sm text-muted-foreground mt-2">+18% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pedidos Faturados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">142</p>
                  <p className="text-sm text-muted-foreground mt-2">este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Aguardando NF-e</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">8</p>
                  <p className="text-sm text-muted-foreground mt-2">pedidos</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ações de Faturamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Emitir Notas Fiscais Pendentes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Gerar Boletos de Cobrança
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Conciliar Pedidos x Notas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversão</span>
                    <span className="font-bold text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio Aprovação</span>
                    <span className="font-bold">3.8h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa Cancelamento</span>
                    <span className="font-bold text-red-600">2.3%</span>
                  </div>
                  <Button className="w-full mt-4">Gerar Relatório Completo</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Clientes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {["Transportadora ABC", "Logística XYZ", "Frota Nacional", "Cargo Express", "Trans Brasil"].map((cliente, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{cliente}</span>
                      <span className="font-semibold text-green-600">R$ {(50 - idx * 5)}k</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default OMS;
