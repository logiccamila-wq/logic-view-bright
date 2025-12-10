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
import { TireControl } from "@/components/fleet/TireControl";
import { TireApprovals } from "@/components/fleet/TireApprovals";

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
          <TabsList className="flex w-full flex-wrap justify-start gap-2 h-auto p-2 bg-muted/50 rounded-lg">
            <TabsTrigger value="orders" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <Wrench className="h-4 w-4" />
              <span>Ordens</span>
            </TabsTrigger>

            <TabsTrigger value="lavajato" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <Droplet className="h-4 w-4" />
              <span>Lava-Jato</span>
            </TabsTrigger>

            <TabsTrigger value="borracharia" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <Circle className="h-4 w-4" />
              <span>Borracharia</span>
            </TabsTrigger>

            <TabsTrigger value="tires" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <Circle className="h-4 w-4" />
              <span>Pneus</span>
            </TabsTrigger>

            <TabsTrigger value="tpms" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <Gauge className="h-4 w-4" />
              <span>TPMS</span>
            </TabsTrigger>

            <TabsTrigger value="workshop" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <Package className="h-4 w-4" />
              <span>Oficina</span>
            </TabsTrigger>

            <TabsTrigger value="checklist" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <ClipboardCheck className="h-4 w-4" />
              <span>Checklists</span>
            </TabsTrigger>

            <TabsTrigger value="scheduler" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <Calendar className="h-4 w-4" />
              <span>Agendamento</span>
            </TabsTrigger>

            <TabsTrigger value="plans" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <ListChecks className="h-4 w-4" />
              <span>Planos</span>
            </TabsTrigger>

            <TabsTrigger value="parts" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <PackagePlus className="h-4 w-4" />
              <span>Peças</span>
            </TabsTrigger>

            <TabsTrigger value="test" className="flex items-center gap-2 px-3 py-2 flex-grow sm:flex-grow-0">
              <TestTube className="h-4 w-4" />
              <span>Teste APIs</span>
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

          <TabsContent value="tires" className="space-y-6">
            <TireControl />
            <TireApprovals />
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
