import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ServiceOrdersTab } from "@/components/mechanic/ServiceOrdersTab";
import { TPMSTab } from "@/components/mechanic/TPMSTab";
import { WorkshopTab } from "@/components/mechanic/WorkshopTab";
import { MaintenanceChecklistTab } from "@/components/mechanic/MaintenanceChecklistTab";
import { LavaJatoTab } from "@/components/mechanic/LavaJatoTab";
import { BorachariaTab } from "@/components/mechanic/BorachariaTab";
import { MaintenanceScheduler } from "@/components/mechanic/MaintenanceScheduler";
import { PartsRequestTab } from "@/components/mechanic/PartsRequestTab";
import { MaintenancePlansConfig } from "@/components/mechanic/MaintenancePlansConfig";

import { MapTestPanel } from "@/components/maps/MapTestPanel";
import { MechanicClockIn } from "@/components/mechanic/MechanicClockIn";

import { Wrench, Gauge, Package, ClipboardCheck, Droplet, Circle, Calendar, PackagePlus, TestTube, ListChecks } from "lucide-react";

const Mechanic = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Portal do Mecânico</h1>
          <p className="text-muted-foreground">
            Sistema completo de gestão de manutenção, ordens de serviço e monitoramento da frota
          </p>
        </div>

        {/* Controle de Ponto */}
        <MechanicClockIn />

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-10 gap-1">
            <TabsTrigger value="orders" className="flex items-center gap-2 text-xs sm:text-sm">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Ordens de Serviço</span>
              <span className="sm:hidden">OS</span>
            </TabsTrigger>

            <TabsTrigger value="lavajato" className="flex items-center gap-2 text-xs sm:text-sm">
              <Droplet className="h-4 w-4" />
              <span className="hidden sm:inline">Lava-Jato</span>
              <span className="sm:hidden">Lava</span>
            </TabsTrigger>

            <TabsTrigger value="borracharia" className="flex items-center gap-2 text-xs sm:text-sm">
              <Circle className="h-4 w-4" />
              <span className="hidden sm:inline">Borracharia</span>
              <span className="sm:hidden">Pneu</span>
            </TabsTrigger>

            <TabsTrigger value="tpms" className="flex items-center gap-2 text-xs sm:text-sm">
              <Gauge className="h-4 w-4" />
              <span>TPMS</span>
            </TabsTrigger>

            <TabsTrigger value="workshop" className="flex items-center gap-2 text-xs sm:text-sm">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Oficina</span>
              <span className="sm:hidden">Ofic</span>
            </TabsTrigger>

            <TabsTrigger value="checklist" className="flex items-center gap-2 text-xs sm:text-sm">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Checklists</span>
              <span className="sm:hidden">Check</span>
            </TabsTrigger>

            <TabsTrigger value="scheduler" className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Agendamento</span>
              <span className="sm:hidden">Agend</span>
            </TabsTrigger>

            <TabsTrigger value="plans" className="flex items-center gap-2 text-xs sm:text-sm">
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Planos</span>
              <span className="sm:hidden">Plano</span>
            </TabsTrigger>

            <TabsTrigger value="parts" className="flex items-center gap-2 text-xs sm:text-sm">
              <PackagePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Pedido Peças</span>
              <span className="sm:hidden">Peças</span>
            </TabsTrigger>

            <TabsTrigger value="test" className="flex items-center gap-2 text-xs sm:text-sm">
              <TestTube className="h-4 w-4" />
              <span className="hidden sm:inline">Teste APIs</span>
              <span className="sm:hidden">Test</span>
            </TabsTrigger>
          </TabsList>

          {/* CONTEÚDO */}

          <TabsContent value="orders" className="space-y-6">
            <ServiceOrdersTab />
          </TabsContent>

          <TabsContent value="lavajato" className="space-y-6">
            <LavaJatoTab />
          </TabsContent>

          <TabsContent value="borracharia" className="space-y-6">
            <BorachariaTab />
          </TabsContent>

          <TabsContent value="tpms" className="space-y-6">
            <TPMSTab />
          </TabsContent>

          <TabsContent value="workshop" className="space-y-6">
            <WorkshopTab />
          </TabsContent>

          <TabsContent value="checklist" className="space-y-6">
            <MaintenanceChecklistTab />
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-6">
            <MaintenanceScheduler />
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <MaintenancePlansConfig />
          </TabsContent>

          <TabsContent value="parts" className="space-y-6">
            <PartsRequestTab />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <MapTestPanel />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Mechanic;
