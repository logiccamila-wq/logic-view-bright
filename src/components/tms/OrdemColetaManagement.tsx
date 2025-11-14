import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, FileText, Download } from "lucide-react";
import { OrdemColetaDialog } from "./OrdemColetaDialog";
import { format } from "date-fns";

export function OrdemColetaManagement() {
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState<any>(null);

  useEffect(() => {
    loadOrdens();
  }, []);

  const loadOrdens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ordem_coleta')
        .select('*')
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      setOrdens(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar ordens de coleta');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (ordem: any) => {
    try {
      toast.info('Gerando PDF...');
      
      const { data, error } = await supabase.functions.invoke('generate-ordem-coleta-pdf', {
        body: { ordem_id: ordem.id }
      });

      if (error) throw error;

      // Criar um elemento temporário para renderizar o HTML
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.focus();
        
        // Aguardar um pouco para garantir que o conteúdo foi carregado
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
      
      toast.success('PDF gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const filteredOrdens = ordens.filter(ordem =>
    ordem.numero_ordem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.motorista_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "secondary",
      coletado: "default",
      cancelado: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ordens de Coleta</h2>
        <Button onClick={() => { setSelectedOrdem(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, cliente ou motorista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : filteredOrdens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma ordem de coleta encontrada</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Placas</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrdens.map((ordem) => (
                <TableRow key={ordem.id}>
                  <TableCell className="font-medium">{ordem.numero_ordem}</TableCell>
                  <TableCell>{format(new Date(ordem.data_emissao), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{ordem.cliente_nome}</TableCell>
                  <TableCell>{ordem.motorista_nome}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {ordem.placa_cavalo}
                      {ordem.placa_carreta && ` / ${ordem.placa_carreta}`}
                    </div>
                  </TableCell>
                  <TableCell>{ordem.produto}</TableCell>
                  <TableCell>{getStatusBadge(ordem.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGeneratePDF(ordem)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setSelectedOrdem(ordem); setDialogOpen(true); }}
                      >
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <OrdemColetaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ordem={selectedOrdem}
        onSuccess={loadOrdens}
      />
    </div>
  );
}