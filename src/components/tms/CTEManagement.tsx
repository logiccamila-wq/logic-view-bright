import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CTEDialog } from './CTEDialog';
import { format } from 'date-fns';

interface CTE {
  id: string;
  numero_cte: string;
  status: string;
  remetente_nome: string;
  destinatario_nome: string;
  valor_total: number;
  placa_veiculo: string;
  data_emissao: string;
}

export function CTEManagement() {
  const [ctes, setCTEs] = useState<CTE[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCTEs();
  }, []);

  const loadCTEs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cte')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCTEs(data || []);
    } catch (error) {
      console.error('Erro ao carregar CT-e:', error);
      toast.error('Erro ao carregar CT-e');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      rascunho: { variant: 'outline', label: 'Rascunho' },
      emitido: { variant: 'default', label: 'Emitido' },
      autorizado: { variant: 'secondary', label: 'Autorizado' },
      cancelado: { variant: 'destructive', label: 'Cancelado' },
      rejeitado: { variant: 'destructive', label: 'Rejeitado' }
    };

    const config = variants[status] || variants.rascunho;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredCTEs = ctes.filter(cte =>
    cte.numero_cte.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cte.placa_veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cte.remetente_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestão de CT-e
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar CT-e..."
                  className="pl-8 w-64"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo CT-e
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredCTEs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum CT-e encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>Remetente</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCTEs.map(cte => (
                  <TableRow key={cte.id}>
                    <TableCell className="font-mono">{cte.numero_cte}</TableCell>
                    <TableCell>
                      {format(new Date(cte.data_emissao), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{cte.remetente_nome}</TableCell>
                    <TableCell>{cte.destinatario_nome}</TableCell>
                    <TableCell className="font-mono">{cte.placa_veiculo}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      R$ {cte.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{getStatusBadge(cte.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CTEDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadCTEs}
      />
    </>
  );
}
