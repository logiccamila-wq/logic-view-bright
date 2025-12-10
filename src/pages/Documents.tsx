import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, Shield, Clock, Car, CreditCard, FileCheck, Plus, Search, Edit, Trash2, FileUp, CheckCircle, XCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentDialog } from "@/components/documents/DocumentDialog";
import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { Progress } from "@/components/ui/progress";
import { importDocuments, previewImport } from "@/utils/importDocuments";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [importProgress, setImportProgress] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const { data } = await supabase.from('vehicle_documents').select('*').order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir?')) return;
    await supabase.from('vehicle_documents').delete().eq('id', id);
    toast.success('Documento excluído!');
    loadDocuments();
  };

  const handleEdit = (doc: any) => {
    setSelectedDocument(doc);
    setSelectedType("");
    setDialogOpen(true);
  };

  const handleNewDocument = (type: string) => {
    setSelectedDocument(null);
    setSelectedType(type);
    setDialogOpen(true);
  };

  const handlePreviewImport = async () => {
    setImporting(true);
    try {
      const preview = await previewImport();
      setPreviewData(preview);
      setPreviewOpen(true);
    } catch (error: any) {
      toast.error('Erro ao gerar preview: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    setImportProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await importDocuments(false);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      
      if (result.errors > 0) {
        toast.error(
          `Importados ${result.imported} de ${result.total} veículos. ${result.errors} erros encontrados.`,
          { duration: 5000 }
        );
      } else {
        toast.success(`✅ Importados todos os ${result.imported} veículos com sucesso!`);
      }
      
      setPreviewOpen(false);
      await loadDocuments();
    } catch (error: any) {
      toast.error('Erro ao importar: ' + error.message);
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const filterDocuments = (type: string) => {
    return documents.filter(doc => doc.document_type === type && (searchTerm === "" || 
      doc.vehicle_plate?.toLowerCase().includes(searchTerm.toLowerCase())));
  };

  const getKPIs = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiring = documents.filter(doc => doc.expiry_date && new Date(doc.expiry_date) > now && new Date(doc.expiry_date) <= thirtyDaysFromNow).length;
    const fines = filterDocuments('fine').filter((f: any) => !f.paid);
    const finesValue = fines.reduce((sum: number, f: any) => sum + (f.value || 0), 0);
    const validCNHs = filterDocuments('cnh').filter((c: any) => c.status === 'valid').length;
    const paidCRLVs = filterDocuments('crlv').filter((c: any) => c.paid).length;
    return { expiring, pendingFines: fines.length, finesValue, validCNHs, paidCRLVs };
  };

  const kpis = getKPIs();

  const getStatusBadge = (status: string) => {
    const variants = {
      valid: { variant: "default" as const, icon: CheckCircle, label: "Válido", className: "bg-success/10 text-success hover:bg-success/20" },
      expiring: { variant: "secondary" as const, icon: Clock, label: "Vencendo", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      expired: { variant: "destructive" as const, icon: XCircle, label: "Vencido", className: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
      pending: { variant: "outline" as const, icon: AlertTriangle, label: "Pendente", className: "bg-muted/50" },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const DOCUMENT_TYPES = [
    { value: 'crlv', label: 'CRLV' },
    { value: 'civ', label: 'CIV' },
    { value: 'cipp', label: 'CIPP' },
    { value: 'tachograph', label: 'Tacógrafo' },
    { value: 'fire_extinguisher', label: 'Extintores' },
    { value: 'ibama_ctf', label: 'IBAMA CTF' },
    { value: 'ibama_aatipp', label: 'IBAMA AATIPP' },
    { value: 'antt', label: 'ANTT' },
    { value: 'opacity_test', label: 'Opacidade' },
    { value: 'noise_test', label: 'Ruído' },
    { value: 'chemical', label: 'Químicos' },
    { value: 'cnh', label: 'CNH' },
    { value: 'fine', label: 'Multas' },
    { value: 'epi', label: 'EPI' },
    { value: 'training', label: 'Treinamentos' },
    { value: 'emergency_kit', label: 'Kit de Emergências' },
  ];

  return (
    <>
      <Layout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestão de Documentos</h1>
          <p className="text-muted-foreground">Controle de documentos por placa</p>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handlePreviewImport} 
              disabled={importing}
              variant="outline"
              className="gap-2"
            >
              {importing ? (
                <>Carregando...</>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  Preview da Importação
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Docs Vencendo"
            value={kpis.expiring}
            icon={AlertTriangle}
          />
          <StatCard
            title="Multas Pendentes"
            value={kpis.pendingFines}
            icon={CreditCard}
          />
          <StatCard
            title="CNHs Válidas"
            value={kpis.validCNHs}
            icon={Shield}
          />
          <StatCard
            title="CRLVs Pagos"
            value={kpis.paidCRLVs}
            icon={FileCheck}
          />
        </div>

        <Tabs defaultValue="crlv" className="w-full">
          <TabsList className="grid grid-cols-7 lg:grid-cols-16 gap-1">
            {DOCUMENT_TYPES.map(dt => (
              <TabsTrigger key={dt.value} value={dt.value} className="text-xs px-2">
                {dt.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {DOCUMENT_TYPES.map(dt => (
            <TabsContent key={dt.value} value={dt.value}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {dt.label}
                  </CardTitle>
                  <Button size="sm" onClick={() => handleNewDocument(dt.value)}>
                    <Plus className="w-4 h-4 mr-1" /> Novo
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar por placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead>Info</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterDocuments(dt.value).map(doc => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.vehicle_plate}</TableCell>
                          <TableCell>
                            {dt.value === 'training' ? (
                              <div className="space-y-1">
                                {doc.issue_date && (
                                  <span className="text-sm">Conclusão: {new Date(doc.issue_date).toLocaleDateString('pt-BR')}</span>
                                )}
                                {doc.expiry_date && (
                                  <span className="text-sm">Vence: {new Date(doc.expiry_date).toLocaleDateString('pt-BR')}</span>
                                )}
                              </div>
                            ) : dt.value === 'emergency_kit' ? (
                              <div className="space-y-1">
                                {doc.issue_date && (
                                  <span className="text-sm">Última conferência: {new Date(doc.issue_date).toLocaleDateString('pt-BR')}</span>
                                )}
                                {doc.expiry_date && (
                                  <span className="text-sm">Próxima: {new Date(doc.expiry_date).toLocaleDateString('pt-BR')}</span>
                                )}
                              </div>
                            ) : (
                              doc.expiry_date && (
                                <span className="text-sm">
                                  Vence: {new Date(doc.expiry_date).toLocaleDateString('pt-BR')}
                                </span>
                              )
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filterDocuments(dt.value).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Nenhum documento encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <DocumentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          document={selectedDocument}
          documentType={selectedType}
        />

        <DocumentPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          preview={previewData}
          onConfirm={handleConfirmImport}
          isLoading={importing}
        />

        {importing && importProgress > 0 && (
          <div className="fixed bottom-4 right-4 w-80 p-4 bg-card border rounded-lg shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importando documentos...</span>
                <span className="font-mono">{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};

export default Documents;
