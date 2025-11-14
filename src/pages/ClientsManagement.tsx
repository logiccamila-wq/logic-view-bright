import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsFinancialDashboard } from "@/components/crm/ClientsFinancialDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const ClientsManagement = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise financeira completa e gestão de inadimplência
          </p>
        </div>

        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financial">Análise Financeira</TabsTrigger>
            <TabsTrigger value="clients">Cadastro de Clientes</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <ClientsFinancialDashboard />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Em desenvolvimento - Cadastro automático via importação de CT-e
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Inadimplência</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistema de alertas automáticos em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClientsManagement;
