import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, TrendingDown, Award, Target, CloudRain, Recycle, Users, BarChart3 } from "lucide-react";

export default function ESGDashboard() {
  const esgMetrics = {
    carbonFootprint: {
      current: 2847,
      target: 2500,
      reduction: 12.3,
      unit: "ton CO₂/mês"
    },
    fuelEfficiency: {
      current: 2.8,
      improvement: 15.2,
      unit: "km/L"
    },
    renewableEnergy: {
      percentage: 34,
      target: 50
    },
    socialImpact: {
      jobs: 247,
      training: 1834,
      safety: 98.5
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              ESG & Sustentabilidade
            </h1>
            <p className="text-muted-foreground mt-1">
              Environmental, Social and Governance - Impacto e Responsabilidade
            </p>
          </div>
          <Badge className="bg-green-600 text-lg px-4 py-2">
            Score ESG: 87/100
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emissões CO₂</CardTitle>
              <CloudRain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{esgMetrics.carbonFootprint.current}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                {esgMetrics.carbonFootprint.reduction}% vs. ano anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{esgMetrics.fuelEfficiency.current} km/L</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                +{esgMetrics.fuelEfficiency.improvement}% melhoria
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energia Renovável</CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{esgMetrics.renewableEnergy.percentage}%</div>
              <p className="text-xs text-muted-foreground">
                Meta: {esgMetrics.renewableEnergy.target}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empregos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{esgMetrics.socialImpact.jobs}</div>
              <p className="text-xs text-muted-foreground">
                {esgMetrics.socialImpact.training} horas de treinamento
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="environmental" className="space-y-4">
          <TabsList>
            <TabsTrigger value="environmental">Ambiental</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="governance">Governança</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="environmental" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pegada de Carbono</CardTitle>
                  <CardDescription>Emissões mensais de CO₂</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Meta de Redução 2026</span>
                        <span className="font-bold">{esgMetrics.carbonFootprint.target} ton</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${(esgMetrics.carbonFootprint.target / esgMetrics.carbonFootprint.current) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Emissão Atual</p>
                        <p className="text-lg font-bold">{esgMetrics.carbonFootprint.current} ton</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Redução</p>
                        <p className="text-lg font-bold text-green-600">-{esgMetrics.carbonFootprint.reduction}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Iniciativas Verdes</CardTitle>
                  <CardDescription>Ações de sustentabilidade ativas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Frota Híbrida/Elétrica", progress: 28, target: 40 },
                      { name: "Compensação Carbono", progress: 67, target: 100 },
                      { name: "Reciclagem de Resíduos", progress: 85, target: 90 },
                      { name: "Energia Solar", progress: 34, target: 50 }
                    ].map((initiative, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{initiative.name}</span>
                          <span className="font-medium">{initiative.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${initiative.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Economia de Recursos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-700">-18.5%</div>
                      <div className="text-sm text-muted-foreground mt-1">Consumo Combustível</div>
                      <div className="text-xs text-green-600 mt-2">32.400 L economizados</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-700">-12.8%</div>
                      <div className="text-sm text-muted-foreground mt-1">Consumo Água</div>
                      <div className="text-xs text-blue-600 mt-2">8.900 L economizados</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-700">94.2%</div>
                      <div className="text-sm text-muted-foreground mt-1">Taxa Reciclagem</div>
                      <div className="text-xs text-purple-600 mt-2">2.1 ton recicladas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Impacto Social</CardTitle>
                  <CardDescription>Nossa contribuição para a sociedade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Empregos Diretos</span>
                    <span className="text-2xl font-bold">{esgMetrics.socialImpact.jobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Horas de Treinamento</span>
                    <span className="text-2xl font-bold">{esgMetrics.socialImpact.training}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Índice de Segurança</span>
                    <Badge className="bg-green-600">{esgMetrics.socialImpact.safety}%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diversidade & Inclusão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mulheres na Liderança</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "42%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>PcD Contratados</span>
                      <span className="font-medium">8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "8%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Programa Jovem Aprendiz</span>
                      <span className="font-medium">12%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "12%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Bem-estar dos Colaboradores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold">92%</div>
                      <div className="text-xs text-muted-foreground">Satisfação</div>
                    </div>
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-xs text-muted-foreground">Benefícios</div>
                    </div>
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">98.5%</div>
                      <div className="text-xs text-muted-foreground">Segurança</div>
                    </div>
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold">7.4h</div>
                      <div className="text-xs text-muted-foreground">Treino/mês</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Governança Corporativa</CardTitle>
                <CardDescription>Transparência, ética e compliance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-xs text-muted-foreground mt-1">Compliance</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground mt-1">Violações LGPD</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-xs text-muted-foreground mt-1">Auditorias/ano</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">97%</div>
                    <div className="text-xs text-muted-foreground mt-1">Transparência</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Certificações & Selos</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">ISO 9001</Badge>
                    <Badge variant="outline">ISO 14001</Badge>
                    <Badge variant="outline">ISO 45001</Badge>
                    <Badge variant="outline">SASB</Badge>
                    <Badge variant="outline">GRI Standards</Badge>
                    <Badge variant="outline">Carbon Neutral</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios ESG</CardTitle>
                <CardDescription>Documentação e transparência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: "Relatório de Sustentabilidade 2025", date: "Dez 2025", size: "2.4 MB" },
                    { name: "Inventário de Emissões GEE", date: "Jan 2026", size: "890 KB" },
                    { name: "Relatório de Impacto Social", date: "Dez 2025", size: "1.2 MB" },
                    { name: "Auditoria Compliance Q4 2025", date: "Dez 2025", size: "3.1 MB" }
                  ].map((report, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded hover:bg-muted transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">{report.date} • {report.size}</p>
                      </div>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
