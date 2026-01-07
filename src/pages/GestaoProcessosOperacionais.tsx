import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle2, AlertTriangle, TrendingUp, ClipboardCheck, Users, Calendar, XCircle } from "lucide-react";

interface POP {
  id: string;
  code: string;
  title: string;
  version: string;
  status: "ativo" | "revisao" | "obsoleto";
  category: "seguranca" | "qualidade" | "operacional" | "ambiental";
  lastRevision: string;
  nextRevision: string;
  responsible: string;
  compliance: number;
  occurrences: number;
}

interface Occurrence {
  id: string;
  popCode: string;
  type: "nao_conformidade" | "observacao" | "melhoria";
  description: string;
  severity: "critica" | "alta" | "media" | "baixa";
  date: string;
  responsible: string;
  status: "aberta" | "em_analise" | "resolvida";
  actions?: string;
}

export default function GestaoProcessosOperacionais() {
  const [pops, setPops] = useState<POP[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [selectedPOP, setSelectedPOP] = useState<POP | null>(null);
  const [overallCompliance, setOverallCompliance] = useState(89);

  useEffect(() => {
    loadPOPs();
    loadOccurrences();
  }, []);

  const loadPOPs = () => {
    const mockPOPs: POP[] = [
      {
        id: "1",
        code: "POP-001",
        title: "Check-list Pré-Viagem",
        version: "3.2",
        status: "ativo",
        category: "seguranca",
        lastRevision: "2025-11-15",
        nextRevision: "2026-05-15",
        responsible: "João Silva",
        compliance: 94,
        occurrences: 3
      },
      {
        id: "2",
        code: "POP-002",
        title: "Procedimento de Abastecimento",
        version: "2.1",
        status: "ativo",
        category: "operacional",
        lastRevision: "2025-10-20",
        nextRevision: "2026-04-20",
        responsible: "Maria Santos",
        compliance: 88,
        occurrences: 7
      },
      {
        id: "3",
        code: "POP-003",
        title: "Procedimento de Emergência",
        version: "4.0",
        status: "ativo",
        category: "seguranca",
        lastRevision: "2025-12-01",
        nextRevision: "2026-06-01",
        responsible: "Carlos Oliveira",
        compliance: 96,
        occurrences: 1
      },
      {
        id: "4",
        code: "POP-004",
        title: "Manutenção Preventiva",
        version: "2.5",
        status: "ativo",
        category: "qualidade",
        lastRevision: "2025-09-10",
        nextRevision: "2026-03-10",
        responsible: "Ana Costa",
        compliance: 82,
        occurrences: 12
      },
      {
        id: "5",
        code: "POP-005",
        title: "Descarte de Resíduos",
        version: "1.8",
        status: "revisao",
        category: "ambiental",
        lastRevision: "2025-08-05",
        nextRevision: "2026-02-05",
        responsible: "Paulo Mendes",
        compliance: 79,
        occurrences: 15
      },
      {
        id: "6",
        code: "POP-006",
        title: "Carregamento e Amarração",
        version: "3.0",
        status: "ativo",
        category: "seguranca",
        lastRevision: "2025-11-20",
        nextRevision: "2026-05-20",
        responsible: "Roberto Lima",
        compliance: 91,
        occurrences: 5
      },
      {
        id: "7",
        code: "POP-007",
        title: "Inspeção de Equipamentos",
        version: "2.3",
        status: "ativo",
        category: "qualidade",
        lastRevision: "2025-10-15",
        nextRevision: "2026-04-15",
        responsible: "Fernanda Alves",
        compliance: 87,
        occurrences: 8
      },
      {
        id: "8",
        code: "POP-008",
        title: "Treinamento de Motoristas",
        version: "1.5",
        status: "obsoleto",
        category: "operacional",
        lastRevision: "2024-06-30",
        nextRevision: "2025-12-30",
        responsible: "Marcos Souza",
        compliance: 65,
        occurrences: 22
      }
    ];

    setPops(mockPOPs);
  };

  const loadOccurrences = () => {
    const mockOccurrences: Occurrence[] = [
      {
        id: "1",
        popCode: "POP-001",
        type: "nao_conformidade",
        description: "Motorista não verificou nível de água antes de viagem",
        severity: "alta",
        date: "2026-01-05",
        responsible: "João Silva",
        status: "em_analise",
        actions: "Reciclagem do motorista agendada para 15/01/2026"
      },
      {
        id: "2",
        popCode: "POP-002",
        type: "observacao",
        description: "Abastecimento realizado fora do horário recomendado",
        severity: "baixa",
        date: "2026-01-04",
        responsible: "Maria Santos",
        status: "resolvida",
        actions: "Motorista orientado sobre horários de abastecimento"
      },
      {
        id: "3",
        popCode: "POP-004",
        type: "nao_conformidade",
        description: "Manutenção preventiva atrasada em 5 dias",
        severity: "critica",
        date: "2026-01-03",
        responsible: "Ana Costa",
        status: "aberta",
        actions: "Manutenção emergencial agendada para amanhã"
      },
      {
        id: "4",
        popCode: "POP-005",
        type: "melhoria",
        description: "Sugestão de novo processo de segregação de resíduos",
        severity: "media",
        date: "2026-01-02",
        responsible: "Paulo Mendes",
        status: "em_analise"
      },
      {
        id: "5",
        popCode: "POP-006",
        type: "nao_conformidade",
        description: "Amarração de carga não seguiu procedimento padrão",
        severity: "alta",
        date: "2026-01-01",
        responsible: "Roberto Lima",
        status: "resolvida",
        actions: "Motorista retreinado e avaliado"
      }
    ];

    setOccurrences(mockOccurrences);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      ativo: "default",
      revisao: "secondary",
      obsoleto: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      seguranca: "text-red-600",
      qualidade: "text-blue-600",
      operacional: "text-green-600",
      ambiental: "text-emerald-600"
    };
    return colors[category] || "text-gray-600";
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      critica: "destructive",
      alta: "destructive",
      media: "secondary",
      baixa: "outline"
    };
    return <Badge variant={variants[severity] || "outline"}>{severity.toUpperCase()}</Badge>;
  };

  const getOccurrenceStatusIcon = (status: string) => {
    switch (status) {
      case "aberta":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "em_analise":
        return <ClipboardCheck className="h-4 w-4 text-yellow-500" />;
      case "resolvida":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return "text-green-600";
    if (compliance >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              Gestão de POPs
            </h1>
            <p className="text-muted-foreground mt-1">
              Procedimentos Operacionais Padrão - Conformidade SASSMAQ
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Criar Novo POP
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conformidade Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-3xl font-bold ${getComplianceColor(overallCompliance)}`}>
                  {overallCompliance}%
                </span>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                +3% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                POPs Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {pops.filter(p => p.status === "ativo").length}
                </span>
                <CheckCircle2 className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                de {pops.length} totais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Não Conformidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-red-600">
                  {occurrences.filter(o => o.type === "nao_conformidade" && o.status !== "resolvida").length}
                </span>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {occurrences.filter(o => o.severity === "critica").length} críticas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revisões Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-yellow-600">
                  {pops.filter(p => p.status === "revisao").length}
                </span>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                próx. 30 dias
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pops" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pops">POPs Cadastrados</TabsTrigger>
            <TabsTrigger value="occurrences">Ocorrências</TabsTrigger>
            <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          </TabsList>

          {/* POPs Tab */}
          <TabsContent value="pops" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {pops.map((pop) => (
                <Card key={pop.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{pop.code}</CardTitle>
                          {getStatusBadge(pop.status)}
                          <Badge variant="outline" className={getCategoryColor(pop.category)}>
                            {pop.category}
                          </Badge>
                        </div>
                        <CardDescription className="text-base font-medium text-foreground">
                          {pop.title}
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-1">
                        <div className={`text-2xl font-bold ${getComplianceColor(pop.compliance)}`}>
                          {pop.compliance}%
                        </div>
                        <p className="text-xs text-muted-foreground">conformidade</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Versão:</span>
                        <p className="font-medium">{pop.version}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Responsável:</span>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {pop.responsible}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Última Revisão:</span>
                        <p className="font-medium">{new Date(pop.lastRevision).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Próxima Revisão:</span>
                        <p className="font-medium">{new Date(pop.nextRevision).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        {pop.occurrences} ocorrência{pop.occurrences !== 1 ? 's' : ''} registrada{pop.occurrences !== 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Visualizar</Button>
                        <Button variant="outline" size="sm">Editar</Button>
                        <Button variant="outline" size="sm">Histórico</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Occurrences Tab */}
          <TabsContent value="occurrences" className="space-y-4">
            {occurrences.map((occ) => (
              <Card key={occ.id} className={`border-l-4 ${
                occ.severity === "critica" ? "border-l-red-500" :
                occ.severity === "alta" ? "border-l-orange-500" :
                occ.severity === "media" ? "border-l-yellow-500" :
                "border-l-blue-500"
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getOccurrenceStatusIcon(occ.status)}
                        <CardTitle className="text-lg">{occ.popCode}</CardTitle>
                        {getSeverityBadge(occ.severity)}
                        <Badge variant={
                          occ.type === "nao_conformidade" ? "destructive" :
                          occ.type === "melhoria" ? "default" : "outline"
                        }>
                          {occ.type.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        {occ.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Data:</span>
                      <p className="font-medium">{new Date(occ.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Responsável:</span>
                      <p className="font-medium">{occ.responsible}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">{occ.status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  {occ.actions && (
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm font-medium mb-1">Ações Tomadas:</p>
                      <p className="text-sm text-muted-foreground">{occ.actions}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Analisar</Button>
                    {occ.status !== "resolvida" && (
                      <Button size="sm">Resolver</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Conformidade</CardTitle>
                <CardDescription>
                  Evolução mensal da conformidade aos POPs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Dezembro 2025", "Novembro 2025", "Outubro 2025", "Setembro 2025"].map((month, idx) => {
                    const values = [89, 86, 84, 81];
                    const value = values[idx];
                    return (
                      <div key={month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{month}</span>
                          <span className={`font-bold ${getComplianceColor(value)}`}>{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              value >= 90 ? "bg-green-600" :
                              value >= 75 ? "bg-yellow-600" : "bg-red-600"
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conformidade por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Segurança", value: 93, color: "text-red-600" },
                    { category: "Qualidade", value: 85, color: "text-blue-600" },
                    { category: "Operacional", value: 88, color: "text-green-600" },
                    { category: "Ambiental", value: 79, color: "text-emerald-600" }
                  ].map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${item.color}`}>{item.category}</span>
                        <span className={`font-bold ${getComplianceColor(item.value)}`}>{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.value >= 90 ? "bg-green-600" :
                            item.value >= 75 ? "bg-yellow-600" : "bg-red-600"
                          }`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
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
