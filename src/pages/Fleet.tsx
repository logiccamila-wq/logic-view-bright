import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Truck } from "lucide-react";

interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  status: "ativo" | "manutencao" | "inativo";
  motorista?: string;
  km: number;
}

const Fleet = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockVehicles: Vehicle[] = [
    { id: "1", placa: "ABC-1234", modelo: "Mercedes-Benz Atego", status: "ativo", motorista: "João Silva", km: 85000 },
    { id: "2", placa: "DEF-5678", modelo: "Volvo FH", status: "manutencao", km: 120000 },
    { id: "3", placa: "GHI-9012", modelo: "Scania R450", status: "ativo", motorista: "Maria Santos", km: 65000 },
    { id: "4", placa: "JKL-3456", modelo: "Iveco Daily", status: "inativo", km: 180000 },
  ];

  const filteredVehicles = mockVehicles.filter(v =>
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Vehicle["status"]) => {
    const variants = {
      ativo: { label: "Ativo", className: "bg-green-500/20 text-green-600 hover:bg-green-500/30" },
      manutencao: { label: "Manutenção", className: "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30" },
      inativo: { label: "Inativo", className: "bg-red-500/20 text-red-600 hover:bg-red-500/30" },
    };
    return variants[status];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestão de Frota</h1>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Veículo
          </Button>
        </div>

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
            <Card key={vehicle.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{vehicle.placa}</h3>
                        <Badge className={getStatusBadge(vehicle.status).className}>
                          {getStatusBadge(vehicle.status).label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{vehicle.modelo}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        {vehicle.motorista && (
                          <span className="text-muted-foreground">
                            Motorista: <span className="text-foreground">{vehicle.motorista}</span>
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          KM: <span className="text-foreground">{vehicle.km.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Fleet;
