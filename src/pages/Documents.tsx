import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, Shield, Clock, Car, CreditCard, FileCheck, Plus, Search, Edit, Trash2, Upload } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentDialog } from "@/components/documents/DocumentDialog";
import { importDocuments } from "@/utils/importDocuments";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [importing, setImporting] = useState(false);

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

  const handleImport = async () => {
    if (!confirm('Deseja importar todos os documentos da planilha?')) return;
    
    setImporting(true);
    try {
      console.log('Iniciando importação de documentos...');
      const result = await importDocuments();
      
      if (result.errors > 0) {
        console.error('Erros durante importação:', result.errorDetails);
        toast.error(
          `Importados ${result.imported} de ${result.total} veículos. ${result.errors} erros. Verifique o console para detalhes.`,
          { duration: 5000 }
        );
      } else {
        toast.success(`✅ Importados todos os ${result.imported} veículos com sucesso!`);
      }
      
      await loadDocuments();
    } catch (error: any) {
      console.error('Erro crítico na importação:', error);
      toast.error('Erro ao importar: ' + error.message);
    } finally {
      setImporting(false);
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
    const fines = filterDocuments('fine').filter(f => !f.paid);
    const finesValue = fines.reduce((sum, f) => sum + (f.value || 0), 0);
    const validCNHs = filterDocuments('cnh').filter(c => c.status === 'valid').length;
    const paidCRLVs = filterDocuments('crlv').filter(c => c.paid).length;
    return { expiring, pendingFines: fines.length, finesValue, validCNHs, paidCRLVs };
  };

  const kpis = getKPIs();

  const getStatusBadge = (status: string) => {
    const variants: any = {
      valid: { label: "Válido", className: "bg-green-500/20 text-green-600" },
      expiring: { label: "Vencendo", className: "bg-yellow-500/20 text-yellow-600" },
      expired: { label: "Vencido", className: "bg-red-500/20 text-red-600" },
      pending: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-600" },
      paid: { label: "Pago", className: "bg-green-500/20 text-green-600" },
    };
    return <Badge className={variants[status]?.className}>{variants[status]?.label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Documentos</h1>
            <p className="text-muted-foreground mt-2">Controle de documentos por placa</p>
          </div>
          <Button onClick={handleImport} disabled={importing}>
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'Importando...' : 'Importar Planilha'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Docs Vencendo" value={kpis.expiring} icon={AlertTriangle} trend={{ value: "Próximos 30 dias", positive: false }} />
          <StatCard title="Multas Pendentes" value={kpis.pendingFines} icon={FileText} trend={{ value: `R$ ${kpis.finesValue.toFixed(2)}`, positive: false }} />
          <StatCard title="CNHs Válidas" value={kpis.validCNHs} icon={CreditCard} trend={{ value: "Total válidas", positive: true }} />
          <StatCard title="CRLVs Pagos" value={kpis.paidCRLVs} icon={Car} trend={{ value: `Ano ${new Date().getFullYear()}`, positive: true }} />
        </div>

        <Tabs defaultValue="crlv" className="w-full">
          <TabsList className="grid w-full grid-cols-10 lg:grid-cols-13">
            <TabsTrigger value="crlv">CRLV</TabsTrigger>
            <TabsTrigger value="civ">CIV</TabsTrigger>
            <TabsTrigger value="cipp">CIPP</TabsTrigger>
            <TabsTrigger value="tachograph">Tacógrafo</TabsTrigger>
            <TabsTrigger value="fire_extinguisher">Extintores</TabsTrigger>
            <TabsTrigger value="ibama_ctf">IBAMA CTF</TabsTrigger>
            <TabsTrigger value="ibama_aatipp">IBAMA AATIPP</TabsTrigger>
            <TabsTrigger value="antt">ANTT</TabsTrigger>
            <TabsTrigger value="opacity_test">Opacidade</TabsTrigger>
            <TabsTrigger value="noise_test">Ruído</TabsTrigger>
            <TabsTrigger value="chemical">Químicos</TabsTrigger>
            <TabsTrigger value="cnh">CNH</TabsTrigger>
            <TabsTrigger value="fine">Multas</TabsTrigger>
          </TabsList>

          {['crlv', 'civ', 'cipp', 'tachograph', 'fire_extinguisher', 'ibama_ctf', 'ibama_aatipp', 'antt', 'opacity_test', 'noise_test', 'chemical', 'cnh', 'fine'].map(type => (
            <TabsContent key={type} value={type}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {type === 'crlv' && 'CRLV'}
                      {type === 'civ' && 'CIV'}
                      {type === 'cipp' && 'CIPP'}
                      {type === 'tachograph' && 'Tacógrafos'}
                      {type === 'fire_extinguisher' && 'Extintores'}
                      {type === 'ibama_ctf' && 'IBAMA CTF'}
                      {type === 'ibama_aatipp' && 'IBAMA AATIPP'}
                      {type === 'antt' && 'ANTT'}
                      {type === 'opacity_test' && 'Teste de Opacidade (Fumaça)'}
                      {type === 'noise_test' && 'Teste de Ruído (Barulho)'}
                      {type === 'chemical' && 'Produtos Químicos'}
                      {type === 'cnh' && 'CNH'}
                      {type === 'fine' && 'Multas'}
                    </div>
                    <Button size="sm" onClick={() => handleNewDocument(type)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Input placeholder="Buscar por placa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead>Info</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterDocuments(type).map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.vehicle_plate}</TableCell>
                          <TableCell>{doc.document_category || doc.document_number || doc.description || doc.driver_name || '-'}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(doc)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}><Trash2 className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <DocumentDialog open={dialogOpen} onOpenChange={setDialogOpen} document={selectedDocument} documentType={selectedType} onSuccess={loadDocuments} />
    </Layout>
  );
};

export default Documents;
