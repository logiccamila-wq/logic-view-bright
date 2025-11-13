import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceOrdersTab } from '@/components/mechanic/ServiceOrdersTab';
import { TPMSTab } from '@/components/mechanic/TPMSTab';
import { WorkshopTab } from '@/components/mechanic/WorkshopTab';
import { MaintenanceChecklistTab } from '@/components/mechanic/MaintenanceChecklistTab';
import { Wrench, Gauge, Package, ClipboardCheck } from 'lucide-react';

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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Ordens de Serviço</span>
              <span className="sm:hidden">OS</span>
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
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <ServiceOrdersTab />
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default Mechanic;
