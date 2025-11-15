import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Car,
  CreditCard,
  FileCheck,
  Calendar,
  Plus,
  Search,
  Download,
  Upload,
  Eye
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - substituir por dados reais do Supabase
  const mockDocuments = {
    chemical: [
      { id: "1", vehicle: "ABC-1234", type: "FISPQ", expiry: "2025-06-15", status: "valid" },
      { id: "2", vehicle: "DEF-5678", type: "Certificado ONU", expiry: "2024-12-20", status: "expiring" },
    ],
    civ: [
      { id: "1", vehicle: "ABC-1234", number: "CIV-123456", expiry: "2025-03-10", status: "valid" },
      { id: "2", vehicle: "GHI-9012", number: "CIV-789012", expiry: "2024-11-30", status: "expired" },
    ],
    cipp: [
      { id: "1", vehicle: "DEF-5678", number: "CIPP-456789", expiry: "2025-08-20", status: "valid" },
    ],
    tachograph: [
      { id: "1", vehicle: "ABC-1234", lastCheck: "2024-10-15", nextCheck: "2025-01-15", status: "valid" },
      { id: "2", vehicle: "JKL-3456", lastCheck: "2024-09-01", nextCheck: "2024-12-01", status: "expiring" },
    ],
    fines: [
      { id: "1", vehicle: "ABC-1234", type: "Excesso de Velocidade", value: 195.23, date: "2024-10-01", status: "pending" },
      { id: "2", vehicle: "DEF-5678", type: "Rodízio", value: 130.16, date: "2024-09-15", status: "paid" },
    ],
    cnh: [
      { id: "1", driver: "João Silva", number: "12345678901", expiry: "2026-05-20", category: "E", status: "valid" },
      { id: "2", driver: "Maria Santos", number: "98765432109", expiry: "2024-12-10", category: "D", status: "expiring" },
    ],
    crlv: [
      { id: "1", vehicle: "ABC-1234", year: "2024", paid: true, status: "valid" },
      { id: "2", vehicle: "GHI-9012", year: "2024", paid: false, status: "pending" },
    ]
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      valid: { label: "Válido", className: "bg-green-500/20 text-green-600" },
      expiring: { label: "Vencendo", className: "bg-yellow-500/20 text-yellow-600" },
      expired: { label: "Vencido", className: "bg-red-500/20 text-red-600" },
      pending: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-600" },
      paid: { label: "Pago", className: "bg-green-500/20 text-green-600" },
    };
    return (
      <Badge className={variants[status as keyof typeof variants]?.className}>
        {variants[status as keyof typeof variants]?.label}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Documentos</h1>
          <p className="text-muted-foreground mt-2">
            Controle completo de documentos e certificações da frota
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Docs Vencendo"
            value={5}
            icon={AlertTriangle}
            trend={{ value: "Próximos 30 dias", positive: false }}
          />
          <StatCard
            title="Multas Pendentes"
            value={3}
            icon={FileText}
            trend={{ value: "R$ 455,55", positive: false }}
          />
          <StatCard
            title="CNHs Válidas"
            value={28}
            icon={CreditCard}
            trend={{ value: "De 32 total", positive: true }}
          />
          <StatCard
            title="CRLVs Pagos"
            value={45}
            icon={Car}
            trend={{ value: "Ano 2024", positive: true }}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chemical" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="chemical">Químicos</TabsTrigger>
            <TabsTrigger value="civ">CIV</TabsTrigger>
            <TabsTrigger value="cipp">CIPP</TabsTrigger>
            <TabsTrigger value="tachograph">Tacógrafo</TabsTrigger>
            <TabsTrigger value="fines">Multas</TabsTrigger>
            <TabsTrigger value="cnh">CNH</TabsTrigger>
            <TabsTrigger value="crlv">CRLV</TabsTrigger>
          </TabsList>

          {/* Químicos */}
          <TabsContent value="chemical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Documentos de Produtos Químicos
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Documento
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por veículo ou tipo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDocuments.chemical.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.vehicle}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.expiry}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CIV */}
          <TabsContent value="civ" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Certificado de Inspeção Veicular (CIV)
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo CIV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDocuments.civ.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.vehicle}</TableCell>
                        <TableCell>{doc.number}</TableCell>
                        <TableCell>{doc.expiry}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CIPP */}
          <TabsContent value="cipp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Certificado de Inspeção de Produtos Perigosos (CIPP)
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo CIPP
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDocuments.cipp.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.vehicle}</TableCell>
                        <TableCell>{doc.number}</TableCell>
                        <TableCell>{doc.expiry}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tacógrafo */}
          <TabsContent value="tachograph" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Manutenção de Tacógrafos
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Manutenção
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Última Verificação</TableHead>
                      <TableHead>Próxima Verificação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDocuments.tachograph.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.vehicle}</TableCell>
                        <TableCell>{doc.lastCheck}</TableCell>
                        <TableCell>{doc.nextCheck}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multas */}
          <TabsContent value="fines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Gestão de Multas
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Multa
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDocuments.fines.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.vehicle}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>R$ {doc.value.toFixed(2)}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CNH */}
          <TabsContent value="cnh" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Carteira Nacional de Habilitação (CNH)
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar CNH
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Motorista</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDocuments.cnh.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.driver}</TableCell>
                        <TableCell>{doc.number}</TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>{doc.expiry}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CRLV */}
          <TabsContent value="crlv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Certificado de Registro e Licenciamento de Veículo (CRLV)
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar CRLV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDocuments.crlv.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.vehicle}</TableCell>
                        <TableCell>{doc.year}</TableCell>
                        <TableCell>{doc.paid ? "Sim" : "Não"}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Documents;
