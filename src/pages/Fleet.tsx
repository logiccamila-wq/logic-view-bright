import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, AlertCircle, CheckCircle, Bell, Wrench, TrendingUp, BarChart3, Upload, TriangleAlert, Gauge } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Truck } from "lucide-react";
import { useMaintenanceAlerts } from "@/hooks/useMaintenanceAlerts";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceCostAnalysis } from "@/components/mechanic/MaintenanceCostAnalysis";
import { useNavigate } from "react-router-dom";
import { TireControl } from "@/components/fleet/TireControl";
import { TireApprovals } from "@/components/fleet/TireApprovals";
import { ProcessActions } from "@/components/fleet/ProcessActions";
import { NonConformities } from "@/components/fleet/NonConformities";
import { ProductivityPanel } from "@/components/fleet/ProductivityPanel";
import { VehicleFormDialog } from "@/components/fleet/VehicleFormDialog";
import { useVehicles } from "@/lib/hooks/useVehicles";

const Fleet = () => {
  const navigate = useNavigate();
  const { vehicles, refresh } = useVehicles();
  const [searchTerm, setSearchTerm] = useState("");
  const [maintenanceStats, setMaintenanceStats] = useState({
    overdue: 0,
    urgent: 0,
    scheduled: 0,
    ok: 0
  });

  const { hasRole } = useAuth();
  const { notifications } = useNotifications();
  const { checkMaintenanceSchedules } = useMaintenanceAlerts();

  // Verificar se o usuário tem acesso ao módulo de alertas
  const canViewAlerts = hasRole('admin') || 
                       hasRole('logistics_manager') || 
                       hasRole('maintenance_manager') ||
                       hasRole('fleet_maintenance');

  // Carregar estatísticas de manutenção
  useEffect(() => {
    const loadMaintenanceStats = async () => {
      if (!canViewAlerts) return;

      try {
        const { data: serviceOrders } = await supabase
          .from('service_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!serviceOrders) return;

        const vehicleMap = new Map<string, any[]>();
        serviceOrders.forEach((order) => {
          const existing = vehicleMap.get(order.vehicle_plate) || [];
          vehicleMap.set(order.vehicle_plate, [...existing, order]);
        });

        let overdue = 0, urgent = 0, scheduled = 0, ok = 0;

        for (const [, orders] of vehicleMap.entries()) {
          const currentOdometer = Math.max(...orders.map(o => o.odometer));
          const avgInterval = 10000; // Intervalo médio simplificado
          const predictedKm = currentOdometer + avgInterval;
          const kmUntil = predictedKm - currentOdometer;

          if (kmUntil < 0) overdue++;
          else if (kmUntil < 1000) urgent++;
          else if (kmUntil < 3000) scheduled++;
          else ok++;
        }

        setMaintenanceStats({ overdue, urgent, scheduled, ok });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    loadMaintenanceStats();
  }, [canViewAlerts]);

  const filteredVehicles = vehicles.filter(v =>
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.model || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string = '') => {
    const s = status.toLowerCase();
    if (s.includes('ativo')) return { label: "Ativo", className: "bg-green-500/15 text-green-600 border-green-500/20" };
    if (s.includes('manuten')) return { label: "Manutenção", className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20" };
    return { label: status || "Inativo", className: "bg-red-500/15 text-red-600 border-red-500/20" };
  };

  // Filtrar notificações de frota
  const fleetNotifications = notifications.filter(n => n.module === 'fleet' && !n.read);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Gestão de Frota</h1>
            <p className="text-base text-muted-foreground">
              Gerencie todos os veículos da frota e acompanhe manutenções e custos
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2 shadow-sm"
              onClick={() => navigate('/import-vehicles')}
            >
              <Upload className="h-4 w-4" />
              Importar CRLV
            </Button>
            <VehicleFormDialog onSuccess={refresh} />
          </div>
        </div>

        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Veículos
            </TabsTrigger>
            <TabsTrigger value="cost-analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análise de Custos
            </TabsTrigger>
            <TabsTrigger value="tires" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Pneus
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4" />
              Ações
            </TabsTrigger>
            <TabsTrigger value="nc" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Não Conformidades
            </TabsTrigger>
            <TabsTrigger value="prod" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Produtividade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-6">

        {/* Alertas de Manutenção - Apenas para usuários autorizados */}
        {canViewAlerts && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Status de Manutenção Preventiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{maintenanceStats.overdue}</p>
                    <p className="text-sm text-muted-foreground">Atrasadas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{maintenanceStats.urgent}</p>
                    <p className="text-sm text-muted-foreground">Urgentes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{maintenanceStats.scheduled}</p>
                    <p className="text-sm text-muted-foreground">Agendadas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{maintenanceStats.ok}</p>
                    <p className="text-sm text-muted-foreground">Em Dia</p>
                  </div>
                </div>
              </div>
              
              {fleetNotifications.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Alertas Recentes:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {fleetNotifications.slice(0, 5).map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3 rounded-lg text-sm ${
                          notif.type === 'error' 
                            ? 'bg-destructive/10 text-destructive' 
                            : notif.type === 'warning'
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : 'bg-blue-500/10 text-blue-600'
                        }`}
                      >
                        <p className="font-medium">{notif.title}</p>
                        <p className="text-xs opacity-80 mt-1">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total de Veículos" value="24" icon={Truck} />
          <StatCard 
            title="Ativos" 
            value="18" 
            icon={CheckCircle} 
            trend={{ value: "+12%", positive: true }}
          />
          <StatCard 
            title="Em Manutenção" 
            value="4" 
            icon={AlertCircle} 
          />
          <StatCard title="Inativos" value="2" icon={Truck} />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por placa ou modelo..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle List */}
        <div className="grid gap-4">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.plate}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{vehicle.plate}</h3>
                        <Badge className={getStatusBadge(vehicle.status).className}>
                          {getStatusBadge(vehicle.status).label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{vehicle.model}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Tipo: <span className="text-foreground">{vehicle.type}</span>
                        </span>
                        <span className="text-muted-foreground">
                          KM: <span className="text-foreground">{Number(vehicle.mileage ?? 0).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <TireApprovals />
          </TabsContent>

          <TabsContent value="cost-analysis" className="space-y-6">
            <MaintenanceCostAnalysis />
          </TabsContent>

          <TabsContent value="tires" className="space-y-6">
            <TireControl />
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <ProcessActions />
          </TabsContent>

          <TabsContent value="nc" className="space-y-6">
            <NonConformities />
          </TabsContent>

          <TabsContent value="prod" className="space-y-6">
            <ProductivityPanel />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Fleet;
