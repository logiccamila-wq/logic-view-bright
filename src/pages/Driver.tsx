import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Package,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Star,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";

const Driver = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Super App Motorista</h1>
          <p className="text-muted-foreground">Central completa para motoristas</p>
        </div>

        {/* Premium Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Entregas Hoje" value="12" icon={Package} />
          <StatCard 
            title="Pontuação" 
            value="9.2" 
            icon={Star}
            trend={{ value: "+0.3", positive: true }}
          />
          <StatCard title="Horas" value="8.5h" icon={Clock} />
          <StatCard 
            title="Ganhos" 
            value="R$ 840" 
            icon={DollarSign}
            trend={{ value: "+R$ 120", positive: true }}
          />
        </div>

        {/* Active Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Entrega Ativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">São Paulo → Rio de Janeiro</h3>
                  <p className="text-sm text-muted-foreground">Veículo: ABC-1234</p>
                </div>
                <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">
                  Ativa
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">428 km</p>
                  <p className="text-xs text-muted-foreground">Distância Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">287 km</p>
                  <p className="text-xs text-muted-foreground">Percorridos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">5h 20m</p>
                  <p className="text-xs text-muted-foreground">Tempo Restante</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <MapPin className="mr-2 w-4 h-4" />
                  Ver Rota
                </Button>
                <Button className="flex-1">
                  <Package className="mr-2 w-4 h-4" />
                  Iniciar Entrega
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Entregas no Prazo</span>
                  <span className="text-lg font-semibold text-green-600">96%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avaliação Média</span>
                  <span className="text-lg font-semibold">4.8 ⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Km Rodados</span>
                  <span className="text-lg font-semibold">12.4k km</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    🏆
                  </div>
                  <div>
                    <p className="font-semibold">Motorista do Mês</p>
                    <p className="text-xs text-muted-foreground">Outubro 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    ⚡
                  </div>
                  <div>
                    <p className="font-semibold">100 Entregas</p>
                    <p className="text-xs text-muted-foreground">Sem atrasos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    🌟
                  </div>
                  <div>
                    <p className="font-semibold">5 Estrelas</p>
                    <p className="text-xs text-muted-foreground">10 avaliações</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Ganhos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-green-600">R$ 8.420</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold">R$ 7.200</p>
                <p className="text-sm text-muted-foreground">Base</p>
              </div>
              <div>
                <p className="text-2xl font-bold">R$ 820</p>
                <p className="text-sm text-muted-foreground">Bônus</p>
              </div>
              <div>
                <p className="text-2xl font-bold">R$ 400</p>
                <p className="text-sm text-muted-foreground">Extras</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Driver;
