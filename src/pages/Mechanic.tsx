import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const Mechanic = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const serviceOrders = [
    {
      id: "OS-001",
      vehicle: "ABC-1234",
      type: "Manutenção Preventiva",
      status: "pending",
      priority: "high",
      date: "2024-11-13",
    },
    {
      id: "OS-002",
      vehicle: "DEF-5678",
      type: "Troca de Óleo",
      status: "in-progress",
      priority: "medium",
      date: "2024-11-13",
    },
    {
      id: "OS-003",
      vehicle: "GHI-9012",
      type: "Alinhamento",
      status: "completed",
      priority: "low",
      date: "2024-11-12",
    },
  ];

  const filteredOrders = serviceOrders.filter((order) => order.status === activeTab);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hub do Mecânico</h1>
            <p className="text-muted-foreground">Gerencie ordens de serviço e manutenções</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova OS
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Pendentes" value="8" icon={Clock} />
          <StatCard title="Em Andamento" value="3" icon={Wrench} />
          <StatCard title="Concluídas" value="24" icon={CheckCircle} />
          <StatCard title="Urgentes" value="2" icon={AlertCircle} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pendentes (8)</TabsTrigger>
            <TabsTrigger value="in-progress">Em Andamento (3)</TabsTrigger>
            <TabsTrigger value="completed">Concluídas (24)</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{order.id}</h3>
                        <Badge
                          className={
                            order.priority === "high"
                              ? "bg-red-500/20 text-red-600"
                              : order.priority === "medium"
                              ? "bg-yellow-500/20 text-yellow-600"
                              : "bg-green-500/20 text-green-600"
                          }
                        >
                          {order.priority === "high"
                            ? "Alta"
                            : order.priority === "medium"
                            ? "Média"
                            : "Baixa"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Veículo: {order.vehicle} • {order.type}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    <Button>Ver Detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Mechanic;
