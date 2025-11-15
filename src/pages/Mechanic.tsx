import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceOrdersTab } from '@/components/mechanic/ServiceOrdersTab';
import { TPMSTab } from '@/components/mechanic/TPMSTab';
import { WorkshopTab } from '@/components/mechanic/WorkshopTab';
import { MaintenanceChecklistTab } from '@/components/mechanic/MaintenanceChecklistTab';
import { LavaJatoTab } from '@/components/mechanic/LavaJatoTab';
import { BorachariaTab } from '@/components/mechanic/BorachariaTab';
import { MaintenanceScheduler } from '@/components/mechanic/MaintenanceScheduler';
import { PartsRequestTab } from '@/components/mechanic/PartsRequestTab';
import { Wrench, Gauge, Package, ClipboardCheck, Droplet, Circle, Calendar, PackagePlus } from 'lucide-react';

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

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:w-auto">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Ordens de Serviço</span>
              <span className="sm:hidden">OS</span>
            </TabsTrigger>
            <TabsTrigger value="lavajato" className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              <span className="hidden sm:inline">Lava-Jato</span>
            </TabsTrigger>
            <TabsTrigger value="borracharia" className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              <span className="hidden sm:inline">Borracharia</span>
            </TabsTrigger>
            <TabsTrigger value="tpms" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">TPMS</span>
            </TabsTrigger>
            <TabsTrigger value="workshop" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Oficina</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Checklists</span>
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Agendamento</span>
            </TabsTrigger>
            <TabsTrigger value="parts" className="flex items-center gap-2">
              <PackagePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Pedido Peças</span>
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="parts" className="space-y-6">
            <PartsRequestTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Mechanic;
