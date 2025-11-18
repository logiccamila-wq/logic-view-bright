import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  Clock,
  DollarSign,
  Package,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { CTEManagement } from "@/components/tms/CTEManagement";
import MDFEManagement from "@/components/tms/MDFEManagement";
import { RevenueAnalysis } from "@/components/revenue/RevenueAnalysis";
import { TripManagement } from "@/components/tms/TripManagement";
import { OrdemColetaManagement } from "@/components/tms/OrdemColetaManagement";
import { RouteOptimizer } from "@/components/tms/RouteOptimizer";
import { VehicleList } from "@/components/tms/VehicleList";

const TMS = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">TMS - Transport Management</h1>
          <p className="text-base text-muted-foreground">
            Sistema de Gestão de Transportes e Logística
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <Tabs defaultValue="trips" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="trips">Gestão de Viagens</TabsTrigger>
            <TabsTrigger value="rotas">Planejamento de Rotas</TabsTrigger>
            <TabsTrigger value="ordem-coleta">Ordem de Coleta</TabsTrigger>
            <TabsTrigger value="veiculos">Cavalos</TabsTrigger>
            <TabsTrigger value="cte">CT-e</TabsTrigger>
            <TabsTrigger value="mdfe">MDF-e</TabsTrigger>
            <TabsTrigger value="receita">Análise de Receita</TabsTrigger>
          </TabsList>

          {/* Gestão de Viagens */}
          <TabsContent value="trips">
            <TripManagement />
          </TabsContent>

          {/* Planejamento de Rotas */}
          <TabsContent value="rotas">
            <RouteOptimizer />
          </TabsContent>

          {/* Ordem de Coleta */}
          <TabsContent value="ordem-coleta">
            <OrdemColetaManagement />
          </TabsContent>

          {/* Veículos */}
          <TabsContent value="veiculos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Lista de Cavalos Mecânicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VehicleList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* CT-e */}
          <TabsContent value="cte">
            <CTEManagement />
          </TabsContent>

          {/* MDF-e */}
          <TabsContent value="mdfe">
            <MDFEManagement />
          </TabsContent>

          {/* Receita */}
          <TabsContent value="receita">
            <RevenueAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TMS;
