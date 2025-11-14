import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientAnalysis {
  client_cnpj: string;
  periodo_mes: number;
  periodo_ano: number;
  total_ctes: number;
  receita_total: number;
  receita_recebida: number;
  receita_pendente: number;
  receita_atrasada: number;
  ticket_medio: number;
  peso_total_kg: number;
  maior_atraso_dias: number;
  inadimplente: boolean;
  score_cliente: number;
}

interface Client {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cidade: string;
  uf: string;
}

export function ClientsFinancialDashboard() {
  const [analyses, setAnalyses] = useState<ClientAnalysis[]>([]);
  const [clients, setClients] = useState<Map<string, Client>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInadimplente, setFilterInadimplente] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Atualizar análises
      await supabase.rpc('calculate_client_financial_analysis');

      // Carregar análises
      const { data: analysesData, error: analysesError } = await supabase
        .from('client_financial_analysis')
        .select('*')
        .order('receita_total', { ascending: false });

      if (analysesError) throw analysesError;

      setAnalyses(analysesData || []);

      // Carregar dados de clientes
      const cnpjs = [...new Set(analysesData?.map(a => a.client_cnpj) || [])];
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .in('cnpj', cnpjs);

      if (clientsError) throw clientsError;

      const clientsMap = new Map<string, Client>();
      clientsData?.forEach(client => {
        clientsMap.set(client.cnpj, client);
      });
      setClients(clientsMap);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar análises financeiras');
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-green-500">Excelente</Badge>;
    if (score >= 70) return <Badge variant="secondary">Bom</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-500">Regular</Badge>;
    return <Badge variant="destructive">Crítico</Badge>;
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const client = clients.get(analysis.client_cnpj);
    const matchesSearch = !searchTerm || 
      analysis.client_cnpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.razao_social.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterInadimplente || analysis.inadimplente;
    
    return matchesSearch && matchesFilter;
  });

  // Calcular totalizadores
  const totals = filteredAnalyses.reduce((acc, curr) => ({
    receita_total: acc.receita_total + curr.receita_total,
    receita_recebida: acc.receita_recebida + curr.receita_recebida,
    receita_pendente: acc.receita_pendente + curr.receita_pendente,
    receita_atrasada: acc.receita_atrasada + curr.receita_atrasada,
    total_ctes: acc.total_ctes + curr.total_ctes,
    inadimplentes: acc.inadimplentes + (curr.inadimplente ? 1 : 0)
  }), {
    receita_total: 0,
    receita_recebida: 0,
    receita_pendente: 0,
    receita_atrasada: 0,
    total_ctes: 0,
    inadimplentes: 0
  });

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.receita_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals.total_ctes} CT-e's no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Recebida</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {totals.receita_recebida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totals.receita_recebida / totals.receita_total) * 100 || 0).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Atrasada</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {totals.receita_atrasada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer atenção urgente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Inadimplentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {totals.inadimplentes}
            </div>
            <p className="text-xs text-muted-foreground">
              De {filteredAnalyses.length} clientes ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Análise Financeira por Cliente
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente ou CNPJ..."
                  className="pl-8 w-64"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant={filterInadimplente ? "default" : "outline"}
                onClick={() => setFilterInadimplente(!filterInadimplente)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Inadimplentes
              </Button>
              <Button onClick={loadData} variant="outline">
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando análises...</div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma análise encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead className="text-right">CT-e's</TableHead>
                  <TableHead className="text-right">Receita Total</TableHead>
                  <TableHead className="text-right">Recebido</TableHead>
                  <TableHead className="text-right">Pendente</TableHead>
                  <TableHead className="text-right">Atrasado</TableHead>
                  <TableHead className="text-right">Atraso (dias)</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalyses.map((analysis) => {
                  const client = clients.get(analysis.client_cnpj);
                  return (
                    <TableRow key={`${analysis.client_cnpj}-${analysis.periodo_mes}-${analysis.periodo_ano}`}>
                      <TableCell className="font-medium">
                        {client?.razao_social || 'Cliente não cadastrado'}
                        {client?.cidade && <div className="text-xs text-muted-foreground">{client.cidade}/{client.uf}</div>}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {analysis.client_cnpj}
                      </TableCell>
                      <TableCell className="text-right">{analysis.total_ctes}</TableCell>
                      <TableCell className="text-right font-medium">
                        {analysis.receita_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {analysis.receita_recebida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="text-right text-yellow-600">
                        {analysis.receita_pendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {analysis.receita_atrasada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell className="text-right">
                        {analysis.maior_atraso_dias > 0 ? (
                          <span className="text-red-600 font-medium">{analysis.maior_atraso_dias}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getScoreBadge(analysis.score_cliente)}
                      </TableCell>
                      <TableCell>
                        {analysis.inadimplente ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inadimplente
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50">
                            Em Dia
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
