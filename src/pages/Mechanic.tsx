import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, FileText, Calendar, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Mechanic = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="p-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <a href="/" className="text-primary hover:underline">
            HOME
          </a>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-purple/10 border border-purple/20 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Wrench className="w-8 h-8" />
            HUB Central de Serviços
          </h1>
        </div>

        <Tabs defaultValue="os" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="os">1. Ordens de Serviço (Mec.)</TabsTrigger>
            <TabsTrigger value="tires">2. Gestão de Pneus (Borracharia)</TabsTrigger>
            <TabsTrigger value="fuel">3. Posto Interno (Abastecimento)</TabsTrigger>
            <TabsTrigger value="clock">4. Controle de Ponto</TabsTrigger>
          </TabsList>

          <TabsContent value="os" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Ordens de Serviço</CardTitle>
                  <CardDescription>
                    Abrir/fechar O.S. com fotos e laudos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Abrir</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-green flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-green-foreground" />
                  </div>
                  <CardTitle>Preventiva</CardTitle>
                  <CardDescription>
                    Agenda por hodômetro e tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Abrir</Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Dica:</strong> instale como PWA para acesso rápido no Android.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tires">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Pneus</CardTitle>
                <CardDescription>Controle de pneus e borracharia</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fuel">
            <Card>
              <CardHeader>
                <CardTitle>Posto Interno</CardTitle>
                <CardDescription>Controle de abastecimento</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clock">
            <Card>
              <CardHeader>
                <CardTitle>Controle de Ponto</CardTitle>
                <CardDescription>Registro de ponto dos colaboradores</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Mechanic;
