import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, DollarSign, Fuel, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const Reports = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatórios
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Receita Mensal" 
            value="R$ 245.8k" 
            icon={DollarSign}
            trend={{ value: "+18.2%", positive: true }}
          />
          <StatCard 
            title="Custo Combustível" 
            value="R$ 89.2k" 
            icon={Fuel}
            trend={{ value: "-5.3%", positive: true }}
          />
          <StatCard 
            title="Horas Trabalhadas" 
            value="1.842h" 
            icon={Clock}
            trend={{ value: "+12%", positive: true }}
          />
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Desempenho de Frota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Entregas no Prazo</span>
                  <span className="text-lg font-semibold text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Km Rodados</span>
                  <span className="text-lg font-semibold">45.8k km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Média Consumo</span>
                  <span className="text-lg font-semibold">2.8 km/l</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                Manutenções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preventivas</span>
                  <span className="text-lg font-semibold">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Corretivas</span>
                  <span className="text-lg font-semibold text-orange-600">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Custo Total</span>
                  <span className="text-lg font-semibold">R$ 32.4k</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Motoristas - Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: "João Silva", score: 9.2 },
                  { nome: "Maria Santos", score: 8.8 },
                  { nome: "Pedro Costa", score: 8.5 },
                ].map((driver, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{driver.nome}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(driver.score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8">{driver.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Próximos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { veiculo: "ABC-1234", tipo: "Revisão", data: "15/11" },
                  { veiculo: "DEF-5678", tipo: "Troca Pneus", data: "18/11" },
                  { veiculo: "GHI-9012", tipo: "Alinhamento", data: "22/11" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{item.veiculo}</p>
                      <p className="text-xs text-muted-foreground">{item.tipo}</p>
                    </div>
                    <span className="text-sm font-medium">{item.data}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
