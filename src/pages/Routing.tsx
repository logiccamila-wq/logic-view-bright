import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteOptimizer } from "@/components/tms/RouteOptimizer";

const Routing = () => {
  return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Roteirização</h1>
          <p className="text-muted-foreground">Planejamento de rotas com cálculo e visualização em mapa</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Otimizador de Rotas</CardTitle>
          </CardHeader>
          <CardContent>
            <RouteOptimizer />
          </CardContent>
        </Card>
      </div>
  );
};

export default Routing;

