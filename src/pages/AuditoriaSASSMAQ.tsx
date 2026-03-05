import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, AlertTriangle, Award, FileCheck, TrendingUp, XCircle, Clock } from "lucide-react";

interface AuditItem {
  id: string;
  section: string;
  requirement: string;
  description: string;
  status: "conforme" | "nao_conforme" | "nao_aplicavel" | "pendente";
  evidence?: string;
  observations?: string;
  dueDate?: string;
  responsible?: string;
}

interface AuditSection {
  id: string;
  name: string;
  standard: "SASSMAQ" | "ISO9001" | "ISO14001" | "ISO45001";
  totalItems: number;
  conformeItems: number;
  compliance: number;
  lastAudit: string;
  nextAudit: string;
}

export default function AuditoriaSASSMAQ() {
  const [sections, setSections] = useState<AuditSection[]>([]);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [overallCompliance, setOverallCompliance] = useState(89);

  useEffect(() => {
    loadAuditSections();
    loadAuditItems();
  }, []);

  const loadAuditSections = () => {
    const mockSections: AuditSection[] = [
      // SASSMAQ Sections
      {
        id: "sassmaq-1",
        name: "1. Comprometimento, Política e Liderança",
        standard: "SASSMAQ",
        totalItems: 12,
        conformeItems: 11,
        compliance: 92,
        lastAudit: "2025-11-15",
        nextAudit: "2026-05-15"
      },
      {
        id: "sassmaq-2",
        name: "2. Avaliação e Gerenciamento de Riscos",
        standard: "SASSMAQ",
        totalItems: 18,
        conformeItems: 16,
        compliance: 89,
        lastAudit: "2025-11-15",
        nextAudit: "2026-05-15"
      },
      {
        id: "sassmaq-3",
        name: "3. Documentação e Controle de Informações",
        standard: "SASSMAQ",
        totalItems: 15,
        conformeItems: 13,
        compliance: 87,
        lastAudit: "2025-11-15",
        nextAudit: "2026-05-15"
      },
      {
        id: "sassmaq-4",
        name: "4. Qualificação e Treinamento",
        standard: "SASSMAQ",
        totalItems: 14,
        conformeItems: 12,
        compliance: 86,
        lastAudit: "2025-11-15",
        nextAudit: "2026-05-15"
      },
      {
        id: "sassmaq-5",
        name: "5. Controle Operacional e de Emergências",
        standard: "SASSMAQ",
        totalItems: 22,
        conformeItems: 20,
        compliance: 91,
        lastAudit: "2025-11-15",
        nextAudit: "2026-05-15"
      },
      // ISO 9001 - Quality
      {
        id: "iso9001",
        name: "ISO 9001:2015 - Sistema de Gestão da Qualidade",
        standard: "ISO9001",
        totalItems: 28,
        conformeItems: 25,
        compliance: 89,
        lastAudit: "2025-10-20",
        nextAudit: "2026-10-20"
      },
      // ISO 14001 - Environmental
      {
        id: "iso14001",
        name: "ISO 14001:2015 - Sistema de Gestão Ambiental",
        standard: "ISO14001",
        totalItems: 24,
        conformeItems: 21,
        compliance: 88,
        lastAudit: "2025-10-20",
        nextAudit: "2026-10-20"
      },
      // ISO 45001 - Health & Safety
      {
        id: "iso45001",
        name: "ISO 45001:2018 - Sistema de Gestão de SST",
        standard: "ISO45001",
        totalItems: 26,
        conformeItems: 23,
        compliance: 88,
        lastAudit: "2025-10-20",
        nextAudit: "2026-10-20"
      }
    ];

    setSections(mockSections);

    // Calculate overall compliance
    const total = mockSections.reduce((sum, s) => sum + s.totalItems, 0);
    const conforme = mockSections.reduce((sum, s) => sum + s.conformeItems, 0);
    setOverallCompliance(Math.round((conforme / total) * 100));
  };

  const loadAuditItems = () => {
    const mockItems: AuditItem[] = [
      // SASSMAQ Section 1
      {
        id: "1",
        section: "sassmaq-1",
        requirement: "1.1",
        description: "Política de QSMS documentada e comunicada",
        status: "conforme",
        evidence: "Política QSMS Rev. 3.0 aprovada e divulgada",
        responsible: "Diretoria"
      },
      {
        id: "2",
        section: "sassmaq-1",
        requirement: "1.2",
        description: "Definição de responsabilidades e autoridades",
        status: "conforme",
        evidence: "Organograma atualizado com responsabilidades",
        responsible: "RH"
      },
      {
        id: "3",
        section: "sassmaq-1",
        requirement: "1.3",
        description: "Disponibilização de recursos adequados",
        status: "nao_conforme",
        observations: "Falta de investimento em equipamentos de emergência",
        dueDate: "2026-02-28",
        responsible: "Diretoria"
      },
      // SASSMAQ Section 2
      {
        id: "4",
        section: "sassmaq-2",
        requirement: "2.1",
        description: "Identificação e avaliação de perigos e riscos",
        status: "conforme",
        evidence: "Matriz de Riscos atualizada em 12/2025",
        responsible: "SESMT"
      },
      {
        id: "5",
        section: "sassmaq-2",
        requirement: "2.2",
        description: "Plano de ação para riscos significativos",
        status: "conforme",
        evidence: "Plano de Ação 2026 aprovado",
        responsible: "SESMT"
      },
      {
        id: "6",
        section: "sassmaq-2",
        requirement: "2.3",
        description: "Monitoramento de indicadores de segurança",
        status: "nao_conforme",
        observations: "Indicadores não atualizados nos últimos 2 meses",
        dueDate: "2026-01-31",
        responsible: "SESMT"
      },
      // SASSMAQ Section 3
      {
        id: "7",
        section: "sassmaq-3",
        requirement: "3.1",
        description: "Controle de documentos e registros",
        status: "conforme",
        evidence: "Sistema digital de gestão documental implementado",
        responsible: "Qualidade"
      },
      {
        id: "8",
        section: "sassmaq-3",
        requirement: "3.2",
        description: "Procedimentos documentados e atualizados",
        status: "nao_conforme",
        observations: "5 procedimentos com revisão vencida",
        dueDate: "2026-02-15",
        responsible: "Qualidade"
      },
      // SASSMAQ Section 4
      {
        id: "9",
        section: "sassmaq-4",
        requirement: "4.1",
        description: "Programa de treinamento de motoristas",
        status: "conforme",
        evidence: "100% dos motoristas treinados em 2025",
        responsible: "Treinamento"
      },
      {
        id: "10",
        section: "sassmaq-4",
        requirement: "4.2",
        description: "Avaliação de eficácia dos treinamentos",
        status: "nao_conforme",
        observations: "Falta de avaliação pós-treinamento",
        dueDate: "2026-03-31",
        responsible: "Treinamento"
      },
      // SASSMAQ Section 5
      {
        id: "11",
        section: "sassmaq-5",
        requirement: "5.1",
        description: "Plano de Atendimento a Emergências atualizado",
        status: "conforme",
        evidence: "PAE Rev. 2.0 validado em simulado 11/2025",
        responsible: "Operações"
      },
      {
        id: "12",
        section: "sassmaq-5",
        requirement: "5.2",
        description: "Inspeção periódica de veículos e equipamentos",
        status: "conforme",
        evidence: "100% da frota inspecionada mensalmente",
        responsible: "Manutenção"
      },
      // ISO 9001
      {
        id: "13",
        section: "iso9001",
        requirement: "4.1",
        description: "Contexto da organização documentado",
        status: "conforme",
        evidence: "Análise SWOT atualizada 10/2025",
        responsible: "Qualidade"
      },
      {
        id: "14",
        section: "iso9001",
        requirement: "8.5",
        description: "Controle de saídas não conformes",
        status: "nao_conforme",
        observations: "Registros de NC não sistematizados",
        dueDate: "2026-02-28",
        responsible: "Qualidade"
      },
      // ISO 14001
      {
        id: "15",
        section: "iso14001",
        requirement: "6.1",
        description: "Identificação de aspectos ambientais",
        status: "conforme",
        evidence: "Levantamento de aspectos realizado 09/2025",
        responsible: "Meio Ambiente"
      },
      {
        id: "16",
        section: "iso14001",
        requirement: "8.1",
        description: "Controle de resíduos perigosos",
        status: "nao_conforme",
        observations: "Destinação de resíduos sem comprovação",
        dueDate: "2026-01-31",
        responsible: "Meio Ambiente"
      },
      // ISO 45001
      {
        id: "17",
        section: "iso45001",
        requirement: "6.1",
        description: "Identificação de perigos e avaliação de riscos",
        status: "conforme",
        evidence: "APR atualizada para todas as atividades",
        responsible: "SESMT"
      },
      {
        id: "18",
        section: "iso45001",
        requirement: "9.1",
        description: "Monitoramento de saúde ocupacional",
        status: "nao_conforme",
        observations: "Exames periódicos de 3 motoristas vencidos",
        dueDate: "2026-01-15",
        responsible: "SESMT"
      }
    ];

    setAuditItems(mockItems);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
      conforme: { variant: "default", label: "CONFORME" },
      nao_conforme: { variant: "destructive", label: "NÃO CONFORME" },
      nao_aplicavel: { variant: "outline", label: "N/A" },
      pendente: { variant: "secondary", label: "PENDENTE" }
    };
    const cfg = config[status] || config.pendente;
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "conforme":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "nao_conforme":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pendente":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStandardBadge = (standard: string) => {
    const colors: Record<string, string> = {
      SASSMAQ: "bg-blue-100 text-blue-800",
      ISO9001: "bg-green-100 text-green-800",
      ISO14001: "bg-emerald-100 text-emerald-800",
      ISO45001: "bg-orange-100 text-orange-800"
    };
    return (
      <Badge className={`${colors[standard] || ''} border-0`}>
        {standard}
      </Badge>
    );
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return "text-green-600";
    if (compliance >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredItems = selectedSection
    ? auditItems.filter(item => item.section === selectedSection)
    : auditItems;

  const nonConformities = auditItems.filter(item => item.status === "nao_conforme");

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Auditoria Virtual SASSMAQ/ISO
            </h1>
            <p className="text-muted-foreground mt-1">
              Sistema de Gestão Integrado - Conformidade e Certificações
            </p>
          </div>
          <Button>
            <FileCheck className="h-4 w-4 mr-2" />
            Nova Auditoria
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
                Meta: ≥ 90% para certificação
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
                  {nonConformities.length}
                </span>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {nonConformities.filter(nc => nc.dueDate && new Date(nc.dueDate) < new Date()).length} vencidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Certificações Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-600">4</span>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                SASSMAQ + 3 ISOs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Próxima Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-purple-600">128</span>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                dias restantes
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sections" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sections">Seções de Auditoria</TabsTrigger>
            <TabsTrigger value="nonconformities">Não Conformidades</TabsTrigger>
            <TabsTrigger value="certifications">Certificações</TabsTrigger>
          </TabsList>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-4">
            {sections.map((section) => (
              <Card key={section.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStandardBadge(section.standard)}
                        <CardTitle className="text-lg">{section.name}</CardTitle>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`text-2xl font-bold ${getComplianceColor(section.compliance)}`}>
                        {section.compliance}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {section.conformeItems}/{section.totalItems} itens
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={section.compliance} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Última Auditoria:</span>
                      <p className="font-medium">{new Date(section.lastAudit).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Próxima Auditoria:</span>
                      <p className="font-medium">{new Date(section.nextAudit).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSection(section.id)}
                    >
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm">Exportar Relatório</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Non-Conformities Tab */}
          <TabsContent value="nonconformities" className="space-y-4">
            {nonConformities.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <CardTitle className="text-lg">
                          {item.requirement} - {item.description}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        <strong>Seção:</strong> {sections.find(s => s.id === item.section)?.name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.observations && (
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-sm font-medium text-red-900 mb-1">Observação:</p>
                      <p className="text-sm text-red-700">{item.observations}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {item.dueDate && (
                      <div>
                        <span className="text-muted-foreground">Prazo:</span>
                        <p className={`font-medium ${
                          new Date(item.dueDate) < new Date() ? 'text-red-600' : ''
                        }`}>
                          {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                    {item.responsible && (
                      <div>
                        <span className="text-muted-foreground">Responsável:</span>
                        <p className="font-medium">{item.responsible}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">Criar Plano de Ação</Button>
                    <Button size="sm" variant="outline">Anexar Evidências</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {nonConformities.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-lg font-medium">Nenhuma não conformidade encontrada!</p>
                  <p className="text-sm text-muted-foreground">
                    Todos os itens estão em conformidade com os requisitos.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SASSMAQ */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-blue-600" />
                      SASSMAQ v.6
                    </CardTitle>
                    <Badge variant="default">CERTIFICADO</Badge>
                  </div>
                  <CardDescription>
                    Sistema de Avaliação de Segurança, Saúde, Meio Ambiente e Qualidade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conformidade:</span>
                      <span className="font-bold text-green-600">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Certificação:</span>
                      <p className="font-medium">15/05/2024</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Validade:</span>
                      <p className="font-medium">15/05/2027</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Ver Certificado</Button>
                </CardContent>
              </Card>

              {/* ISO 9001 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6 text-green-600" />
                      ISO 9001:2015
                    </CardTitle>
                    <Badge variant="default">CERTIFICADO</Badge>
                  </div>
                  <CardDescription>
                    Sistema de Gestão da Qualidade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conformidade:</span>
                      <span className="font-bold text-green-600">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Certificação:</span>
                      <p className="font-medium">20/10/2023</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Validade:</span>
                      <p className="font-medium">20/10/2026</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Ver Certificado</Button>
                </CardContent>
              </Card>

              {/* ISO 14001 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6 text-emerald-600" />
                      ISO 14001:2015
                    </CardTitle>
                    <Badge variant="default">CERTIFICADO</Badge>
                  </div>
                  <CardDescription>
                    Sistema de Gestão Ambiental
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conformidade:</span>
                      <span className="font-bold text-yellow-600">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Certificação:</span>
                      <p className="font-medium">20/10/2023</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Validade:</span>
                      <p className="font-medium">20/10/2026</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Ver Certificado</Button>
                </CardContent>
              </Card>

              {/* ISO 45001 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6 text-orange-600" />
                      ISO 45001:2018
                    </CardTitle>
                    <Badge variant="default">CERTIFICADO</Badge>
                  </div>
                  <CardDescription>
                    Sistema de Gestão de Saúde e Segurança do Trabalho
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conformidade:</span>
                      <span className="font-bold text-yellow-600">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Certificação:</span>
                      <p className="font-medium">20/10/2023</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Validade:</span>
                      <p className="font-medium">20/10/2026</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Ver Certificado</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
